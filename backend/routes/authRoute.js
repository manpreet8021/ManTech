import express from 'express';
import { login, resetPassword } from '../controller/authController.js';
import { upload } from '../middleware/multerMiddleware.js'

const router = express.Router()

router.route('/login').post(login)
router.route('/reset-password').post(resetPassword)

export default router
