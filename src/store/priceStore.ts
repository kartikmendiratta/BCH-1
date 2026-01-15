import { create } from 'zustand'
import api from '@/lib/api'
import { PriceData } from '@/types'

interface PriceState {
  prices: PriceData | null
  isLoading: boolean
  fetchPrices: () => Promise<void>
}

export const usePriceStore = create<PriceState>((set) => ({
  prices: null,
  isLoading: false,

  fetchPrices: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('/price')
      set({ prices: res.data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
}))