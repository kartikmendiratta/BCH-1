import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { Offer } from '../types'
import { usePriceStore } from '../store/priceStore'
import { useAuthStore } from '../store/authStore'

export default function Marketplace() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { prices, fetchPrices } = usePriceStore()
  const { user } = useAuthStore()
  
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    type: searchParams.get('type') || 'sell',
    fiat: 'USD'
  })
  
  // Create offer modal
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newOffer, setNewOffer] = useState({
    type: 'sell' as 'buy' | 'sell',
    amount_bch: '',
    price_per_bch: '',
    fiat_currency: 'USD',
    payment_method: 'bank_transfer',
    min_limit: '',
    max_limit: ''
  })

  // Trade modal
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [tradeAmount, setTradeAmount] = useState('')
  const [initiating, setInitiating] = useState(false)

  useEffect(() => {
    fetchPrices()
    loadOffers()
  }, [filter])

  const loadOffers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/offers', { params: filter })
      setOffers(res.data.offers || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/offers', {
        ...newOffer,
        amount_bch: parseFloat(newOffer.amount_bch),
        price_per_bch: parseFloat(newOffer.price_per_bch),
        min_limit: parseFloat(newOffer.min_limit) || 0,
        max_limit: parseFloat(newOffer.max_limit) || parseFloat(newOffer.amount_bch) * parseFloat(newOffer.price_per_bch)
      })
      setShowCreate(false)
      loadOffers()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create offer')
    } finally {
      setCreating(false)
    }
  }

  const handleInitiateTrade = async () => {
    if (!selectedOffer) return
    setInitiating(true)
    try {
      const res = await api.post('/trades', {
        offer_id: selectedOffer.id,
        amount_bch: parseFloat(tradeAmount)
      })
      navigate(`/trade/${res.data.id}`)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate trade')
    } finally {
      setInitiating(false)
    }
  }

  const fiatSymbol = { USD: '$', INR: '₹', EUR: '€' }[filter.fiat] || '$'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <Button onClick={() => setShowCreate(true)}>Create Offer</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex bg-neutral-900 rounded-lg p-1">
          <button
            onClick={() => {
              setFilter(f => ({ ...f, type: 'sell' }))
              setSearchParams({ type: 'sell' })
            }}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter.type === 'sell' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Buy BCH
          </button>
          <button
            onClick={() => {
              setFilter(f => ({ ...f, type: 'buy' }))
              setSearchParams({ type: 'buy' })
            }}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              filter.type === 'buy' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sell BCH
          </button>
        </div>

        <Select
          value={filter.fiat}
          onChange={(e) => setFilter(f => ({ ...f, fiat: e.target.value }))}
          options={[
            { value: 'USD', label: 'USD' },
            { value: 'INR', label: 'INR' },
            { value: 'EUR', label: 'EUR' }
          ]}
        />
      </div>

      {/* Price Info */}
      {prices && (
        <div className="text-sm text-neutral-400">
          Current BCH price: {fiatSymbol}{prices[filter.fiat.toLowerCase() as keyof typeof prices]?.toFixed(2)}
        </div>
      )}

      {/* Offers */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <p className="text-neutral-400 text-center py-8">
            No offers available. Be the first to create one!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-neutral-400 text-sm">{offer.user_email || `User #${offer.user_id}`}</p>
                <p className="font-semibold">
                  {fiatSymbol}{offer.price_per_bch.toFixed(2)} <span className="text-neutral-500 text-sm">/ BCH</span>
                </p>
                <p className="text-neutral-400 text-sm">
                  {offer.amount_bch} BCH available • {offer.payment_method.replace('_', ' ')}
                </p>
                <p className="text-neutral-500 text-xs">
                  Limits: {fiatSymbol}{offer.min_limit} - {fiatSymbol}{offer.max_limit}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedOffer(offer)
                  setTradeAmount('')
                }}
                disabled={offer.user_id === user?.id}
              >
                {filter.type === 'sell' ? 'Buy' : 'Sell'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Create Offer Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Offer">
        <form onSubmit={handleCreateOffer} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNewOffer(o => ({ ...o, type: 'sell' }))}
              className={`flex-1 py-2 rounded-lg text-sm ${
                newOffer.type === 'sell' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              Sell BCH
            </button>
            <button
              type="button"
              onClick={() => setNewOffer(o => ({ ...o, type: 'buy' }))}
              className={`flex-1 py-2 rounded-lg text-sm ${
                newOffer.type === 'buy' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              Buy BCH
            </button>
          </div>

          <Input
            label="Amount (BCH)"
            type="number"
            step="0.00000001"
            placeholder="0.5"
            value={newOffer.amount_bch}
            onChange={(e) => setNewOffer(o => ({ ...o, amount_bch: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price per BCH"
              type="number"
              placeholder="450"
              value={newOffer.price_per_bch}
              onChange={(e) => setNewOffer(o => ({ ...o, price_per_bch: e.target.value }))}
              required
            />
            <Select
              label="Currency"
              value={newOffer.fiat_currency}
              onChange={(e) => setNewOffer(o => ({ ...o, fiat_currency: e.target.value }))}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'INR', label: 'INR' },
                { value: 'EUR', label: 'EUR' }
              ]}
            />
          </div>

          <Select
            label="Payment Method"
            value={newOffer.payment_method}
            onChange={(e) => setNewOffer(o => ({ ...o, payment_method: e.target.value }))}
            options={[
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'upi', label: 'UPI' },
              { value: 'paypal', label: 'PayPal' },
              { value: 'cash', label: 'Cash' }
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Limit"
              type="number"
              placeholder="50"
              value={newOffer.min_limit}
              onChange={(e) => setNewOffer(o => ({ ...o, min_limit: e.target.value }))}
            />
            <Input
              label="Max Limit"
              type="number"
              placeholder="500"
              value={newOffer.max_limit}
              onChange={(e) => setNewOffer(o => ({ ...o, max_limit: e.target.value }))}
            />
          </div>

          <Button type="submit" className="w-full" loading={creating}>
            Create Offer
          </Button>
        </form>
      </Modal>

      {/* Trade Modal */}
      <Modal
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        title={`${filter.type === 'sell' ? 'Buy' : 'Sell'} BCH`}
      >
        {selectedOffer && (
          <div className="space-y-4">
            <div className="bg-neutral-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Price</span>
                <span>{fiatSymbol}{selectedOffer.price_per_bch} / BCH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Available</span>
                <span>{selectedOffer.amount_bch} BCH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Payment</span>
                <span>{selectedOffer.payment_method.replace('_', ' ')}</span>
              </div>
            </div>

            <Input
              label="Amount (BCH)"
              type="number"
              step="0.00000001"
              placeholder="0.1"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
            />

            {tradeAmount && (
              <div className="text-sm text-neutral-400">
                You will {filter.type === 'sell' ? 'pay' : 'receive'}:{' '}
                <span className="text-white font-medium">
                  {fiatSymbol}{(parseFloat(tradeAmount) * selectedOffer.price_per_bch).toFixed(2)}
                </span>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleInitiateTrade}
              loading={initiating}
              disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
            >
              Start Trade
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
