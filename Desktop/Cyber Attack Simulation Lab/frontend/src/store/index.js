import { create } from 'zustand'

const getStoredUser = () => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    const updated = { ...get().user, ...updates }
    localStorage.setItem('user', JSON.stringify(updated))
    set({ user: updated })
  },
}))

// Theme store
const getStoredTheme = () => localStorage.getItem('theme') || 'dark'

export const useThemeStore = create((set) => ({
  theme: getStoredTheme(),
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
    return { theme: next }
  }),
  initTheme: () => {
    const theme = getStoredTheme()
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme })
  },
}))
