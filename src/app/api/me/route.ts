import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { supabase } from '@/lib/config/db'

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const userId = (req as any).userId

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_sub, created_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
})