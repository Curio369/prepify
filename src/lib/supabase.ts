import { createBrowserClient } from '@supabase/ssr'

// Use createBrowserClient from @supabase/ssr — this handles PKCE flow
// correctly and keeps sessions in sync with the server-side client
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
