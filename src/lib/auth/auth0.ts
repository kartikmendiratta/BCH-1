// src/lib/auth/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0/server'

export const auth0 = new Auth0Client({
  // Auth0 v4 configuration
  // These are read from environment variables by default:
  // AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
  
  authorizationParameters: {
    scope: 'openid profile email',
  },
})