import { getServerUser } from '@/lib/supabase-server'

// Superadmin gate. The allowlist lives ONLY in a server env var (ADMIN_EMAILS,
// comma-separated). It is never sent to the client, so it cannot be bypassed
// from the browser. Every admin API must call requireAdmin() first.

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

// Returns the authenticated user iff they are a superadmin, else null.
export async function requireAdmin() {
  const user = await getServerUser()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}
