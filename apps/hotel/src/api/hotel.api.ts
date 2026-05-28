import { api } from '@flowtap/api-core'

export const hotelApi = {
  // Room Types
  getRoomTypes: (params: { companyId: string }) =>
    api.get('/hotel/room-types', { params }),

  createRoomType: (data: Record<string, unknown>) =>
    api.post('/hotel/room-types', data),

  updateRoomType: (id: string, data: Record<string, unknown>) =>
    api.put(`/hotel/room-types/${id}`, data),

  deleteRoomType: (id: string) =>
    api.delete(`/hotel/room-types/${id}`),

  // Rooms
  getRooms: (params: { companyId: string; roomTypeId?: string; status?: string }) =>
    api.get('/hotel/rooms', { params }),

  createRoom: (data: Record<string, unknown>) =>
    api.post('/hotel/rooms', data),

  updateRoom: (id: string, data: Record<string, unknown>) =>
    api.put(`/hotel/rooms/${id}`, data),

  updateRoomStatus: (id: string, status: string) =>
    api.patch(`/hotel/rooms/${id}/status`, { status }),

  deleteRoom: (id: string) =>
    api.delete(`/hotel/rooms/${id}`),

  // Bookings
  getBookings: (params: { companyId: string; status?: string; page?: number; pageSize?: number }) =>
    api.get('/hotel/bookings', { params }),

  createBooking: (data: {
    companyId: string
    guestName: string
    guestPhone: string
    guestEmail?: string
    roomId: string
    checkIn: string
    checkOut: string
    guestCount?: number
    notes?: string
    totalAmount?: number
  }) => api.post('/hotel/bookings', data),

  updateBookingStatus: (id: string, status: string) =>
    api.patch(`/hotel/bookings/${id}/status`, { status }),

  cancelBooking: (id: string, reason?: string) =>
    api.patch(`/hotel/bookings/${id}/cancel`, { reason }),
}
