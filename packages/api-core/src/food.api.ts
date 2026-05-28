import api from './axiosInstance'

export interface StockAlertRule {
  id: string
  productId: string
  warehouseId: string
  threshold: number
  unit: string
  sendEmail: boolean
  sendSms: boolean
  sendWhatsApp: boolean
  recipientContact?: string
  lastTriggeredAt?: string
}

export interface StockAlertRuleForm {
  productId: string
  warehouseId: string
  threshold: string
  unit: string
  sendEmail: boolean
  sendSms: boolean
  sendWhatsApp: boolean
  recipientContact: string
}

export const foodApi = {
  getTables(params: { companyId: string; locationId: string }) {
    return api.get('/food/tables', { params })
  },

  // ── Stock Alert Rules ────────────────────────────────────────────────────────
  getStockAlerts() {
    return api.get<{ data: StockAlertRule[] }>('/food/stock-alerts')
  },
  createStockAlert(data: Omit<StockAlertRuleForm, 'threshold'> & { threshold: number }) {
    return api.post('/food/stock-alerts', data)
  },
  updateStockAlert(id: string, data: Omit<StockAlertRuleForm, 'threshold'> & { threshold: number }) {
    return api.put(`/food/stock-alerts/${id}`, data)
  },
  deleteStockAlert(id: string) {
    return api.delete(`/food/stock-alerts/${id}`)
  },
}
