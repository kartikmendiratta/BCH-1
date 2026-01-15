import { Request, Response } from 'express'
import { supabase } from '../config/db'
import { AuthRequest } from '../middleware/auth.middleware'
import { generateAddress } from '../services/bch.service'

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_sub, created_at')
      .eq('id', req.userId)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get user' })
  }
}

// Create user profile (called after Auth0 authentication)
export async function createProfile(req: AuthRequest, res: Response) {
  try {
    const { name, preferences } = req.body

    // Update user with additional profile info
    await supabase
      .from('users')
      .update({ name })
      .eq('id', req.userId)

    // Create wallet if not exists
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.userId)
      .single()

    if (!wallet) {
      const address = generateAddress()
      await supabase
        .from('wallets')
        .insert({ user_id: req.userId, address })
    }

    res.json({ message: 'Profile updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create profile' })
  }
}
