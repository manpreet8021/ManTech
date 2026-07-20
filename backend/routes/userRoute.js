import express from 'express';
import { createUser, getAllUser, updateUser, deleteUser } from '../controller/userController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router()

router.route('/').post(protect, requirePermission('user', 'write'), createUser)
router.route('/').get(protect, requirePermission('user'), getAllUser)
router.route('/').put(protect, requirePermission('user', 'write'), updateUser)
router.route('/:id').delete(protect, requirePermission('user', 'write'), deleteUser)

export default router
