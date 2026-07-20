import Joi from "joi";
import bcrypt from "bcryptjs";
import asyncHandler from "../middleware/asyncHandler.js";
import { createUserModel, findUser, setUserPassword } from "../model/userModel.js";
import { getUserRoleAndPermissions } from "../model/userRoleModel.js";
import { generateToken, verifyPasswordResetToken } from "../config/jwtToken.js";
import { findOrganisation } from "../model/organisationModel.js";
import { findPasswordReset, hashToken, markPasswordResetUsed } from "../model/passwordResetModel.js";
import { Op } from "sequelize";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const SALT_ROUNDS = 10;

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
    }),
})

const login = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const origin = req.headers.origin
  const organisation = origin
    ? await findOrganisation({ url: { [Op.in]: [origin, `${origin}/`] }, active: true })
    : null

  if(!organisation) {
    res.status(401)
    throw new Error("Invalid email or password")
  }

  const { email, password } = req.body
  const user = await findUser({ email, org_id: organisation.id })

  if (!user) {
    res.status(401)
    throw new Error("Invalid email or password")
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    res.status(401)
    throw new Error("Invalid email or password")
  }

  if (!user.active) {
    res.status(403)
    throw new Error("This account is inactive")
  }

  const { role, permissions } = await getUserRoleAndPermissions(user.id)

  const tokenData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    permissions,
  }

  res.status(200).json({
    name: user.name,
    email: user.email,
    role,
    permissions,
    token: generateToken(tokenData)
  })
})

const resetPassword = asyncHandler(async (req, res) => {
  const { error } = resetPasswordSchema.validate(req.body, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const { token, password } = req.body
  const decoded = verifyPasswordResetToken(token)

  if (!decoded) {
    res.status(400)
    throw new Error("This link is invalid or has expired")
  }

  const resetRecord = await findPasswordReset({ token_hash: hashToken(token) })

  if (!resetRecord) {
    res.status(400)
    throw new Error("This link is invalid or has expired")
  }

  if (resetRecord.used) {
    res.status(400)
    throw new Error("Password has already been reset. Please log in, or ask your administrator for a new link.")
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  const [affectedCount] = await setUserPassword(decoded.id, hashedPassword)

  if (affectedCount === 0) {
    res.status(404)
    throw new Error("User not found")
  }

  await markPasswordResetUsed(resetRecord.id)

  res.status(200).json({ message: "Password has been set. You can now log in." })
})

export {
  login,
  resetPassword
};
