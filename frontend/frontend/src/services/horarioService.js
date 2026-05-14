import api from './api'

export const horarioService = {
  listarPorProfissional: (profissionalId) => 
    api.get(`/horarios/profissional/${profissionalId}`).then(r => r.data),
  criar: (data) => 
    api.post('/horarios/', data).then(r => r.data),
  atualizar: (id, data) => 
    api.put(`/horarios/${id}`, data).then(r => r.data),
  deletar: (id) => 
    api.delete(`/horarios/${id}`),
}
