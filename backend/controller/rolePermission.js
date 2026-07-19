import asyncHandler from "../middleware/asyncHandler.js";
import { createPermissionModel, findAllPermissions } from "../model/permissionModel.js";
import { createRoleModel, findAllRoles } from "../model/roleModel.js";
import { createRolePermissionModel, findAllRolePermissions } from "../model/rolePermissionModel.js";
import { getUserRoleAndPermissions } from "../model/userRoleModel.js";
import Joi from "joi";

const createRoleValidation = Joi.object({
    name: Joi.string().required(),
    org_id: Joi.number().positive().required()
})

const createPermissionValidation = Joi.object({
    resource: Joi.string().required(),
    action: Joi.string().required()
})

const rolePermissionValidation = Joi.object({
    role_id: Joi.number().positive().required(),
    permission_id: Joi.number().positive().required()
})

const getAllRoles = asyncHandler(async(req, res) => {
    const roles = await findAllRoles({active: true, org_id: req.org_id})
    res.status(200).json(roles)
})

const getAllPermission = asyncHandler(async(req, res) => {
    const permissions = await findAllPermissions({active: true})
    res.status(200).json(permissions)
})

const getRolePermission = asyncHandler(async(req,res) => {
    const rolePermissions = await findAllRolePermissions({active: true})
    res.status(200).json(rolePermissions)
})

const getUserPermission = asyncHandler(async(req, res) => {
    const { role, permissions } = await getUserRoleAndPermissions(req.params.id)
    res.status(200).json({ role, permissions })
})

const createRole = asyncHandler(async(req, res) => {
    const { error } = createRoleValidation.validate(req.body, {abortEarly: false})

    if(error) {
        res.status(400)
        throw new Error(error.message);
    }

    const insertedRole = await createRoleModel(req.body)

    res.status(200).json({ message: "Role created successfully" });
})

const createPermission = asyncHandler(async(req, res) => {
    const {error} = createPermissionValidation.validate(req.body, {abortEarly: false})

    if(error) {
        res.status(400)
        throw new Error(error.message);
    }

    const insertedPermission = await createPermissionModel(req.body)

    res.status(201).json()
})

const createRolePermission = asyncHandler(async(req,res) => {
    const { error } = rolePermissionValidation.validate(req.body, {abortEarly: false})

    if(error) {
        res.status(400)
        throw new Error(error.message)
    }

    const insertedRolePermission = await createRolePermissionModel(req.body)

    res.status(201).json()
})

export {getAllRoles, getAllPermission, createRolePermission, createRole, createPermission, getUserPermission, getRolePermission}