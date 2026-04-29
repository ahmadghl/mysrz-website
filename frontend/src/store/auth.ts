import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

interface AuthState {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      login: async (username, password) => {
        const res = await api.post('/auth/login', { username, password })
        const token = res.data.access_token
        set({ token })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },
      logout: () => {
        set({ token: null })
        delete api.defaults.headers.common['Authorization']
      },
    }),
    { name: 'auth-store' }
  )
)
