import express from 'express';
import { createUser, getAllUser } from '../controller/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router()

router.route('/').post(protect, createUser)
router.route('/').get(protect, getAllUser)

export default router
