import { Router } from 'express'
import { getBalance, getAddress, withdraw, getTransactions } from '../controllers/wallet.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/balance', authMiddleware, getBalance)
router.get('/address', authMiddleware, getAddress)
router.post('/withdraw', authMiddleware, withdraw)
router.get('/transactions', authMiddleware, getTransactions)

export default router
