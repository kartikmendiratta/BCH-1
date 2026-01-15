import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware'
import { supabase } from '@/lib/config/db'
import { getBalance } from '@/lib/services/bch.service'

// GET /api/wallet/balance - Get user's wallet balance
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.userId

    // Get wallet info
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('address')
      .eq('user_id', userId)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Get BCH balance from blockchain (mock for now)
    const balance_bch = await getBalance(wallet.address)
    
    // Get current price to calculate USD value
    const priceResponse = await fetch('/api/price')
    const prices = await priceResponse.json()
    const balance_usd = balance_bch * (prices?.usd || 200)

    return NextResponse.json({
      balance_bch,
      balance_usd,
      address: wallet.address
    })
  } catch (error) {
    console.error('Get balance error:', error)
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    )
  }
})