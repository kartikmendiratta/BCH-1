import axios from 'axios'

interface PriceCache {
  prices: { usd: number; inr: number; eur: number } | null
  timestamp: number
}

let priceCache: PriceCache = {
  prices: null,
  timestamp: 0
}

const CACHE_TTL = 60000 // 1 minute

export async function getBCHPrices(): Promise<{ usd: number; inr: number; eur: number }> {
  // Return cached if fresh
  if (priceCache.prices && Date.now() - priceCache.timestamp < CACHE_TTL) {
    return priceCache.prices
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd,inr,eur',
      { timeout: 5000 }
    )

    const data = response.data['bitcoin-cash']
    
    const prices = {
      usd: data.usd,
      inr: data.inr,
      eur: data.eur
    }
    
    priceCache = {
      prices,
      timestamp: Date.now()
    }

    return prices
  } catch (err) {
    console.error('Price fetch error:', err)
    
    // Return cached or fallback
    if (priceCache.prices) {
      return priceCache.prices
    }

    // Fallback prices
    return {
      usd: 450,
      inr: 37500,
      eur: 415
    }
  }
}
