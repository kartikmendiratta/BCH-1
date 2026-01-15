import { Response } from 'express'
import { supabase } from '../config/db'
import { AuthRequest } from '../middleware/auth.middleware'
import { generateAddress } from '../services/bch.service'

export async function initiateTrade(req: AuthRequest, res: Response) {
  try {
    const { offer_id, amount_bch } = req.body

    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offer_id)
      .single()

    if (offerError || !offer) {
      return res.status(404).json({ error: 'Offer not found' })
    }

    if (offer.user_id === req.userId) {
      return res.status(400).json({ error: 'Cannot trade with yourself' })
    }

    if (amount_bch > offer.amount_bch) {
      return res.status(400).json({ error: 'Amount exceeds available' })
    }

    const amountFiat = amount_bch * offer.price_per_bch

    // Determine buyer/seller
    let buyerId, sellerId
    if (offer.type === 'sell') {
      buyerId = req.userId
      sellerId = offer.user_id
    } else {
      buyerId = offer.user_id
      sellerId = req.userId
    }

    // Generate escrow address
    const escrowAddress = generateAddress()

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        offer_id,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount_bch,
        amount_fiat: amountFiat,
        fiat_currency: offer.fiat_currency,
        payment_method: offer.payment_method,
        escrow_address: escrowAddress,
        status: 'initiated'
      })
      .select('id')
      .single()

    if (tradeError) throw tradeError

    // Update offer amount
    const newAmount = offer.amount_bch - amount_bch
    if (newAmount <= 0) {
      await supabase
        .from('offers')
        .update({ status: 'inactive' })
        .eq('id', offer_id)
    } else {
      await supabase
        .from('offers')
        .update({ amount_bch: newAmount })
        .eq('id', offer_id)
    }

    res.json({
      id: trade.id,
      escrow_address: escrowAddress,
      status: 'initiated'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to initiate trade' })
  }
}

export async function getTrades(req: AuthRequest, res: Response) {
  try {
    const { data: trades, error } = await supabase
      .from('trades')
      .select(`
        *,
        buyer:users!trades_buyer_id_fkey(email),
        seller:users!trades_seller_id_fkey(email)
      `)
      .or(`buyer_id.eq.${req.userId},seller_id.eq.${req.userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formattedTrades = trades?.map(trade => ({
      ...trade,
      buyer_email: trade.buyer?.email,
      seller_email: trade.seller?.email,
      buyer: undefined,
      seller: undefined
    }))

    res.json({ trades: formattedTrades })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get trades' })
  }
}

export async function getTrade(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .select(`
        *,
        buyer:users!trades_buyer_id_fkey(id, email),
        seller:users!trades_seller_id_fkey(id, email)
      `)
      .eq('id', id)
      .single()

    if (tradeError || !trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    // Check access
    if (trade.buyer?.id !== req.userId && trade.seller?.id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Get messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('trade_id', id)
      .order('created_at', { ascending: true })

    res.json({
      ...trade,
      buyer_id: trade.buyer?.id,
      seller_id: trade.seller?.id,
      buyer_email: trade.buyer?.email,
      seller_email: trade.seller?.email,
      buyer: { id: trade.buyer?.id, email: trade.buyer?.email },
      seller: { id: trade.seller?.id, email: trade.seller?.email },
      messages: messages || []
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get trade' })
  }
}

export async function updateTradeStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params
    const { status } = req.body

    const { data: trade, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    if (trade.buyer_id !== req.userId && trade.seller_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'initiated': ['funded', 'cancelled'],
      'funded': ['paid', 'cancelled'],
      'paid': ['completed', 'disputed'],
      'disputed': ['completed', 'cancelled']
    }

    if (!validTransitions[trade.status]?.includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' })
    }

    const { error } = await supabase
      .from('trades')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Status updated', status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update status' })
  }
}

export async function releaseBCH(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const { data: trade, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !trade) {
      return res.status(404).json({ error: 'Trade not found' })
    }

    if (trade.seller_id !== req.userId) {
      return res.status(403).json({ error: 'Only seller can release' })
    }

    if (trade.status !== 'paid') {
      return res.status(400).json({ error: 'Trade must be in paid status' })
    }

    // In production, this would execute the smart contract release
    // For demo, we just update status
    const fakeTxid = 'demo_' + Date.now().toString(16)
    
    const { error } = await supabase
      .from('trades')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'BCH released', txid: fakeTxid })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to release BCH' })
  }
}
