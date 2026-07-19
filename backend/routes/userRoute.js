import express from 'express';
import { createUser } from '../controller/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router()

router.route('/').post(protect, createUser)

export default router
