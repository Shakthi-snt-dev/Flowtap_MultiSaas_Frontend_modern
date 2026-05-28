import React, { useState } from 'react'
import { Plus, LogIn, LogOut, Eye, XCircle, Search } from 'lucide-react'
import { Button, Modal, Input, Select, Badge } from '@flowtap/ui-core'
import toast from 'react-hot-toast'

type BookingStatus = 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled'

interface Booking {
  id: string
  bookingNumber: string
  guest: string
  phone: string
  room: string
  checkIn: string
  checkOut: string
  nights: number
  amount: number
  status: BookingStatus
}

const MOCK_BOOKINGS: Booking[] = [
  { id: '1', bookingNumber: 'BK-001', guest: 'Arjun Mehta',  phone: '+91 98765 43210', room: '201 - Deluxe',   checkIn: '2024-05-06', checkOut: '2024-05-09', nights: 3, amount: 7500,  status: 'Confirmed' },
  { id: '2', bookingNumber: 'BK-002', guest: 'Priya Shah',   phone: '+91 87654 32109', room: '101 - Standard', checkIn: '2024-05-05', checkOut: '2024-05-07', nights: 2, amount: 3000,  status: 'Checked In' },
  { id: '3', bookingNumber: 'BK-003', guest: 'Vikram Nair',  phone: '+91 76543 21098', room: '301 - Suite',    checkIn: '2024-05-01', checkOut: '2024-05-03', nights: 2, amount: 12000, status: 'Checked Out' },
]

const STATUS_BADGE: Record<BookingStatus, 'success' | 'info' | 'default' | 'danger'> = {
  Confirmed: 'info', 'Checked In': 'success', 'Checked Out': 'default', Cancelled: 'danger',
}

const TABS: ('All' | BookingStatus)[] = ['All', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled']

const ROOM_OPTIONS = [
  { value: '101 - Standard', label: '101 - Standard Single' },
  { value: '201 - Deluxe',   label: '201 - Deluxe Double' },
  { value: '301 - Suite',    label: '301 - Suite' },
]

interface AddForm {
  guest: string; phone: string; email: string; room: string
  checkIn: string; checkOut: string; guestCount: string; notes: string
}

const emptyForm = (): AddForm => ({
  guest: '', phone: '', email: '', room: '101 - Standard',
  checkIn: '', checkOut: '', guestCount: '1', notes: '',
})

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS)
  const [tab, setTab] = useState<'All' | BookingStatus>('All')
  const [search, setSearch] = useState('')
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<AddForm>(emptyForm())

  const filtered = bookings
    .filter(b => tab === 'All' || b.status === tab)
    .filter(b => !search || b.guest.toLowerCase().includes(search.toLowerCase()) || b.bookingNumber.includes(search))

  const handleStatusChange = (id: string, status: BookingStatus) => {
    const b = bookings.find(x => x.id === id)
    if (!b) return
    setBookings(prev => prev.map(x => x.id === id ? { ...x, status } : x))
    toast.success(`${b.bookingNumber} â†’ ${status}`)
  }

  const handleAdd = () => {
    if (!form.guest || !form.checkIn || !form.checkOut) { toast.error('Fill required fields'); return }
    const nights = Math.max(1, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000))
    const newBooking: Booking = {
      id: String(Date.now()),
      bookingNumber: `BK-${String(bookings.length + 1).padStart(3, '0')}`,
      guest: form.guest, phone: form.phone, room: form.room,
      checkIn: form.checkIn, checkOut: form.checkOut, nights,
      amount: nights * 2500, status: 'Confirmed',
    }
    setBookings(prev => [newBooking, ...prev])
    toast.success(`Booking ${newBooking.bookingNumber} created`)
    setForm(emptyForm())
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage hotel reservations</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>New Booking</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search guest or booking #"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                {['Booking #', 'Guest', 'Room', 'Check-in', 'Check-out', 'Nights', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">No bookings found</td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.bookingNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{b.guest}</p>
                    <p className="text-xs text-gray-400">{b.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.room}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.checkIn}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.checkOut}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.nights}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">â‚¹{b.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[b.status]}>{b.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'Checked In')}
                          title="Check In"
                          className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                      )}
                      {b.status === 'Checked In' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'Checked Out')}
                          title="Check Out"
                          className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setViewBooking(b)}
                        title="View"
                        className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(b.status === 'Confirmed' || b.status === 'Checked In') && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'Cancelled')}
                          title="Cancel"
                          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Booking Modal */}
      <Modal open={!!viewBooking} onClose={() => setViewBooking(null)} title="Booking Details" size="md">
        {viewBooking && (
          <div className="space-y-3 text-sm">
            {[
              ['Booking #', viewBooking.bookingNumber],
              ['Guest', viewBooking.guest],
              ['Phone', viewBooking.phone],
              ['Room', viewBooking.room],
              ['Check-in', viewBooking.checkIn],
              ['Check-out', viewBooking.checkOut],
              ['Nights', String(viewBooking.nights)],
              ['Amount', `â‚¹${viewBooking.amount.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-medium text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <Badge variant={STATUS_BADGE[viewBooking.status]}>{viewBooking.status}</Badge>
            </div>
          </div>
        )}
      </Modal>

      {/* New Booking Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Booking"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Create Booking</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Guest Name" value={form.guest} onChange={e => setForm(p => ({ ...p, guest: e.target.value }))} />
            <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Select label="Room" options={ROOM_OPTIONS} value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Check-in Date" type="date" value={form.checkIn} onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))} />
            <Input label="Check-out Date" type="date" value={form.checkOut} onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))} />
          </div>
          <Input label="Guest Count" type="number" min="1" value={form.guestCount} onChange={e => setForm(p => ({ ...p, guestCount: e.target.value }))} />
          <Input label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}

