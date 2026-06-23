'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/useRequireAuth'

interface SavedTest {
  id: string
  name: string
  exam_type: string
  exam_skin: string
  question_count: number
  last_result: any | null
  created_at: string
}

const EXAM_BADGE: Record<string, string> = {
  'JEE Main': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'NEET': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'CTET': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'UPTET': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '' }
}

export default function LibraryPage() {
  const authed = useRequireAuth()
  const router = useRouter()

  const [tests, setTests] = useState<SavedTest[]>([])
  const [limit, setLimit] = useState(50)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tests')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTests(data.tests || [])
      setLimit(data.limit || 50)
    } catch (e: any) {
      setError(e.message || 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (authed) load() }, [authed, load])

  async function rename(id: string) {
    const name = editName.trim()
    setEditingId(null)
    if (!name) return
    setTests(ts => ts.map(t => t.id === id ? { ...t, name } : t)) // optimistic
    await fetch('/api/tests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    })
  }

  async function remove(id: string) {
    setConfirmDelete(null)
    setBusyId(id)
    setTests(ts => ts.filter(t => t.id !== id)) // optimistic
    await fetch(`/api/tests?id=${id}`, { method: 'DELETE' })
    setBusyId(null)
  }

  if (!authed) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/40 text-sm font-mono animate-pulse">Checking access...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="border-b border-white/8 px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <a href="/" className="text-white/50 hover:text-white text-sm transition">← Home</a>
          <span className="text-white/15">|</span>
          <h1 className="text-lg font-semibold tracking-tight">My Library</h1>
        </div>
        <a
          href="/upload"
          className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-zinc-200 transition"
        >
          + New Test
        </a>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-8">
        {/* Usage meter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/50 text-sm">
            {tests.length} of {limit} saved
          </p>
          <div className="w-40 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all ${tests.length >= limit ? 'bg-red-500' : 'bg-white/60'}`}
              style={{ width: `${Math.min(100, (tests.length / limit) * 100)}%` }}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/[0.03] border border-white/8 animate-pulse" />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
            <p className="text-white/40 text-sm mb-6">Upload a paper and it's saved here automatically — reopen it anytime, no re-processing.</p>
            <a href="/upload" className="inline-block bg-white text-black text-sm font-semibold px-6 py-3 rounded-full hover:bg-zinc-200 transition">
              Upload your first paper →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map(t => {
              const badge = EXAM_BADGE[t.exam_type] || 'bg-white/10 text-white/60 border-white/15'
              const score = t.last_result?.marks
              const max = t.last_result?.maxMarks
              return (
                <div
                  key={t.id}
                  className={`group relative rounded-2xl bg-white/[0.03] border border-white/8 p-5 hover:border-white/20 transition flex flex-col ${busyId === t.id ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge}`}>
                      {t.exam_type}
                    </span>
                    <span className="text-white/25 text-xs">{fmtDate(t.created_at)}</span>
                  </div>

                  {/* Name (inline editable) */}
                  {editingId === t.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => rename(t.id)}
                      onKeyDown={e => { if (e.key === 'Enter') rename(t.id); if (e.key === 'Escape') setEditingId(null) }}
                      className="bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-sm w-full mb-2 outline-none focus:border-white/40"
                    />
                  ) : (
                    <h3 className="font-semibold text-[15px] leading-snug mb-2 line-clamp-2 min-h-[2.6em]">{t.name}</h3>
                  )}

                  <div className="flex items-center gap-3 text-xs text-white/40 mb-4">
                    <span>{t.question_count} questions</span>
                    {score !== undefined && (
                      <span className="text-emerald-400 font-medium">Last: {score}/{max}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/exam?test=${t.id}`)}
                      className="flex-1 bg-white text-black text-sm font-semibold py-2 rounded-lg hover:bg-zinc-200 transition"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => { setEditingId(t.id); setEditName(t.name) }}
                      title="Rename"
                      className="w-9 h-9 grid place-items-center rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => setConfirmDelete(t.id)}
                      title="Delete"
                      className="w-9 h-9 grid place-items-center rounded-lg border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/40 transition"
                    >
                      🗑
                    </button>
                  </div>

                  {/* Delete confirm overlay */}
                  {confirmDelete === t.id && (
                    <div className="absolute inset-0 rounded-2xl bg-black/90 grid place-items-center p-4 text-center">
                      <div>
                        <p className="text-sm mb-4">Delete "<span className="font-medium">{t.name}</span>"?</p>
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg border border-white/15 text-white/60 text-sm hover:bg-white/5">Cancel</button>
                          <button onClick={() => remove(t.id)} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
