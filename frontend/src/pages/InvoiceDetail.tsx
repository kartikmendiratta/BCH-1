import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Invoice } from '../types'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, Share2 } from 'lucide-react'

export default function InvoiceDetail() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadInvoice()
  }, [id])

  const loadInvoice = async () => {
    try {
      const res = await api.get(`/invoices/${id}`)
      setInvoice(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (invoice?.payment_address) {
      navigator.clipboard.writeText(invoice.payment_address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareInvoice = () => {
    const url = `${window.location.origin}/invoice/${id}`
    navigator.clipboard.writeText(url)
    alert('Invoice link copied!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <Card>
        <p className="text-neutral-400 text-center py-8">Invoice not found</p>
      </Card>
    )
  }

  const fiatSymbol = { USD: '$', INR: '₹', EUR: '€' }[invoice.fiat_currency] || '$'
  const bchUri = `bitcoincash:${invoice.payment_address}?amount=${invoice.amount_bch}`

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoice #{invoice.id}</h1>
        <Badge
          variant={invoice.status === 'paid' ? 'success' : invoice.status === 'expired' ? 'error' : 'warning'}
        >
          {invoice.status}
        </Badge>
      </div>

      <Card>
        <div className="text-center space-y-6">
          {/* Amount */}
          <div>
            <p className="text-neutral-400 text-sm mb-1">{invoice.title}</p>
            <p className="text-4xl font-bold">
              {fiatSymbol}{invoice.amount_fiat.toFixed(2)}
            </p>
            <p className="text-neutral-400">{invoice.amount_bch.toFixed(8)} BCH</p>
          </div>

          {invoice.description && (
            <p className="text-neutral-400 text-sm">{invoice.description}</p>
          )}

          {invoice.status === 'pending' && (
            <>
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={bchUri} size={200} />
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-neutral-400 text-sm mb-2">Payment Address</p>
                <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-3 max-w-md mx-auto">
                  <code className="text-xs text-neutral-300 flex-1 truncate">
                    {invoice.payment_address}
                  </code>
                  <button onClick={copyAddress} className="text-neutral-400 hover:text-white">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button variant="secondary" onClick={shareInvoice}>
                  <Share2 size={18} className="mr-2" />
                  Share Link
                </Button>
              </div>
            </>
          )}

          {invoice.status === 'paid' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-400" size={32} />
              </div>
              <p className="text-green-400 font-medium">Payment Received!</p>
              {invoice.paid_at && (
                <p className="text-neutral-400 text-sm mt-1">
                  Paid on {new Date(invoice.paid_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {invoice.status === 'expired' && (
            <div className="py-8">
              <p className="text-red-400">This invoice has expired</p>
            </div>
          )}
        </div>
      </Card>

      {/* Details */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Invoice ID</span>
            <span>#{invoice.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Created</span>
            <span>{new Date(invoice.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Amount (Fiat)</span>
            <span>{fiatSymbol}{invoice.amount_fiat.toFixed(2)} {invoice.fiat_currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Amount (BCH)</span>
            <span>{invoice.amount_bch.toFixed(8)} BCH</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
