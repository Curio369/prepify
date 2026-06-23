import { createClient } from '@supabase/supabase-js'

// Service-role client — BYPASSES Row Level Security.
// SERVER-ONLY. Never import this into a client component or expose the key.
// Used for trusted server-side writes (question uploads, storage).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)
