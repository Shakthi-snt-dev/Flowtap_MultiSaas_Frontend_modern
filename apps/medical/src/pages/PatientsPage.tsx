import React, { useState } from 'react'
import { Stethoscope, Plus, Search, Eye, CalendarDays } from 'lucide-react'
import { Button, Input, Modal } from '@flowtap/ui-core'
import toast from 'react-hot-toast'

interface Patient {
  id: string
  name: string
  dob: string
  age: number
  gender: string
  bloodGroup: string
  phone: string
  email: string
  lastVisit: string
}

const MOCK_PATIENTS: Patient[] = [
  { id: 'P-001', name: 'Anita Sharma', dob: '1985-03-15', age: 39, gender: 'Female', bloodGroup: 'A+', phone: '+91 98765 43210', email: 'anita@example.com', lastVisit: '2024-04-20' },
  { id: 'P-002', name: 'Kiran Patel', dob: '1992-07-22', age: 31, gender: 'Male', bloodGroup: 'O+', phone: '+91 87654 32109', email: 'kiran@example.com', lastVisit: '2024-05-01' },
  { id: 'P-003', name: 'Mohan Reddy', dob: '1958-11-30', age: 65, gender: 'Male', bloodGroup: 'B-', phone: '+91 76543 21098', email: '', lastVisit: '2024-05-05' },
  { id: 'P-004', name: 'Sita Verma', dob: '2000-06-10', age: 23, gender: 'Female', bloodGroup: 'AB+', phone: '+91 65432 10987', email: 'sita@example.com', lastVisit: '2024-03-15' },
  { id: 'P-005', name: 'Rajesh Kumar', dob: '1975-09-25', age: 48, gender: 'Male', bloodGroup: 'O-', phone: '+91 54321 09876', email: '', lastVisit: '2024-05-06' },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const PatientsPage: React.FC = () => {
  const [patients] = useState<Patient[]>(MOCK_PATIENTS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [viewPatient, setViewPatient] = useState<Patient | null>(null)
  const [form, setForm] = useState({
    name: '', dob: '', gender: 'Male', bloodGroup: 'O+',
    phone: '', email: '', address: '', emergencyContact: '',
  })

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.id.includes(search)
  )

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required')
      return
    }
    toast.success('Patient registered successfully')
    setShowAdd(false)
    setForm({ name: '', dob: '', gender: 'Male', bloodGroup: 'O+', phone: '', email: '', address: '', emergencyContact: '' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{patients.length} registered patients</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" /> Register Patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or IDâ€¦"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Patient ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Age / Gender</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Blood Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Last Visit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 font-semibold text-sm flex-shrink-0">
                        {p.name[0]}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.age} yrs / {p.gender}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {p.bloodGroup}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.phone}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.lastVisit}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewPatient(p)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.success('Opening appointment bookingâ€¦')}
                        className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600 dark:text-teal-400 transition-colors"
                        title="Book Appointment"
                      >
                        <CalendarDays className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No patients found</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Register New Patient" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Patient's full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <Input label="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="col-span-2">
              <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2} placeholder="Home address"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="col-span-2">
              <Input label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Name and phone number" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Register Patient</Button>
          </div>
        </div>
      </Modal>

      {/* View Patient Modal */}
      <Modal open={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details" size="md">
        {viewPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-2xl">
                {viewPatient.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewPatient.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{viewPatient.id}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 mt-1">
                  {viewPatient.bloodGroup}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Age', `${viewPatient.age} years`],
                ['Gender', viewPatient.gender],
                ['Date of Birth', viewPatient.dob],
                ['Phone', viewPatient.phone],
                ['Email', viewPatient.email || 'â€”'],
                ['Last Visit', viewPatient.lastVisit],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
                  <div className="font-medium text-gray-900 dark:text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => { toast.success('Opening appointment bookingâ€¦'); setViewPatient(null) }}>
                <CalendarDays className="w-4 h-4 mr-2" /> Book Appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

