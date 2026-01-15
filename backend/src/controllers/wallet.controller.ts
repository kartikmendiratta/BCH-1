import { Response } from 'express'
import { supabase } from '../config/db'
import { AuthRequest } from '../middleware/auth.middleware'
import { generateAddress } from '../services/bch.service'
import { getBCHPrices } from '../services/price.service'

export async function getBalance(req: AuthRequest, res: Response) {
  try {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.userId)
      .single()
    
    if (error || !wallet) {
      // Create wallet if not exists
      const address = generateAddress()
      await supabase
        .from('wallets')
        .insert({ user_id: req.userId, address })

      return res.json({ balance_bch: 0, balance_usd: 0 })
    }

    const prices = await getBCHPrices()
    const balanceUsd = wallet.balance_bch * prices.usd

    res.json({
      balance_bch: wallet.balance_bch,
      balance_usd: balanceUsd
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get balance' })
  }
}

export async function getAddress(req: AuthRequest, res: Response) {
  try {
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.userId)
      .single()
    
    if (!wallet) {
      const address = generateAddress()
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({ user_id: req.userId, address })
        .select()
        .single()

      wallet = newWallet || { address }
    }

    res.json({ address: wallet.address })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get address' })
  }
}

export async function withdraw(req: AuthRequest, res: Response) {
  try {
    const { address, amount } = req.body

    if (!address || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid address or amount' })
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.userId)
      .single()

    if (!wallet || wallet.balance_bch < amount) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    // In production, this would create an actual BCH transaction
    // For demo, we just update balance
    const newBalance = wallet.balance_bch - amount
    await supabase
      .from('wallets')
      .update({ balance_bch: newBalance })
      .eq('user_id', req.userId)

    // Log transaction
    const fakeTxid = 'withdraw_' + Date.now().toString(16)
    await supabase
      .from('transactions')
      .insert({
        user_id: req.userId,
        txid: fakeTxid,
        type: 'withdrawal',
        amount_bch: amount
      })

    res.json({ message: 'Withdrawal submitted', txid: fakeTxid })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Withdrawal failed' })
  }
}

export async function getTransactions(req: AuthRequest, res: Response) {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('txid, type, amount_bch, confirmations, created_at')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // Transform to match expected format
    const formattedTransactions = transactions?.map(tx => ({
      ...tx,
      timestamp: tx.created_at
    }))

    res.json({ transactions: formattedTransactions })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get transactions' })
  }
}
