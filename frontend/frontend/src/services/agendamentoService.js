import api from './api'

export const agendamentoService = {
  listar: (params) => api.get('/agendamentos/', { params }).then(r => r.data),
  buscar: (id) => api.get(`/agendamentos/${id}`).then(r => r.data),
  criar: (data) => api.post('/agendamentos/', data).then(r => r.data),
  atualizar: (id, data) => api.put(`/agendamentos/${id}`, data).then(r => r.data),
  deletar: (id) => api.delete(`/agendamentos/${id}`).then(r => r.data),
}
