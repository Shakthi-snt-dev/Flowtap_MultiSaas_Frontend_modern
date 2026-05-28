import { api } from '@flowtap/api-core'

export const medicalApi = {
  // ── Patients ──────────────────────────────────────────────────────────────
  getPatients(params: { companyId: string; search?: string; page?: number; pageSize?: number }) {
    return api.get('/medical/patients', { params })
  },
  getPatient(id: string) {
    return api.get(`/medical/patients/${id}`)
  },
  createPatient(data: {
    companyId: string
    name: string
    dob?: string
    gender?: string
    bloodGroup?: string
    phone: string
    email?: string
    address?: string
    emergencyContact?: string
  }) {
    return api.post('/medical/patients', data)
  },
  updatePatient(id: string, data: Record<string, unknown>) {
    return api.put(`/medical/patients/${id}`, data)
  },

  // ── Appointments ──────────────────────────────────────────────────────────
  getAppointments(params: { companyId: string; date?: string; status?: string; page?: number; pageSize?: number }) {
    return api.get('/medical/appointments', { params })
  },
  createAppointment(data: {
    companyId: string
    patientId: string
    doctorId?: string
    scheduledAt: string
    type: string
    notes?: string
    fee?: number
  }) {
    return api.post('/medical/appointments', data)
  },
  updateAppointmentStatus(id: string, status: string) {
    return api.patch(`/medical/appointments/${id}/status`, { status })
  },

  // ── Consultations ─────────────────────────────────────────────────────────
  getConsultations(params: { companyId: string; patientId?: string; page?: number; pageSize?: number }) {
    return api.get('/medical/consultations', { params })
  },
  createConsultation(data: {
    companyId: string
    patientId: string
    appointmentId?: string
    diagnosis: string
    prescription?: string
    notes?: string
    followUpDate?: string
    fee?: number
  }) {
    return api.post('/medical/consultations', data)
  },
  updateConsultation(id: string, data: Record<string, unknown>) {
    return api.put(`/medical/consultations/${id}`, data)
  },
}
