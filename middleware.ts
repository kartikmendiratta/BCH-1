// middleware.ts (root level)
import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth/auth0'

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request)

  // If Auth0 handled it (login, logout, callback), return that response
  if (authRes) {
    return authRes
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
