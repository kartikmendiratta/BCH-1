import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { setAuth0Instance } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute() {
  const { isLoading, isAuthenticated, user, loginWithRedirect } = useAuth0()
  const { setUser } = useAuthStore()

  useEffect(() => {
    setAuth0Instance(useAuth0())
    if (user) {
      setUser(user)
    }
  }, [user, setUser])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    loginWithRedirect()
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  return <Outlet />
}
