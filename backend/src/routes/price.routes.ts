import { Router } from 'express'
import { getPrices } from '../controllers/price.controller'

const router = Router()

router.get('/', getPrices)

export default router
