import { useEffect, useState } from 'react'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { WalletInfo, Transaction } from '../types'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, ExternalLink } from 'lucide-react'

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // Withdraw
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    loadWallet()
  }, [])

  const loadWallet = async () => {
    try {
      const [balanceRes, addressRes, txRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/address'),
        api.get('/wallet/transactions')
      ])
      setWallet({
        ...balanceRes.data,
        address: addressRes.data.address
      })
      setTransactions(txRes.data.transactions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm(`Withdraw ${withdrawAmount} BCH to ${withdrawAddress}?`)) return
    
    setWithdrawing(true)
    try {
      await api.post('/wallet/withdraw', {
        address: withdrawAddress,
        amount: parseFloat(withdrawAmount)
      })
      alert('Withdrawal submitted!')
      setWithdrawAddress('')
      setWithdrawAmount('')
      loadWallet()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Withdrawal failed')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Balance */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Balance</h2>
          <p className="text-4xl font-bold mb-2">{wallet?.balance_bch.toFixed(8)} BCH</p>
          <p className="text-neutral-400">${wallet?.balance_usd.toFixed(2)} USD</p>
        </Card>

        {/* Deposit */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Deposit</h2>
          {wallet?.address && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG value={wallet.address} size={150} />
              </div>
              <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-3">
                <code className="text-xs text-neutral-300 flex-1 truncate">
                  {wallet.address}
                </code>
                <button onClick={copyAddress} className="text-neutral-400 hover:text-white">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Withdraw */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Withdraw</h2>
        <form onSubmit={handleWithdraw} className="space-y-4 max-w-md">
          <Input
            label="BCH Address"
            placeholder="bitcoincash:q..."
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
            required
          />
          <Input
            label="Amount (BCH)"
            type="number"
            step="0.00000001"
            placeholder="0.1"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            required
          />
          <Button type="submit" loading={withdrawing}>
            Withdraw
          </Button>
        </form>
      </Card>

      {/* Transactions */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-neutral-400 text-sm border-b border-neutral-800">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Confirmations</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.txid} className="border-b border-neutral-800/50">
                    <td className="py-3">
                      <span className={tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3">{tx.amount_bch.toFixed(8)} BCH</td>
                    <td className="py-3">{tx.confirmations}</td>
                    <td className="py-3 text-neutral-400">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <a
                        href={`https://blockchair.com/bitcoin-cash/transaction/${tx.txid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-white"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
