import React, { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button, Modal, Input, Select, Badge } from '@flowtap/ui-core'
import { useAppSelector } from '@flowtap/store'
import { hotelApi } from '../api/hotel.api'
import toast from 'react-hot-toast'

type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved' | 'Cleaning'

interface Room {
  id: string
  roomNumber: string
  floor: string
  roomTypeId: string
  roomType?: { title: string }
  status: RoomStatus
  isActive: boolean
}

const STATUS_CONFIG: Record<RoomStatus, { border: string; badge: 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'default' }> = {
  Available:   { border: 'border-green-500',  badge: 'success' },
  Occupied:    { border: 'border-red-500',     badge: 'danger' },
  Maintenance: { border: 'border-orange-500',  badge: 'warning' },
  Reserved:    { border: 'border-yellow-500',  badge: 'warning' },
  Cleaning:    { border: 'border-blue-500',    badge: 'info' },
}

type FilterType = 'All' | RoomStatus
const FILTERS: FilterType[] = ['All', 'Available', 'Occupied', 'Maintenance', 'Reserved', 'Cleaning']

const FLOOR_OPTIONS = ['1st', '2nd', '3rd', '4th', '5th'].map(f => ({ value: f, label: `${f} Floor` }))
const STATUS_OPTIONS: RoomStatus[] = ['Available', 'Occupied', 'Maintenance', 'Reserved', 'Cleaning']

export const RoomsPage: React.FC = () => {
  const tenant = useAppSelector((s) => s.tenant.tenant)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<FilterType>('All')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStatus, setNewStatus] = useState<RoomStatus>('Available')
  const [saving, setSaving] = useState(false)

  const [addForm, setAddForm] = useState({ roomNumber: '', floor: '1st', roomTypeId: '', isActive: true })

  const load = useCallback(async () => {
    if (!tenant?.id) return
    setLoading(true)
    try {
      const [roomsRes, typesRes] = await Promise.all([
        hotelApi.getRooms({ companyId: tenant.id }),
        hotelApi.getRoomTypes({ companyId: tenant.id })
      ])
      setRooms(roomsRes.data.data ?? [])
      const types = typesRes.data.data ?? []
      setRoomTypes(types)
      if (types.length > 0 && !addForm.roomTypeId) {
        setAddForm(p => ({ ...p, roomTypeId: types[0].id }))
      }
    } catch {
      toast.error('Failed to load room data')
    } finally {
      setLoading(false)
    }
  }, [tenant?.id])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'All' ? rooms : rooms.filter(r => r.status === filter)

  const openStatusModal = (room: Room) => {
    setSelectedRoom(room)
    setNewStatus(room.status)
    setShowStatusModal(true)
  }

  const handleChangeStatus = async () => {
    if (!selectedRoom) return
    try {
      await hotelApi.updateRoomStatus(selectedRoom.id, newStatus)
      toast.success(`Room ${selectedRoom.roomNumber} â†’ ${newStatus}`)
      setShowStatusModal(false)
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleAddRoom = async () => {
    if (!addForm.roomNumber) { toast.error('Room number required'); return }
    if (!addForm.roomTypeId) { toast.error('Room type required'); return }
    if (!tenant?.id) return

    setSaving(true)
    try {
      await hotelApi.createRoom({
        companyId: tenant.id,
        ...addForm
      })
      toast.success('Room added successfully')
      setAddForm({ roomNumber: '', floor: '1st', roomTypeId: roomTypes[0]?.id ?? '', isActive: true })
      setShowAddModal(false)
      load()
    } catch {
      toast.error('Failed to add room')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rooms.length} rooms total</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Add Room</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {f}
            <span className="ml-1.5 text-xs opacity-70">
              {f === 'All' ? rooms.length : rooms.filter(r => r.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Room grid */}
      {loading ? (
        <div className="py-20 text-center">Loading rooms...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(room => {
            const cfg = STATUS_CONFIG[room.status]
            return (
              <div key={room.id} className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${cfg.border} p-4 flex flex-col gap-2 relative`}>
                {!room.isActive && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default">Inactive</Badge>
                  </div>
                )}
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{room.roomNumber}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{room.floor} Floor</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                  {room.roomType?.title ?? 'Unknown Type'}
                </p>
                <Badge variant={cfg.badge}>{room.status}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() => openStatusModal(room)}
                >
                  Change Status
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No rooms found</p>
          <p className="text-sm">Try changing the filter</p>
        </div>
      )}

      {/* Change Status Modal */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Change Status â€” Room ${selectedRoom?.roomNumber}`}
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button onClick={handleChangeStatus}>Save</Button>
          </div>
        }
      >
        <Select
          label="New Status"
          options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
          value={newStatus}
          onChange={e => setNewStatus(e.target.value as RoomStatus)}
        />
      </Modal>

      {/* Add Room Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Room"
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAddRoom}>Add Room</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Room Number"
            placeholder="e.g. 401"
            value={addForm.roomNumber}
            onChange={e => setAddForm(p => ({ ...p, roomNumber: e.target.value }))}
          />
          <Select
            label="Floor"
            options={FLOOR_OPTIONS}
            value={addForm.floor}
            onChange={e => setAddForm(p => ({ ...p, floor: e.target.value }))}
          />
          <Select
            label="Room Type"
            options={roomTypes.map(t => ({ value: t.id, label: t.title }))}
            value={addForm.roomTypeId}
            onChange={e => setAddForm(p => ({ ...p, roomTypeId: e.target.value }))}
            placeholder="Select a room type"
          />
          
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="room-active"
              checked={addForm.isActive}
              onChange={e => setAddForm(p => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="room-active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Room is active and ready for use
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}

