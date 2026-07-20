import Joi from "joi";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import { createUserModel } from "../model/userModel.js";
import { createUserRole, findAllUser } from "../model/userRoleModel.js";

const SALT_ROUNDS = 10;

const validateAddUser = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role_id: Joi.number().positive().required()
})

const createUser = asyncHandler(async (req, res) => {
  const { error } = validateAddUser.validate(req.body, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const { name, email, role_id } = req.body

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

  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  })
})

const getAllUser = asyncHandler(async (req, res) => {
  const users = await findAllUser({ org_id: req.user.org_id })

  const result = users.map(user => {
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
  })
  res.status(200).json(result)
})

export { createUser, getAllUser }
