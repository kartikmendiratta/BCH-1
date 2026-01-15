import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Button from '../components/ui/Button'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = () => {
    loginWithRedirect()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <Link to="/" className="text-2xl font-bold">BCH P2P</Link>
          <p className="text-neutral-400 mt-2">Welcome back</p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-2 rounded-lg text-sm">
              Authentication error. Please try again.
            </div>
          )}

          <Button onClick={handleLogin} className="w-full">
            Sign In with Auth0
          </Button>
        </div>

        <p className="text-neutral-400 text-sm mt-6">
          Secure authentication powered by Auth0
        </p>

        <p className="text-center text-neutral-400 text-sm mt-4">
          Don't have an account?{' '}
          <button 
            onClick={handleLogin}
            className="text-white hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
