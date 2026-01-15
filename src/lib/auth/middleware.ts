// src/lib/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth/auth0'
import { supabase } from '@/lib/config/db'

// Next.js Route Context Type
export type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>
}

// Extended request with user data
export interface AuthenticatedRequest extends NextRequest {
  userId: string
  userSub: string
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context: RouteContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: RouteContext) => {
    try {
      // Auth0 v4 syntax
      const session = await auth0.getSession()
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' }, 
          { status: 401 }
        )
      }

      const userSub = session.user.sub
      const userEmail = session.user.email

      // Get or create user in Supabase
      let { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('auth0_sub', userSub)
        .single()

      if (error || !user) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            auth0_sub: userSub,
            email: userEmail,
          })
          .select('id')
          .single()

        if (createError || !newUser) {
          return NextResponse.json(
            { error: 'Failed to sync user' },
            { status: 500 }
          )
        }
        user = newUser
      }

      // Create authenticated request with user data
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.userId = user.id.toString()
      authenticatedReq.userSub = userSub

      return handler(authenticatedReq, context)
    } catch (error) {
      console.error('Auth wrapper error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}