import React, { useState, useEffect } from 'react'
import { CalendarDays, Plus, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button, Badge, Modal, Input } from '@flowtap/ui-core'
import toast from 'react-hot-toast'
import { cn } from '@flowtap/shared'

interface Appointment {
  id: string
  time: string
  patient: string
  patientId: string
  doctor: string
  type: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'No Show' | 'Cancelled'
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', time: '09:00', patient: 'Anita Sharma', patientId: 'P-001', doctor: 'Dr. Mehta', type: 'Consultation', status: 'Completed' },
  { id: '2', time: '09:30', patient: 'Kiran Patel', patientId: 'P-002', doctor: 'Dr. Mehta', type: 'Follow-up', status: 'Completed' },
  { id: '3', time: '10:00', patient: 'Mohan Reddy', patientId: 'P-003', doctor: 'Dr. Sharma', type: 'Consultation', status: 'In Progress' },
  { id: '4', time: '10:30', patient: 'Sita Verma', patientId: 'P-004', doctor: 'Dr. Mehta', type: 'Consultation', status: 'Scheduled' },
  { id: '5', time: '11:00', patient: 'Rajesh Kumar', patientId: 'P-005', doctor: 'Dr. Sharma', type: 'Emergency', status: 'Scheduled' },
  { id: '6', time: '11:30', patient: 'Priya Nair', patientId: 'P-006', doctor: 'Dr. Mehta', type: 'Follow-up', status: 'Scheduled' },
]

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; badgeVariant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  Scheduled: { color: 'blue', icon: <Clock className="w-4 h-4" />, badgeVariant: 'info' },
  'In Progress': { color: 'yellow', icon: <AlertCircle className="w-4 h-4" />, badgeVariant: 'warning' },
  Completed: { color: 'green', icon: <CheckCircle className="w-4 h-4" />, badgeVariant: 'success' },
  'No Show': { color: 'gray', icon: <XCircle className="w-4 h-4" />, badgeVariant: 'default' },
  Cancelled: { color: 'red', icon: <XCircle className="w-4 h-4" />, badgeVariant: 'danger' },
}

const TYPE_COLORS: Record<string, string> = {
  Consultation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Follow-up': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Emergency: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const [view, setView] = useState<'timeline' | 'list'>('timeline')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [today] = useState(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  const [form, setForm] = useState({
    patient: '', doctor: 'Dr. Mehta', date: '', time: '', type: 'Consultation', notes: '',
  })

  const statusTabs = ['All', 'Scheduled', 'In Progress', 'Completed', 'No Show', 'Cancelled']

  const filtered = appointments.filter((a) => statusFilter === 'All' || a.status === statusFilter)

  const updateStatus = (id: string, newStatus: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a))
    toast.success(`Status updated to ${newStatus}`)
  }

  const handleBook = () => {
    if (!form.patient.trim() || !form.date || !form.time) {
      toast.error('Patient, date and time are required')
      return
    }
    toast.success('Appointment booked successfully')
    setShowAdd(false)
    setForm({ patient: '', doctor: 'Dr. Mehta', date: '', time: '', type: 'Consultation', notes: '' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['timeline', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                  view === v ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>
                {v}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Book Appointment
          </Button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              statusFilter === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700')}>
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({appointments.filter((a) => a.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const config = STATUS_CONFIG[apt.status]
            return (
              <div key={apt.id}
                className={cn(
                  'flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl border p-4 transition-all',
                  apt.status === 'In Progress'
                    ? 'border-yellow-300 dark:border-yellow-700 shadow-md'
                    : 'border-gray-200 dark:border-gray-700'
                )}>
                {/* Time */}
                <div className="text-center flex-shrink-0 w-16">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{apt.time}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">AM</div>
                </div>
                {/* Divider dot */}
                <div className="flex flex-col items-center flex-shrink-0 mt-1">
                  <div className={cn('w-3 h-3 rounded-full flex-shrink-0',
                    apt.status === 'Completed' ? 'bg-green-500' :
                    apt.status === 'In Progress' ? 'bg-yellow-500' :
                    apt.status === 'Cancelled' || apt.status === 'No Show' ? 'bg-gray-400' : 'bg-blue-500')} />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{apt.patient}</span>
                      <span className="text-xs text-gray-400">{apt.patientId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[apt.type] ?? TYPE_COLORS.Consultation)}>
                        {apt.type}
                      </span>
                      <Badge variant={config.badgeVariant}>{apt.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{apt.doctor}</span>
                  </div>
                </div>
                {/* Actions */}
                {apt.status === 'Scheduled' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => updateStatus(apt.id, 'In Progress')}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:opacity-80 transition-opacity">
                      Start
                    </button>
                    <button onClick={() => updateStatus(apt.id, 'No Show')}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:opacity-80 transition-opacity">
                      No Show
                    </button>
                  </div>
                )}
                {apt.status === 'In Progress' && (
                  <button onClick={() => updateStatus(apt.id, 'Completed')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex-shrink-0">
                    Complete
                  </button>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No appointments for this filter</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {['Time', 'Patient', 'Doctor', 'Type', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((apt) => {
                const config = STATUS_CONFIG[apt.status]
                return (
                  <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">{apt.time}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{apt.patient}</div>
                      <div className="text-xs text-gray-400">{apt.patientId}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{apt.doctor}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[apt.type] ?? TYPE_COLORS.Consultation)}>
                        {apt.type}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge variant={config.badgeVariant}>{apt.status}</Badge></td>
                    <td className="px-4 py-3">
                      {apt.status === 'Scheduled' && (
                        <button onClick={() => updateStatus(apt.id, 'In Progress')}
                          className="text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:underline">
                          Start
                        </button>
                      )}
                      {apt.status === 'In Progress' && (
                        <button onClick={() => updateStatus(apt.id, 'Completed')}
                          className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline">
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Book Appointment" size="md">
        <div className="space-y-4">
          <Input label="Patient Name *" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Search patient name" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor</label>
            <select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Dr. Mehta</option>
              <option>Dr. Sharma</option>
              <option>Dr. Iyer</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time *</label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Consultation</option>
              <option>Follow-up</option>
              <option>Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleBook}>Book Appointment</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

