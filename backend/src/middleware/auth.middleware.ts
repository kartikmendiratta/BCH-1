import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-client'
import { supabase } from '../config/db'

export interface AuthRequest extends Request {
  userId?: number
  userSub?: string
  userEmail?: string
}

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 86400000, // 1 day
})

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err: any, key: any) => {
    if (err) return callback(err)
    const signingKey = key?.getPublicKey()
    callback(null, signingKey)
  })
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided', code: 'AUTH_REQUIRED' })
  }

  // Verify Auth0 JWT token
  jwt.verify(token, getKey, {
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  }, async (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token', code: 'AUTH_REQUIRED' })
    }

    req.userSub = decoded.sub
    req.userEmail = decoded.email || decoded[`${process.env.AUTH0_AUDIENCE}/email`]
    
    try {
      // Get or create user ID from database
      let { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth0_sub', decoded.sub)
        .single()
      
      if (!user) {
        // Create user if doesn't exist
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            auth0_sub: decoded.sub,
            email: req.userEmail || decoded.sub + '@auth0.local'
          })
          .select('id')
          .single()
        
        user = newUser
      }
      
      req.userId = user?.id
      next()
    } catch (dbErr) {
      console.error('Database error in auth middleware:', dbErr)
      return res.status(500).json({ error: 'Database error', code: 'DB_ERROR' })
    }
  })
}
