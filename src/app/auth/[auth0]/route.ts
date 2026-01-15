// src/app/auth/[auth0]/route.ts
// In Auth0 v4, all auth routes are handled by the middleware
// This file can be a catch-all that redirects to the appropriate middleware handler

import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth/auth0'

export async function GET(req: NextRequest) {
  // The middleware handles auth routes automatically
  // This is a fallback that returns the middleware response
  const response = await auth0.middleware(req)
  return response || NextResponse.next()
}

export async function POST(req: NextRequest) {
  const response = await auth0.middleware(req)
  return response || NextResponse.next()
}
