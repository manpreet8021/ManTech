import express from 'express';
import { createPermission, createRole, createRolePermission, getAllPermission, getAllRoles, getRolePermission, getUserPermission } from '../controller/rolePermission.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router()

router.route('/role').get(protect, getAllRoles)
router.route('/permission').get(protect, getAllPermission)
router.route('/role').post(createRole)
router.route('/permission').post(createPermission)
router.route('/rolePermission').get(getRolePermission)
router.route('/rolePermission').post(createRolePermission)
router.route('/:id').post(getUserPermission)

export default router