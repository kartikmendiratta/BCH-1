import { auth0 } from '@/lib/auth/auth0'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/config/db'

export interface AuthenticatedRequest extends NextRequest {
  userId?: number
  userSub?: string
  userEmail?: string
}

export async function withAuth(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    try {
      const session = await auth0.getSession()
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' }, 
          { status: 401 }
        )
      }

      const userSub = session.user.sub
      const userEmail = session.user.email

      // Get or create user in database
      let { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('auth0_sub', userSub)
        .single()

      if (error || !user) {
        // Create user if doesn't exist
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
            { error: 'Failed to create user' },
            { status: 500 }
          )
        }
        
        user = newUser
      }

      // Add user info to request
      ;(req as any).userId = user.id
      ;(req as any).userSub = userSub
      ;(req as any).userEmail = userEmail

      return handler(req, context)
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}