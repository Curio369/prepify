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

  if (loading) return (
    <div className="min-h-screen bg-[#060b10] flex items-center justify-center">
      <div className="text-white/40 text-sm font-mono animate-pulse tracking-widest uppercase">Loading…</div>
    </div>
  )

  if (!questions.length) return (
    <div className="min-h-screen bg-[#060b10] flex flex-col items-center justify-center text-white/40 p-4 text-center gap-4">
      <p className="text-sm">No questions found for this subject yet.</p>
      <button onClick={() => router.push(backPath)} className="text-white/70 text-sm underline underline-offset-4">
        Return to selection
      </button>
    </div>
  )

  const q = questions[current]
  const questionText = language === 'en' ? (q.text_en || q.text) : (q.text_hi || q.text_en || q.text)
  const optionsSet = language === 'en' ? (q.options_en || q.options) : (q.options_hi || q.options_en || q.options)
  const attempted = Object.keys(answers).length
  const hasHindi = !!(q.text_hi || q.options_hi)
  const isLowTime = timeLeft !== null && timeLeft < 300

  const sections: Section[] = (ordered || !!sortBy) ? buildSections(questions) : []
  const currentSection = sections.find(s => current >= s.startIdx && current <= s.endIdx)

  return (
    <div className="min-h-screen w-full max-w-full bg-[#060b10] text-white flex flex-col overflow-x-hidden" style={{ fontFamily: 'var(--font-space), var(--font-geist-sans), sans-serif' }}>
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
      <header className="sticky top-0 z-30 bg-[#060b10]/98 border-b border-white/6 px-4 md:px-8 py-3 flex items-center gap-3">

        <button onClick={() => router.push(backPath)} className="text-white/40 hover:text-white/80 text-sm transition shrink-0 flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>

        <span className="text-white/25 text-sm select-none">|</span>

        <span className="text-white/50 text-xs font-medium truncate max-w-[100px] md:max-w-[200px]">{subject}</span>

        {/* Progress bar — desktop */}
        <div className="hidden md:flex items-center gap-3 flex-1 mx-4">
          <div className="flex gap-px flex-1 h-1 rounded-full overflow-hidden bg-white/6">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-1 h-full transition-all ${
                  i === current ? 'bg-white/80' : answers[i] !== undefined ? 'bg-white/35' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-white/35 font-mono shrink-0">{current + 1}/{questions.length}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {timeLeft !== null && !isSubmitted && (
            <span className={`font-mono text-sm font-semibold tabular-nums ${isLowTime ? 'text-red-400 animate-pulse' : 'text-white/60'}`}>
              {isLowTime && <span className="mr-1">⏱</span>}{formatCountdown(timeLeft)}
            </span>
          )}
          {hasHindi && (
            <div className="relative">
              <button
                onClick={() => { setLanguage(l => l === 'en' ? 'hi' : 'en'); setShowLangHint(false) }}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${
                  showLangHint
                    ? 'text-emerald-300 border-emerald-400/50 ring-1 ring-emerald-400/40'
                    : 'text-white/45 hover:text-white/80 border-white/8 hover:border-white/18'
                }`}
              >
                {language === 'en' ? 'हिंदी' : 'English'}
              </button>
              {showLangHint && (
                <div
                  className="lang-hint absolute top-full right-0 mt-2 z-40"
                  onClick={() => setShowLangHint(false)}
                >
                  <div className="relative bg-emerald-500 text-[#04140c] text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    <span className="absolute -top-1 right-4 w-2 h-2 rotate-45 bg-emerald-500" />
                    भाषा यहाँ बदलें · Change language here
                  </div>
                </div>
              )}
            </div>
          )}
          {!isSubmitted && (
            <button
              onClick={handleFinish}
              className="hidden md:block text-xs font-semibold px-4 py-1.5 rounded-lg border border-red-500/30 text-red-400/80 hover:border-red-500/55 hover:text-red-400 transition"
            >
              Submit
            </button>
          )}
          {isSubmitted && (
            <button
              onClick={() => router.push('/results')}
              className="hidden md:block bg-white text-[#060b10] text-xs font-bold px-4 py-1.5 rounded-lg transition hover:bg-white/90"
            >
              View Report →
            </button>
          )}
        </div>
      </header>

      {/* ── Mobile: progress + counter ── */}
      <div className="md:hidden flex items-center gap-3 px-4 pt-3">
        <div className="flex-1 h-0.5 rounded-full bg-white/6 overflow-hidden flex gap-px">
          {questions.map((_, i) => (
            <span key={i} className={`flex-1 h-full transition-all ${
              i === current ? 'bg-white/75' : answers[i] !== undefined ? 'bg-white/30' : 'bg-transparent'
            }`} />
          ))}
        </div>
        <span className="text-[11px] text-white/35 font-mono shrink-0">{current + 1}/{questions.length}</span>
        {timeLeft !== null && !isSubmitted && (
          <span className={`font-mono text-[11px] font-semibold tabular-nums ${isLowTime ? 'text-red-400 animate-pulse' : 'text-white/45'}`}>
            {formatCountdown(timeLeft)}
          </span>
        )}
      </div>

      {/* ── Section tabs (ordered mode) ── */}
      {(ordered || !!sortBy) && sections.length > 1 && (
        <div className="border-b border-white/6 overflow-x-auto w-full">
          <div className="flex w-max min-w-full px-4 md:px-8">
            {sections.map((sec, si) => {
              const isActive = currentSection?.subject === sec.subject
              const done = Array.from({ length: sec.endIdx - sec.startIdx + 1 }, (_, k) => answers[sec.startIdx + k]).filter(Boolean).length
              const total = sec.endIdx - sec.startIdx + 1
              return (
                <button
                  key={sec.subject}
                  onClick={() => setCurrent(sec.startIdx)}
                  className={`flex flex-col items-start px-4 py-2.5 text-left transition-all shrink-0 border-b-2 ${
                    isActive ? 'border-white/60 text-white/90' : 'border-transparent text-white/30 hover:text-white/55'
                  }`}
                >
                  <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-0.5">Part {si + 1}</span>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {language === 'hi' ? sec.label.hi : sec.label.en}
                  </span>
                  <span className={`text-[10px] mt-0.5 font-mono ${done === total ? 'text-emerald-400' : 'text-white/25'}`}>
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
                <div className="flex-1 h-px bg-white/8" />
                <div className="text-center">
                  <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                    Part {sections.findIndex(s => s.subject === currentSection.subject) + 1}
                  </div>
                  <div className="text-sm font-semibold text-white/80 mt-0.5">
                    {language === 'hi' ? currentSection.label.hi : currentSection.label.en}
                  </div>
                  <div className="text-[11px] text-white/30 mt-0.5">
                    {currentSection.endIdx - currentSection.startIdx + 1} questions
                  </div>
                </div>
                <div className="flex-1 h-px bg-white/8" />
              </div>
            )}

            {/* Question number */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Q{current + 1}</span>
              {q.year && <span className="text-[11px] text-white/22 font-mono">{q.year}</span>}
              <button
                onClick={() => setReportOpen(true)}
                className="ml-auto flex items-center gap-1 text-[11px] text-white/30 hover:text-amber-400 transition-colors"
                title="Report a problem with this question"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Report
              </button>
            </div>

            {/* Question text */}
            <div className="text-[17px] md:text-lg font-medium leading-relaxed text-white/90 mb-6">
              {renderText(questionText)}
            </div>

            {/* Diagram */}
            {q.diagram_url && (
              <div className="rounded-xl overflow-hidden bg-white p-2 flex justify-center mb-6">
                <img src={q.diagram_url} alt="Diagram" className="max-w-full max-h-64 object-contain" />
              </div>
            )}

            {/* Options */}
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optText = optionsSet?.[opt] || optionsSet?.[opt.toLowerCase()] || ''
                const isSelected = answers[current] === opt
                const isCorrect = q.correct_answer === opt

                let cls = 'border-white/8 text-white/65 hover:border-white/22 hover:text-white/85 cursor-pointer'
                let badgeCls = 'border-white/15 text-white/35'
                let badgeLabel: React.ReactNode = opt

                if (isSubmitted || isCurrentRevealed) {
                  if (isCorrect) {
                    cls = 'border-emerald-500/50 bg-emerald-500/8 text-emerald-200 cursor-default'
                    badgeCls = 'bg-emerald-500 border-emerald-500 text-white'
                    badgeLabel = '✓'
                  } else if (isSelected) {
                    cls = 'border-red-500/40 bg-red-500/8 text-red-300 cursor-default'
                    badgeCls = 'bg-red-500 border-red-500 text-white'
                    badgeLabel = '✗'
                  } else {
                    cls = 'border-white/5 text-white/25 cursor-default'
                    badgeCls = 'border-white/10 text-white/20'
                  }
                } else if (isSelected) {
                  cls = 'border-white/40 bg-white/5 text-white cursor-pointer'
                  badgeCls = 'bg-white text-[#060b10] border-white'
                }

                return (
                  <button
                    key={opt}
                    disabled={isSubmitted || isCurrentRevealed}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 flex items-center gap-3.5 text-sm ${cls}`}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${badgeCls}`}>
                      {badgeLabel}
                    </span>
                    <div className="flex-1 leading-snug">{renderText(optText)}</div>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {(isSubmitted || isCurrentRevealed) && q.explanation && (
              <div className="mt-5 border-l-2 border-emerald-500/60 pl-4 py-1">
                <div className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-2">Explanation</div>
                <div className="text-white/55 text-sm leading-relaxed">{renderText(q.explanation)}</div>
              </div>
            )}

            {/* Results card — shown on every question after submission */}
            {isSubmitted && (
              <div className="mt-8 border border-white/8 bg-white/3 rounded-2xl p-7 text-center">
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Final Score</p>
                <div className="text-5xl font-mono font-black text-white/90">
                  {score()}<span className="text-xl text-white/25 font-normal"> / {questions.length}</span>
                </div>
                <p className="text-sm text-white/40 mt-2">{Math.round((score() / questions.length) * 100)}% accuracy</p>
                <button onClick={() => router.push('/results')} className="mt-6 w-full bg-white text-[#060b10] text-sm font-bold py-3 rounded-xl transition hover:bg-white/90">
                  View Full Report →
                </button>
                <button onClick={() => router.push(backPath)} className="mt-2 w-full border border-white/10 text-white/60 text-sm font-medium py-3 rounded-xl transition hover:border-white/22 hover:text-white/80">
                  Try Another
                </button>
              </div>
            )}

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3 mt-8">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/8 text-white/45 hover:text-white/75 hover:border-white/18 disabled:opacity-25 transition">
                ← Prev
              </button>
              {!isSubmitted ? (
                <button
                  onClick={() => current === questions.length - 1 ? handleFinish() : setCurrent(c => c + 1)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold transition ml-auto bg-white text-[#060b10] hover:bg-white/90"
                >
                  {current === questions.length - 1 ? 'Finish →' : 'Next →'}
                </button>
              ) : (
                <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/8 text-white/45 hover:text-white/75 hover:border-white/18 disabled:opacity-25 transition ml-auto">
                  Next →
                </button>
              )}
            </div>
          </div>
        </main>

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 border-l border-white/6">
          <div className="p-4 border-b border-white/6">
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-3">Questions</p>
            <div className="flex gap-3 text-[11px] text-white/35">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-white/50 inline-block" />Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-white/10 inline-block" />Skipped
              </span>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-lg text-xs font-mono font-semibold transition-all ${
                    i === current
                      ? 'bg-white text-[#060b10]'
                      : answers[i] !== undefined
                      ? 'bg-white/15 text-white/65 hover:bg-white/22'
                      : 'bg-white/4 text-white/25 border border-white/6 hover:border-white/15 hover:text-white/45'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-white/6 space-y-2 text-xs">
            <div className="flex justify-between text-white/35"><span>Answered</span><span className="text-white/65 font-mono font-semibold">{attempted}</span></div>
            <div className="flex justify-between text-white/35"><span>Remaining</span><span className="font-mono">{questions.length - attempted}</span></div>
            {!isSubmitted && (
              <button onClick={handleFinish} className="w-full mt-3 bg-white text-[#060b10] font-bold py-2.5 rounded-xl transition hover:bg-white/90 text-sm">
                Submit Exam
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#060b10]/98 border-t border-white/6 px-4 py-3 z-30">
        <div className="flex justify-between items-center gap-2">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-medium border border-white/8 text-white/40 hover:text-white/70 disabled:opacity-25 transition">
            ← Prev
          </button>
          {!isSubmitted ? (
            <button onClick={handleFinish}
              className="px-4 py-2.5 rounded-xl text-xs font-medium border border-red-500/30 text-red-400/80 hover:border-red-500/55 hover:text-red-400 transition">
              Submit
            </button>
          ) : (
            <button onClick={() => router.push('/results')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#060b10] hover:bg-white/90 transition">
              Report →
            </button>
          )}
          {!isSubmitted ? (
            <button
              onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-[#060b10] hover:bg-white/90 disabled:opacity-25 transition"
            >
              Next →
            </button>
          ) : (
            <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
              className="px-4 py-2.5 rounded-xl text-xs font-medium border border-white/8 text-white/40 disabled:opacity-25 transition">
              Next →
            </button>
          )}
        </div>
      </div>

      {/* ── Report issue modal ── */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center px-4"
          onClick={e => { if (e.target === e.currentTarget) setReportOpen(false) }}
        >
          <div className="report-modal w-full max-w-sm rounded-2xl border border-white/10 bg-[#11161d] p-5">
            {reportStatus === 'sent' ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-white font-semibold mb-1">Thanks for reporting!</p>
                <p className="text-white/50 text-sm mb-5">We&apos;ll review this question and fix it.</p>
                <button onClick={() => setReportOpen(false)} className="w-full bg-white text-[#060b10] font-bold py-2.5 rounded-xl text-sm hover:bg-white/90 transition">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold text-sm">Report a problem · Q{current + 1}</h3>
                  <button onClick={() => setReportOpen(false)} className="text-white/40 hover:text-white/80 text-lg leading-none">×</button>
                </div>
                <p className="text-white/45 text-xs mb-4">What&apos;s wrong with this question?</p>

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
                      className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition ${
                        reportType === opt.value
                          ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                          : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white/80'
                      }`}
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
                  className="w-full h-16 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition mb-2"
                />

                {reportStatus === 'error' && (
                  <p className="text-red-400 text-xs mb-2">Couldn&apos;t send — please try again.</p>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setReportOpen(false)} className="flex-1 border border-white/12 text-white/60 font-medium py-2.5 rounded-xl text-sm hover:bg-white/5 transition">Cancel</button>
                  <button
                    onClick={submitReport}
                    disabled={!reportType || reportStatus === 'sending'}
                    className="flex-1 bg-amber-400 text-[#1a1200] font-bold py-2.5 rounded-xl text-sm hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
