'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdBanner from '@/components/ads/AdUnit';

// ── Static subject sets ──────────────────────────────────────────────────────
// Paper I: CDP + Lang I + Lang II + Mathematics + EVS  (each 30 Q)
// Paper II: CDP + Lang I + Lang II + stream subject (Maths&Science / Social Studies)
const PAPER_I_CORE  = ['Child Development and Pedagogy']
const PAPER_II_CORE = ['Child Development and Pedagogy']
const PAPER_I_TAIL  = ['Mathematics', 'Environmental Studies']

const LANG_I_OPTIONS = [
  { label: 'English', value: 'Language I English' },
  { label: 'Hindi',   value: 'Language I Hindi'   },
]
const LANG_II_OPTIONS = [
  { label: 'English', value: 'Language II English' },
  { label: 'Hindi',   value: 'Language II Hindi'   },
]

// Paper II stream — 'ms' expands to Mathematics + Science (30+30 in Supabase)
const P2_OPTIONAL = [
  { label: 'Maths & Science (30+30)', value: 'ms'            },
  { label: 'Social Studies (60)',      value: 'Social Studies' },
]

// Subject groups for Topic Practice dropdown
const SUBJECT_GROUPS = {
  'Paper I & II': [
    { label: 'Child Development & Pedagogy', value: 'Child Development and Pedagogy' },
    { label: 'Language I – English',         value: 'Language I English'             },
    { label: 'Language I – Hindi',           value: 'Language I Hindi'               },
    { label: 'Language II – English',        value: 'Language II English'            },
    { label: 'Language II – Hindi',          value: 'Language II Hindi'              },
  ],
  'Paper I Only (Class 1–5)': [
    { label: 'Mathematics',           value: 'Mathematics'           },
    { label: 'Environmental Studies', value: 'Environmental Studies' },
  ],
  'Paper II Only (Class 6–8)': [
    { label: 'Mathematics',    value: 'Mathematics'    },
    { label: 'Science',        value: 'Science'        },
    { label: 'Social Studies', value: 'Social Studies' },
  ],
}

// PYQ papers — one entry per year+paper. Tag DB imports with these `year` values
// (and exam_type 'CTET') for these to populate.
const PYQ_PAPERS = [
  { id: '2024-p1', label: '2024 · Paper I',  year: '2024', paper: 'I'  as const },
  { id: '2024-p2', label: '2024 · Paper II', year: '2024', paper: 'II' as const },
  { id: '2023-p1', label: '2023 · Paper I',  year: '2023', paper: 'I'  as const },
  { id: '2023-p2', label: '2023 · Paper II', year: '2023', paper: 'II' as const },
  { id: '2022-p1', label: '2022 · Paper I',  year: '2022', paper: 'I'  as const },
  { id: '2022-p2', label: '2022 · Paper II', year: '2022', paper: 'II' as const },
  { id: '2021-p1', label: '2021 · Paper I',  year: '2021', paper: 'I'  as const },
  { id: '2021-p2', label: '2021 · Paper II', year: '2021', paper: 'II' as const },
]

type Mode = 'subject' | 'full' | 'pyq'

export default function CtetLandingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('subject')
  const [loading, setLoading] = useState(false)
  const [practiceMode, setPracticeMode] = useState<'learning' | 'exam'>('exam')

  // Topic Practice
  const [selectedSubject, setSelectedSubject] = useState('Child Development and Pedagogy')
  const [questionCount, setQuestionCount]     = useState(10)

  // Full Mock — nothing pre-selected; user must choose
  const [paper, setPaper]           = useState<'I' | 'II'>('I')
  const [langI, setLangI]           = useState<string | null>(null)
  const [langII, setLangII]         = useState<string | null>(null)
  const [p2Optional, setP2Optional] = useState<string | null>(null)
  const [fullError, setFullError]   = useState<string | null>(null)

  // PYQ
  const [selectedPyq, setSelectedPyq] = useState(PYQ_PAPERS[0].id)
  const [pyqLangI, setPyqLangI]       = useState<string | null>(null)
  const [pyqLangII, setPyqLangII]     = useState<string | null>(null)
  const [pyqStream, setPyqStream]     = useState<'ms' | 'Social Studies' | null>(null)
  const [pyqError, setPyqError]       = useState<string | null>(null)

  const [dark, setDark] = useState(false)

  // 'ms' sentinel expands to Mathematics + Science (stored separately in Supabase)
  function buildSubjects(p: 'I' | 'II', li: string, lii: string, optional?: string): string {
    if (p === 'I') {
      return [...PAPER_I_CORE, li, lii, ...PAPER_I_TAIL].join(',')
    }
    const streamSubjects = optional === 'ms' ? ['Mathematics', 'Science'] : [optional ?? 'Social Studies']
    return [...PAPER_II_CORE, li, lii, ...streamSubjects].join(',')
  }

  function handleStart() {
    if (mode === 'pyq') {
      const pyq = PYQ_PAPERS.find(p => p.id === selectedPyq)!
      if (!pyqLangI || !pyqLangII) { setPyqError('Please select both Language I and Language II before starting.'); return }
      if (pyq.paper === 'II' && !pyqStream) { setPyqError('Please select your Optional Subject before starting.'); return }
      setPyqError(null)
    }
    setLoading(true)
    if (mode === 'subject') {
      router.push(`/ctet/exam?subject=${encodeURIComponent(selectedSubject)}&limit=${questionCount}&mode=${practiceMode}`)
    } else if (mode === 'full') {
      if (!langI || !langII) { setLoading(false); setFullError('Please select both Language I and Language II before starting.'); return }
      if (paper === 'II' && !p2Optional) { setLoading(false); setFullError('Please select your Optional Subject before starting.'); return }
      setFullError(null)
      const subjects = buildSubjects(paper, langI, langII, p2Optional ?? undefined)
      router.push(`/ctet/exam?subjects=${encodeURIComponent(subjects)}&subject=Full+Mock+Paper+${paper}&limit=150&timer=150&ordered=true&sort=subject`)
    } else {
      const pyq = PYQ_PAPERS.find(p => p.id === selectedPyq)!
      const optional = pyq.paper === 'II' ? (pyqStream ?? undefined) : undefined
      const subjects = buildSubjects(pyq.paper, pyqLangI!, pyqLangII!, optional)
      const label = encodeURIComponent(`PYQ · ${pyq.label}${pyq.paper === 'II' ? ` · ${pyqStream === 'ms' ? 'Maths & Science' : 'Social Studies'}` : ''}`)
      router.push(`/ctet/exam?subjects=${encodeURIComponent(subjects)}&subject=${label}&limit=150&timer=150&year=${pyq.year}&ordered=true`)
    }
  }

  const MODES: { id: Mode; label: string }[] = [
    { id: 'subject', label: 'Topic Practice' },
    { id: 'full',    label: 'Full Mock'      },
    { id: 'pyq',     label: 'PYQ Papers'    },
  ]

  // Theme helpers
  const bg   = dark ? 'bg-[#0a0d14]'    : 'bg-[#e8e4dc]'
  const card = dark ? 'bg-[#13181f]'    : 'bg-[#faf8f4]'
  const bdr  = dark ? 'border-white/10' : 'border-black/12'
  const txt  = dark ? 'text-white'      : 'text-[#0f0f0f]'
  const muted= dark ? 'text-white/60'   : 'text-black/55'
  const sub  = dark ? 'text-white/78'   : 'text-black/70'
  const inp  = dark ? 'bg-[#1a2030] border-white/14 text-white' : 'bg-[#f0efe9] border-black/12 text-[#0f0f0f]'

  const tabBar    = dark ? 'bg-white/5 border border-white/10' : 'bg-black/7 border border-black/8'
  const tabActive = dark ? 'bg-white text-[#0f0f0f] shadow-sm' : 'bg-[#0f0f0f] text-white shadow-sm'
  const tabInact  = dark ? 'text-white/55 hover:text-white/80' : 'text-black/50 hover:text-black/75'

  const optActive = dark ? 'bg-white/90 border-white/70 text-[#0f0f0f]' : 'bg-[#0f0f0f] border-[#0f0f0f] text-white'
  const optInact  = dark ? 'border-white/15 text-white/65 hover:border-white/35 hover:text-white/90' : 'border-black/14 text-black/58 hover:border-black/28 hover:text-black/80'

  const logoSrc = dark ? '/Logos/logo-icon_dark-Photoroom.png' : '/Logos/logo-icon_light-Photoroom.png'

  return (
    <div className={`min-h-screen w-full ${bg} ${txt} flex flex-col overflow-x-hidden transition-colors duration-300`} style={{ fontFamily: 'var(--font-space), var(--font-geist-sans), sans-serif' }}>

      {/* ── Navbar ── */}
      <nav className={`px-5 md:px-10 py-3.5 flex items-center justify-between border-b ${bdr} transition-colors`}>
        <div className="flex items-center gap-2.5">
          <Image src={logoSrc} alt="Prepify" width={80} height={30} style={{ height: 30, width: 'auto', flexShrink: 0 }} />
          <span className={`font-bold tracking-tight text-sm ${txt}`}>Prepify</span>
          <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:block ${muted}`}>/ CTET</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(d => !d)}
            aria-label="Toggle colour mode"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all select-none ${
              dark ? 'bg-white/8 border-white/12 text-white/55 hover:bg-white/14' : 'bg-black/5 border-black/10 text-black/45 hover:bg-black/9'
            }`}
          >
            {dark ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
          </button>
          <a href="/" className={`text-xs transition-opacity opacity-50 hover:opacity-80 ${txt}`}>← Home</a>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-center gap-10 px-4 md:px-10 py-10 max-w-5xl mx-auto w-full">

        {/* Left hero — desktop only */}
        <div className="hidden md:flex flex-col flex-1 pr-8">
          <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase mb-6 px-3 py-1.5 rounded-full w-fit border ${
            dark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-black/5 border-black/8 text-black/40'
          }`}>
            Free · No Login Required
          </div>

          <h1 className={`text-5xl font-bold tracking-tight leading-[1.08] mb-5 ${txt}`}>
            CTET prep that<br />
            actually works.
          </h1>

          <p className={`text-base leading-relaxed mb-7 max-w-sm ${sub}`}>
            Topic-wise practice, full 150-question mocks, and real past year papers — with instant AI explanations.
          </p>

          <div className="flex gap-3 mb-7">
            <div className={`flex-1 rounded-2xl border px-4 py-3.5 ${dark ? 'bg-amber-950/20 border-amber-800/30' : 'bg-amber-100/70 border-amber-300/60'}`}>
              <div className={`text-xs font-semibold mb-0.5 ${dark ? 'text-amber-400' : 'text-amber-700'}`}>Paper I</div>
              <div className={`text-sm font-medium ${dark ? 'text-amber-200' : 'text-amber-900'}`}>Class 1–5</div>
              <div className={`text-[11px] mt-0.5 ${dark ? 'text-amber-600' : 'text-amber-600'}`}>CDP · Maths · EVS · Lang</div>
            </div>
            <div className={`flex-1 rounded-2xl border px-4 py-3.5 ${dark ? 'bg-red-950/20 border-red-800/30' : 'bg-red-100/70 border-red-300/60'}`}>
              <div className={`text-xs font-semibold mb-0.5 ${dark ? 'text-red-400' : 'text-red-600'}`}>Paper II</div>
              <div className={`text-sm font-medium ${dark ? 'text-red-200' : 'text-red-800'}`}>Class 6–8</div>
              <div className={`text-[11px] mt-0.5 ${dark ? 'text-red-600' : 'text-red-500'}`}>CDP · Science / Soc. St.</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-w-xs mb-8">
            {[
              ['Real PYQ Papers', 'Year-wise'],
              ['AI Explanations', 'Every question'],
              ['Hindi + English', 'Bilingual'],
              ['No Repeat Qs', 'Smart tracking'],
            ].map(([title, hint]) => (
              <div key={title} className={`rounded-xl border px-3 py-2.5 ${dark ? `bg-white/3 ${bdr}` : `bg-black/3 ${bdr}`}`}>
                <div className={`text-xs font-semibold ${txt}`}>{title}</div>
                <div className={`text-[10px] mt-0.5 ${muted}`}>{hint}</div>
              </div>
            ))}
          </div>

          <a href="/uptet" className={`inline-flex items-center gap-1.5 text-sm font-medium transition-opacity opacity-75 hover:opacity-100 ${txt}`}>
            Also try UPTET practice
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>

        {/* Right: Selection panel */}
        <div className="w-full md:w-[420px] shrink-0">

          {/* Mobile header */}
          <div className="md:hidden mb-5 text-center">
            <h1 className={`text-2xl font-bold tracking-tight ${txt}`}>CTET Practice Hub</h1>
            <p className={`text-sm mt-1 ${sub}`}>Topic practice, full mocks, past papers.</p>
            <a href="/uptet" className={`inline-flex items-center gap-1 text-xs mt-2.5 font-medium transition-opacity opacity-70 hover:opacity-95 ${txt}`}>
              Also try UPTET
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>

          {/* Mode tabs */}
          <div className={`flex rounded-xl ${tabBar} p-1 mb-4`}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center ${mode === m.id ? tabActive : tabInact}`}
              >{m.label}</button>
            ))}
          </div>

          {/* Panel card */}
          <div className={`${card} border ${bdr} rounded-2xl p-5 space-y-5`}>

            {/* ── Topic Practice ── */}
            {mode === 'subject' && (
              <>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Subject</label>
                  <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                    className={`w-full ${inp} border rounded-xl p-3 text-sm focus:outline-none transition`}>
                    {Object.entries(SUBJECT_GROUPS).map(([group, subjects]) => (
                      <optgroup key={group} label={group}>
                        {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Questions</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 30, 50].map(n => (
                      <button key={n} onClick={() => setQuestionCount(n)}
                        className={`py-2.5 rounded-xl text-sm font-bold border transition ${questionCount === n ? optActive : optInact}`}
                      >{n}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Practice Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'learning', label: 'Learning', hint: 'See answer instantly' },
                      { value: 'exam',     label: 'Exam',     hint: 'Submit & analyse'    },
                    ] as const).map(opt => (
                      <button key={opt.value} onClick={() => setPracticeMode(opt.value)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition text-left ${practiceMode === opt.value ? optActive : optInact}`}>
                        <div>{opt.label}</div>
                        <div className="text-[10px] font-normal opacity-60 mt-0.5">{opt.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Full Mock Exam ── */}
            {mode === 'full' && (
              <>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Paper</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setPaper('I'); setFullError(null) }}
                      className={`py-3 rounded-xl border text-sm font-bold transition ${
                        paper === 'I' ? (dark ? 'bg-amber-950/50 border-amber-600/50 text-amber-300' : 'bg-amber-100 border-amber-400/70 text-amber-800') : optInact
                      }`}>
                      Paper I<span className="block text-[10px] font-normal opacity-60 mt-0.5">Class 1–5</span>
                    </button>
                    <button onClick={() => { setPaper('II'); setFullError(null) }}
                      className={`py-3 rounded-xl border text-sm font-bold transition ${
                        paper === 'II' ? (dark ? 'bg-red-950/50 border-red-600/50 text-red-300' : 'bg-red-100 border-red-400/70 text-red-800') : optInact
                      }`}>
                      Paper II<span className="block text-[10px] font-normal opacity-60 mt-0.5">Class 6–8</span>
                    </button>
                  </div>
                </div>

                {/* Syllabus breakdown */}
                <div className={`border ${bdr} rounded-xl p-3 space-y-1.5 ${dark ? 'bg-white/2' : 'bg-black/2'}`}>
                  <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${muted}`}>
                    {paper === 'I' ? 'Paper I Syllabus' : 'Paper II Syllabus'}
                  </p>
                  {(paper === 'I'
                    ? [
                        { sec: 'I',   label: 'Child Development & Pedagogy', q: 30, choose: false },
                        { sec: 'II',  label: 'Language I – your choice ↓',   q: 30, choose: true  },
                        { sec: 'III', label: 'Language II – your choice ↓',  q: 30, choose: true  },
                        { sec: 'IV',  label: 'Mathematics',                  q: 30, choose: false },
                        { sec: 'V',   label: 'Environmental Studies',        q: 30, choose: false },
                      ]
                    : [
                        { sec: 'I',   label: 'Child Development & Pedagogy',    q: 30, choose: false },
                        { sec: 'II',  label: 'Language I – your choice ↓',      q: 30, choose: true  },
                        { sec: 'III', label: 'Language II – your choice ↓',     q: 30, choose: true  },
                        { sec: 'IV',  label: 'Optional Subject – your choice ↓', q: 60, choose: true  },
                      ]
                  ).map(row => (
                    <div key={row.sec} className="flex items-center gap-2 text-xs">
                      <span className={`font-mono text-[10px] w-4 shrink-0 ${muted}`}>{row.sec}</span>
                      <span className={`flex-1 ${row.choose ? (dark ? 'text-amber-400' : 'text-amber-600') : sub}`}>{row.label}</span>
                      <span className={`font-mono text-[10px] shrink-0 ${muted}`}>{row.q}Q</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Section II · Language I</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANG_I_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { setLangI(opt.value); setFullError(null) }}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition ${langI === opt.value ? optActive : optInact}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Section III · Language II</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANG_II_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { setLangII(opt.value); setFullError(null) }}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition ${langII === opt.value ? optActive : optInact}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>

                {paper === 'II' && (
                  <div>
                    <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>
                      Section IV · Optional Subject <span className="normal-case font-normal">(60 Q)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {P2_OPTIONAL.map(opt => (
                        <button key={opt.value} onClick={() => { setP2Optional(opt.value); setFullError(null) }}
                          className={`py-2.5 rounded-xl border text-xs font-semibold transition ${p2Optional === opt.value ? optActive : optInact}`}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`flex items-center gap-2 text-xs border ${bdr} rounded-xl px-3 py-2.5 ${sub}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-60"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  150 Questions · 150 Minutes · Auto-submits on timeout
                </div>
              </>
            )}

            {/* ── PYQ Mock Test ── */}
            {mode === 'pyq' && (
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-3 ${muted}`}>Select Paper</label>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                  {PYQ_PAPERS.map(p => {
                    const isP1 = p.paper === 'I'
                    const isSelected = selectedPyq === p.id
                    return (
                      <button key={p.id}
                        onClick={() => { setSelectedPyq(p.id); setPyqLangI(null); setPyqLangII(null); setPyqStream(null); setPyqError(null) }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition flex items-center justify-between ${
                          isSelected
                            ? dark ? 'border-white/30 bg-white/7 text-white' : 'border-black/25 bg-black/5 text-[#0f0f0f]'
                            : dark ? 'border-white/14 bg-white/3 text-white/72 hover:border-white/28 hover:text-white/95' : 'border-black/12 bg-transparent text-black/62 hover:border-black/22 hover:text-black/85'
                        }`}>
                        <span className="font-medium">{p.label}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                          isP1
                            ? dark ? 'border-amber-700/50 text-amber-500 bg-amber-950/40' : 'border-amber-300 text-amber-700 bg-amber-50'
                            : dark ? 'border-red-700/50 text-red-500 bg-red-950/40'       : 'border-red-300 text-red-600 bg-red-50'
                        }`}>P-{p.paper}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Language I <span className="normal-case font-normal">(Section II)</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {LANG_I_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setPyqLangI(opt.value); setPyqError(null) }}
                          className={`py-2.5 rounded-xl border text-xs font-semibold transition ${pyqLangI === opt.value ? optActive : optInact}`}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Language II <span className="normal-case font-normal">(Section III)</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      {LANG_II_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setPyqLangII(opt.value); setPyqError(null) }}
                          className={`py-2.5 rounded-xl border text-xs font-semibold transition ${pyqLangII === opt.value ? optActive : optInact}`}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>

                  {PYQ_PAPERS.find(p => p.id === selectedPyq)?.paper === 'II' && (
                    <div>
                      <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${muted}`}>Optional Subject <span className="normal-case font-normal">(Section IV · 60 Q)</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {P2_OPTIONAL.map(opt => (
                          <button key={opt.value} onClick={() => { setPyqStream(opt.value as 'ms' | 'Social Studies'); setPyqError(null) }}
                            className={`py-2.5 rounded-xl border text-xs font-semibold transition ${pyqStream === opt.value ? optActive : optInact}`}
                          >{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 text-xs border ${bdr} rounded-xl px-3 py-2.5 mt-3 ${sub}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-60"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  150 min timer · Questions from actual {PYQ_PAPERS.find(p => p.id === selectedPyq)?.year} paper
                </div>
              </div>
            )}

            {/* Error */}
            {((pyqError && mode === 'pyq') || (fullError && mode === 'full')) && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {mode === 'pyq' ? pyqError : fullError}
              </div>
            )}

            {/* Start button */}
            <button onClick={handleStart} disabled={loading}
              className={`w-full font-bold py-3.5 rounded-xl transition-all disabled:opacity-40 text-sm tracking-wide ${
                dark ? 'bg-white text-[#0f0f0f] hover:bg-white/90' : 'bg-[#0f0f0f] text-white hover:bg-[#1c1c1c]'
              }`}>
              {loading ? 'Preparing...' : mode === 'subject' ? 'Start Practice' : mode === 'full' ? `Start Full Mock — Paper ${paper}` : 'Start PYQ Mock Test'}
            </button>
          </div>

          {/* Ad slot */}
          <div className="mt-4"><AdBanner /></div>
        </div>
      </div>
    </div>
  )
}
