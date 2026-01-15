import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // Now points to Next.js API routes
})

// Add interceptors for authentication and error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page
      window.location.href = '/api/auth/login?returnTo=' + encodeURIComponent(window.location.pathname)
    }
    return Promise.reject(error)
  }
)

export default api