// src/lib/auth/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0/server'

// Debug check for Vercel (these will show up in Vercel logs if missing or invalid)
// This runs BEFORE the Auth0Client is instantiated
const config = {
  secret: process.env.AUTH0_SECRET,
  baseUrl: process.env.AUTH0_BASE_URL,
  issuer: process.env.AUTH0_ISSUER_BASE_URL,
  clientId: process.env.AUTH0_CLIENT_ID,
}

if (!config.baseUrl || !config.issuer || !config.secret) {
  console.error('MISSING AUTH0 CONFIG DETECTED:', {
    baseUrl: config.baseUrl ? 'PRESENT' : 'MISSING',
    issuer: config.issuer ? 'PRESENT' : 'MISSING',
    secret: config.secret ? 'PRESENT' : 'MISSING',
  });
} else {
  // Check for common URL formatting errors that cause "Invalid URL"
  try {
    new URL(config.baseUrl);
    new URL(config.issuer);
  } catch (e) {
    console.error('INVALID URL FORMAT DETECTED:', {
      baseUrl: config.baseUrl,
      issuer: config.issuer,
      error: (e as Error).message
    });
  }
}

export const auth0 = new Auth0Client({
  // Auth0 v4 automatically reads:
  // AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
  authorizationParameters: {
    scope: 'openid profile email',
  },
})