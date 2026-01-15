import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Invoice } from '../types'
import { Plus, ExternalLink } from 'lucide-react'

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      const res = await api.get('/invoices')
      setInvoices(res.data.invoices || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fiatSymbol = (currency: string) => ({ USD: '$', INR: '₹', EUR: '€' }[currency] || '$')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link to="/invoices/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-neutral-400 mb-4">No invoices yet</p>
            <Link to="/invoices/create">
              <Button>Create Your First Invoice</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Link key={invoice.id} to={`/invoice/${invoice.id}`}>
              <Card className="flex items-center justify-between hover:border-neutral-700 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium">{invoice.title}</p>
                  <p className="text-neutral-400 text-sm">
                    {fiatSymbol(invoice.fiat_currency)}{invoice.amount_fiat.toFixed(2)} {invoice.fiat_currency}
                    {' '}({invoice.amount_bch.toFixed(8)} BCH)
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Created {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'expired' ? 'error' : 'warning'}>
                    {invoice.status}
                  </Badge>
                  <ExternalLink size={16} className="text-neutral-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
