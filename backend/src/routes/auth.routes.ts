import { Router } from 'express'
import { getMe, createProfile } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/me', authMiddleware, getMe)
router.post('/profile', authMiddleware, createProfile)

export default router
