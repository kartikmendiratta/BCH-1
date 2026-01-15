import { Router } from 'express'
import { createOffer, getOffers, getOffer, deleteOffer } from '../controllers/offer.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/', getOffers)
router.get('/:id', getOffer)
router.post('/', authMiddleware, createOffer)
router.delete('/:id', authMiddleware, deleteOffer)

export default router
