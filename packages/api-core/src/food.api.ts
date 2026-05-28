import api from './axiosInstance'

export const foodApi = {
  getTables(params: { companyId: string; locationId: string }) {
    return api.get('/food/tables', { params })
  },
}
