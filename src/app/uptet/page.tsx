'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ── Data ──
const PAPER_I_SUBJECTS = [
  'Child Development and Pedagogy',
  'Language I Hindi',
  'Language II English',
  'Mathematics',
  'Environmental Studies',
]
const PAPER_II_BASE = [
  'Child Development and Pedagogy',
  'Language I Hindi',
  'Language II English',
]
const OPTIONAL_SUBJECTS = ['Maths and Science', 'Science', 'Social Studies']
const OPTIONAL_LANGUAGES = ['Language Hindi', 'Language English', 'Language Sanskrit', 'Language Urdu']

const SUBJECT_GROUPS = {
  'Paper I & II': [
    { label: 'Child Development & Pedagogy', value: 'Child Development and Pedagogy' },
    { label: 'Language I – Hindi', value: 'Language I Hindi' },
    { label: 'Language II – English', value: 'Language II English' },
    { label: 'Language II – Urdu', value: 'Language II Urdu' },
    { label: 'Language II – Sanskrit', value: 'Language II Sanskrit' },
  ],
  'Paper I Only (Class 1–5)': [
    { label: 'Mathematics', value: 'Mathematics' },
    { label: 'Environmental Studies', value: 'Environmental Studies' },
  ],
  'Paper II Only (Class 6–8)': [
    { label: 'Mathematics', value: 'Mathematics' },
    { label: 'Science', value: 'Science' },
    { label: 'Social Studies', value: 'Social Studies' },
    { label: 'Language – Hindi', value: 'Language Hindi' },
    { label: 'Language – English', value: 'Language English' },
    { label: 'Language – Sanskrit', value: 'Language Sanskrit' },
    { label: 'Language – Urdu', value: 'Language Urdu' },
  ],
}

// Actual PYQ papers matching uploaded PDFs
const PYQ_PAPERS = [
  { id: '2022-jan-p1',    label: 'Jan 2022 · Paper I',                    year: '2022', paper: 'I',  subjects: PAPER_I_SUBJECTS.join(',') },
  { id: '2022-jan-p2-ms', label: 'Jan 2022 · Paper II · Maths & Science', year: '2022', paper: 'II', subjects: [...PAPER_II_BASE, 'Maths and Science', 'Science'].join(',') },
  { id: '2022-jan-p2-ss', label: 'Jan 2022 · Paper II · Social Science',  year: '2022', paper: 'II', subjects: [...PAPER_II_BASE, 'Social Studies'].join(',') },
  { id: '2019-p1',        label: '2019 · Paper I',                        year: '2019', paper: 'I',  subjects: PAPER_I_SUBJECTS.join(',') },
  { id: '2019-p2-ms',     label: '2019 · Paper II · Maths & Science',     year: '2019', paper: 'II', subjects: [...PAPER_II_BASE, 'Maths and Science', 'Science'].join(',') },
  { id: '2019-p2-ss',     label: '2019 · Paper II · Social Science',      year: '2019', paper: 'II', subjects: [...PAPER_II_BASE, 'Social Studies'].join(',') },
  { id: '2018-nov-p1',    label: 'Nov 2018 · Paper I',                    year: '2018', paper: 'I',  subjects: PAPER_I_SUBJECTS.join(',') },
  { id: '2018-p2-ms',     label: '2018 · Paper II · Maths & Science',     year: '2018', paper: 'II', subjects: [...PAPER_II_BASE, 'Maths and Science', 'Science'].join(',') },
  { id: '2017-oct-p1',    label: 'Oct 2017 · Paper I',                    year: '2017', paper: 'I',  subjects: PAPER_I_SUBJECTS.join(',') },
  { id: '2017-oct-p2-ms', label: 'Oct 2017 · Paper II · Maths & Science', year: '2017', paper: 'II', subjects: [...PAPER_II_BASE, 'Maths and Science', 'Science'].join(',') },
  { id: '2017-oct-p2-ss', label: 'Oct 2017 · Paper II · Social Science',  year: '2017', paper: 'II', subjects: [...PAPER_II_BASE, 'Social Studies'].join(',') },
  { id: '2016-p1',        label: '2016 · Paper I',                        year: '2016', paper: 'I',  subjects: PAPER_I_SUBJECTS.join(',') },
  { id: '2016-p2-ms',     label: '2016 · Paper II · Maths & Science',     year: '2016', paper: 'II', subjects: [...PAPER_II_BASE, 'Maths and Science', 'Science'].join(',') },
  { id: '2016-ss',        label: '2016 · Social Science',                 year: '2016', paper: 'II', subjects: [...PAPER_II_BASE, 'Social Studies'].join(',') },
  { id: '2013-p1',        label: '2013 · Paper I',                        year: '2013', paper: 'I',  subjects: PAPER_I_SUBJECTS.join(',') },
  { id: '2013-p2',        label: '2013 · Paper II',                       year: '2013', paper: 'II', subjects: [...PAPER_II_BASE, 'Maths and Science', 'Science'].join(',') },
]

type Mode = 'subject' | 'full' | 'pyq'

export default function UptetLandingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('subject')

  // Subject practice
  const [selectedSubject, setSelectedSubject] = useState('Child Development and Pedagogy')
  const [questionCount, setQuestionCount] = useState(10)

  // Full exam
  const [paper, setPaper] = useState<'I' | 'II'>('I')
  const [optionalType, setOptionalType] = useState<'subject' | 'language'>('subject')
  const [optionalSubject, setOptionalSubject] = useState(OPTIONAL_SUBJECTS[0])
  const [optionalLanguage, setOptionalLanguage] = useState(OPTIONAL_LANGUAGES[0])

  // PYQ
  const [selectedPyq, setSelectedPyq] = useState(PYQ_PAPERS[0].id)

  const [loading, setLoading] = useState(false)

  function handleStart() {
    setLoading(true)
    if (mode === 'subject') {
      router.push(`/uptet/exam?subject=${encodeURIComponent(selectedSubject)}&limit=${questionCount}`)
    } else if (mode === 'full') {
      const base = paper === 'I' ? PAPER_I_SUBJECTS : PAPER_II_BASE
      const subjects = paper === 'II'
        ? [...base, optionalType === 'language' ? optionalLanguage : optionalSubject].join(',')
        : base.join(',')
      router.push(`/uptet/exam?subjects=${encodeURIComponent(subjects)}&subject=Full+Mock+Paper+${paper}&limit=150&timer=150&ordered=true`)
    } else {
      const pyq = PYQ_PAPERS.find(p => p.id === selectedPyq)!
      const label = encodeURIComponent(`PYQ · ${pyq.label}`)
      router.push(`/uptet/exam?subjects=${encodeURIComponent(pyq.subjects)}&subject=${label}&limit=150&timer=150&year=${pyq.year}&ordered=true`)
    }
  }

  const MODES: { id: Mode; label: string; sub: string }[] = [
    { id: 'subject', label: 'Topic Practice',   sub: 'One subject at a time' },
    { id: 'full',    label: 'Full Mock Exam',   sub: '150 Q · 150 min' },
    { id: 'pyq',     label: 'PYQ Mock Test',    sub: 'Real past papers' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 flex flex-col">

      {/* ── Top bar ── */}
      <nav className="px-5 md:px-10 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold tracking-widest text-sm">PREPIFY</span>
          <span className="text-[10px] text-slate-600 font-mono uppercase tracking-wider hidden sm:block">/ UPTET</span>
        </div>
        <a href="/" className="text-slate-600 hover:text-slate-400 text-xs transition">← Home</a>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-center gap-10 px-4 md:px-10 py-10 max-w-5xl mx-auto w-full">

        {/* ── Left: Hero (desktop only) ── */}
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

        {/* ── Right: Selection panel ── */}
        <div className="w-full md:w-[400px] shrink-0">

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

          {/* Panel body */}
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
              </>
            )}

            {/* ── Full Mock Exam ── */}
            {mode === 'full' && (
              <>
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

                {paper === 'II' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Optional Section (60 Q)</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {(['subject', 'language'] as const).map(t => (
                        <button key={t} onClick={() => setOptionalType(t)}
                          className={`py-2 rounded-xl border text-xs font-semibold transition capitalize ${
                            optionalType === t
                              ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                              : 'border-white/10 text-slate-500 hover:border-white/20'
                          }`}
                        >{t === 'subject' ? 'Maths / Science / SS' : 'Language'}</button>
                      ))}
                    </div>
                    {optionalType === 'subject' ? (
                      <div className="grid grid-cols-3 gap-1.5">
                        {OPTIONAL_SUBJECTS.map(s => (
                          <button key={s} onClick={() => setOptionalSubject(s)}
                            className={`py-2 rounded-xl border text-[11px] font-semibold transition ${
                              optionalSubject === s
                                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                                : 'border-white/10 text-slate-500 hover:border-white/20'
                            }`}
                          >{s.replace('Maths and Science', 'Maths & Sci')}</button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {OPTIONAL_LANGUAGES.map(l => (
                          <button key={l} onClick={() => setOptionalLanguage(l)}
                            className={`py-2 rounded-xl border text-[11px] font-semibold transition ${
                              optionalLanguage === l
                                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                                : 'border-white/10 text-slate-500 hover:border-white/20'
                            }`}
                          >{l.replace('Language ', '')}</button>
                        ))}
                      </div>
                    )}
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
                  {PYQ_PAPERS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPyq(p.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition flex items-center justify-between ${
                        selectedPyq === p.id
                          ? 'border-emerald-500/50 bg-emerald-500/8 text-slate-100'
                          : 'border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/15 hover:text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                        selectedPyq === p.id
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-white/10 text-slate-600'
                      }`}>P-{p.paper}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 mt-3">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-emerald-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  150 min timer · Questions from actual {PYQ_PAPERS.find(p => p.id === selectedPyq)?.year} paper
                </div>
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
