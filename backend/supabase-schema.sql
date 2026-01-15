-- Run this SQL in your Supabase Dashboard SQL Editor to create the required tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  auth0_sub TEXT UNIQUE,
  email TEXT,
  password_hash TEXT,
  name TEXT,
  bch_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  amount_bch DECIMAL NOT NULL,
  price_per_bch DECIMAL NOT NULL,
  fiat_currency TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  min_limit DECIMAL DEFAULT 0,
  max_limit DECIMAL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  offer_id INTEGER NOT NULL REFERENCES offers(id),
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  amount_bch DECIMAL NOT NULL,
  amount_fiat DECIMAL NOT NULL,
  fiat_currency TEXT NOT NULL,
  payment_method TEXT,
  escrow_address TEXT,
  status TEXT DEFAULT 'initiated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  trade_id INTEGER NOT NULL REFERENCES trades(id),
  sender_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  amount_fiat DECIMAL NOT NULL,
  fiat_currency TEXT NOT NULL,
  amount_bch DECIMAL NOT NULL,
  payment_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  address TEXT NOT NULL,
  balance_bch DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  txid TEXT,
  type TEXT NOT NULL,
  amount_bch DECIMAL NOT NULL,
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_buyer_id ON trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_trades_seller_id ON trades(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_trade_id ON messages(trade_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
