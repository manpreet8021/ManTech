import Joi from "joi";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import { createUserModel, updateUserModel } from "../model/userModel.js";
import { createUserRole, deleteUserRoleByUserId, findAllUser, findUsersByRoleName } from "../model/userRoleModel.js";
import { generatePasswordResetToken } from "../config/jwtToken.js";
import { sendMail } from "../config/mailer.js";
import { createPasswordReset, hashToken } from "../model/passwordResetModel.js";
import { createManagerTeacherMapping, deleteManagerTeacherMappingByTeacherId } from "../model/managerTeacherModel.js";

const SALT_ROUNDS = 10;
const MANAGER_ROLE_NAME = "Manager";

const validateAddUser = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role_ids: Joi.array().items(Joi.number().positive()).min(1).required(),
  manager_id: Joi.number().positive().allow(null).default(null),
})

// Email is set once at invite time and can't be edited afterwards — it's the
// key an admin uses to find/re-invite a user, and changing it silently would
// also desync the active-email uniqueness the DB enforces per org.
const validateUpdateUser = Joi.object({
  id: Joi.number().positive().required(),
  name: Joi.string().required(),
  role_ids: Joi.array().items(Joi.number().positive()).min(1).required(),
  manager_id: Joi.number().positive().allow(null).default(null),
})

const shapeUser = (user, managerId = null) => {
  const data = user.toJSON()
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    active: data.active,
    managerId,
    roles: data.UserRoleMappings.map((mapping) => ({
      id: mapping.Role.id,
      name: mapping.Role.name,
    })),
  }
}

const getAllUser = asyncHandler(async (req, res) => {
  const users = await findAllUser({ org_id: req.user.org_id })
  res.status(200).json(users.map((u) => shapeUser(u)))
})

const getAllManagers = asyncHandler(async (req, res) => {
  const managers = await findUsersByRoleName(req.user.org_id, MANAGER_ROLE_NAME)
  res.status(200).json(managers.map((m) => ({ id: m.id, name: m.name, email: m.email })))
})

const createUser = asyncHandler(async (req, res) => {
  const { name, email, roles: role_ids, managerId: manager_id } = req.body
  const { error, value } = validateAddUser.validate({ name, email, role_ids, manager_id }, { abortEarly: false })

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

  for (const role_id of value.role_ids) {
    await createUserRole({ role_id, user_id: newUser.id })
  }

  if (value.manager_id) {
    await createManagerTeacherMapping({ manager_id: value.manager_id, teacher_id: newUser.id })
  }

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

  res.status(201).json(shapeUser(createdUser, value.manager_id))
})

const updateUser = asyncHandler(async (req, res) => {
  const { id, name, roles: role_ids, managerId: manager_id } = req.body
  const { error, value } = validateUpdateUser.validate({ id, name, role_ids, manager_id }, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const [affectedCount] = await updateUserModel({ name, org_id: req.user.org_id }, value.id)

  if (affectedCount === 0) {
    // Either no such user, or it belongs to a different org — stop here,
    // before touching role mappings, so a foreign id can't be used to
    // reassign someone else's org's role.
    res.status(404)
    throw new Error("User not found")
  }

  await deleteUserRoleByUserId(value.id)
  for (const role_id of value.role_ids) {
    await createUserRole({ role_id, user_id: value.id })
  }

  await deleteManagerTeacherMappingByTeacherId(value.id)
  if (value.manager_id) {
    await createManagerTeacherMapping({ manager_id: value.manager_id, teacher_id: value.id })
  }

  const [updatedUser] = await findAllUser({ id: value.id, org_id: req.user.org_id })
  res.status(200).json(shapeUser(updatedUser, value.manager_id))
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

export { createUser, getAllUser, getAllManagers, updateUser, deleteUser }
