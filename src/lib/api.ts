// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api', 
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // UPDATED: v4 routes are at /auth/login, not /api/auth/login
      const returnTo = encodeURIComponent(window.location.pathname)
      window.location.href = `/auth/login?returnTo=${returnTo}`
    }
    return Promise.reject(error)
  }
)

export default api