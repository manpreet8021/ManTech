import express from 'express';
import { createUser, getAllUser, getAllManagers, updateUser, deleteUser } from '../controller/userController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router()

router.route('/managers').get(protect, getAllManagers)
router.route('/').post(protect, requirePermission('users', 'write'), createUser)
router.route('/').get(protect, requirePermission('users'), getAllUser)
router.route('/').put(protect, requirePermission('users', 'write'), updateUser)
router.route('/:id').delete(protect, requirePermission('users', 'write'), deleteUser)

export default router
