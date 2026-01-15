import { Router } from 'express'
import { createInvoice, getInvoices, getInvoice, getPublicInvoice } from '../controllers/invoice.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authMiddleware, getInvoices)
router.get('/public/:id', getPublicInvoice)
router.get('/:id', authMiddleware, getInvoice)
router.post('/', authMiddleware, createInvoice)

export default router
