import { api } from '@flowtap/api-core'

export const jewelleryApi = {
  // ── Jewelry Items ─────────────────────────────────────────────────────────
  getItems(params: { companyId: string; search?: string; metalType?: string; page?: number; pageSize?: number }) {
    return api.get('/jewellery/items', { params })
  },
  getItem(id: string) {
    return api.get(`/jewellery/items/${id}`)
  },
  createItem(data: {
    companyId: string
    name: string
    sku?: string
    metalType: string
    purity: string
    grossWeight: number
    netWeight: number
    stoneWeight?: number
    makingCharges?: number
    salePrice?: number
    category?: string
    imageUrl?: string
  }) {
    return api.post('/jewellery/items', data)
  },
  updateItem(id: string, data: Record<string, unknown>) {
    return api.put(`/jewellery/items/${id}`, data)
  },
  deleteItem(id: string) {
    return api.delete(`/jewellery/items/${id}`)
  },

  // ── Metal Rates ───────────────────────────────────────────────────────────
  getMetalRates(params: { companyId: string }) {
    return api.get('/jewellery/metal-rates', { params })
  },
  setMetalRate(data: { companyId: string; metal: string; purity: string; ratePerGram: number }) {
    return api.post('/jewellery/metal-rates', data)
  },
  updateMetalRate(id: string, ratePerGram: number) {
    return api.patch(`/jewellery/metal-rates/${id}`, { ratePerGram })
  },

  // ── Metal Exchange ────────────────────────────────────────────────────────
  getExchanges(params: { companyId: string; page?: number; pageSize?: number }) {
    return api.get('/jewellery/metal-exchange', { params })
  },
  createExchange(data: {
    companyId: string
    clientId?: string
    metalType: string
    purity: string
    weightGrams: number
    ratePerGram: number
    direction: 'In' | 'Out'
    notes?: string
  }) {
    return api.post('/jewellery/metal-exchange', data)
  },
}
