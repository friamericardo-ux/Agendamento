import api from './api'

export const clienteService = {
  listar: (params) => api.get('/clientes/', { params }).then(r => r.data),
  buscarPorId: (id) => api.get(`/clientes/${id}`).then(r => r.data),
  criar: (data) => api.post('/clientes/', data).then(r => r.data),
  atualizar: (id, data) => api.put(`/clientes/${id}`, data).then(r => r.data),
  deletar: (id) => api.delete(`/clientes/${id}`),
}
