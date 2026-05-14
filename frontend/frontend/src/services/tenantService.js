import api from './api'

export const tenantService = {
  me: () => api.get('/tenants/me').then(r => r.data), // I should add this endpoint or just use /tenants/{id}
  buscar: (id) => api.get(`/tenants/${id}`).then(r => r.data),
  atualizar: (id, data) => api.put(`/tenants/${id}`, data).then(r => r.data),
}
