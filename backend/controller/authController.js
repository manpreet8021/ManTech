import Joi from "joi";
import bcrypt from "bcryptjs";
import asyncHandler from "../middleware/asyncHandler.js";
import { createUserModel, findUser } from "../model/userModel.js";
import { getUserRoleAndPermissions } from "../model/userRoleModel.js";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const SALT_ROUNDS = 10;

const validateUserCreateSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.",
    }),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const createUser = asyncHandler(async (req, res) => {
  const {error} = validateUserCreateSchema.validate(req.body, {abortEarly: false})

  if(error) {
    res.status(400)
    throw new Error(error.message)
  }

  const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS)

  let insertUser;
  try {
    insertUser = await createUserModel({ ...req.body, password: hashedPassword })
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      res.status(409)
      throw new Error("Email is already registered")
    }
    throw err
  }

  res.status(201).json({
    id: insertUser.id,
    name: insertUser.name,
    email: insertUser.email,
  });
});

const login = asyncHandler(async(req, res) => {
  const {error} = loginSchema.validate(req.body, {abortEarly: false})

  if(error) {
    res.status(400)
    throw new Error(error.message)
  }

  const {email, password} = req.body
  const user = await findUser({email})

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

  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    permissions,
  })
})

export {
  createUser,
  login
};
