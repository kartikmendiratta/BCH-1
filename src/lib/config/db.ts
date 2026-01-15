import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required')
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required')
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function initDB() {
  try {
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error && error.code === '42P01') {
      console.log('Tables not found. Please run the SQL migrations in Supabase Dashboard.')
    } else if (error) {
      console.error('Supabase error:', error.message)
    } else {
      console.log('Supabase connection initialized')
    }
  } catch (err) {
    console.error('Failed to connect to Supabase:', err)
  }
}