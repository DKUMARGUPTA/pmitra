import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = ''

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (phone, password) => {
        set({ isLoading: true })
        try {
          const res = await axios.post(`${API_URL}/api/auth/login`, { phone, password })
          set({ user: res.data.user, token: res.data.token, isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.response?.data?.error || 'Login failed' }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const res = await axios.post(`${API_URL}/api/auth/register`, userData)
          set({ user: res.data.user, token: res.data.token, isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.response?.data?.error || 'Registration failed' }
        }
      },

      logout: () => {
        set({ user: null, token: null })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      }
    }),
    {
      name: 'poultry-mitra-auth',
      partialize: (state) => ({ token: state.token, user: state.user })
    }
  )
)