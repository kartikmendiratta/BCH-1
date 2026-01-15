import axios from 'axios'
import { Auth0ContextInterface } from '@auth0/auth0-react'

let auth0Instance: Auth0ContextInterface | null = null

export const setAuth0Instance = (auth0: Auth0ContextInterface) => {
  auth0Instance = auth0
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use(async (config) => {
  if (auth0Instance?.isAuthenticated) {
    try {
      const token = await auth0Instance.getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      })
      config.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.error('Error getting access token:', error)
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && auth0Instance) {
      auth0Instance.loginWithRedirect()
    }
    return Promise.reject(error)
  }
)

export default api
