import Joi from "joi";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import { createUserModel, updateUserModel } from "../model/userModel.js";
import { createUserRole, deleteUserRoleByUserId, findAllUser } from "../model/userRoleModel.js";
import { generatePasswordResetToken } from "../config/jwtToken.js";
import { sendMail } from "../config/mailer.js";
import { createPasswordReset, hashToken } from "../model/passwordResetModel.js";

const SALT_ROUNDS = 10;

const validateAddUser = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role_id: Joi.number().positive().required()
})

const validateUpdateUser = Joi.object({
  id: Joi.number().positive().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role_id: Joi.number().positive().required()
})

const shapeUser = (user) => {
  const data = user.toJSON()
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    active: data.active,
    roles: data.UserRoleMappings.map((mapping) => ({
      id: mapping.Role.id,
      name: mapping.Role.name,
    })),
  }
}

const getAllUser = asyncHandler(async (req, res) => {
  const users = await findAllUser({ org_id: req.user.org_id })
  res.status(200).json(users.map(shapeUser))
})

const createUser = asyncHandler(async (req, res) => {
  const { name, email, role: role_id } = req.body
  const { error } = validateAddUser.validate({ name, email, role_id }, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const temporaryPassword = crypto.randomBytes(16).toString("hex")
  const hashedPassword = await bcrypt.hash(temporaryPassword, SALT_ROUNDS)

  let newUser;
  try {
    newUser = await createUserModel({ name, email, password: hashedPassword, org_id: req.user.org_id })
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      res.status(409)
      throw new Error("Email is already registered")
    }
    throw err
  }

  await createUserRole({ role_id, user_id: newUser.id })

  // Best-effort: a failed email shouldn't undo the user that was just
  // created — the admin can always resend/regenerate a reset link later.
  try {
    const resetToken = generatePasswordResetToken(newUser.id)
    await createPasswordReset({ user_id: newUser.id, token_hash: hashToken(resetToken) })
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    await sendMail({
      to: newUser.email,
      subject: "You've been added to ManTech — set your password",
      html: `<p>Hi ${newUser.name},</p>
        <p>An account has been created for you on ManTech. Click the link below to set your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link expires in 24 hours.</p>`,
    })
  } catch (err) {
    console.error("Failed to send password-reset email:", err)
  }

  // Re-fetch in the same shape getAllUser returns, so the frontend can drop
  // this straight into its cache/table instead of refetching the whole list.
  const [createdUser] = await findAllUser({ id: newUser.id, org_id: req.user.org_id })

  res.status(201).json(shapeUser(createdUser))
})

const updateUser = asyncHandler(async (req, res) => {
  const { id, name, email, role: role_id } = req.body
  const { error } = validateUpdateUser.validate({ id, name, email, role_id }, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const [affectedCount] = await updateUserModel({ name, org_id: req.user.org_id }, id)

  if (affectedCount === 0) {
    // Either no such user, or it belongs to a different org — stop here,
    // before touching role mappings, so a foreign id can't be used to
    // reassign someone else's org's role.
    res.status(404)
    throw new Error("User not found")
  }

  await deleteUserRoleByUserId(id)
  await createUserRole({ role_id, user_id: id })

  const [updatedUser] = await findAllUser({ id, org_id: req.user.org_id })
  res.status(200).json(shapeUser(updatedUser))
})

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  const [affectedCount] = await updateUserModel({ active: false, org_id: req.user.org_id }, id)

  if (affectedCount === 0) {
    // Either no such user, or it belongs to a different org.
    res.status(404)
    throw new Error("User not found")
  }

  res.status(200).json({ id: Number(id) })
})

export { createUser, getAllUser, updateUser, deleteUser }
