import React, { useState } from 'react'
import { ClipboardList, Plus, ChevronDown, ChevronUp, Pill, Activity } from 'lucide-react'
import { Button, Input, Modal, Badge } from '@flowtap/ui-core'
import toast from 'react-hot-toast'

interface Prescription {
  medicine: string
  dosage: string
  duration: string
  instructions: string
}

interface Consultation {
  id: string
  patient: string
  doctor: string
  date: string
  complaints: string
  diagnosis: string
  vitals: { bp: string; pulse: number; temp: number; weight: number }
  prescriptions: Prescription[]
}

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: '1', patient: 'Anita Sharma', doctor: 'Dr. Mehta', date: '2024-05-06 09:00',
    complaints: 'Fever, headache for 3 days',
    diagnosis: 'Viral fever',
    vitals: { bp: '120/80', pulse: 88, temp: 99.8, weight: 58 },
    prescriptions: [
      { medicine: 'Paracetamol 500mg', dosage: '1 tablet', duration: '3 days', instructions: 'After meals' },
      { medicine: 'Cetirizine 10mg', dosage: '1 tablet', duration: '5 days', instructions: 'Before sleep' },
    ],
  },
  {
    id: '2', patient: 'Kiran Patel', doctor: 'Dr. Mehta', date: '2024-05-06 09:30',
    complaints: 'Follow-up for hypertension',
    diagnosis: 'Hypertension (controlled)',
    vitals: { bp: '138/90', pulse: 72, temp: 98.6, weight: 78 },
    prescriptions: [
      { medicine: 'Amlodipine 5mg', dosage: '1 tablet', duration: '30 days', instructions: 'Morning, empty stomach' },
    ],
  },
  {
    id: '3', patient: 'Mohan Reddy', doctor: 'Dr. Sharma', date: '2024-05-06 10:00',
    complaints: 'Chest pain, shortness of breath',
    diagnosis: 'Mild angina â€” ECG ordered',
    vitals: { bp: '145/95', pulse: 96, temp: 98.4, weight: 82 },
    prescriptions: [
      { medicine: 'Aspirin 75mg', dosage: '1 tablet', duration: '30 days', instructions: 'After breakfast' },
      { medicine: 'Nitrate spray', dosage: 'As needed', duration: '30 days', instructions: 'Sublingual for chest pain' },
    ],
  },
]

const VitalBadge: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
    <div className="font-bold text-gray-900 dark:text-white">
      {value}<span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-0.5">{unit}</span>
    </div>
  </div>
)

export const ConsultationsPage: React.FC = () => {
  const [consultations] = useState<Consultation[]>(MOCK_CONSULTATIONS)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [viewConsult, setViewConsult] = useState<Consultation | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [dateFilter, setDateFilter] = useState('')
  const [form, setForm] = useState({
    patient: '', doctor: 'Dr. Mehta', complaints: '', diagnosis: '', clinicalNotes: '',
    bp: '', pulse: '', temp: '', weight: '',
  })
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { medicine: '', dosage: '', duration: '', instructions: '' },
  ])

  const filtered = consultations.filter((c) => !dateFilter || c.date.startsWith(dateFilter))

  const addPrescriptionRow = () => setPrescriptions((p) => [...p, { medicine: '', dosage: '', duration: '', instructions: '' }])
  const removePrescriptionRow = (i: number) => setPrescriptions((p) => p.filter((_, idx) => idx !== i))

  const handleSubmit = () => {
    if (!form.patient || !form.complaints || !form.diagnosis) {
      toast.error('Patient, complaints and diagnosis are required')
      return
    }
    toast.success('Consultation recorded successfully')
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultations</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{consultations.length} records today</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Consultation
          </Button>
        </div>
      </div>

      {/* Consultation list */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Summary row */}
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300 font-semibold flex-shrink-0">
                  {c.patient[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{c.patient}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{c.doctor} Â· {c.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.diagnosis}</div>
                  <div className="text-xs text-gray-400 truncate max-w-48">{c.complaints}</div>
                </div>
                <Badge variant="info">{c.prescriptions.length} Rx</Badge>
                {expanded === c.id
                  ? <ChevronUp className="w-5 h-5 text-gray-400" />
                  : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {/* Expanded details */}
            {expanded === c.id && (
              <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
                {/* Vitals */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Activity className="w-4 h-4" /> Vitals
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <VitalBadge label="BP" value={c.vitals.bp} unit="mmHg" />
                    <VitalBadge label="Pulse" value={c.vitals.pulse} unit="bpm" />
                    <VitalBadge label="Temp" value={c.vitals.temp} unit="Â°F" />
                    <VitalBadge label="Weight" value={c.vitals.weight} unit="kg" />
                  </div>
                </div>

                {/* Clinical info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chief Complaints</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">{c.complaints}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Diagnosis</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">{c.diagnosis}</div>
                  </div>
                </div>

                {/* Prescriptions */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Pill className="w-4 h-4" /> Prescriptions ({c.prescriptions.length})
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                          {['Medicine', 'Dosage', 'Duration', 'Instructions'].map((h) => (
                            <th key={h} className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {c.prescriptions.map((rx, i) => (
                          <tr key={i} className="bg-white dark:bg-gray-800">
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{rx.medicine}</td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{rx.dosage}</td>
                            <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{rx.duration}</td>
                            <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{rx.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => { setViewConsult(c); setExpanded(null) }}>
                    Full Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No consultations found</p>
          </div>
        )}
      </div>

      {/* Full View Modal */}
      <Modal open={!!viewConsult} onClose={() => setViewConsult(null)} title="Consultation Record" size="lg">
        {viewConsult && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xl">
                {viewConsult.patient[0]}
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-lg">{viewConsult.patient}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{viewConsult.doctor} Â· {viewConsult.date}</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Vitals</div>
              <div className="grid grid-cols-4 gap-3">
                <VitalBadge label="BP" value={viewConsult.vitals.bp} unit="mmHg" />
                <VitalBadge label="Pulse" value={viewConsult.vitals.pulse} unit="bpm" />
                <VitalBadge label="Temp" value={viewConsult.vitals.temp} unit="Â°F" />
                <VitalBadge label="Weight" value={viewConsult.vitals.weight} unit="kg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Chief Complaints</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">{viewConsult.complaints}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Diagnosis</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">{viewConsult.diagnosis}</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Prescriptions</div>
              <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    {['Medicine', 'Dosage', 'Duration', 'Instructions'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {viewConsult.prescriptions.map((rx, i) => (
                    <tr key={i} className="bg-white dark:bg-gray-800">
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{rx.medicine}</td>
                      <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{rx.dosage}</td>
                      <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{rx.duration}</td>
                      <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{rx.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => { toast.success('Printing prescriptionâ€¦'); window.print() }}>
                Print Prescription
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Consultation Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Record Consultation" size="xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Patient *" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Patient name" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor</label>
              <select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Dr. Mehta</option>
                <option>Dr. Sharma</option>
              </select>
            </div>
          </div>

          {/* Vitals */}
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vitals</div>
            <div className="grid grid-cols-4 gap-3">
              {[
                ['BP', 'bp', '120/80'],
                ['Pulse (bpm)', 'pulse', '72'],
                ['Temp (Â°F)', 'temp', '98.6'],
                ['Weight (kg)', 'weight', '70'],
              ].map(([label, key, placeholder]) => (
                <Input key={key} label={label} value={form[key as keyof typeof form]} placeholder={placeholder}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chief Complaints *</label>
            <textarea value={form.complaints} onChange={(e) => setForm({ ...form, complaints: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis *</label>
            <textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clinical Notes</label>
            <textarea value={form.clinicalNotes} onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Prescriptions</div>
              <button onClick={addPrescriptionRow}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">+ Add Row</button>
            </div>
            <div className="space-y-2">
              {prescriptions.map((rx, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-start">
                  <input value={rx.medicine} onChange={(e) => setPrescriptions((p) => p.map((r, idx) => idx === i ? { ...r, medicine: e.target.value } : r))}
                    placeholder="Medicine name"
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={rx.dosage} onChange={(e) => setPrescriptions((p) => p.map((r, idx) => idx === i ? { ...r, dosage: e.target.value } : r))}
                    placeholder="Dosage"
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input value={rx.duration} onChange={(e) => setPrescriptions((p) => p.map((r, idx) => idx === i ? { ...r, duration: e.target.value } : r))}
                    placeholder="Duration (e.g. 5 days)"
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex gap-1">
                    <input value={rx.instructions} onChange={(e) => setPrescriptions((p) => p.map((r, idx) => idx === i ? { ...r, instructions: e.target.value } : r))}
                      placeholder="Instructions"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {prescriptions.length > 1 && (
                      <button onClick={() => removePrescriptionRow(i)}
                        className="px-2 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">âœ•</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Consultation</Button>
        </div>
      </Modal>
    </div>
  )
}

