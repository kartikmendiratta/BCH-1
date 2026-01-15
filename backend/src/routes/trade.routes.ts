import { Router } from 'express'
import { initiateTrade, getTrades, getTrade, updateTradeStatus, releaseBCH } from '../controllers/trade.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authMiddleware, getTrades)
router.get('/:id', authMiddleware, getTrade)
router.post('/', authMiddleware, initiateTrade)
router.patch('/:id/status', authMiddleware, updateTradeStatus)
router.post('/:id/release', authMiddleware, releaseBCH)

export default router
