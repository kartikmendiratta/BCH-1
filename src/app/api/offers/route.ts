import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware'
import { supabase } from '@/lib/config/db'

// GET /api/offers - Get all active offers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'buy' or 'sell'
    const currency = searchParams.get('currency')

    let query = supabase
      .from('offers')
      .select(`
        *,
        user:users(email)
      `)
      .eq('status', 'active')

    if (type) {
      query = query.eq('type', type)
    }
    
    if (currency) {
      query = query.eq('fiat_currency', currency)
    }

    const { data: offers, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch offers' },
        { status: 500 }
      )
    }

    return NextResponse.json({ offers: offers || [] })
  } catch (error) {
    console.error('Get offers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

// POST /api/offers - Create a new offer
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.userId
    const {
      type,
      amount_bch,
      price_per_bch,
      fiat_currency,
      payment_method,
      min_limit,
      max_limit
    } = await req.json()

    // Validate required fields
    if (!type || !amount_bch || !price_per_bch || !fiat_currency || !payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: offer, error } = await supabase
      .from('offers')
      .insert({
        user_id: userId,
        type,
        amount_bch,
        price_per_bch,
        fiat_currency,
        payment_method,
        min_limit: min_limit || 0,
        max_limit: max_limit || amount_bch * price_per_bch,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create offer' },
        { status: 500 }
      )
    }

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    console.error('Create offer error:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
})