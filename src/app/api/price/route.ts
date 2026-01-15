import { NextRequest, NextResponse } from 'next/server'
import { getBCHPrices } from '@/lib/services/price.service'

export async function GET() {
  try {
    const prices = await getBCHPrices()
    return NextResponse.json(prices)
  } catch (error) {
    console.error('Price fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to get prices' },
      { status: 500 }
    )
  }
}