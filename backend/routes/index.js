import express from 'express';
import authRoute from './authRoute.js'
import rolePermission from './rolePermissionRoute.js'
import userRoute from './userRoute.js'

const router = express.Router();
router.use('/auth', authRoute)
router.use('/rolePermission', rolePermission)
router.use('/user', userRoute)

export default router