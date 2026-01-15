import { Request, Response } from 'express'
import { supabase } from '../config/db'
import { AuthRequest } from '../middleware/auth.middleware'
import { generateAddress } from '../services/bch.service'
import { getBCHPrices } from '../services/price.service'

export async function createInvoice(req: AuthRequest, res: Response) {
  try {
    const { title, description, amount_fiat, fiat_currency } = req.body

    if (!title || !amount_fiat || !fiat_currency) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get BCH price
    const prices = await getBCHPrices()
    const fiatKey = fiat_currency.toLowerCase() as keyof typeof prices
    const bchPrice = prices[fiatKey]
    
    if (!bchPrice) {
      return res.status(400).json({ error: 'Invalid currency' })
    }

    const amountBch = amount_fiat / bchPrice
    const paymentAddress = generateAddress()

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: req.userId,
        title,
        description: description || null,
        amount_fiat,
        fiat_currency,
        amount_bch: amountBch,
        payment_address: paymentAddress
      })
      .select('id')
      .single()

    if (error) throw error

    res.json({
      id: data.id,
      payment_address: paymentAddress,
      amount_bch: amountBch,
      status: 'pending'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create invoice' })
  }
}

export async function getInvoices(req: AuthRequest, res: Response) {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ invoices })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get invoices' })
  }
}

export async function getInvoice(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !invoice) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    res.json(invoice)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get invoice' })
  }
}

export async function getPublicInvoice(req: Request, res: Response) {
  try {
    const { id } = req.params

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('id, title, description, amount_fiat, fiat_currency, amount_bch, payment_address, status, created_at, paid_at')
      .eq('id', id)
      .single()

    if (error || !invoice) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    res.json(invoice)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get invoice' })
  }
}
