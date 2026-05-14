import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      empresaNome: 'Agendamentos Automação',
      login: (token, usuario) => set({ token, usuario }),
      logout: () => set({ token: null, usuario: null }),
    }),
    { name: 'auth-storage' }
  )
)
