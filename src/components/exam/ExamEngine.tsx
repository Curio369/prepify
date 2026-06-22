'use client'
import { useEffect, useState, useCallback } from 'react'
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

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function seenKey(examType: string, subject: string) {
  return `seen_${examType}_${subject}`.replace(/\s+/g, '_')
}

function getSeenIds(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveSeenIds(key: string, ids: string[]) {
  try {
    const existing = getSeenIds(key)
    ids.forEach(id => existing.add(id))
    localStorage.setItem(key, JSON.stringify([...existing]))
  } catch {}
}

interface ExamEngineProps {
  examType: string
  subject: string       // used as display label + API param
  subjects?: string     // comma-separated for multi-subject (full exam)
  limit: string
  backPath: string
  timerMinutes?: number // if set, shows countdown and auto-submits
  year?: string         // for PYQ mode
  ordered?: boolean     // preserve original paper sequence, skip seen-filter
}

export default function ExamEngine({
  examType, subject, subjects, limit, backPath, timerMinutes, year, ordered
}: ExamEngineProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timerMinutes ? timerMinutes * 60 : null)

  // ── Fetch + seen-question filtering ──
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const subjectsParam = subjects
          ? `subjects=${encodeURIComponent(subjects)}`
          : `subject=${encodeURIComponent(subject)}`
        const yearParam = year ? `&year=${year}` : ''
        const orderedParam = ordered ? '&ordered=true' : ''

        if (ordered) {
          // Sequential mode (PYQ / full mock): fetch in paper order, no seen-filter
          const res = await fetch(
            `/api/exams/generate?exam_type=${examType}&${subjectsParam}&limit=${limit}${yearParam}${orderedParam}`
          )
          const data = await res.json()
          setQuestions(data.questions || [])
        } else {
          // Practice mode: fetch large pool, filter seen, shuffle
          const key = seenKey(examType, subjects || subject)
          const seen = getSeenIds(key)
          const fetchLimit = parseInt(limit) * 4

          const res = await fetch(
            `/api/exams/generate?exam_type=${examType}&${subjectsParam}&limit=${fetchLimit}${yearParam}`
          )
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

  // ── Countdown timer ──
  const handleFinish = useCallback(() => {
    setIsSubmitted(true)
    // Save seen IDs to localStorage
    const key = seenKey(examType, subjects || subject)
    saveSeenIds(key, questions.map(q => String(q.id)))
  }, [examType, subject, subjects, questions])

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
    let c = 0
    questions.forEach((q, i) => { if (answers[i] === q.correct_answer) c++ })
    return c
  }

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return
    setAnswers(prev => ({ ...prev, [current]: opt }))
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-emerald-400 text-sm font-bold font-mono animate-pulse">
        Assembling {examType} Questions...
      </div>
    </div>
  )

  if (!questions.length) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4 text-center">
      <p className="text-sm text-slate-500 mb-4">No questions found for this subject yet.</p>
      <button onClick={() => router.push(backPath)} className="text-emerald-400 text-sm font-semibold underline">
        Return to Subject Selection
      </button>
    </div>
  )

  const q = questions[current]
  const questionText = language === 'en' ? (q.text_en || q.text) : (q.text_hi || q.text_en || q.text)
  const optionsSet = language === 'en' ? (q.options_en || q.options) : (q.options_hi || q.options_en || q.options)
  const attempted = Object.keys(answers).length
  const hasHindi = !!(q.text_hi || q.options_hi)
  const isLowTime = timeLeft !== null && timeLeft < 300

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3 flex items-center gap-3">
        <button onClick={() => router.push(backPath)} className="text-slate-500 hover:text-slate-300 text-sm transition shrink-0">
          ← Back
        </button>

        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono uppercase tracking-widest px-2 py-0.5 rounded-md border border-emerald-500/20 truncate max-w-[120px] md:max-w-none">
          {subject}
        </span>

        {/* Desktop progress bar */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-auto">
          <div className="flex gap-0.5 flex-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full flex-1 transition-colors ${
                  i === current ? 'bg-white' : answers[i] !== undefined ? 'bg-emerald-500/60' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-mono shrink-0">{current + 1}/{questions.length}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Countdown timer */}
          {timeLeft !== null && !isSubmitted && (
            <span className={`font-mono text-sm font-bold px-3 py-1 rounded-lg border transition-all ${
              isLowTime
                ? 'text-red-400 border-red-500/40 bg-red-500/10 animate-pulse'
                : 'text-slate-300 border-slate-700 bg-slate-800'
            }`}>
              ⏱ {formatCountdown(timeLeft)}
            </span>
          )}
          {hasHindi && (
            <button
              onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
              className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 transition"
            >
              {language === 'en' ? 'हिंदी' : 'English'}
            </button>
          )}
          {!isSubmitted && (
            <button
              onClick={handleFinish}
              className="hidden md:block bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-xl transition"
            >
              Submit
            </button>
          )}
        </div>
      </header>

      {/* ── Mobile progress + timer bar ── */}
      <div className="md:hidden flex items-center gap-2 px-4 pt-3 pb-0">
        <div className="flex gap-0.5 flex-1">
          {questions.map((_, i) => (
            <span key={i} className={`h-1 rounded-full flex-1 transition-colors ${
              i === current ? 'bg-white' : answers[i] !== undefined ? 'bg-emerald-500/50' : 'bg-slate-800'
            }`} />
          ))}
        </div>
        <span className="text-[11px] text-slate-500 font-mono shrink-0">{current + 1}/{questions.length}</span>
        {timeLeft !== null && !isSubmitted && (
          <span className={`font-mono text-[11px] font-bold ml-1 ${isLowTime ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
            {formatCountdown(timeLeft)}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-16 pt-5 pb-28 md:pb-12">
          <div className="w-full max-w-2xl">

            {/* Ad slot */}
            <div className="w-full h-14 md:h-16 bg-slate-900 border border-dashed border-slate-800 rounded-xl mb-6 flex items-center justify-center text-[10px] text-slate-600 tracking-wider uppercase">
              Advertisement
            </div>

            {/* Question */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-slate-500">Q{current + 1}</span>
                {q.subject && q.subject !== subject && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
                    {q.subject}
                  </span>
                )}
                {q.year && (
                  <span className="text-[10px] text-slate-600 font-mono">{q.year}</span>
                )}
              </div>
              <div className="text-base md:text-lg font-medium leading-relaxed text-slate-100">
                {renderText(questionText)}
              </div>
            </div>

            {q.diagram_url && (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-white p-2 flex justify-center mb-5">
                <img src={q.diagram_url} alt="Diagram" className="max-w-full max-h-64 object-contain" />
              </div>
            )}

            {/* Options */}
            <div className="space-y-2.5">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optText = optionsSet?.[opt] || optionsSet?.[opt.toLowerCase()] || ''
                const isSelected = answers[current] === opt
                const isCorrect = q.correct_answer === opt

                let container = 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/60 cursor-pointer'
                let text = 'text-slate-300'
                let badge = 'border-slate-700 text-slate-500'
                let badgeLabel: React.ReactNode = opt

                if (isSubmitted) {
                  if (isCorrect) {
                    container = 'border-emerald-500/40 bg-emerald-500/10 cursor-default'
                    text = 'text-emerald-300 font-medium'
                    badge = 'bg-emerald-500 border-emerald-500 text-white'
                    badgeLabel = '✓'
                  } else if (isSelected) {
                    container = 'border-red-500/40 bg-red-500/10 cursor-default'
                    text = 'text-red-400'
                    badge = 'bg-red-500 border-red-500 text-white'
                    badgeLabel = '✗'
                  } else {
                    container = 'border-slate-800 bg-slate-900/40 cursor-default'
                    text = 'text-slate-600'
                  }
                } else if (isSelected) {
                  container = 'border-emerald-500 bg-emerald-500/5 cursor-pointer'
                  text = 'text-emerald-300 font-medium'
                  badge = 'bg-emerald-500 border-emerald-500 text-white'
                }

                return (
                  <button
                    key={opt}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-3.5 md:p-4 rounded-xl border transition-all duration-150 flex items-center gap-3 text-sm ${container}`}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 ${badge}`}>
                      {badgeLabel}
                    </span>
                    <div className={`flex-1 leading-snug ${text}`}>{renderText(optText)}</div>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {isSubmitted && q.explanation && (
              <div className="mt-5 pl-4 pr-3 py-3.5 border-l-2 border-emerald-500 bg-slate-900/70 rounded-r-xl">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">✨ Explanation</div>
                <p className="text-slate-400 text-sm leading-relaxed">{q.explanation}</p>
              </div>
            )}

            {/* Results card (last question) */}
            {isSubmitted && current === questions.length - 1 && (
              <div className="mt-6 border border-slate-800 bg-slate-900/60 rounded-2xl p-6 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
                <div className="text-5xl font-mono font-black text-white mt-1">
                  {score()}<span className="text-lg text-slate-600 font-normal"> / {questions.length}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{Math.round((score() / questions.length) * 100)}% accuracy</p>
                <button onClick={() => router.push(backPath)} className="mt-5 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold py-3 rounded-xl transition">
                  Try Another
                </button>
              </div>
            )}

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3 mt-8">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 transition">
                ← Previous
              </button>
              {!isSubmitted ? (
                <button
                  onClick={() => current === questions.length - 1 ? handleFinish() : setCurrent(c => c + 1)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow transition ml-auto ${
                    current === questions.length - 1
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-white text-slate-950 hover:bg-slate-200'
                  }`}
                >
                  {current === questions.length - 1 ? 'Finish & View Score' : 'Next →'}
                </button>
              ) : (
                <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 transition ml-auto">
                  Next Review →
                </button>
              )}
            </div>
          </div>
        </main>

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-l border-slate-800 bg-slate-900/40">
          <div className="p-4 border-b border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Question Palette</p>
            <div className="flex gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60 inline-block" />Answered</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-700 inline-block" />Skipped</span>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-lg text-xs font-mono font-bold transition-all ${
                    i === current
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 bg-white text-slate-950'
                      : answers[i] !== undefined
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500"><span>Answered</span><span className="text-emerald-400 font-bold font-mono">{attempted}</span></div>
            <div className="flex justify-between text-slate-500"><span>Remaining</span><span className="font-mono">{questions.length - attempted}</span></div>
            {!isSubmitted && (
              <button onClick={handleFinish} className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-sm">
                Submit Exam
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 flex justify-between items-center z-30">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-950 disabled:opacity-30 transition">
          ← Prev
        </button>
        {!isSubmitted ? (
          <button
            onClick={() => current === questions.length - 1 ? handleFinish() : setCurrent(c => c + 1)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow transition ${
              current === questions.length - 1
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-white text-slate-950 hover:bg-slate-200'
            }`}
          >
            {current === questions.length - 1 ? 'Finish & Score' : 'Next →'}
          </button>
        ) : (
          <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-950 disabled:opacity-30 transition">
            Next Review →
          </button>
        )}
      </div>
    </div>
  )
}
