'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { usePriceStore } from '@/store/priceStore'
import { Trade } from '@/types'
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'

export default function Dashboard() {
  const { prices, fetchPrices } = usePriceStore()
  const [trades, setTrades] = useState<Trade[]>([])
  const [balance, setBalance] = useState({ balance_bch: 0, balance_usd: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrices()
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tradesRes, walletRes] = await Promise.all([
        api.get('/trades'),
        api.get('/wallet/balance')
      ])
      setTrades(tradesRes.data.trades || [])
      setBalance(walletRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const activeTrades = trades.filter(t => !['completed', 'cancelled'].includes(t.status))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/marketplace">
          <Button>
            <Plus size={18} className="mr-2" />
            New Trade
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <p className="text-neutral-400 text-sm mb-1">BCH Balance</p>
          <p className="text-2xl font-bold">{balance.balance_bch.toFixed(8)} BCH</p>
          <p className="text-neutral-500 text-sm">${balance.balance_usd.toFixed(2)} USD</p>
        </Card>

        <Card>
          <p className="text-neutral-400 text-sm mb-1">BCH Price</p>
          <p className="text-2xl font-bold">${prices?.usd.toFixed(2) || '---'}</p>
          <p className="text-neutral-500 text-sm">
            ₹{prices?.inr.toFixed(2) || '---'} | €{prices?.eur.toFixed(2) || '---'}
          </p>
        </Card>

        <Card>
          <p className="text-neutral-400 text-sm mb-1">Active Trades</p>
          <p className="text-2xl font-bold">{activeTrades.length}</p>
          <p className="text-neutral-500 text-sm">{trades.length} total trades</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/marketplace?type=buy">
          <Card className="hover:border-neutral-600 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
                <ArrowDownRight className="text-green-400" />
              </div>
              <div>
                <p className="font-semibold">Buy BCH</p>
                <p className="text-neutral-400 text-sm">Find sellers and buy Bitcoin Cash</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/marketplace?type=sell">
          <Card className="hover:border-neutral-600 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
                <ArrowUpRight className="text-red-400" />
              </div>
              <div>
                <p className="font-semibold">Sell BCH</p>
                <p className="text-neutral-400 text-sm">Create an offer or find buyers</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Trades */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
        {trades.length === 0 ? (
          <Card>
            <p className="text-neutral-400 text-center py-8">
              No trades yet. Start your first trade!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {trades.slice(0, 5).map((trade) => (
              <Link key={trade.id} href={`/trade/${trade.id}`}>
                <Card className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{trade.amount_bch} BCH</p>
                    <p className="text-neutral-400 text-sm">
                      {trade.amount_fiat} {trade.fiat_currency}
                    </p>
                  </div>
                  <Badge
                    variant={
                      trade.status === 'completed' ? 'success' :
                      trade.status === 'disputed' ? 'error' :
                      trade.status === 'cancelled' ? 'error' :
                      'warning'
                    }
                  >
                    {trade.status}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}