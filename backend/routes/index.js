import express from 'express';
import authRoute from './authRoute.js'
import rolePermission from './rolePermissionRoute.js'

const router = express.Router();
router.use('/auth', authRoute)
router.use('/rolePermission', rolePermission)

export default router