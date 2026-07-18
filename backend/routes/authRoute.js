import express from 'express';
import { checkWork } from '../controller/authController.js';
import { upload } from '../middleware/multerMiddleware.js'

const router = express.Router()

router.route('/').get(checkWork)

export default router