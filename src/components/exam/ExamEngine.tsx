'use client'
import { useEffect, useState, useCallback } from 'react'
import AdBanner from '@/components/ads/AdUnit'
import { useRouter } from 'next/navigation'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

function renderText(text: string) {
  if (!text) return null
  const sanitized = text.replace(/–/g, '-').replace(/—/g, '-').replace(/−/g, '-')
  const parts = sanitized.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g)
  return parts.map((part, i) => {
    if (part.startsWith('$$')) return <BlockMath key={i} math={part.slice(2, -2)} />
    if (part.startsWith('$')) return <InlineMath key={i} math={part.slice(1, -1)} />
    return <span key={i}>{part}</span>
  })
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const PART_LABELS: Record<string, { en: string; hi: string }> = {
  'Child Development and Pedagogy': { en: 'Child Dev. & Pedagogy',  hi: 'बाल विकास एवं शिक्षाशास्त्र' },
  'Language I Hindi':               { en: 'Language I – Hindi',     hi: 'भाषा I – हिन्दी'              },
  'Language I English':             { en: 'Language I – English',   hi: 'भाषा I – अंग्रेज़ी'           },
  'Language II English':            { en: 'Language II – English',  hi: 'भाषा II – अंग्रेज़ी'          },
  'Language II Hindi':              { en: 'Language II – Hindi',    hi: 'भाषा II – हिन्दी'             },
  'Language II Urdu':               { en: 'Language II – Urdu',     hi: 'भाषा II – उर्दू'              },
  'Language II Sanskrit':           { en: 'Language II – Sanskrit', hi: 'भाषा II – संस्कृत'            },
  'Mathematics':                    { en: 'Mathematics',            hi: 'गणित'                         },
  'Environmental Studies':          { en: 'Env. Studies (EVS)',     hi: 'पर्यावरण अध्ययन'              },
  'Science':                        { en: 'Science',                hi: 'विज्ञान'                      },
  'Social Studies':                 { en: 'Social Studies',         hi: 'सामाजिक अध्ययन'               },
  'Language Hindi':                 { en: 'Language – Hindi',       hi: 'भाषा – हिन्दी'                },
  'Language English':               { en: 'Language – English',     hi: 'भाषा – अंग्रेज़ी'             },
  'Language Sanskrit':              { en: 'Language – Sanskrit',    hi: 'भाषा – संस्कृत'               },
  'Language Urdu':                  { en: 'Language – Urdu',        hi: 'भाषा – उर्दू'                 },
}

interface Section { subject: string; startIdx: number; endIdx: number; label: { en: string; hi: string } }

function buildSections(questions: any[]): Section[] {
  const sections: Section[] = []
  let i = 0
  while (i < questions.length) {
    const subj = questions[i].subject || 'General'
    const start = i
    while (i < questions.length && questions[i].subject === subj) i++
    sections.push({ subject: subj, startIdx: start, endIdx: i - 1, label: PART_LABELS[subj] || { en: subj, hi: subj } })
  }
  return sections
}

function seenKey(examType: string, subject: string) {
  return `seen_${examType}_${subject}`.replace(/\s+/g, '_')
}
function getSeenIds(key: string): Set<string> {
  try { const raw = localStorage.getItem(key); return new Set(raw ? JSON.parse(raw) : []) } catch { return new Set() }
}
function saveSeenIds(key: string, ids: string[]) {
  try { const e = getSeenIds(key); ids.forEach(id => e.add(id)); localStorage.setItem(key, JSON.stringify([...e])) } catch {}
}

// ── Theme tokens ──────────────────────────────────────────────────────────────
// Professional light mode is the default; a persisted toggle switches to dark.
// Colours are chosen for contrast (body text ≥ 4.5:1) with a single indigo accent
// reserved for selection / primary actions / focus — never decoration.
function tokens(dark: boolean) {
  return {
    app:         dark ? 'bg-[#0b0f14] text-[#e7ebef]'   : 'bg-[#f5f6f8] text-[#101828]',
    surfaceBg:   dark ? 'bg-[#0b0f14]'                  : 'bg-[#f5f6f8]',
    loadingText: dark ? 'text-white/40'                 : 'text-[#667085]',

    header:      dark ? 'bg-[#0b0f14]/95 border-white/8'        : 'bg-white/85 border-[#e6e8ec]',
    backBtn:     dark ? 'text-white/45 hover:text-white/85'     : 'text-[#667085] hover:text-[#101828]',
    divider:     dark ? 'text-white/20'                         : 'text-[#d0d5dd]',
    subject:     dark ? 'text-white/55'                         : 'text-[#475467]',

    progTrack:   dark ? 'bg-white/8'   : 'bg-[#e7eaef]',
    progCurrent: dark ? 'bg-indigo-400' : 'bg-indigo-600',
    progDone:    dark ? 'bg-indigo-400/45' : 'bg-indigo-300',
    counter:     dark ? 'text-white/35' : 'text-[#98a2b3]',

    timer:       dark ? 'text-white/65' : 'text-[#475467]',
    timerLow:    dark ? 'text-red-400'  : 'text-red-600',

    langActive:  dark ? 'text-indigo-300 border-indigo-400/50 ring-1 ring-indigo-400/40'
                      : 'text-indigo-700 border-indigo-400 ring-1 ring-indigo-200',
    langIdle:    dark ? 'text-white/50 hover:text-white/85 border-white/10 hover:border-white/20'
                      : 'text-[#475467] hover:text-[#101828] border-[#dfe3e8] hover:border-[#c3c8d0]',
    hintBubble:  dark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white',

    iconBtn:     dark ? 'text-white/50 hover:text-white/85 border-white/10 hover:border-white/20'
                      : 'text-[#667085] hover:text-[#101828] border-[#dfe3e8] hover:border-[#c3c8d0]',

    submitGhost: dark ? 'border-red-500/30 text-red-400/85 hover:border-red-500/55 hover:text-red-400'
                      : 'border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50',
    primary:     dark ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary:   dark ? 'border border-white/10 text-white/65 hover:border-white/22 hover:text-white/85'
                      : 'border border-[#dfe3e8] text-[#475467] hover:border-[#c3c8d0] hover:bg-white',

    tabsBorder:  dark ? 'border-white/8' : 'border-[#e6e8ec]',
    tabActive:   dark ? 'border-indigo-400 text-white/90' : 'border-indigo-600 text-[#101828]',
    tabIdle:     dark ? 'border-transparent text-white/35 hover:text-white/60' : 'border-transparent text-[#98a2b3] hover:text-[#475467]',
    partLabel:   dark ? 'text-white/25' : 'text-[#98a2b3]',
    doneOk:      dark ? 'text-emerald-400' : 'text-emerald-600',
    doneIdle:    dark ? 'text-white/25' : 'text-[#98a2b3]',

    qNum:        dark ? 'text-white/35' : 'text-[#98a2b3]',
    year:        dark ? 'text-white/25' : 'text-[#b0b7c3]',
    reportLink:  dark ? 'text-white/35 hover:text-amber-400' : 'text-[#98a2b3] hover:text-amber-600',
    qText:       dark ? 'text-white/90' : 'text-[#101828]',

    explBorder:  dark ? 'border-emerald-500/60' : 'border-emerald-500',
    explLabel:   dark ? 'text-emerald-400/85' : 'text-emerald-600',
    explText:    dark ? 'text-white/60' : 'text-[#475467]',

    resultBox:   dark ? 'border border-white/8 bg-white/[0.03]' : 'border border-[#e6e8ec] bg-white',
    resultLabel: dark ? 'text-white/30' : 'text-[#98a2b3]',
    resultScore: dark ? 'text-white/90' : 'text-[#101828]',
    resultScoreSub: dark ? 'text-white/25' : 'text-[#b0b7c3]',
    resultPct:   dark ? 'text-white/45' : 'text-[#667085]',

    aside:       dark ? 'border-white/8' : 'border-[#e6e8ec]',
    asidePanel:  dark ? 'bg-[#0b0f14]' : 'bg-white',
    legendText:  dark ? 'text-white/40' : 'text-[#667085]',
    legendAnsw:  dark ? 'bg-indigo-400' : 'bg-indigo-500',
    legendSkip:  dark ? 'bg-white/12' : 'bg-[#e4e7ec]',
    gridCurrent: dark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white',
    gridAnswered:dark ? 'bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100',
    gridSkipped: dark ? 'bg-white/[0.04] text-white/30 border border-white/8 hover:border-white/18 hover:text-white/55'
                      : 'bg-white text-[#98a2b3] border border-[#e4e7ec] hover:border-[#c3c8d0] hover:text-[#475467]',
    statLabel:   dark ? 'text-white/40' : 'text-[#667085]',
    statValue:   dark ? 'text-white/80' : 'text-[#101828]',

    mobileNav:   dark ? 'bg-[#0b0f14]/97 border-white/8' : 'bg-white/95 border-[#e6e8ec]',

    modalOverlay:dark ? 'bg-black/60' : 'bg-[#101828]/40',
    modalPanel:  dark ? 'border border-white/10 bg-[#11161d]' : 'border border-[#e4e7ec] bg-white',
    modalTitle:  dark ? 'text-white' : 'text-[#101828]',
    modalClose:  dark ? 'text-white/40 hover:text-white/80' : 'text-[#98a2b3] hover:text-[#101828]',
    modalSub:    dark ? 'text-white/45' : 'text-[#667085]',
    modalSent:   dark ? 'text-white/50' : 'text-[#667085]',
    typeIdle:    dark ? 'border-white/10 text-white/55 hover:border-white/25 hover:text-white/80'
                      : 'border-[#e4e7ec] text-[#475467] hover:border-[#c3c8d0] hover:text-[#101828]',
    typeActive:  dark ? 'border-amber-400/60 bg-amber-400/10 text-amber-300' : 'border-amber-400 bg-amber-50 text-amber-700',
    textarea:    dark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-400/60'
                      : 'bg-[#fafbfc] border-[#e4e7ec] text-[#101828] placeholder:text-[#98a2b3] focus:border-indigo-400',
    reportBtn:   dark ? 'bg-amber-400 text-[#1a1200] hover:bg-amber-300' : 'bg-amber-500 text-white hover:bg-amber-600',
  }
}

// Option-state styling, theme-aware.
function optionClasses(
  dark: boolean,
  state: 'idle' | 'selected' | 'correct' | 'wrong' | 'muted',
) {
  switch (state) {
    case 'correct':
      return {
        box: dark ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 cursor-default'
                  : 'border-emerald-500 bg-emerald-50 text-emerald-800 cursor-default',
        badge: 'bg-emerald-600 border-emerald-600 text-white',
      }
    case 'wrong':
      return {
        box: dark ? 'border-red-500/40 bg-red-500/10 text-red-300 cursor-default'
                  : 'border-red-400 bg-red-50 text-red-700 cursor-default',
        badge: 'bg-red-500 border-red-500 text-white',
      }
    case 'muted':
      return {
        box: dark ? 'border-white/5 text-white/25 cursor-default' : 'border-[#eceef1] text-[#98a2b3] cursor-default',
        badge: dark ? 'border-white/10 text-white/20' : 'border-[#e4e7ec] text-[#cbd2da]',
      }
    case 'selected':
      return {
        box: dark ? 'border-indigo-400/70 bg-indigo-500/10 text-white cursor-pointer'
                  : 'border-indigo-500 bg-indigo-50 text-indigo-900 cursor-pointer',
        badge: dark ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-600 text-white border-indigo-600',
      }
    default:
      return {
        box: dark ? 'border-white/8 text-white/70 hover:border-white/22 hover:text-white/90 cursor-pointer'
                  : 'border-[#e4e7ec] bg-white text-[#344054] hover:border-[#c3c8d0] hover:bg-[#fafbfc] cursor-pointer',
        badge: dark ? 'border-white/15 text-white/35' : 'border-[#d0d5dd] text-[#667085]',
      }
  }
}

interface ExamEngineProps {
  examType: string
  subject: string
  subjects?: string
  limit: string
  backPath: string
  timerMinutes?: number
  year?: string
  ordered?: boolean
  sortBy?: string
  mode?: 'learning' | 'exam'
}

export default function ExamEngine({
  examType, subject, subjects, limit, backPath, timerMinutes, year, ordered, sortBy, mode = 'exam'
}: ExamEngineProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'en' | 'hi'>('hi')
  const [showLangHint, setShowLangHint] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timerMinutes ? timerMinutes * 60 : null)
  const [revealedQuestions, setRevealedQuestions] = useState<Set<number>>(new Set())

  // Professional light mode is the default; remember the user's choice.
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    try { const s = localStorage.getItem('exam_theme'); if (s === 'dark' || s === 'light') setTheme(s) } catch {}
  }, [])
  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      try { localStorage.setItem('exam_theme', next) } catch {}
      return next
    })
  }
  const dark = theme === 'dark'
  const T = tokens(dark)

  // Report-an-issue state
  const [reportOpen, setReportOpen] = useState(false)
  const [reportType, setReportType] = useState<string | null>(null)
  const [reportNote, setReportNote] = useState('')
  const [reportStatus, setReportStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const subjectsParam = subjects
          ? `subjects=${encodeURIComponent(subjects)}`
          : `subject=${encodeURIComponent(subject)}`
        const yearParam = year ? `&year=${year}` : ''
        const orderedParam = ordered ? '&ordered=true' : ''
        const sortParam = sortBy ? `&sort=${sortBy}` : ''

        if (ordered || sortBy) {
          const res = await fetch(`/api/exams/generate?exam_type=${examType}&${subjectsParam}&limit=${limit}${yearParam}${orderedParam}${sortParam}`)
          const data = await res.json()
          setQuestions(data.questions || [])
        } else {
          const key = seenKey(examType, subjects || subject)
          const seen = getSeenIds(key)
          const fetchLimit = parseInt(limit) * 4
          const res = await fetch(`/api/exams/generate?exam_type=${examType}&${subjectsParam}&limit=${fetchLimit}${yearParam}`)
          const data = await res.json()
          const pool: any[] = shuffle(data.questions || [])
          const unseen = pool.filter(q => !seen.has(String(q.id)))
          const fallback = pool.filter(q => seen.has(String(q.id)))
          if (unseen.length === 0 && pool.length > 0) {
            localStorage.removeItem(key)
            setQuestions(pool.slice(0, parseInt(limit)))
          } else {
            setQuestions([...unseen, ...fallback].slice(0, parseInt(limit)))
          }
        }
      } catch (err) {
        console.error('Error loading questions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [examType, subject, subjects, limit, year, ordered])

  // One-time hint pointing at the language toggle; auto-dismisses.
  useEffect(() => {
    if (!showLangHint) return
    const t = setTimeout(() => setShowLangHint(false), 6000)
    return () => clearTimeout(t)
  }, [showLangHint])

  const handleFinish = useCallback(() => {
    setIsSubmitted(true)
    const key = seenKey(examType, subjects || subject)
    saveSeenIds(key, questions.map(q => String(q.id)))
    localStorage.setItem('prepify_last_result', JSON.stringify({
      questions, answers, examType, subject: subjects || subject, timerMinutes, language, savedAt: Date.now(),
    }))
  }, [examType, subject, subjects, questions, answers, timerMinutes, language])

  useEffect(() => {
    if (timeLeft === null || isSubmitted) return
    if (timeLeft <= 0) { handleFinish(); return }
    const t = setInterval(() => setTimeLeft(s => (s ?? 1) - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, isSubmitted, handleFinish])

  function formatCountdown(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`
  }

  const score = () => {
    let c = 0; questions.forEach((q, i) => { if (answers[i] === q.correct_answer) c++ }); return c
  }

  // Reset the report dialog whenever the user moves to a different question
  useEffect(() => {
    setReportOpen(false); setReportType(null); setReportNote(''); setReportStatus('idle')
  }, [current])

  async function submitReport() {
    if (!reportType) return
    const q = questions[current]
    setReportStatus('sending')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: q?.id,
          exam_type: examType,
          subject: q?.subject,
          issue_type: reportType,
          note: reportNote,
          question_text: q?.text_en || q?.text_hi || q?.text || '',
        }),
      })
      setReportStatus(res.ok ? 'sent' : 'error')
    } catch {
      setReportStatus('error')
    }
  }

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return
    if (mode === 'learning' && revealedQuestions.has(current)) return
    setAnswers(prev => ({ ...prev, [current]: opt }))
    if (mode === 'learning') setRevealedQuestions(prev => new Set([...prev, current]))
  }

  const isCurrentRevealed = mode === 'learning' && revealedQuestions.has(current)

  function ThemeToggle() {
    return (
      <button
        onClick={toggleTheme}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={dark ? 'Light mode' : 'Dark mode'}
        className={`grid place-items-center w-8 h-8 rounded-lg border transition shrink-0 ${T.iconBtn}`}
      >
        {dark ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>
    )
  }

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${T.surfaceBg}`}>
      <div className={`text-sm font-mono animate-pulse tracking-widest uppercase ${T.loadingText}`}>Loading…</div>
    </div>
  )

  if (!questions.length) return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-center gap-4 ${T.app}`}>
      <p className={`text-sm ${T.loadingText}`}>No questions found for this subject yet.</p>
      <button onClick={() => router.push(backPath)} className={`text-sm underline underline-offset-4 ${T.subject}`}>
        Return to selection
      </button>
    </div>
  )

  const q = questions[current]
  const questionText = language === 'en' ? (q.text_en || q.text) : (q.text_hi || q.text_en || q.text)
  // Image-first questions (match-the-column / passages / multi-figure): show the whole
  // body as one big image and hide the text (flag, or "empty text + a diagram").
  const engineDiagram = q.diagram_url || q.diagramBase64
  const imageFirst = !!(engineDiagram && (q.fullImageMode || !(questionText || '').trim()))
  const optionsSet = language === 'en' ? (q.options_en || q.options) : (q.options_hi || q.options_en || q.options)
  const attempted = Object.keys(answers).length
  const hasHindi = !!(q.text_hi || q.options_hi)
  const isLowTime = timeLeft !== null && timeLeft < 300

  const sections: Section[] = (ordered || !!sortBy) ? buildSections(questions) : []
  const currentSection = sections.find(s => current >= s.startIdx && current <= s.endIdx)

  return (
    <div className={`min-h-screen w-full max-w-full flex flex-col overflow-x-hidden transition-colors ${T.app}`} style={{ fontFamily: 'var(--font-space), var(--font-geist-sans), sans-serif' }}>
      <style jsx>{`
        .lang-hint {
          animation: hintIn 240ms cubic-bezier(0.23, 1, 0.32, 1) both,
                     hintBob 2.4s ease-in-out 240ms infinite;
          transform-origin: top right;
        }
        @keyframes hintIn { from { opacity: 0; transform: translateY(-4px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes hintBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
        .report-modal { animation: modalIn 200ms cubic-bezier(0.23, 1, 0.32, 1) both; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .lang-hint { animation: hintIn 200ms ease both; }
          .report-modal { animation: none; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 md:px-8 py-3 flex items-center gap-3 transition-colors ${T.header}`}>

        <button onClick={() => router.push(backPath)} className={`text-sm transition shrink-0 flex items-center gap-1 ${T.backBtn}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>

        <span className={`text-sm select-none ${T.divider}`}>|</span>

        <span className={`text-xs font-medium truncate max-w-[100px] md:max-w-[200px] ${T.subject}`}>{subject}</span>

        {/* Progress bar — desktop */}
        <div className="hidden md:flex items-center gap-3 flex-1 mx-4">
          <div className={`flex gap-px flex-1 h-1 rounded-full overflow-hidden ${T.progTrack}`}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-1 h-full transition-all ${
                  i === current ? T.progCurrent : answers[i] !== undefined ? T.progDone : 'bg-transparent'
                }`}
              />
            ))}
          </div>
          <span className={`text-xs font-mono shrink-0 ${T.counter}`}>{current + 1}/{questions.length}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {timeLeft !== null && !isSubmitted && (
            <span className={`font-mono text-sm font-semibold tabular-nums ${isLowTime ? `${T.timerLow} animate-pulse` : T.timer}`}>
              {isLowTime && <span className="mr-1">⏱</span>}{formatCountdown(timeLeft)}
            </span>
          )}
          {hasHindi && (
            <div className="relative">
              <button
                onClick={() => { setLanguage(l => l === 'en' ? 'hi' : 'en'); setShowLangHint(false) }}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${showLangHint ? T.langActive : T.langIdle}`}
              >
                {language === 'en' ? 'हिंदी' : 'English'}
              </button>
              {showLangHint && (
                <div
                  className="lang-hint absolute top-full right-0 mt-2 z-40"
                  onClick={() => setShowLangHint(false)}
                >
                  <div className={`relative text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap ${T.hintBubble}`}>
                    <span className={`absolute -top-1 right-4 w-2 h-2 rotate-45 ${T.hintBubble}`} />
                    भाषा यहाँ बदलें · Change language here
                  </div>
                </div>
              )}
            </div>
          )}
          <ThemeToggle />
          {!isSubmitted && (
            <button
              onClick={handleFinish}
              className={`hidden md:block text-xs font-semibold px-4 py-1.5 rounded-lg border transition ${T.submitGhost}`}
            >
              Submit
            </button>
          )}
          {isSubmitted && (
            <button
              onClick={() => router.push('/results')}
              className={`hidden md:block text-xs font-bold px-4 py-1.5 rounded-lg transition ${T.primary}`}
            >
              View Report →
            </button>
          )}
        </div>
      </header>

      {/* ── Mobile: progress + counter ── */}
      <div className="md:hidden flex items-center gap-3 px-4 pt-3">
        <div className={`flex-1 h-0.5 rounded-full overflow-hidden flex gap-px ${T.progTrack}`}>
          {questions.map((_, i) => (
            <span key={i} className={`flex-1 h-full transition-all ${
              i === current ? T.progCurrent : answers[i] !== undefined ? T.progDone : 'bg-transparent'
            }`} />
          ))}
        </div>
        <span className={`text-[11px] font-mono shrink-0 ${T.counter}`}>{current + 1}/{questions.length}</span>
        {timeLeft !== null && !isSubmitted && (
          <span className={`font-mono text-[11px] font-semibold tabular-nums ${isLowTime ? `${T.timerLow} animate-pulse` : T.counter}`}>
            {formatCountdown(timeLeft)}
          </span>
        )}
      </div>

      {/* ── Section tabs (ordered mode) ── */}
      {(ordered || !!sortBy) && sections.length > 1 && (
        <div className={`border-b overflow-x-auto w-full ${T.tabsBorder}`}>
          <div className="flex w-max min-w-full px-4 md:px-8">
            {sections.map((sec, si) => {
              const isActive = currentSection?.subject === sec.subject
              const done = Array.from({ length: sec.endIdx - sec.startIdx + 1 }, (_, k) => answers[sec.startIdx + k]).filter(Boolean).length
              const total = sec.endIdx - sec.startIdx + 1
              return (
                <button
                  key={sec.subject}
                  onClick={() => setCurrent(sec.startIdx)}
                  className={`flex flex-col items-start px-4 py-2.5 text-left transition-all shrink-0 border-b-2 ${isActive ? T.tabActive : T.tabIdle}`}
                >
                  <span className={`text-[10px] font-mono uppercase tracking-widest mb-0.5 ${T.partLabel}`}>Part {si + 1}</span>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {language === 'hi' ? sec.label.hi : sec.label.en}
                  </span>
                  <span className={`text-[10px] mt-0.5 font-mono ${done === total ? T.doneOk : T.doneIdle}`}>
                    {done}/{total}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-10 lg:px-16 pt-6 pb-28 md:pb-12">
          <div className="w-full max-w-2xl">

            {/* Ad slot */}
            <div className="mb-7"><AdBanner /></div>

            {/* Section divider — shown only at first question of each section */}
            {(ordered || !!sortBy) && currentSection && current === currentSection.startIdx && (
              <div className="mb-7 flex items-center gap-4">
                <div className={`flex-1 h-px ${dark ? 'bg-white/8' : 'bg-[#e6e8ec]'}`} />
                <div className="text-center">
                  <div className={`text-[10px] font-mono uppercase tracking-widest ${T.partLabel}`}>
                    Part {sections.findIndex(s => s.subject === currentSection.subject) + 1}
                  </div>
                  <div className={`text-sm font-semibold mt-0.5 ${T.qText}`}>
                    {language === 'hi' ? currentSection.label.hi : currentSection.label.en}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${T.counter}`}>
                    {currentSection.endIdx - currentSection.startIdx + 1} questions
                  </div>
                </div>
                <div className={`flex-1 h-px ${dark ? 'bg-white/8' : 'bg-[#e6e8ec]'}`} />
              </div>
            )}

            {/* Question number */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-[11px] font-mono uppercase tracking-widest ${T.qNum}`}>Q{current + 1}</span>
              {q.year && <span className={`text-[11px] font-mono ${T.year}`}>{q.year}</span>}
              <button
                onClick={() => setReportOpen(true)}
                className={`ml-auto flex items-center gap-1 text-[11px] transition-colors ${T.reportLink}`}
                title="Report a problem with this question"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Report
              </button>
            </div>

            {/* Question text */}
            {!imageFirst && (questionText || '').trim() && (
              <div className={`text-[17px] md:text-lg font-medium leading-relaxed mb-6 ${T.qText}`}>
                {renderText(questionText)}
              </div>
            )}

            {/* Diagram (large when the image IS the question) */}
            {engineDiagram && (
              <div className="rounded-xl overflow-hidden bg-white p-2 flex justify-center mb-6 border border-[#e6e8ec]">
                <img src={engineDiagram} alt={imageFirst ? 'Question' : 'Diagram'} className={`max-w-full object-contain ${imageFirst ? 'max-h-[78vh]' : 'max-h-64'}`} />
              </div>
            )}

            {/* Options */}
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optText = optionsSet?.[opt] || optionsSet?.[opt.toLowerCase()] || ''
                const isSelected = answers[current] === opt
                const isCorrect = q.correct_answer === opt

                let state: 'idle' | 'selected' | 'correct' | 'wrong' | 'muted' = 'idle'
                let badgeLabel: React.ReactNode = opt
                if (isSubmitted || isCurrentRevealed) {
                  if (isCorrect) { state = 'correct'; badgeLabel = '✓' }
                  else if (isSelected) { state = 'wrong'; badgeLabel = '✗' }
                  else state = 'muted'
                } else if (isSelected) {
                  state = 'selected'
                }
                const oc = optionClasses(dark, state)

                return (
                  <button
                    key={opt}
                    disabled={isSubmitted || isCurrentRevealed}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 flex items-center gap-3.5 text-sm ${oc.box}`}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${oc.badge}`}>
                      {badgeLabel}
                    </span>
                    <div className="flex-1 leading-snug">{renderText(optText)}</div>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {(isSubmitted || isCurrentRevealed) && q.explanation && (
              <div className={`mt-5 border-l-2 pl-4 py-1 ${T.explBorder}`}>
                <div className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${T.explLabel}`}>Explanation</div>
                <div className={`text-sm leading-relaxed ${T.explText}`}>{renderText(q.explanation)}</div>
              </div>
            )}

            {/* Results card — shown on every question after submission */}
            {isSubmitted && (
              <div className={`mt-8 rounded-2xl p-7 text-center ${T.resultBox}`}>
                <p className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${T.resultLabel}`}>Final Score</p>
                <div className={`text-5xl font-mono font-black ${T.resultScore}`}>
                  {score()}<span className={`text-xl font-normal ${T.resultScoreSub}`}> / {questions.length}</span>
                </div>
                <p className={`text-sm mt-2 ${T.resultPct}`}>{Math.round((score() / questions.length) * 100)}% accuracy</p>
                <button onClick={() => router.push('/results')} className={`mt-6 w-full text-sm font-bold py-3 rounded-xl transition ${T.primary}`}>
                  View Full Report →
                </button>
                <button onClick={() => router.push(backPath)} className={`mt-2 w-full text-sm font-medium py-3 rounded-xl transition ${T.secondary}`}>
                  Try Another
                </button>
              </div>
            )}

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3 mt-8">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-25 transition ${T.secondary}`}>
                ← Prev
              </button>
              {!isSubmitted ? (
                <button
                  onClick={() => current === questions.length - 1 ? handleFinish() : setCurrent(c => c + 1)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition ml-auto ${T.primary}`}
                >
                  {current === questions.length - 1 ? 'Finish →' : 'Next →'}
                </button>
              ) : (
                <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-25 transition ml-auto ${T.secondary}`}>
                  Next →
                </button>
              )}
            </div>
          </div>
        </main>

        {/* ── Desktop Sidebar ── */}
        <aside className={`hidden md:flex flex-col w-56 lg:w-60 shrink-0 border-l ${T.aside} ${T.asidePanel}`}>
          <div className={`p-4 border-b ${T.aside}`}>
            <p className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${T.partLabel}`}>Questions</p>
            <div className={`flex gap-3 text-[11px] ${T.legendText}`}>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-sm inline-block ${T.legendAnsw}`} />Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-sm inline-block ${T.legendSkip}`} />Skipped
              </span>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-lg text-xs font-mono font-semibold transition-all ${
                    i === current ? T.gridCurrent : answers[i] !== undefined ? T.gridAnswered : T.gridSkipped
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className={`p-4 border-t space-y-2 text-xs ${T.aside}`}>
            <div className={`flex justify-between ${T.statLabel}`}><span>Answered</span><span className={`font-mono font-semibold ${T.statValue}`}>{attempted}</span></div>
            <div className={`flex justify-between ${T.statLabel}`}><span>Remaining</span><span className="font-mono">{questions.length - attempted}</span></div>
            {!isSubmitted && (
              <button onClick={handleFinish} className={`w-full mt-3 font-bold py-2.5 rounded-xl transition text-sm ${T.primary}`}>
                Submit Exam
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t px-4 py-3 z-30 ${T.mobileNav}`}>
        <div className="flex justify-between items-center gap-2">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium disabled:opacity-25 transition ${T.secondary}`}>
            ← Prev
          </button>
          {!isSubmitted ? (
            <button onClick={handleFinish}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition ${T.submitGhost}`}>
              Submit
            </button>
          ) : (
            <button onClick={() => router.push('/results')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${T.primary}`}>
              Report →
            </button>
          )}
          {!isSubmitted ? (
            <button
              onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-25 transition ${T.primary}`}
            >
              Next →
            </button>
          ) : (
            <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium disabled:opacity-25 transition ${T.secondary}`}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* ── Report issue modal ── */}
      {reportOpen && (
        <div
          className={`fixed inset-0 z-50 backdrop-blur-sm grid place-items-center px-4 ${T.modalOverlay}`}
          onClick={e => { if (e.target === e.currentTarget) setReportOpen(false) }}
        >
          <div className={`report-modal w-full max-w-sm rounded-2xl p-5 ${T.modalPanel}`}>
            {reportStatus === 'sent' ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className={`font-semibold mb-1 ${T.modalTitle}`}>Thanks for reporting!</p>
                <p className={`text-sm mb-5 ${T.modalSent}`}>We&apos;ll review this question and fix it.</p>
                <button onClick={() => setReportOpen(false)} className={`w-full font-bold py-2.5 rounded-xl text-sm transition ${T.primary}`}>Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold text-sm ${T.modalTitle}`}>Report a problem · Q{current + 1}</h3>
                  <button onClick={() => setReportOpen(false)} className={`text-lg leading-none ${T.modalClose}`}>×</button>
                </div>
                <p className={`text-xs mb-4 ${T.modalSub}`}>What&apos;s wrong with this question?</p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {([
                    { value: 'diagram_missing', label: 'Diagram missing' },
                    { value: 'wrong_answer',    label: 'Wrong answer'    },
                    { value: 'unclear',         label: 'Unclear / typo'  },
                    { value: 'options',         label: 'Options issue'   },
                    { value: 'other',           label: 'Other'           },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setReportType(opt.value)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition ${reportType === opt.value ? T.typeActive : T.typeIdle}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={reportNote}
                  onChange={e => setReportNote(e.target.value)}
                  placeholder="Add a detail (optional)…"
                  maxLength={500}
                  className={`w-full h-16 resize-none border rounded-lg px-3 py-2 text-sm outline-none transition mb-2 ${T.textarea}`}
                />

                {reportStatus === 'error' && (
                  <p className="text-red-500 text-xs mb-2">Couldn&apos;t send — please try again.</p>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setReportOpen(false)} className={`flex-1 font-medium py-2.5 rounded-xl text-sm transition ${T.secondary}`}>Cancel</button>
                  <button
                    onClick={submitReport}
                    disabled={!reportType || reportStatus === 'sending'}
                    className={`flex-1 font-bold py-2.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition ${T.reportBtn}`}
                  >
                    {reportStatus === 'sending' ? 'Sending…' : 'Submit report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
