import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Modal, Input, Select, Badge } from '@flowtap/ui-core'
import toast from 'react-hot-toast'

type MetalType = 'Gold' | 'Silver' | 'Platinum'

interface Exchange {
  id: string
  date: string
  customer: string
  metal: MetalType
  weight: string
  purity: string
  rate: string
  paid: number
  status: 'Completed' | 'Pending'
}

const MOCK_EXCHANGES: Exchange[] = [
  { id: '1', date: '2024-05-06', customer: 'Sunita Devi',  metal: 'Gold',   weight: '18.5g', purity: '22K', rate: '5958/g', paid: 87000, status: 'Completed' },
  { id: '2', date: '2024-05-05', customer: 'Ramesh Gupta', metal: 'Silver', weight: '250g',  purity: '925', rate: '85/g',   paid: 21250, status: 'Completed' },
]

const METAL_OPTIONS: MetalType[] = ['Gold', 'Silver', 'Platinum']
const PURITY_OPTIONS_BY_METAL: Record<MetalType, string[]> = {
  Gold:     ['24K', '22K', '18K', '14K'],
  Silver:   ['999', '925', '800'],
  Platinum: ['950', '900'],
}
const CURRENT_RATES: Record<string, number> = {
  '24K': 6500, '22K': 5958, '18K': 4875, '14K': 3792,
  '999': 85, '925': 78, '800': 68,
  '950': 3040, '900': 2880,
}
const PURITY_FACTOR: Record<string, number> = {
  '24K': 1.0, '22K': 22/24, '18K': 18/24, '14K': 14/24,
  '999': 0.999, '925': 0.925, '800': 0.800,
  '950': 0.950, '900': 0.900,
}

interface AddForm {
  customer: string; phone: string
  metal: MetalType; purity: string
  grossWeight: string; stoneWeight: string; netWeight: string
  rateUsed: string; calculatedPayment: number; notes: string
}

const emptyForm = (): AddForm => ({
  customer: '', phone: '',
  metal: 'Gold', purity: '22K',
  grossWeight: '', stoneWeight: '0', netWeight: '',
  rateUsed: String(CURRENT_RATES['22K']),
  calculatedPayment: 0, notes: '',
})

function calcPayment(grossWeight: string, stoneWeight: string, purity: string, rate: string): number {
  const net = Math.max(0, Number(grossWeight || 0) - Number(stoneWeight || 0))
  const factor = PURITY_FACTOR[purity] ?? 1
  return Math.round(net * Number(rate || 0) * factor)
}

export const MetalExchangePage: React.FC = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>(MOCK_EXCHANGES)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<AddForm>(emptyForm())

  const updateCalc = (updates: Partial<AddForm>, current: AddForm) => {
    const merged = { ...current, ...updates }
    const payment = calcPayment(merged.grossWeight, merged.stoneWeight, merged.purity, merged.rateUsed)
    return { ...merged, netWeight: String(Math.max(0, Number(merged.grossWeight || 0) - Number(merged.stoneWeight || 0)).toFixed(2)), calculatedPayment: payment }
  }

  const setField = (updates: Partial<AddForm>) => setForm(p => updateCalc(updates, p))

  const handleMetalChange = (metal: MetalType) => {
    const purity = PURITY_OPTIONS_BY_METAL[metal][0]
    const rateUsed = String(CURRENT_RATES[purity] ?? 0)
    setField({ metal, purity, rateUsed })
  }

  const handlePurityChange = (purity: string) => {
    setField({ purity, rateUsed: String(CURRENT_RATES[purity] ?? form.rateUsed) })
  }

  const handleSubmit = () => {
    if (!form.customer || !form.grossWeight) { toast.error('Fill required fields'); return }
    const newEx: Exchange = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      customer: form.customer, metal: form.metal,
      weight: `${form.netWeight}g`, purity: form.purity,
      rate: `${form.rateUsed}/g`, paid: form.calculatedPayment,
      status: 'Completed',
    }
    setExchanges(p => [newEx, ...p])
    toast.success(`Exchange recorded â€” â‚¹${form.calculatedPayment.toLocaleString()} paid`)
    setForm(emptyForm())
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Metal Exchange</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Old gold / silver purchase records</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>New Exchange</Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                {['Date', 'Customer', 'Metal', 'Weight', 'Purity', 'Rate Used', 'Paid Amount', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {exchanges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">No exchange records yet</td>
                </tr>
              ) : exchanges.map(ex => (
                <tr key={ex.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ex.date}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{ex.customer}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ex.metal}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ex.weight}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ex.purity}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">â‚¹{ex.rate}</td>
                  <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">â‚¹{ex.paid.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ex.status === 'Completed' ? 'success' : 'warning'}>{ex.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Exchange Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New Metal Exchange"
        size="lg"
        footer={
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Calculated Payment: </span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">â‚¹{form.calculatedPayment.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Record Exchange</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Customer Name" value={form.customer} onChange={e => setField({ customer: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={e => setField({ phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Metal Type"
              options={METAL_OPTIONS.map(m => ({ value: m, label: m }))}
              value={form.metal}
              onChange={e => handleMetalChange(e.target.value as MetalType)}
            />
            <Select
              label="Purity"
              options={PURITY_OPTIONS_BY_METAL[form.metal].map(p => ({ value: p, label: p }))}
              value={form.purity}
              onChange={e => handlePurityChange(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Gross Weight (g)"
              type="number" step="0.01"
              value={form.grossWeight}
              onChange={e => setField({ grossWeight: e.target.value })}
            />
            <Input
              label="Stone Weight (g)"
              type="number" step="0.01"
              value={form.stoneWeight}
              onChange={e => setField({ stoneWeight: e.target.value })}
            />
            <Input
              label="Net Weight (g)"
              value={form.netWeight}
              readOnly
              hint="Gross âˆ’ Stone"
            />
          </div>
          <Input
            label="Rate Used (â‚¹/g)"
            type="number"
            value={form.rateUsed}
            onChange={e => setField({ rateUsed: e.target.value })}
            hint="Auto-filled from current rate, editable"
          />
          <Input
            label="Notes"
            placeholder="Any additional notes"
            value={form.notes}
            onChange={e => setField({ notes: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  )
}

