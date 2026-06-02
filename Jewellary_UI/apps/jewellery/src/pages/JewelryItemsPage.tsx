import React, { useState } from 'react'
import { Plus, Tag } from 'lucide-react'
import { Button, Modal, Input, Select, Badge } from '@flowtap/ui-core'
import toast from 'react-hot-toast'

type MetalType = 'Gold' | 'Silver' | 'Platinum'

interface JewelryItem {
  id: string
  name: string
  metal: MetalType
  purity: string
  grossWeight: number
  netWeight: number
  stoneWeight: number
  makingCharges: number
  tagNumber: string
}

const MOCK_JEWELRY: JewelryItem[] = [
  { id: '1', name: 'Gold Necklace Set', metal: 'Gold',     purity: '22K', grossWeight: 45.2, netWeight: 42.1, stoneWeight: 3.1, makingCharges: 2500, tagNumber: 'JW-001' },
  { id: '2', name: 'Diamond Ring',       metal: 'Gold',     purity: '18K', grossWeight: 5.8,  netWeight: 5.2,  stoneWeight: 0.6, makingCharges: 1200, tagNumber: 'JW-002' },
  { id: '3', name: 'Silver Bracelet',    metal: 'Silver',   purity: '925', grossWeight: 28.5, netWeight: 28.0, stoneWeight: 0.5, makingCharges: 300,  tagNumber: 'JW-003' },
]

const GOLD_RATE = 6200 // per gram today

const PURITY_RATES: Record<string, number> = {
  '24K': 1.0, '22K': 22 / 24, '18K': 18 / 24,
  '925': 0.925, '999': 0.999,
  Platinum: 1.0,
}

const METAL_RATES: Record<MetalType, number> = {
  Gold: GOLD_RATE, Silver: 85, Platinum: 3200,
}

function calcValue(item: JewelryItem): number {
  const rate = METAL_RATES[item.metal]
  const purity = PURITY_RATES[item.purity] ?? 1
  return Math.round(item.netWeight * rate * purity + item.makingCharges)
}

const METAL_GRADIENT: Record<MetalType, string> = {
  Gold:     'from-yellow-300 to-amber-500',
  Silver:   'from-gray-300 to-gray-500',
  Platinum: 'from-slate-300 to-slate-500',
}

const METAL_OPTIONS: MetalType[] = ['Gold', 'Silver', 'Platinum']
const PURITY_OPTIONS_BY_METAL: Record<MetalType, string[]> = {
  Gold: ['24K', '22K', '18K', '14K'],
  Silver: ['999', '925', '800'],
  Platinum: ['950', '900'],
}

type FilterMetal = 'All' | MetalType

interface AddForm {
  name: string; metal: MetalType; purity: string
  grossWeight: string; netWeight: string; stoneWeight: string
  makingCharges: string; huid: string; tagNumber: string
}

export const JewelryItemsPage: React.FC = () => {
  const [items, setItems] = useState<JewelryItem[]>(MOCK_JEWELRY)
  const [metalFilter, setMetalFilter] = useState<FilterMetal>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<AddForm>({
    name: '', metal: 'Gold', purity: '22K',
    grossWeight: '', netWeight: '', stoneWeight: '',
    makingCharges: '', huid: '', tagNumber: '',
  })

  const filtered = metalFilter === 'All' ? items : items.filter(i => i.metal === metalFilter)

  const handleMetalChange = (metal: MetalType) => {
    const firstPurity = PURITY_OPTIONS_BY_METAL[metal][0]
    setForm(p => ({ ...p, metal, purity: firstPurity }))
  }

  const handleGrossChange = (val: string) => {
    const gross = Number(val)
    const stone = Number(form.stoneWeight || 0)
    setForm(p => ({ ...p, grossWeight: val, netWeight: String(Math.max(0, gross - stone).toFixed(2)) }))
  }

  const handleStoneChange = (val: string) => {
    const stone = Number(val)
    const gross = Number(form.grossWeight || 0)
    setForm(p => ({ ...p, stoneWeight: val, netWeight: String(Math.max(0, gross - stone).toFixed(2)) }))
  }

  const handleAdd = () => {
    if (!form.name || !form.grossWeight || !form.tagNumber) { toast.error('Fill required fields'); return }
    const newItem: JewelryItem = {
      id: String(Date.now()), name: form.name, metal: form.metal, purity: form.purity,
      grossWeight: Number(form.grossWeight), netWeight: Number(form.netWeight),
      stoneWeight: Number(form.stoneWeight || 0), makingCharges: Number(form.makingCharges || 0),
      tagNumber: form.tagNumber,
    }
    setItems(p => [...p, newItem])
    toast.success(`${form.name} added`)
    setForm({ name: '', metal: 'Gold', purity: '22K', grossWeight: '', netWeight: '', stoneWeight: '', makingCharges: '', huid: '', tagNumber: '' })
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jewelry Items</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Today's Gold Rate: <span className="font-semibold text-yellow-600">â‚¹{GOLD_RATE}/g</span>
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Add Item</Button>
      </div>

      {/* Metal filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', ...METAL_OPTIONS] as FilterMetal[]).map(m => (
          <button
            key={m}
            onClick={() => setMetalFilter(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              metalFilter === m
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            {/* Image placeholder */}
            <div className={`h-28 bg-gradient-to-br ${METAL_GRADIENT[item.metal]} flex items-center justify-center`}>
              <span className="text-white text-3xl font-bold opacity-30">{item.metal[0]}</span>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <Badge variant="warning">{item.metal} {item.purity}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div>
                  <p className="text-gray-400">Gross</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{item.grossWeight}g</p>
                </div>
                <div>
                  <p className="text-gray-400">Net</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{item.netWeight}g</p>
                </div>
                <div>
                  <p className="text-gray-400">Stone</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{item.stoneWeight}g</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Tag className="w-3 h-3" />
                  <span>{item.tagNumber}</span>
                </div>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  â‚¹{calcValue(item).toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-gray-400">Making: â‚¹{item.makingCharges.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No items found</p>
        </div>
      )}

      {/* Add Item Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Jewelry Item"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Item</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Item Name" placeholder="e.g. Gold Necklace Set" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
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
              onChange={e => setForm(p => ({ ...p, purity: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Gross Weight (g)" type="number" step="0.01" value={form.grossWeight} onChange={e => handleGrossChange(e.target.value)} />
            <Input label="Stone Weight (g)" type="number" step="0.01" value={form.stoneWeight} onChange={e => handleStoneChange(e.target.value)} />
            <Input label="Net Weight (g)" type="number" step="0.01" value={form.netWeight} readOnly hint="Auto-calculated" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Making Charges (â‚¹)" type="number" value={form.makingCharges} onChange={e => setForm(p => ({ ...p, makingCharges: e.target.value }))} />
            <Input label="Tag Number" placeholder="JW-004" value={form.tagNumber} onChange={e => setForm(p => ({ ...p, tagNumber: e.target.value }))} />
          </div>
          <Input label="HUID / Hallmark Number" placeholder="Optional" value={form.huid} onChange={e => setForm(p => ({ ...p, huid: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}

