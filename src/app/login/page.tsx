'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/upload'

  async function signInWithGoogle() {
    setLoading(true)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        <p className="text-xs font-mono text-white/40 tracking-widest uppercase mb-4">Prepify</p>
        <h1 className="text-3xl font-display tracking-tight mb-2">Sign in to continue</h1>
        <p className="text-white/50 text-sm mb-10">
          Upload your DPPs and get AI-extracted questions instantly.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 px-6 rounded-full hover:bg-zinc-100 transition-all disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {loading ? 'Redirecting to Google...' : 'Continue with Google'}
        </button>

        {searchParams.get('error') && (
          <p className="text-red-400 text-xs mt-4">
            Login failed. Please try again.
          </p>
        )}

        <p className="text-white/20 text-xs mt-8">
          Free tier: 10 uploads/month. No credit card needed.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  )
}
