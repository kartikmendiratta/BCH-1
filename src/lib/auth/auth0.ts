// src/lib/auth/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0/server'

// Helper to sanitize env vars (remove quotes if user accidentally added them in Vercel)
const cleanEnv = (val: string | undefined) => val ? val.replace(/['"]/g, '').trim() : undefined;

const sanitizedConfig = {
  secret: cleanEnv(process.env.AUTH0_SECRET),
  baseUrl: cleanEnv(process.env.AUTH0_BASE_URL),
  issuer: cleanEnv(process.env.AUTH0_ISSUER_BASE_URL),
  clientId: cleanEnv(process.env.AUTH0_CLIENT_ID),
  clientSecret: cleanEnv(process.env.AUTH0_CLIENT_SECRET),
}

// Debug logs
if (process.env.NODE_ENV === 'production' && !sanitizedConfig.baseUrl) {
  console.error('CRITICAL: AUTH0_BASE_URL is undefined or empty after sanitization.');
}

export const auth0 = new Auth0Client({
  // Use sanitized values
  domain: sanitizedConfig.issuer?.replace('https://', '').replace(/\/$/, ''), // SDK wants domain, no protocol, no trailing slash
  clientId: sanitizedConfig.clientId,
  clientSecret: sanitizedConfig.clientSecret,
  secret: sanitizedConfig.secret,
  appBaseUrl: sanitizedConfig.baseUrl,

  authorizationParameters: {
    scope: 'openid profile email',
  },
})