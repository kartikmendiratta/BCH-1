// src/lib/auth/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0/server'

// Debug check for Vercel (these will show up in Vercel logs if missing)
if (!process.env.AUTH0_BASE_URL || !process.env.AUTH0_ISSUER_BASE_URL) {
  console.error('MISSING AUTH0 CONFIG:', {
    baseUrl: process.env.AUTH0_BASE_URL ? 'PRESENT' : 'MISSING',
    issuer: process.env.AUTH0_ISSUER_BASE_URL ? 'PRESENT' : 'MISSING'
  });
}

export const auth0 = new Auth0Client({
  // Auth0 v4 configuration
  // Explicitly passing values to ensure they are being read correctly
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,

  authorizationParameters: {
    scope: 'openid profile email',
  },
})