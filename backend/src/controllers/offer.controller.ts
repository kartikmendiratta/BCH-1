import { Request, Response } from 'express'
import { supabase } from '../config/db'
import { AuthRequest } from '../middleware/auth.middleware'

export async function createOffer(req: AuthRequest, res: Response) {
  try {
    const { type, amount_bch, price_per_bch, fiat_currency, payment_method, min_limit, max_limit } = req.body

    if (!type || !amount_bch || !price_per_bch || !fiat_currency || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await supabase
      .from('offers')
      .insert({
        user_id: req.userId,
        type,
        amount_bch,
        price_per_bch,
        fiat_currency,
        payment_method,
        min_limit: min_limit || 0,
        max_limit: max_limit || (amount_bch * price_per_bch)
      })
      .select('id')
      .single()

    if (error) throw error

    res.json({ id: data.id, message: 'Offer created' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create offer' })
  }
}

export async function getOffers(req: Request, res: Response) {
  try {
    const { type, fiat, page = '1', limit = '20' } = req.query

    let query = supabase
      .from('offers')
      .select(`
        *,
        users!inner(email)
      `, { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    if (fiat) {
      query = query.eq('fiat_currency', fiat)
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const start = (pageNum - 1) * limitNum
    const end = start + limitNum - 1

    query = query.range(start, end)

    const { data: offers, count, error } = await query

    if (error) throw error

    // Transform to match expected format
    const formattedOffers = offers?.map(offer => ({
      ...offer,
      user_email: offer.users?.email,
      users: undefined
    }))

    res.json({ offers: formattedOffers, total: count || 0, page: pageNum })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get offers' })
  }
}

export async function getOffer(req: Request, res: Response) {
  try {
    const { id } = req.params

    const { data: offer, error } = await supabase
      .from('offers')
      .select(`
        *,
        users!inner(email)
      `)
      .eq('id', id)
      .single()

    if (error || !offer) {
      return res.status(404).json({ error: 'Offer not found' })
    }

    res.json({
      ...offer,
      user_email: offer.users?.email,
      users: undefined
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get offer' })
  }
}

export async function deleteOffer(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const { data: offer, error: fetchError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !offer) {
      return res.status(404).json({ error: 'Offer not found' })
    }

    if (offer.user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Offer deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete offer' })
  }
}
