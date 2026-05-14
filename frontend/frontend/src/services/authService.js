import api from './api'

export const authService = {
  login: (email, senha) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', senha)
    return api.post('/auth/login', form).then(res => res.data)
  },
  register: (data) =>
    api.post('/auth/register', data).then(res => res.data),
  me: () =>
    api.get('/auth/me').then(res => res.data),
}