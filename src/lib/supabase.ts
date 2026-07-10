import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Verify/recovery email links land with the session in the URL fragment.
// Capture it before createClient initializes and strips it, so AuthContext can
// establish the session manually if automatic URL detection misses it.
export const initialAuthHash = typeof window !== 'undefined' ? window.location.hash : ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
