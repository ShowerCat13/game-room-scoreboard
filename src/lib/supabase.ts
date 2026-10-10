import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Kiosk mode: the host's Manage sign-in lives in memory only
    autoRefreshToken: true, // Without this the host sign-in lapses after an hour and saves fail
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit realtime event frequency
    },
  },
})
