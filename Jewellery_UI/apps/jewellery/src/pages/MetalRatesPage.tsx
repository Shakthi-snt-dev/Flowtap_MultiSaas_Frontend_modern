import React, { useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button, Modal, Input } from '@flowtap/ui-core'
import toast from 'react-hot-toast'

interface MetalRate {
  key: string
  label: string
  rate: number
  yesterdayRate: number
  unit: string
}

const INITIAL_RATES: MetalRate[] = [
  { key: 'gold24', label: 'Gold 24K', rate: 6500, yesterdayRate: 6450, unit: 'g' },
  { key: 'gold22', label: 'Gold 22K', rate: 5958, yesterdayRate: 5912, unit: 'g' },
  { key: 'gold18', label: 'Gold 18K', rate: 4875, yesterdayRate: 4838, unit: 'g' },
  { key: 'silver', label: 'Silver',   rate: 85,   yesterdayRate: 87,   unit: 'g' },
  { key: 'plat',   label: 'Platinum', rate: 3200, yesterdayRate: 3200, unit: 'g' },
]

const HISTORY_DATES = ['2024-05-06', '2024-05-05', '2024-05-04', '2024-05-03', '2024-05-02']

const HISTORY_DATA = [
  { date: '2024-05-06', gold24: 6500, gold22: 5958, silver: 85 },
  { date: '2024-05-05', gold24: 6450, gold22: 5912, silver: 87 },
  { date: '2024-05-04', gold24: 6390, gold22: 5857, silver: 86 },
  { date: '2024-05-03', gold24: 6420, gold22: 5885, silver: 84 },
  { date: '2024-05-02', gold24: 6380, gold22: 5849, silver: 83 },
]

export const MetalRatesPage: React.FC = () => {
  const [rates, setRates] = useState<MetalRate[]>(INITIAL_RATES)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [formRates, setFormRates] = useState<Record<string, string>>({})
  const [lastUpdated] = useState('Today 10:30 AM')

  const openUpdate = () => {
    const initial: Record<string, string> = {}
    rates.forEach(r => { initial[r.key] = String(r.rate) })
    setFormRates(initial)
    setShowUpdateModal(true)
  }

  const handleSave = () => {
    setRates(prev => prev.map(r => ({
      ...r,
      yesterdayRate: r.rate,
      rate: Number(formRates[r.key]) || r.rate,
    })))
    toast.success('Metal rates updated')
    setShowUpdateModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Metal Rates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last updated: {lastUpdated}</p>
        </div>
        <Button icon={<RefreshCw className="w-4 h-4" />} onClick={openUpdate}>Update Rates</Button>
      </div>

      {/* Rate cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {rates.map(r => {
          const change = r.rate - r.yesterdayRate
          const pct = ((change / r.yesterdayRate) * 100).toFixed(2)
          const isUp = change >= 0
          return (
            <div key={r.key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{r.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                â‚¹{r.rate.toLocaleString()}
                <span className="text-sm font-normal text-gray-400">/{r.unit}</span>
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isUp ? '+' : ''}{change.toLocaleString()} ({pct}%)</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Yesterday: â‚¹{r.yesterdayRate.toLocaleString()}</p>
            </div>
          )
        })}
      </div>

      {/* Historical table */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Historical Rates</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                {['Date', 'Gold 24K', 'Gold 22K', 'Gold 18K', 'Silver'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {HISTORY_DATA.map((row, i) => (
                <tr key={row.date} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${i === 0 ? 'font-semibold bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.date}{i === 0 && <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400 font-normal">(Today)</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">â‚¹{row.gold24.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">â‚¹{row.gold22.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">â‚¹{Math.round(row.gold24 * 0.75).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">â‚¹{row.silver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Rates Modal */}
      <Modal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Metal Rates"
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Rates</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {rates.map(r => (
            <Input
              key={r.key}
              label={`${r.label} (â‚¹ per ${r.unit})`}
              type="number"
              value={formRates[r.key] ?? ''}
              onChange={e => setFormRates(p => ({ ...p, [r.key]: e.target.value }))}
            />
          ))}
        </div>
      </Modal>
    </div>
  )
}

