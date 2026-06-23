'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Client-side route guard. Returns false until auth is confirmed.
// Redirects unauthenticated users to /login?next=<current-path>.
export function useRequireAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      } else {
        setAuthed(true)
      }
    })
  }, [router, pathname])

  return authed
}
