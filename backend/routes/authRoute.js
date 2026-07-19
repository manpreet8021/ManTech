import express from 'express';
import { login } from '../controller/authController.js';
import { upload } from '../middleware/multerMiddleware.js'

const router = express.Router()

router.route('/login').post(login)

export default router