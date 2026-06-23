'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRequireAuth } from '@/lib/useRequireAuth'

interface Rec {
  id: string
  test_name: string
  exam_type: string
  marks: number | null
  max_marks: number | null
  positive_marks: number | null
  negative_marks: number | null
  potential_score: number | null
  percentile: number | null
  remarks: string | null
  source: string
  attempt_date: string | null
  created_at: string
}

const BLANK = {
  test_name: '', exam_type: 'JEE Main', marks: '', max_marks: '300',
  positive_marks: '', negative_marks: '', potential_score: '', percentile: '',
  remarks: '', attempt_date: new Date().toISOString().slice(0, 10),
}

function pct(r: Rec): number | null {
  if (r.marks == null || !r.max_marks) return null
  return Math.round((r.marks / r.max_marks) * 1000) / 10
}
function fmtDate(s: string | null) {
  if (!s) return '—'
  try { return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) }
  catch { return s }
}

export default function TrackerPage() {
  const authed = useRequireAuth()
  const [records, setRecords] = useState<Rec[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [hover, setHover] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/scores')
      const data = await res.json()
      setRecords(data.records || [])
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { if (authed) load() }, [authed, load])

  async function addRecord() {
    if (!form.test_name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/scores', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'manual' }),
      })
      const data = await res.json()
      if (data.record) { await load(); setShowAdd(false); setForm({ ...BLANK }) }
    } finally { setSaving(false) }
  }

  async function remove(id: string) {
    setRecords(rs => rs.filter(r => r.id !== id))
    await fetch(`/api/scores?id=${id}`, { method: 'DELETE' })
  }

  // ── Stats ──
  const stats = useMemo(() => {
    const withPct = records.map(pct).filter((p): p is number => p != null)
    const marks = records.map(r => r.marks).filter((m): m is number => m != null)
    if (!records.length) return null
    const best = marks.length ? Math.max(...marks) : null
    const avg = marks.length ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : null
    const latest = marks.length ? marks[marks.length - 1] : null
    const prev = marks.length > 1 ? marks[marks.length - 2] : null
    const trend = latest != null && prev != null ? latest - prev : null
    return { count: records.length, best, avg, latest, trend, avgPct: withPct.length ? Math.round(withPct.reduce((a, b) => a + b, 0) / withPct.length) : null }
  }, [records])

  // ── Chart data (percentage over attempts) ──
  const chart = useMemo(() => {
    const pts = records
      .map((r, i) => ({ i, p: pct(r), name: r.test_name, date: r.attempt_date, marks: r.marks, max: r.max_marks }))
      .filter(d => d.p != null) as { i: number; p: number; name: string; date: string | null; marks: number | null; max: number | null }[]
    return pts
  }, [records])

  if (!authed) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/40 text-sm font-mono animate-pulse">Checking access...</div>
    </div>
  )

  // chart geometry
  const W = 820, H = 300, padL = 38, padR = 16, padT = 16, padB = 28
  const innerW = W - padL - padR, innerH = H - padT - padB
  const n = chart.length
  const x = (i: number) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (p: number) => padT + innerH - (p / 100) * innerH
  const linePath = chart.map((d, k) => `${k === 0 ? 'M' : 'L'} ${x(k).toFixed(1)} ${y(d.p).toFixed(1)}`).join(' ')

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/8 px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <a href="/" className="text-white/50 hover:text-white text-sm transition">← Home</a>
          <span className="text-white/15">|</span>
          <h1 className="text-lg font-semibold tracking-tight">📊 Score Tracker</h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-zinc-200 transition">
          + Add Test
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-8">
        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="Tests Logged" value={String(stats.count)} />
            <StatCard label="Best Marks" value={stats.best != null ? String(stats.best) : '—'} accent="text-emerald-400" />
            <StatCard label="Average" value={stats.avg != null ? String(stats.avg) : '—'} />
            <StatCard label="Latest" value={stats.latest != null ? String(stats.latest) : '—'}
              sub={stats.trend != null ? `${stats.trend >= 0 ? '▲ +' : '▼ '}${stats.trend}` : undefined}
              subColor={stats.trend != null ? (stats.trend >= 0 ? 'text-emerald-400' : 'text-red-400') : ''} />
          </div>
        )}

        {/* Chart */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 md:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/80">Progress (% score over time)</h2>
            <span className="text-xs text-white/30">{n} plotted</span>
          </div>
          {n === 0 ? (
            <div className="h-48 grid place-items-center text-white/30 text-sm">
              Add tests with marks + max marks to see your graph
            </div>
          ) : (
            <div className="relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
                {/* gridlines */}
                {[0, 25, 50, 75, 100].map(g => (
                  <g key={g}>
                    <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                    <text x={padL - 6} y={y(g) + 3} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.3)">{g}%</text>
                  </g>
                ))}
                {/* area + line */}
                <path d={`${linePath} L ${x(n - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`} fill="rgba(96,165,250,0.10)" />
                <path d={linePath} fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinejoin="round" />
                {/* points */}
                {chart.map((d, k) => (
                  <g key={k} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
                    <circle cx={x(k)} cy={y(d.p)} r={hover === k ? 5 : 3} fill={hover === k ? '#fff' : '#60a5fa'} stroke="#60a5fa" strokeWidth={1.5} />
                    {/* wider invisible hit area */}
                    <rect x={x(k) - 12} y={padT} width={24} height={innerH} fill="transparent" />
                  </g>
                ))}
              </svg>
              {/* tooltip */}
              {hover != null && chart[hover] && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/15 rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none">
                  <div className="font-semibold text-white/90 max-w-[200px] truncate">{chart[hover].name}</div>
                  <div className="text-white/50">{chart[hover].marks}/{chart[hover].max} · {chart[hover].p}% · {fmtDate(chart[hover].date)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.04] text-white/50 text-xs">
                  <th className="text-left px-3 py-2.5 font-medium">#</th>
                  <th className="text-left px-3 py-2.5 font-medium min-w-[180px]">Test</th>
                  <th className="text-left px-3 py-2.5 font-medium">Marks</th>
                  <th className="text-left px-3 py-2.5 font-medium">%</th>
                  <th className="text-left px-3 py-2.5 font-medium">+ve</th>
                  <th className="text-left px-3 py-2.5 font-medium">−ve</th>
                  <th className="text-left px-3 py-2.5 font-medium">Potential</th>
                  <th className="text-left px-3 py-2.5 font-medium">%ile</th>
                  <th className="text-left px-3 py-2.5 font-medium min-w-[160px]">Remarks</th>
                  <th className="text-left px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="px-3 py-10 text-center text-white/30">Loading…</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={11} className="px-3 py-12 text-center text-white/30">
                    No tests logged yet. Take a Prepify test (auto-logged) or click <span className="text-white/60">+ Add Test</span> for coaching mocks.
                  </td></tr>
                ) : records.map((r, i) => {
                  const p = pct(r)
                  return (
                    <tr key={r.id} className="border-t border-white/6 hover:bg-white/[0.02]">
                      <td className="px-3 py-2.5 text-white/30">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white/90">{r.test_name}</span>
                          {r.source === 'prepify' && <span className="text-[9px] bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded">AUTO</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-white/80">{r.marks ?? '—'}{r.max_marks ? `/${r.max_marks}` : ''}</td>
                      <td className="px-3 py-2.5 font-mono text-white/60">{p != null ? `${p}%` : '—'}</td>
                      <td className="px-3 py-2.5 text-emerald-400/80">{r.positive_marks ?? '—'}</td>
                      <td className="px-3 py-2.5 text-red-400/80">{r.negative_marks ?? '—'}</td>
                      <td className="px-3 py-2.5 text-white/50">{r.potential_score ?? '—'}</td>
                      <td className="px-3 py-2.5 text-white/50">{r.percentile ?? '—'}</td>
                      <td className="px-3 py-2.5 text-white/40 text-xs max-w-[220px]"><div className="line-clamp-2">{r.remarks || '—'}</div></td>
                      <td className="px-3 py-2.5 text-white/40 text-xs whitespace-nowrap">{fmtDate(r.attempt_date)}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => remove(r.id)} className="text-white/30 hover:text-red-400 transition">🗑</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center px-4 py-8 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add a test score</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Test name" className="col-span-2">
                <input value={form.test_name} onChange={e => setForm({ ...form, test_name: e.target.value })}
                  placeholder="e.g. Quizrr Full Test 21" className="inp" />
              </Field>
              <Field label="Exam">
                <select value={form.exam_type} onChange={e => setForm({ ...form, exam_type: e.target.value })} className="inp">
                  {['JEE Main', 'JEE Advanced', 'NEET', 'CTET', 'UPTET', 'Other'].map(x => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field label="Attempt date">
                <input type="date" value={form.attempt_date} onChange={e => setForm({ ...form, attempt_date: e.target.value })} className="inp" />
              </Field>
              <Field label="Marks obtained">
                <input value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} placeholder="175" className="inp" inputMode="decimal" />
              </Field>
              <Field label="Out of (max)">
                <input value={form.max_marks} onChange={e => setForm({ ...form, max_marks: e.target.value })} placeholder="300" className="inp" inputMode="decimal" />
              </Field>
              <Field label="+ve marks">
                <input value={form.positive_marks} onChange={e => setForm({ ...form, positive_marks: e.target.value })} placeholder="188" className="inp" inputMode="decimal" />
              </Field>
              <Field label="−ve marks">
                <input value={form.negative_marks} onChange={e => setForm({ ...form, negative_marks: e.target.value })} placeholder="13" className="inp" inputMode="decimal" />
              </Field>
              <Field label="Potential score">
                <input value={form.potential_score} onChange={e => setForm({ ...form, potential_score: e.target.value })} placeholder="220" className="inp" inputMode="decimal" />
              </Field>
              <Field label="Percentile">
                <input value={form.percentile} onChange={e => setForm({ ...form, percentile: e.target.value })} placeholder="98.5" className="inp" inputMode="decimal" />
              </Field>
              <Field label="Remarks" className="col-span-2">
                <textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
                  placeholder="What to improve, silly mistakes, etc." className="inp resize-none h-16" />
              </Field>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-white/15 text-white/60 font-medium py-2.5 rounded-lg hover:bg-white/5 text-sm">Cancel</button>
              <button onClick={addRecord} disabled={saving || !form.test_name.trim()}
                className="flex-1 bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-zinc-200 disabled:opacity-40 text-sm">
                {saving ? 'Saving…' : 'Add Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.inp) {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 13px;
          color: white;
          outline: none;
        }
        :global(.inp:focus) { border-color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}

function StatCard({ label, value, sub, accent, subColor }: { label: string; value: string; sub?: string; accent?: string; subColor?: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="text-[11px] text-white/40 uppercase tracking-wide mb-1.5">{label}</div>
      <div className={`text-2xl font-bold ${accent || 'text-white'}`}>{value}
        {sub && <span className={`text-xs font-semibold ml-2 ${subColor}`}>{sub}</span>}
      </div>
    </div>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] text-white/40 mb-1 block">{label}</span>
      {children}
    </label>
  )
}
