import express from 'express';
import authRoute from './authRoute.js'
import rolePermission from './rolePermissionRoute.js'
import userRoute from './userRoute.js'
import courseRoute from './courseRoute.js'
import videoRoute from './videoRoute.js'

const router = express.Router();
router.use('/auth', authRoute)
router.use('/rolePermission', rolePermission)
router.use('/user', userRoute)
router.use('/course', courseRoute)
router.use('/video', videoRoute)

export default router