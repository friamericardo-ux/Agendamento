import api from './api'

export const profissionalService = {
  listar: () => api.get('/profissionais/').then(r => r.data),
  buscar: (id) => api.get(`/profissionais/${id}`).then(r => r.data),
  criar: (data) => api.post('/profissionais/', data).then(r => r.data),
  atualizar: (id, data) => api.put(`/profissionais/${id}`, data).then(r => r.data),
  deletar: (id) => api.delete(`/profissionais/${id}`).then(r => r.data),
}
