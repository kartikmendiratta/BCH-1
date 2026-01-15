import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { useAuth0 } from '@auth0/auth0-react'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import { Trade as TradeType, Message } from '../types'
import { Send, ExternalLink, Copy, Check, Loader2 } from 'lucide-react'
 
export default function Trade() {
  const { id } = useParams()
  const { user, isAuthenticated, isLoading } = useAuth0()
  const [trade, setTrade] = useState<TradeType | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    
    loadTrade()
    
    // Setup socket
    socketRef.current = io(import.meta.env.VITE_WS_URL || window.location.origin)
    socketRef.current.emit('join_trade', id)
    
    socketRef.current.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })
    
    socketRef.current.on('trade_update', (data: { status: string }) => {
      setTrade(prev => prev ? { ...prev, status: data.status as TradeType['status'] } : null)
    })

    return () => {
      socketRef.current?.emit('leave_trade', id)
      socketRef.current?.disconnect()
    }
  }, [id, isAuthenticated, isLoading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadTrade = async () => {
    try {
      const res = await api.get(`/trades/${id}`)
      setTrade(res.data)
      setMessages(res.data.messages || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return
    
    socketRef.current.emit('send_message', {
      tradeId: id,
      content: newMessage.trim()
    })
    setNewMessage('')
  }

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      await api.patch(`/trades/${id}/status`, { status })
      setTrade(prev => prev ? { ...prev, status: status as TradeType['status'] } : null)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update')
    } finally {
      setUpdating(false)
    }
  }

  const releaseBCH = async () => {
    if (!confirm('Are you sure you want to release the BCH? This cannot be undone.')) return
    setUpdating(true)
    try {
      await api.post(`/trades/${id}/release`)
      setTrade(prev => prev ? { ...prev, status: 'completed' } : null)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to release')
    } finally {
      setUpdating(false)
    }
  }

  const copyAddress = () => {
    if (trade?.escrow_address) {
      navigator.clipboard.writeText(trade.escrow_address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <p className="text-neutral-400 text-center py-8">Please log in to view trades</p>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!trade) {
    return (
      <Card>
        <p className="text-neutral-400 text-center py-8">Trade not found</p>
      </Card>
    )
  }

  const isBuyer = trade.buyer_id === Number(user?.sub)
  const isSeller = trade.seller_id === Number(user?.sub)
  const fiatSymbol = { USD: '$', INR: '₹', EUR: '€' }[trade.fiat_currency] || '$'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trade #{trade.id}</h1>
        <Badge
          variant={
            trade.status === 'completed' ? 'success' :
            trade.status === 'disputed' || trade.status === 'cancelled' ? 'error' :
            'warning'
          }
        >
          {trade.status}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trade Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Trade Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-neutral-400 text-sm">Amount</p>
                <p className="font-medium">{trade.amount_bch} BCH</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Price</p>
                <p className="font-medium">{fiatSymbol}{trade.amount_fiat}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Payment Method</p>
                <p className="font-medium">{trade.payment_method?.replace('_', ' ') || 'Bank Transfer'}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Your Role</p>
                <p className="font-medium">{isBuyer ? 'Buyer' : isSeller ? 'Seller' : 'Observer'}</p>
              </div>
            </div>
          </Card>

          {/* Escrow */}
          {trade.escrow_address && (
            <Card>
              <h2 className="text-lg font-semibold mb-4">Escrow Address</h2>
              <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-3">
                <code className="text-sm text-neutral-300 flex-1 truncate">
                  {trade.escrow_address}
                </code>
                <button onClick={copyAddress} className="text-neutral-400 hover:text-white">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <a
                  href={`https://blockchair.com/bitcoin-cash/address/${trade.escrow_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            
            {trade.status === 'initiated' && isSeller && (
              <p className="text-neutral-400 text-sm mb-4">
                Please fund the escrow address above with {trade.amount_bch} BCH.
              </p>
            )}

            {trade.status === 'funded' && isBuyer && (
              <div className="space-y-4">
                <p className="text-neutral-400 text-sm">
                  The escrow is funded. Please send {fiatSymbol}{trade.amount_fiat} to the seller
                  using {trade.payment_method?.replace('_', ' ')}.
                </p>
                <Button onClick={() => updateStatus('paid')} loading={updating}>
                  I Have Paid
                </Button>
              </div>
            )}

            {trade.status === 'paid' && isSeller && (
              <div className="space-y-4">
                <p className="text-neutral-400 text-sm">
                  The buyer has marked the payment as sent. Once you confirm receipt,
                  release the BCH.
                </p>
                <Button onClick={releaseBCH} loading={updating}>
                  Release BCH
                </Button>
              </div>
            )}

            {trade.status === 'completed' && (
              <p className="text-green-400">
                ✓ Trade completed successfully!
              </p>
            )}

            {trade.status === 'cancelled' && (
              <p className="text-red-400">
                ✗ Trade was cancelled.
              </p>
            )}
          </Card>
        </div>

        {/* Chat */}
        <div className="lg:col-span-1">
          <Card className="h-[500px] flex flex-col p-0">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="font-semibold">Chat</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center">No messages yet</p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`flex ${msg.sender_id === Number(user?.sub) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.sender_id === Number(user?.sub)
                          ? 'bg-white text-black'
                          : 'bg-neutral-800 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-neutral-800">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
