import express from 'express';
import { createCourse, getAllCourse, updateCourse, deleteCourse } from '../controller/courseController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router()

router.route('/').post(protect, requirePermission('course', 'write'), createCourse)
router.route('/').get(protect, requirePermission('course'), getAllCourse)
router.route('/').put(protect, requirePermission('course', 'write'), updateCourse)
router.route('/:id').delete(protect, requirePermission('course', 'write'), deleteCourse)

export default router
