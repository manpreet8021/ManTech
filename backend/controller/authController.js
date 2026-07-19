import Joi from "joi";
import bcrypt from "bcryptjs";
import asyncHandler from "../middleware/asyncHandler.js";
import { createUserModel, findUser } from "../model/userModel.js";
import { getUserRoleAndPermissions } from "../model/userRoleModel.js";
import { generateToken } from "../config/jwtToken.js";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const SALT_ROUNDS = 10;

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const login = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const { email, password } = req.body
  const user = await findUser({ email })

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

export {
  login
};
