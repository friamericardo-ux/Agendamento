import api from './api'

export const servicoService = {
  listar: () => api.get('/servicos').then(r => r.data),
  buscar: (id) => api.get(`/servicos/${id}`).then(r => r.data),
  criar: (data) => api.post('/servicos', data).then(r => r.data),
  atualizar: (id, data) => api.put(`/servicos/${id}`, data).then(r => r.data),
  deletar: (id) => api.delete(`/servicos/${id}`).then(r => r.data),
}
