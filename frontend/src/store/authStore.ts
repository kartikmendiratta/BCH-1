import { create } from 'zustand'
import { User as Auth0User } from '@auth0/auth0-react'

interface AuthState {
  user: Auth0User | null
  setUser: (user: Auth0User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user })
}))
