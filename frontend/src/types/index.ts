export interface User {
  id: number
  email: string
  created_at: string
}

export interface Offer {
  id: number
  user_id: number
  user_email?: string
  type: 'buy' | 'sell'
  amount_bch: number
  price_per_bch: number
  fiat_currency: 'USD' | 'INR' | 'EUR'
  payment_method: string
  min_limit: number
  max_limit: number
  status: 'active' | 'inactive'
  created_at: string
}

export interface Trade {
  id: number
  offer_id: number
  buyer_id: number
  seller_id: number
  buyer?: User
  seller?: User
  amount_bch: number
  amount_fiat: number
  fiat_currency: string
  payment_method: string
  escrow_address: string
  status: 'initiated' | 'funded' | 'paid' | 'completed' | 'disputed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  trade_id: number
  sender_id: number
  content: string
  created_at: string
}

export interface Invoice {
  id: number
  user_id: number
  title: string
  description?: string
  amount_fiat: number
  fiat_currency: string
  amount_bch: number
  payment_address: string
  status: 'pending' | 'paid' | 'expired'
  paid_at?: string
  created_at: string
}

export interface WalletInfo {
  balance_bch: number
  balance_usd: number
  address: string
}

export interface Transaction {
  txid: string
  type: 'deposit' | 'withdrawal' | 'escrow'
  amount_bch: number
  confirmations: number
  timestamp: string
}

export interface PriceData {
  usd: number
  inr: number
  eur: number
}
