import express from 'express';
import { createVideo, getAllVideos, getVideoDetail } from '../controller/videoController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/multerMiddleware.js';

const router = express.Router()

router.route('/').post(protect, requirePermission('course', 'write'), upload.single('pdf'), createVideo)
router.route('/detail/:videoId').get(protect, requirePermission('course'), getVideoDetail)
router.route('/:courseId').get(protect, requirePermission('course'), getAllVideos)

export default router
