import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware'
import { supabase } from '@/lib/config/db'

// GET /api/trades - Get user's trades
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.userId

    const { data: trades, error } = await supabase
      .from('trades')
      .select(`
        *,
        buyer:users!trades_buyer_id_fkey(id, email),
        seller:users!trades_seller_id_fkey(id, email)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trades' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trades: trades || [] })
  } catch (error) {
    console.error('Get trades error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    )
  }
})

// POST /api/trades - Create a new trade
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.userId
    const { offer_id, amount_bch } = await req.json()

    if (!offer_id || !amount_bch) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the offer
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offer_id)
      .single()

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Calculate fiat amount
    const amount_fiat = amount_bch * offer.price_per_bch

    // Create trade
    const { data: trade, error } = await supabase
      .from('trades')
      .insert({
        offer_id,
        buyer_id: offer.type === 'sell' ? userId : offer.user_id,
        seller_id: offer.type === 'sell' ? offer.user_id : userId,
        amount_bch,
        amount_fiat,
        fiat_currency: offer.fiat_currency,
        payment_method: offer.payment_method,
        escrow_address: 'mock_escrow_address',
        status: 'initiated'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create trade' },
        { status: 500 }
      )
    }

    return NextResponse.json(trade, { status: 201 })
  } catch (error) {
    console.error('Create trade error:', error)
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    )
  }
})