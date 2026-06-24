'use client'
import { useEffect, useState, useCallback } from 'react'

interface Stats {
  questions: number; uptet: number; ctet: number; jee: number; neet: number; uploads: number
  savedTests: number; scores: number; reportsOpen: number; reportsTotal: number; users: number
}
interface Report {
  id: string; question_id: string | null; exam_type: string | null; subject: string | null
  issue_type: string; note: string | null; question_text: string | null; status: string; created_at: string
}

const ISSUE_LABEL: Record<string, string> = {
  diagram_missing: 'Diagram missing', wrong_answer: 'Wrong answer',
  unclear: 'Unclear / typo', options: 'Options issue', other: 'Other',
}

export default function AdminPage() {
  const [state, setState] = useState<'loading' | 'denied' | 'ready'>('loading')
  const [stats, setStats] = useState<Stats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<'open' | 'all'>('open')

  const loadReports = useCallback(async (f: 'open' | 'all') => {
    const res = await fetch(`/api/admin/reports${f === 'open' ? '?status=open' : ''}`)
    if (res.ok) { const d = await res.json(); setReports(d.reports || []) }
  }, [])

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/stats')
      if (res.status === 403 || res.status === 401) { setState('denied'); return }
      if (!res.ok) { setState('denied'); return }
      setStats(await res.json())
      await loadReports('open')
      setState('ready')
    })()
  }, [loadReports])

  async function resolve(id: string, status: 'open' | 'resolved') {
    setReports(rs => rs.map(r => r.id === id ? { ...r, status } : r))
    await fetch('/api/admin/reports', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (filter === 'open' && status === 'resolved') setReports(rs => rs.filter(r => r.id !== id))
  }

  if (state === 'loading') return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/40 text-sm font-mono animate-pulse">Verifying access…</div>
    </div>
  )

  if (state === 'denied') return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="text-4xl">🔒</div>
      <h1 className="text-xl font-semibold text-white">Access denied</h1>
      <p className="text-white/40 text-sm max-w-sm">This area is restricted to administrators. If that&apos;s you, sign in with your admin account.</p>
      <a href="/login?next=/admin" className="text-sm text-white underline">Sign in</a>
    </div>
  )

  const cards = stats ? [
    { label: 'Total Questions', value: stats.questions, hint: `${stats.uploads} from uploads` },
    { label: 'UPTET', value: stats.uptet }, { label: 'CTET', value: stats.ctet },
    { label: 'JEE Main', value: stats.jee }, { label: 'NEET', value: stats.neet },
    { label: 'Users', value: stats.users },
    { label: 'Saved Tests', value: stats.savedTests },
    { label: 'Score Records', value: stats.scores },
    { label: 'Open Reports', value: stats.reportsOpen, hint: `${stats.reportsTotal} all-time`, alert: stats.reportsOpen > 0 },
  ] : []

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/8 px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <a href="/" className="text-white/50 hover:text-white text-sm transition">← Home</a>
          <span className="text-white/15">|</span>
          <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/70 border border-emerald-400/20 rounded px-1.5 py-0.5">superadmin</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {cards.map(c => (
            <div key={c.label} className={`rounded-2xl border p-4 ${c.alert ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/8 bg-white/[0.02]'}`}>
              <div className="text-[11px] text-white/40 uppercase tracking-wide mb-1.5">{c.label}</div>
              <div className={`text-2xl font-bold ${c.alert ? 'text-amber-400' : 'text-white'}`}>{c.value}</div>
              {c.hint && <div className="text-[11px] text-white/30 mt-1">{c.hint}</div>}
            </div>
          ))}
        </div>

        {/* Reports */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/80">Question reports</h2>
          <div className="flex gap-2">
            {(['open', 'all'] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); loadReports(f) }}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${filter === f ? 'bg-white text-black' : 'bg-white/[0.04] text-white/50 border border-white/10 hover:text-white/80'}`}>
                {f === 'open' ? 'Open' : 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.04] text-white/50 text-xs">
                  <th className="text-left px-3 py-2.5 font-medium">Date</th>
                  <th className="text-left px-3 py-2.5 font-medium">Exam</th>
                  <th className="text-left px-3 py-2.5 font-medium">Subject</th>
                  <th className="text-left px-3 py-2.5 font-medium">Issue</th>
                  <th className="text-left px-3 py-2.5 font-medium min-w-[260px]">Question / note</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-12 text-center text-white/30">No reports {filter === 'open' ? 'open' : 'yet'} 🎉</td></tr>
                ) : reports.map(r => (
                  <tr key={r.id} className="border-t border-white/6 align-top">
                    <td className="px-3 py-2.5 text-white/40 text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-3 py-2.5 text-white/70 text-xs whitespace-nowrap">{r.exam_type || '—'}</td>
                    <td className="px-3 py-2.5 text-white/60 text-xs">{r.subject || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${r.issue_type === 'diagram_missing' ? 'bg-amber-500/15 text-amber-300' : 'bg-white/10 text-white/60'}`}>
                        {ISSUE_LABEL[r.issue_type] || r.issue_type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-white/55 text-xs">
                      {r.question_text && <div className="line-clamp-2">{r.question_text}</div>}
                      {r.note && <div className="text-white/35 mt-1 italic">“{r.note}”</div>}
                      {r.question_id && <div className="text-white/25 font-mono text-[10px] mt-1">id: {r.question_id}</div>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {r.status === 'open' ? (
                        <button onClick={() => resolve(r.id, 'resolved')} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">Resolve ✓</button>
                      ) : (
                        <button onClick={() => resolve(r.id, 'open')} className="text-xs text-white/30 hover:text-white/60 transition">Reopen</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
