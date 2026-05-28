import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Users, BedDouble, Tag } from 'lucide-react'
import { Button, Modal, Input, Badge } from '@flowtap/ui-core'
import { useAppSelector } from '@flowtap/store'
import { hotelApi } from '../api/hotel.api'
import toast from 'react-hot-toast'

interface RoomType {
  id: string
  title: string
  basePrice: number
  maxOccupancy: number
  amenitiesJson?: string
  description?: string
  isActive: boolean
  totalRooms?: number
}

interface RoomTypeForm {
  title: string
  basePrice: string
  maxOccupancy: string
  description: string
  isActive: boolean
  amenityInput: string
  amenities: string[]
}

const emptyForm = (): RoomTypeForm => ({
  title: '', basePrice: '', maxOccupancy: '2', description: '', isActive: true, amenityInput: '', amenities: [],
})

export const RoomTypesPage: React.FC = () => {
  const tenant = useAppSelector((s) => s.tenant.tenant)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<RoomTypeForm>(emptyForm())
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!tenant?.id) return
    setLoading(true)
    try {
      const res = await hotelApi.getRoomTypes({ companyId: tenant.id })
      setRoomTypes(res.data.data ?? [])
    } catch {
      toast.error('Failed to load room types')
    } finally {
      setLoading(false)
    }
  }, [tenant?.id])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm())
    setShowModal(true)
  }

  const openEdit = (rt: RoomType) => {
    setEditId(rt.id)
    let amenities: string[] = []
    try {
      if (rt.amenitiesJson) amenities = JSON.parse(rt.amenitiesJson)
    } catch { amenities = [] }

    setForm({
      title: rt.title,
      basePrice: String(rt.basePrice),
      maxOccupancy: String(rt.maxOccupancy),
      description: rt.description ?? '',
      isActive: rt.isActive,
      amenityInput: '',
      amenities
    })
    setShowModal(true)
  }

  const addAmenity = () => {
    const val = form.amenityInput.trim()
    if (!val || form.amenities.includes(val)) return
    setForm(p => ({ ...p, amenities: [...p.amenities, val], amenityInput: '' }))
  }

  const removeAmenity = (a: string) => setForm(p => ({ ...p, amenities: p.amenities.filter(x => x !== a) }))

  const handleSave = async () => {
    if (!form.title || !form.basePrice || !form.maxOccupancy) { toast.error('Fill all required fields'); return }
    if (!tenant?.id) return
    
    setSaving(true)
    try {
      const payload = {
        companyId: tenant.id,
        title: form.title,
        basePrice: Number(form.basePrice),
        maxOccupancy: Number(form.maxOccupancy),
        description: form.description,
        isActive: form.isActive,
        amenitiesJson: JSON.stringify(form.amenities)
      }

      if (editId) {
        await hotelApi.updateRoomType(editId, payload)
        toast.success('Room type updated')
      } else {
        await hotelApi.createRoomType(payload)
        toast.success('Room type added')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Failed to save room type')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Types</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your room categories and pricing</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Room Type</Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 text-center">Loading...</div>
        ) : roomTypes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">No room types found</div>
        ) : roomTypes.map(rt => {
          let amenities: string[] = []
          try { if (rt.amenitiesJson) amenities = JSON.parse(rt.amenitiesJson) } catch {}

          return (
            <div key={rt.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{rt.title}</h3>
                    <Badge variant={rt.isActive ? 'success' : 'default'}>{rt.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    â‚¹{rt.basePrice.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/night</span>
                  </p>
                </div>
                <button
                  onClick={() => openEdit(rt)}
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{rt.maxOccupancy} guest{rt.maxOccupancy > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BedDouble className="w-4 h-4" />
                  <span>{rt.totalRooms ?? 0} rooms</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5">
                {amenities.map(a => (
                  <span key={a} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                    <Tag className="w-2.5 h-2.5" />{a}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Room Type' : 'Add Room Type'}
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editId ? 'Save Changes' : 'Add Room Type'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Type Name"
            placeholder="e.g. Deluxe Double"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Base Price (â‚¹/night)"
              type="number"
              min="0"
              value={form.basePrice}
              onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
            />
            <Input
              label="Capacity (guests)"
              type="number"
              min="1"
              value={form.maxOccupancy}
              onChange={e => setForm(p => ({ ...p, maxOccupancy: e.target.value }))}
            />
          </div>
          <Input
            label="Description"
            placeholder="Optional description"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />

          {/* Active status */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="rt-active"
              checked={form.isActive}
              onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="rt-active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Active and available for booking
            </label>
          </div>

          {/* Amenities tag input */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Amenities</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Type amenity and press Enter"
                value={form.amenityInput}
                onChange={e => setForm(p => ({ ...p, amenityInput: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity() } }}
                className="flex-1"
              />
              <Button variant="secondary" size="sm" onClick={addAmenity}>Add</Button>
            </div>
            {form.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.amenities.map(a => (
                  <span
                    key={a}
                    className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                    onClick={() => removeAmenity(a)}
                    title="Click to remove"
                  >
                    {a} Ã—
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

