'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// ── Static subject sets ──────────────────────────────────────────────────────
// Paper I: CDP + Lang I Hindi + Lang II (choice) + Mathematics + EVS
const PAPER_I_FIXED  = ['Child Development and Pedagogy', 'Language I Hindi', 'Mathematics', 'Environmental Studies']
// Paper II base: CDP + Lang I Hindi (Lang II and stream subject added dynamically)
const PAPER_II_FIXED = ['Child Development and Pedagogy', 'Language I Hindi']

const LANG_II_OPTIONS = [
  { label: 'English',  value: 'Language II English'  },
  { label: 'Urdu',     value: 'Language II Urdu'     },
  { label: 'Sanskrit', value: 'Language II Sanskrit'  },
]

// Paper II stream subjects — 'ms' expands to Mathematics + Science (30+30 in Supabase)
const P2_OPTIONAL = [
  { label: 'Maths & Science (30+30)', value: 'ms'            },
  { label: 'Social Studies (60)',      value: 'Social Studies' },
]

// Subject groups for Topic Practice dropdown
const SUBJECT_GROUPS = {
  'Paper I & II': [
    { label: 'Child Development & Pedagogy', value: 'Child Development and Pedagogy' },
    { label: 'Language I – Hindi',           value: 'Language I Hindi'               },
    { label: 'Language II – English',        value: 'Language II English'            },
    { label: 'Language II – Urdu',           value: 'Language II Urdu'               },
    { label: 'Language II – Sanskrit',       value: 'Language II Sanskrit'           },
  ],
  'Paper I Only (Class 1–5)': [
    { label: 'Mathematics',           value: 'Mathematics'           },
    { label: 'Environmental Studies', value: 'Environmental Studies' },
  ],
  'Paper II Only (Class 6–8)': [
    { label: 'Mathematics',   value: 'Mathematics'   },
    { label: 'Science',       value: 'Science'       },
    { label: 'Social Studies', value: 'Social Studies' },
  ],
}

// PYQ papers — one entry per year+paper; Paper II stream chosen via selector
const PYQ_PAPERS = [
  { id: '2022-jan-p1',  label: 'Jan 2022 · Paper I',  year: '2022', paper: 'I'  as const },
  { id: '2022-jan-p2',  label: 'Jan 2022 · Paper II', year: '2022', paper: 'II' as const },
  { id: '2019-p1',      label: '2019 · Paper I',       year: '2019', paper: 'I'  as const },
  { id: '2019-p2',      label: '2019 · Paper II',      year: '2019', paper: 'II' as const },
  { id: '2018-nov-p1',  label: 'Nov 2018 · Paper I',   year: '2018', paper: 'I'  as const },
  { id: '2018-p2',      label: '2018 · Paper II',      year: '2018', paper: 'II' as const },
  { id: '2017-oct-p1',  label: 'Oct 2017 · Paper I',   year: '2017', paper: 'I'  as const },
  { id: '2017-oct-p2',  label: 'Oct 2017 · Paper II',  year: '2017', paper: 'II' as const },
  { id: '2016-p1',      label: '2016 · Paper I',       year: '2016', paper: 'I'  as const },
  { id: '2016-p2',      label: '2016 · Paper II',      year: '2016', paper: 'II' as const },
  { id: '2013-p1',      label: '2013 · Paper I',       year: '2013', paper: 'I'  as const },
  { id: '2013-p2',      label: '2013 · Paper II',      year: '2013', paper: 'II' as const },
]

type Mode = 'subject' | 'full' | 'pyq'

export default function UptetLandingPage() {
  const router = useRouter()
  const [mode, setMode]   = useState<Mode>('subject')
  const [loading, setLoading] = useState(false)

  // Mode: learning = instant reveal, exam = submit then analyse
  const [practiceMode, setPracticeMode] = useState<'learning' | 'exam'>('exam')

  // Topic Practice
  const [selectedSubject, setSelectedSubject] = useState('Child Development and Pedagogy')
  const [questionCount, setQuestionCount]     = useState(10)

  // Full Mock
  const [paper, setPaper]         = useState<'I' | 'II'>('I')
  const [langII, setLangII]       = useState('Language II English')
  const [p2Optional, setP2Optional] = useState('ms')

  // PYQ
  const [selectedPyq, setSelectedPyq] = useState(PYQ_PAPERS[0].id)
  const [pyqLangII, setPyqLangII]     = useState<string | null>(null)
  const [pyqStream, setPyqStream]     = useState<'ms' | 'Social Studies' | null>(null)
  const [pyqError, setPyqError]       = useState<string | null>(null)

  // 'ms' sentinel expands to Mathematics + Science (stored separately in Supabase)
  function buildSubjects(p: 'I' | 'II', lang: string, optional?: string): string {
    if (p === 'I') {
      // CDP, Lang I Hindi, [Lang II], Mathematics, Environmental Studies
      return [...PAPER_I_FIXED.slice(0, 2), lang, ...PAPER_I_FIXED.slice(2)].join(',')
    }
    // Paper II: CDP, Lang I Hindi, [Lang II], [stream]
    const streamSubjects = optional === 'ms'
      ? ['Mathematics', 'Science']    // stored as two separate subjects in Supabase
      : [optional ?? 'Social Studies']
    return [...PAPER_II_FIXED, lang, ...streamSubjects].join(',')
  }

  function handleStart() {
    if (mode === 'pyq') {
      const pyq = PYQ_PAPERS.find(p => p.id === selectedPyq)!
      if (!pyqLangII) { setPyqError('Please select your Language II before starting.'); return }
      if (pyq.paper === 'II' && !pyqStream) { setPyqError('Please select your Optional Subject before starting.'); return }
      setPyqError(null)
    }
    setLoading(true)
    if (mode === 'subject') {
      router.push(`/uptet/exam?subject=${encodeURIComponent(selectedSubject)}&limit=${questionCount}&mode=${practiceMode}`)
    } else if (mode === 'full') {
      const subjects = buildSubjects(paper, langII, p2Optional)
      // sort=subject groups questions by subject (fixes cross-year interleaving)
      router.push(`/uptet/exam?subjects=${encodeURIComponent(subjects)}&subject=Full+Mock+Paper+${paper}&limit=150&timer=150&ordered=true&sort=subject`)
    } else {
      const pyq = PYQ_PAPERS.find(p => p.id === selectedPyq)!
      const optional = pyq.paper === 'II' ? (pyqStream ?? undefined) : undefined
      const subjects = buildSubjects(pyq.paper, pyqLangII!, optional)
      const label = encodeURIComponent(`PYQ · ${pyq.label}${pyq.paper === 'II' ? ` · ${pyqStream === 'ms' ? 'Maths & Science' : 'Social Studies'}` : ''}`)
      // PYQ uses created_at order (preserves original paper sequence within a year)
      router.push(`/uptet/exam?subjects=${encodeURIComponent(subjects)}&subject=${label}&limit=150&timer=150&year=${pyq.year}&ordered=true`)
    }
  }

  const MODES: { id: Mode; label: string; sub: string }[] = [
    { id: 'subject', label: 'Topic Practice', sub: 'One subject at a time' },
    { id: 'full',    label: 'Full Mock Exam', sub: '150 Q · 150 min'       },
    { id: 'pyq',     label: 'PYQ Mock Test',  sub: 'Real past papers'      },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 flex flex-col">

      {/* Top bar */}
      <nav className="px-5 md:px-10 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image src="/Logos/logo-icon_light-Photoroom.png" alt="Prepify" width={34} height={34} style={{ width: 34, height: 34, flexShrink: 0 }} />
          <span className="text-slate-100 font-bold tracking-tight text-sm">Prepify</span>
          <span className="text-[10px] text-slate-600 font-mono uppercase tracking-wider hidden sm:block">/ UPTET</span>
        </div>
        <a href="/" className="text-slate-600 hover:text-slate-400 text-xs transition">← Home</a>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-center gap-10 px-4 md:px-10 py-10 max-w-5xl mx-auto w-full">

        {/* Left hero (desktop) */}
        <div className="hidden md:flex flex-col flex-1 pr-8">
          <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free · No Login Required
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-5">
            The UPTET prep<br />
            <span className="text-emerald-400">teachers trust.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm">
            Topic-wise practice, full 150-question mocks, and real past year papers — all with instant AI explanations.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {[
              ['Real PYQ Papers', '2013 – 2022'],
              ['AI Explanations', 'Every question'],
              ['Hindi + English', 'Bilingual'],
              ['No Repeat Qs', 'Smart tracking'],
            ].map(([title, sub]) => (
              <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <div className="text-sm font-semibold text-slate-200">{title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selection panel */}
        <div className="w-full md:w-[420px] shrink-0">

          {/* Mobile header */}
          <div className="md:hidden mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free · No Login
            </div>
            <h1 className="text-2xl font-bold tracking-tight">UPTET Practice Hub</h1>
            <p className="text-slate-500 text-sm mt-1">Topic practice, full mocks, past papers.</p>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 mb-5">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                  mode === m.id
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-5">

            {/* ── Topic Practice ── */}
            {mode === 'subject' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full bg-[#0d1422] border border-white/10 rounded-xl p-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/60 transition"
                  >
                    {Object.entries(SUBJECT_GROUPS).map(([group, subjects]) => (
                      <optgroup key={group} label={group}>
                        {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Questions</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 30, 50].map(n => (
                      <button key={n} onClick={() => setQuestionCount(n)}
                        className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                          questionCount === n
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                            : 'bg-transparent text-slate-400 border-white/10 hover:border-white/20'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Practice Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'learning', label: '📖 Learning', sub: 'See answer instantly' },
                      { value: 'exam',     label: '🎯 Exam',     sub: 'Submit & analyse'    },
                    ] as const).map(opt => (
                      <button key={opt.value} onClick={() => setPracticeMode(opt.value)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition text-left ${
                          practiceMode === opt.value
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                            : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                        }`}
                      >
                        <div>{opt.label}</div>
                        <div className="text-[10px] font-normal opacity-70 mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Full Mock Exam ── */}
            {mode === 'full' && (
              <>
                {/* Paper I / II */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Paper</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['I', 'II'] as const).map(p => (
                      <button key={p} onClick={() => setPaper(p)}
                        className={`py-3 rounded-xl border text-sm font-bold transition ${
                          paper === p
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                            : 'bg-transparent text-slate-400 border-white/10 hover:border-white/20'
                        }`}
                      >
                        Paper {p}
                        <span className="block text-[10px] font-normal opacity-70 mt-0.5">
                          {p === 'I' ? 'Class 1–5' : 'Class 6–8'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Syllabus preview */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 space-y-1.5">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                    {paper === 'I' ? 'Paper I Syllabus' : 'Paper II Syllabus'}
                  </p>
                  {(paper === 'I'
                    ? [
                        { sec: 'I',   sub: 'Child Development & Pedagogy', q: 30, fixed: true  },
                        { sec: 'II',  sub: 'Language I – Hindi (Mandatory)', q: 30, fixed: true  },
                        { sec: 'III', sub: 'Language II – your choice ↓',   q: 30, fixed: false },
                        { sec: 'IV',  sub: 'Mathematics',                   q: 30, fixed: true  },
                        { sec: 'V',   sub: 'Environmental Studies (EVS)',    q: 30, fixed: true  },
                      ]
                    : [
                        { sec: 'I',   sub: 'Child Development & Pedagogy', q: 30, fixed: true  },
                        { sec: 'II',  sub: 'Language I – Hindi (Mandatory)', q: 30, fixed: true  },
                        { sec: 'III', sub: 'Language II – your choice ↓',   q: 30, fixed: false },
                        { sec: 'IV',  sub: 'Optional Subject – your choice ↓', q: 60, fixed: false },
                      ]
                  ).map(row => (
                    <div key={row.sec} className={`flex items-center gap-2.5 text-xs ${row.fixed ? 'text-slate-400' : 'text-emerald-400'}`}>
                      <span className="font-mono text-[10px] text-slate-600 w-4 shrink-0">{row.sec}</span>
                      <span className="flex-1">{row.sub}</span>
                      <span className="font-mono text-[10px] text-slate-600 shrink-0">{row.q}Q</span>
                    </div>
                  ))}
                </div>

                {/* Language II choice — both papers */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    Section III · Language II <span className="text-emerald-500 normal-case font-normal">(Choose 1)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {LANG_II_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setLangII(opt.value)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                          langII === opt.value
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                            : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                        }`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                {/* Optional subject — Paper II only */}
                {paper === 'II' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Section IV · Optional Subject <span className="text-emerald-500 normal-case font-normal">(Choose 1 · 60 Q)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {P2_OPTIONAL.map(opt => (
                        <button key={opt.value} onClick={() => setP2Optional(opt.value)}
                          className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                            p2Optional === opt.value
                              ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                              : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                          }`}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-emerald-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  150 Questions · 150 Minutes · Auto-submits on timeout
                </div>
              </>
            )}

            {/* ── PYQ Mock Test ── */}
            {mode === 'pyq' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Select Paper</label>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {PYQ_PAPERS.map(p => {
                    const isP1 = p.paper === 'I'
                    const isSelected = selectedPyq === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPyq(p.id); setPyqLangII(null); setPyqStream(null); setPyqError(null) }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition flex items-center justify-between ${
                          isSelected
                            ? isP1
                              ? 'border-emerald-500/50 bg-emerald-500/8 text-slate-100'
                              : 'border-blue-500/50 bg-blue-500/8 text-slate-100'
                            : 'border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/15 hover:text-slate-300'
                        }`}
                      >
                        <span className="font-medium">{p.label}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                          isP1
                            ? isSelected
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border-emerald-900/60 text-emerald-700 bg-emerald-950/40'
                            : isSelected
                              ? 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                              : 'border-blue-900/60 text-blue-700 bg-blue-950/40'
                        }`}>P-{p.paper}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Language II <span className="text-emerald-500 normal-case font-normal">(Section III)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {LANG_II_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setPyqLangII(opt.value); setPyqError(null) }}
                          className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                            pyqLangII === opt.value
                              ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                              : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                          }`}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>

                  {PYQ_PAPERS.find(p => p.id === selectedPyq)?.paper === 'II' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                        Optional Subject <span className="text-emerald-500 normal-case font-normal">(Section IV · 60 Q)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {P2_OPTIONAL.map(opt => (
                          <button key={opt.value} onClick={() => { setPyqStream(opt.value as 'ms' | 'Social Studies'); setPyqError(null) }}
                            className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                              pyqStream === opt.value
                                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300'
                                : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                            }`}
                          >{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 mt-3">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-emerald-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  150 min timer · Questions from actual {PYQ_PAPERS.find(p => p.id === selectedPyq)?.year} paper
                </div>
              </div>
            )}

            {pyqError && mode === 'pyq' && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {pyqError}
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-sm tracking-wide shadow-lg shadow-emerald-500/20"
            >
              {loading
                ? 'Preparing...'
                : mode === 'subject'
                ? 'Start Practice'
                : mode === 'full'
                ? 'Start Full Mock Exam'
                : 'Start PYQ Mock Test'}
            </button>
          </div>

          {/* Ad slot */}
          <div className="mt-4 bg-white/[0.02] border border-dashed border-white/[0.06] rounded-xl h-20 flex items-center justify-center text-[10px] text-slate-700 uppercase tracking-widest">
            Advertisement
          </div>
        </div>
      </div>
    </div>
  )
}
