import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

export default function CreateInvoice() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState({
    title: '',
    description: '',
    amount_fiat: '',
    fiat_currency: 'USD'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('/invoices', {
        ...invoice,
        amount_fiat: parseFloat(invoice.amount_fiat)
      })
      navigate(`/invoice/${res.data.id}`)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Invoice</h1>

      <Card className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g., Web Development Service"
            value={invoice.title}
            onChange={(e) => setInvoice(i => ({ ...i, title: e.target.value }))}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm text-neutral-400">Description (Optional)</label>
            <textarea
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5
                         text-white placeholder:text-neutral-600
                         focus:outline-none focus:border-neutral-600 transition-colors
                         min-h-[100px] resize-none"
              placeholder="Invoice details..."
              value={invoice.description}
              onChange={(e) => setInvoice(i => ({ ...i, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              value={invoice.amount_fiat}
              onChange={(e) => setInvoice(i => ({ ...i, amount_fiat: e.target.value }))}
              required
            />
            <Select
              label="Currency"
              value={invoice.fiat_currency}
              onChange={(e) => setInvoice(i => ({ ...i, fiat_currency: e.target.value }))}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'INR', label: 'INR' },
                { value: 'EUR', label: 'EUR' }
              ]}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" loading={loading}>
              Create Invoice
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
