import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// For backward compatibility
export const db = supabase

export async function initDB() {
  // Tables are created in Supabase Dashboard or via migrations
  // This function now just verifies the connection
  try {
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error && error.code === '42P01') {
      console.log('Tables not found. Please run the SQL migrations in Supabase Dashboard.')
      console.log('See backend/supabase-schema.sql for the required schema.')
    } else if (error) {
      console.error('Supabase error:', error.message)
    } else {
      console.log('Supabase connection initialized')
    }
  } catch (err) {
    console.error('Failed to connect to Supabase:', err)
  }
}
