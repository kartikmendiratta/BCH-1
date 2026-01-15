import { Request, Response } from 'express'
import { getBCHPrices } from '../services/price.service'

export async function getPrices(_req: Request, res: Response) {
  try {
    const prices = await getBCHPrices()
    res.json(prices)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get prices' })
  }
}
