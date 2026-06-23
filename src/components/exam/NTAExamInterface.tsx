'use client'
/**
 * NTAExamInterface — a faithful replica of the real NTA CBT exam screen
 * (JEE Main / NEET family). Upload-driven: reads the extracted questions from
 * localStorage('questions') and renders them in the authentic exam-hall layout.
 *
 * Supports MCQ (A–D) and numerical (integer/decimal) questions, the iconic
 * question-status palette, section tabs, NTA marking (+4 / −1), and an inline
 * NTA-style result summary.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { ExamSkin } from '@/lib/examSkins'

// ── Math-aware text rendering ──────────────────────────────────────────────
function renderText(text: string) {
  if (!text) return null
  const sanitized = String(text).replace(/–/g, '-').replace(/—/g, '-').replace(/−/g, '-')
  const parts = sanitized.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g)
  return parts.map((part, i) => {
    if (part.startsWith('$$')) return <BlockMath key={i} math={part.slice(2, -2)} />
    if (part.startsWith('$')) return <InlineMath key={i} math={part.slice(1, -1)} />
    return <span key={i}>{part}</span>
  })
}

// ── Status state machine (mirrors the real NTA legend) ─────────────────────
type Status = 'notVisited' | 'notAnswered' | 'answered' | 'marked' | 'answeredMarked'

interface NormQ {
  raw: any
  subject: string
  isNumerical: boolean
}

function canonicalSubject(s: string | undefined): string {
  if (!s) return 'General'
  const t = s.trim()
  if (/^math/i.test(t)) return 'Mathematics'
  return t
}

function detectNumerical(q: any): boolean {
  if (q.question_type === 'numerical' || q.type === 'numerical') return true
  const hasOptions = (q.options_en && Object.keys(q.options_en).length) ||
    (q.options_hi && Object.keys(q.options_hi).length) ||
    (q.options && Object.keys(q.options).length)
  // No options + a numeric correct answer ⇒ treat as numerical
  if (!hasOptions && q.correct != null && /^-?\d/.test(String(q.correct).trim())) return true
  return false
}

export default function NTAExamInterface({ skin }: { skin: ExamSkin }) {
  const router = useRouter()

  const [questions, setQuestions] = useState<NormQ[]>([])
  const [loaded, setLoaded] = useState(false)
  const [current, setCurrent] = useState(0)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')

  // answers: index → 'A'|'B'|'C'|'D' for MCQ, or numeric string for numerical
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [status, setStatus] = useState<Record<number, Status>>({})
  const [draft, setDraft] = useState<string>('')           // current selection not yet saved
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showResult, setShowResult] = useState(false) // result modal vs. review mode

  // ── Load questions from the upload flow ──
  useEffect(() => {
    let qs: any[] = []
    try {
      const raw = localStorage.getItem('questions')
      if (raw && raw !== 'undefined') qs = JSON.parse(raw)
    } catch { /* ignore */ }

    const normalized: NormQ[] = (qs || []).map((q) => ({
      raw: q,
      subject: canonicalSubject(q.subject),
      isNumerical: detectNumerical(q),
    }))

    // Order by the skin's canonical subject order, then first-seen order
    const order = skin.subjectOrder.map(canonicalSubject)
    const rank = (s: string) => {
      const i = order.indexOf(s)
      return i === -1 ? order.length + 1 : i
    }
    const seen: string[] = []
    normalized.forEach((n) => { if (!seen.includes(n.subject)) seen.push(n.subject) })
    normalized.sort((a, b) => {
      const ra = rank(a.subject), rb = rank(b.subject)
      if (ra !== rb) return ra - rb
      return seen.indexOf(a.subject) - seen.indexOf(b.subject)
    })

    setQuestions(normalized)
    const dur = Math.min(180, Math.max(10, Math.round((normalized.length || 1) * skin.minutesPerQuestion)))
    setTimeLeft(dur * 60)
    // First question becomes "notAnswered" once visited (handled below)
    setLoaded(true)
  }, [skin])

  // ── Sections (contiguous groups by subject) ──
  const sections = useMemo(() => {
    const out: { subject: string; start: number; end: number }[] = []
    let i = 0
    while (i < questions.length) {
      const subj = questions[i].subject
      const start = i
      while (i < questions.length && questions[i].subject === subj) i++
      out.push({ subject: subj, start, end: i - 1 })
    }
    return out
  }, [questions])

  const currentSection = sections.find(s => current >= s.start && current <= s.end)

  // ── Mark current question visited (notVisited → notAnswered) ──
  useEffect(() => {
    if (!loaded || isSubmitted) return
    setStatus(prev => {
      if (prev[current]) return prev
      return { ...prev, [current]: 'notAnswered' }
    })
    // Load any saved answer into the draft for editing
    setDraft(answers[current] ?? '')
  }, [current, loaded, isSubmitted]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer ──
  const handleSubmit = useCallback(() => {
    setIsSubmitted(true)
    setShowResult(true)
    setShowSubmitConfirm(false)
    setCurrent(0)
  }, [])

  useEffect(() => {
    if (timeLeft === null || isSubmitted) return
    if (timeLeft <= 0) { handleSubmit(); return }
    const t = setInterval(() => setTimeLeft(s => (s ?? 1) - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, isSubmitted, handleSubmit])

  function fmt(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h.toString().padStart(2, '0')}:${m}:${sec}`
  }

  // ── Answer actions ──
  function saveAndNext(markReview = false) {
    setAnswers(prev => {
      const next = { ...prev }
      if (draft !== '') next[current] = draft
      else delete next[current]
      return next
    })
    setStatus(prev => {
      const hasAns = draft !== ''
      let s: Status
      if (markReview) s = hasAns ? 'answeredMarked' : 'marked'
      else s = hasAns ? 'answered' : 'notAnswered'
      return { ...prev, [current]: s }
    })
    goNext()
  }

  function markForReviewAndNext() {
    // Marks for review; keeps draft answer if present
    setAnswers(prev => {
      const next = { ...prev }
      if (draft !== '') next[current] = draft
      return next
    })
    setStatus(prev => ({ ...prev, [current]: draft !== '' ? 'answeredMarked' : 'marked' }))
    goNext()
  }

  function clearResponse() {
    setDraft('')
    setAnswers(prev => { const n = { ...prev }; delete n[current]; return n })
    setStatus(prev => ({ ...prev, [current]: 'notAnswered' }))
  }

  function goNext() {
    setCurrent(c => Math.min(questions.length - 1, c + 1))
  }
  function goPrev() {
    setCurrent(c => Math.max(0, c - 1))
  }

  // ── Numeric keypad ──
  function keypad(val: string) {
    if (isSubmitted) return
    if (val === 'back') { setDraft(d => d.slice(0, -1)); return }
    if (val === 'clr') { setDraft(''); return }
    if (val === '.') { setDraft(d => (d.includes('.') ? d : d + '.')); return }
    if (val === '-') { setDraft(d => (d.startsWith('-') ? d.slice(1) : '-' + d)); return }
    setDraft(d => d + val)
  }

  // ── Scoring ──
  const result = useMemo(() => {
    let correct = 0, incorrect = 0, attempted = 0, marks = 0
    const perSection: Record<string, { correct: number; incorrect: number; marks: number }> = {}
    questions.forEach((nq, i) => {
      const st = status[i]
      const counted = st === 'answered' || st === 'answeredMarked'
      const ans = answers[i]
      if (!counted || ans == null || ans === '') return
      attempted++
      let isRight: boolean
      if (nq.isNumerical) {
        const a = parseFloat(ans), b = parseFloat(String(nq.raw.correct))
        isRight = !isNaN(a) && !isNaN(b) && Math.abs(a - b) < 0.01
      } else {
        isRight = String(ans).toUpperCase() === String(nq.raw.correct).toUpperCase()
      }
      const sec = perSection[nq.subject] ||= { correct: 0, incorrect: 0, marks: 0 }
      if (isRight) {
        correct++; marks += skin.marking.correct; sec.correct++; sec.marks += skin.marking.correct
      } else {
        incorrect++
        const neg = nq.isNumerical ? skin.marking.numericalWrong : skin.marking.wrong
        marks += neg; sec.incorrect++; sec.marks += neg
      }
    })
    const maxMarks = questions.length * skin.marking.correct
    return { correct, incorrect, attempted, marks, maxMarks, perSection,
      unattempted: questions.length - attempted }
  }, [questions, answers, status, skin])

  // ── Status counts for legend ──
  const counts = useMemo(() => {
    const c = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, answeredMarked: 0 }
    questions.forEach((_, i) => {
      const s = status[i] || 'notVisited'
      c[s]++
    })
    return c
  }, [questions, status])

  // On submit: persist the result to the saved test (library "last score")
  // AND auto-log it to the score tracker. Guarded to fire exactly once.
  const recordedRef = useRef(false)
  useEffect(() => {
    if (!isSubmitted || recordedRef.current) return
    recordedRef.current = true
    const id = typeof window !== 'undefined' ? localStorage.getItem('current_test_id') : null
    const name = (typeof window !== 'undefined' && localStorage.getItem('current_test_name')) || `${skin.name} Test`

    if (id) {
      fetch('/api/tests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          result: {
            marks: result.marks, maxMarks: result.maxMarks,
            correct: result.correct, incorrect: result.incorrect,
            attempted: result.attempted, at: Date.now(),
          },
        }),
      }).catch(() => {})
    }

    // Auto-log to the score tracker
    fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test_name: name,
        exam_type: skin.name,
        marks: result.marks,
        max_marks: result.maxMarks,
        positive_marks: result.correct * skin.marking.correct,
        negative_marks: result.incorrect * Math.abs(skin.marking.wrong),
        source: 'prepify',
      }),
    }).catch(() => {})
  }, [isSubmitted, result, skin])

  if (!loaded) return (
    <div className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
      <div className="text-slate-500 text-sm font-medium animate-pulse">Loading exam…</div>
    </div>
  )

  if (!questions.length) return (
    <div className="min-h-screen bg-[#eef1f5] flex flex-col items-center justify-center gap-4 text-slate-600">
      <p className="text-sm">No questions loaded. Upload a paper first.</p>
      <button onClick={() => router.push('/upload')} className="text-blue-700 underline text-sm">Go to Upload</button>
    </div>
  )

  const nq = questions[current]
  const q = nq.raw
  const text = language === 'en' ? (q.text_en || q.text) : (q.text_hi || q.text_en || q.text)
  const opts = language === 'en' ? (q.options_en || q.options) : (q.options_hi || q.options_en || q.options)
  const hasHindi = !!(q.text_hi || q.options_hi)
  const diagram = q.diagram_url || q.diagramBase64
  const lowTime = timeLeft !== null && timeLeft < 300

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-800 flex flex-col" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* ══ Header ══ */}
      <header className="bg-white border-b border-slate-300 shadow-sm">
        <div className="flex items-center justify-between px-3 md:px-5 py-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-700 text-white grid place-items-center font-bold text-sm">P</div>
            <div className="leading-tight">
              <div className="text-[13px] md:text-sm font-bold text-slate-800">{skin.name}</div>
              <div className="text-[10px] text-slate-500 hidden md:block">{skin.fullName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {timeLeft !== null && !isSubmitted && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 hidden sm:inline">Time Left</span>
                <span className={`font-mono text-sm md:text-base font-bold px-2.5 py-1 rounded tabular-nums ${
                  lowTime ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-50 text-blue-800'
                }`}>{fmt(timeLeft)}</span>
              </div>
            )}
            {hasHindi && (
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as 'en' | 'hi')}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            )}
          </div>
        </div>
        {/* Subject tabs */}
        <div className="flex overflow-x-auto border-t border-slate-200">
          {sections.map((sec) => {
            const active = currentSection?.subject === sec.subject
            return (
              <button
                key={sec.subject + sec.start}
                onClick={() => setCurrent(sec.start)}
                className={`px-4 py-2 text-xs md:text-sm font-semibold whitespace-nowrap border-r border-slate-200 transition ${
                  active ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sec.subject}
              </button>
            )
          })}
        </div>
      </header>

      {/* ══ Body ══ */}
      <div className="flex flex-1 min-h-0">

        {/* ── Question pane ── */}
        <main className="flex-1 min-w-0 flex flex-col bg-white border-r border-slate-300">
          {/* meta row */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-[11px] md:text-xs">
            <div className="font-semibold text-slate-700">
              Question {current + 1}
              <span className="ml-3 font-normal text-slate-500">
                {nq.isNumerical ? 'Numerical' : 'Multiple Choice (Single Correct)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-700 font-semibold">+{skin.marking.correct}</span>
              <span className="text-red-600 font-semibold">{nq.isNumerical ? skin.marking.numericalWrong : skin.marking.wrong}</span>
            </div>
          </div>

          {/* scroll area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-7 py-5">
            <div className="max-w-3xl">
              <div className="text-[15px] md:text-base leading-relaxed text-slate-900 mb-5">
                {renderText(text)}
              </div>

              {diagram && (
                <div className="inline-block border border-slate-200 rounded bg-white p-1.5 mb-5">
                  <img src={diagram} alt="Diagram" className="max-w-full max-h-72 object-contain" />
                </div>
              )}

              {/* MCQ options */}
              {!nq.isNumerical && (
                <div className="space-y-2.5">
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const optText = opts?.[opt] || opts?.[opt.toLowerCase()] || ''
                    if (!optText && !['A', 'B', 'C', 'D'].includes(opt)) return null
                    const selected = (isSubmitted ? answers[current] : draft) === opt
                    const isCorrect = String(q.correct).toUpperCase() === opt
                    let cls = 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/40'
                    if (isSubmitted) {
                      if (isCorrect) cls = 'border-green-500 bg-green-50'
                      else if (selected) cls = 'border-red-400 bg-red-50'
                      else cls = 'border-slate-200 opacity-70'
                    } else if (selected) cls = 'border-blue-600 bg-blue-50'
                    return (
                      <label
                        key={opt}
                        className={`flex items-start gap-3 px-4 py-3 rounded border cursor-pointer transition ${cls} ${isSubmitted ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q-${current}`}
                          checked={selected}
                          disabled={isSubmitted}
                          onChange={() => setDraft(opt)}
                          className="mt-1 accent-blue-700"
                        />
                        <span className="font-semibold text-slate-600 shrink-0">{opt}.</span>
                        <span className="flex-1 text-sm text-slate-800 leading-snug">{renderText(optText)}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* Numerical input + keypad */}
              {nq.isNumerical && (
                <div className="max-w-xs">
                  <div className="border-2 border-slate-300 rounded h-12 px-3 grid items-center text-lg font-mono bg-slate-50 mb-3">
                    {(isSubmitted ? answers[current] : draft) || <span className="text-slate-400 text-sm">Enter your answer</span>}
                  </div>
                  {!isSubmitted && (
                    <div className="grid grid-cols-3 gap-1.5">
                      {['1','2','3','4','5','6','7','8','9','.','0','-'].map(k => (
                        <button key={k} onClick={() => keypad(k)}
                          className="h-10 rounded border border-slate-300 bg-white hover:bg-slate-100 font-mono text-base font-semibold text-slate-700 transition">
                          {k}
                        </button>
                      ))}
                      <button onClick={() => keypad('back')} className="h-10 rounded border border-slate-300 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-600 transition">⌫</button>
                      <button onClick={() => keypad('clr')} className="h-10 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 transition col-span-2">Clear</button>
                    </div>
                  )}
                  {isSubmitted && (
                    <p className="text-sm mt-2">
                      Correct answer: <span className="font-mono font-bold text-green-700">{String(q.correct)}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Explanation after submit */}
              {isSubmitted && q.explanation && (
                <div className="mt-6 border-l-4 border-blue-500 bg-blue-50/50 pl-4 py-3 rounded-r max-w-3xl">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1">Solution</div>
                  <div className="text-sm text-slate-700 leading-relaxed">{renderText(q.explanation)}</div>
                </div>
              )}
            </div>
          </div>

          {/* footer buttons */}
          {!isSubmitted ? (
            <div className="border-t border-slate-300 bg-slate-50 px-3 md:px-4 py-2.5 flex flex-wrap items-center gap-2">
              <button onClick={() => markForReviewAndNext()}
                className="text-xs font-semibold px-3 py-2 rounded bg-violet-600 text-white hover:bg-violet-700 transition">
                Mark for Review &amp; Next
              </button>
              <button onClick={clearResponse}
                className="text-xs font-semibold px-3 py-2 rounded border border-slate-400 text-slate-600 hover:bg-slate-200 transition">
                Clear Response
              </button>
              <button onClick={() => saveAndNext(true)}
                className="text-xs font-semibold px-3 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition hidden sm:inline-block">
                Save &amp; Mark for Review
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={goPrev} disabled={current === 0}
                  className="text-xs font-semibold px-3 py-2 rounded border border-slate-400 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition">
                  ← Back
                </button>
                <button onClick={() => saveAndNext(false)}
                  className="text-sm font-bold px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition">
                  Save &amp; Next
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-300 bg-slate-50 px-4 py-2.5 flex items-center gap-2">
              <button onClick={goPrev} disabled={current === 0}
                className="text-xs font-semibold px-3 py-2 rounded border border-slate-400 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition">← Prev</button>
              <button onClick={goNext} disabled={current === questions.length - 1}
                className="text-xs font-semibold px-3 py-2 rounded border border-slate-400 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition">Next →</button>
              <button onClick={() => setShowResult(true)}
                className="ml-auto text-xs font-semibold px-3 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition">
                View Result
              </button>
              <span className="text-sm font-bold text-slate-700">
                {result.marks} / {result.maxMarks}
              </span>
            </div>
          )}
        </main>

        {/* ── Right palette panel (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white">
          {/* profile */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-slate-300 grid place-items-center text-slate-500 text-lg">👤</div>
            <div className="text-xs">
              <div className="font-semibold text-slate-700">Candidate</div>
              <div className="text-slate-400">{skin.name} Mock</div>
            </div>
          </div>

          {/* legend */}
          <div className="px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-2 text-[11px] border-b border-slate-200">
            <LegendItem shape="answered" label="Answered" n={counts.answered} />
            <LegendItem shape="notAnswered" label="Not Answered" n={counts.notAnswered} />
            <LegendItem shape="notVisited" label="Not Visited" n={counts.notVisited} />
            <LegendItem shape="marked" label="Marked" n={counts.marked} />
            <div className="col-span-2">
              <LegendItem shape="answeredMarked" label="Answered & Marked (will be evaluated)" n={counts.answeredMarked} />
            </div>
          </div>

          {/* palette grid grouped by section */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {sections.map(sec => (
              <div key={sec.subject + sec.start} className="mb-4">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 bg-slate-100 px-2 py-1 rounded">
                  {sec.subject}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: sec.end - sec.start + 1 }, (_, k) => {
                    const idx = sec.start + k
                    return <PaletteCell key={idx} n={idx + 1} status={status[idx] || 'notVisited'}
                      active={idx === current} onClick={() => setCurrent(idx)} />
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* submit */}
          {!isSubmitted && (
            <div className="px-4 py-3 border-t border-slate-200">
              <button onClick={() => setShowSubmitConfirm(true)}
                className="w-full bg-blue-700 text-white font-bold py-2.5 rounded hover:bg-blue-800 transition text-sm">
                Submit Test
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* mobile palette toggle / submit bar */}
      <div className="lg:hidden border-t border-slate-300 bg-white px-3 py-2 flex items-center gap-2 overflow-x-auto">
        {questions.map((_, i) => (
          <PaletteCell key={i} n={i + 1} status={status[i] || 'notVisited'} active={i === current} onClick={() => setCurrent(i)} />
        ))}
      </div>
      {!isSubmitted && (
        <div className="lg:hidden border-t border-slate-300 bg-slate-50 px-3 py-2">
          <button onClick={() => setShowSubmitConfirm(true)}
            className="w-full bg-blue-700 text-white font-bold py-2.5 rounded text-sm">Submit Test</button>
        </div>
      )}

      {/* ══ Submit confirmation ══ */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Submit your test?</h3>
            <div className="grid grid-cols-2 gap-2 text-sm mb-5">
              <Stat label="Answered" value={counts.answered + counts.answeredMarked} color="text-green-700" />
              <Stat label="Not Answered" value={counts.notAnswered} color="text-red-600" />
              <Stat label="Marked" value={counts.marked} color="text-violet-600" />
              <Stat label="Not Visited" value={counts.notVisited} color="text-slate-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 border border-slate-300 text-slate-600 font-semibold py-2 rounded hover:bg-slate-50 text-sm">Cancel</button>
              <button onClick={handleSubmit}
                className="flex-1 bg-blue-700 text-white font-bold py-2 rounded hover:bg-blue-800 text-sm">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Result summary (after submit) ══ */}
      {isSubmitted && showResult && (
        <div className="fixed inset-0 z-40 bg-black/30 grid place-items-center px-4 py-8 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) {/* keep open */} }}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{skin.name} · Result</div>
              <div className="text-4xl font-black text-slate-800 mt-1">
                {result.marks}<span className="text-lg text-slate-400 font-normal"> / {result.maxMarks}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5 text-center text-sm">
              <ResultBox n={result.correct} label="Correct" color="bg-green-50 text-green-700" />
              <ResultBox n={result.incorrect} label="Wrong" color="bg-red-50 text-red-600" />
              <ResultBox n={result.unattempted} label="Skipped" color="bg-slate-50 text-slate-500" />
            </div>
            {Object.keys(result.perSection).length > 1 && (
              <div className="mb-5 space-y-1.5">
                {Object.entries(result.perSection).map(([s, v]) => (
                  <div key={s} className="flex justify-between text-sm border-b border-slate-100 pb-1">
                    <span className="text-slate-600">{s}</span>
                    <span className="font-mono font-semibold text-slate-700">{v.marks} <span className="text-slate-400">({v.correct}✓ {v.incorrect}✗)</span></span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setShowResult(false); setCurrent(0) }}
              className="w-full bg-blue-700 text-white font-bold py-2.5 rounded hover:bg-blue-800 text-sm mb-2">
              See Analysis
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => router.push('/library')}
                className="border border-slate-300 text-slate-600 font-semibold py-2.5 rounded hover:bg-slate-50 text-sm">
                Go to Library
              </button>
              <button onClick={() => router.push('/upload')}
                className="border border-slate-300 text-slate-600 font-semibold py-2.5 rounded hover:bg-slate-50 text-sm">
                Practice More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── small presentational helpers ──
function statusStyle(s: Status): { bg: string; color: string; clip?: string } {
  switch (s) {
    case 'answered':       return { bg: '#22a447', color: '#fff', clip: 'polygon(50% 0,100% 28%,100% 100%,0 100%,0 28%)' }
    case 'notAnswered':    return { bg: '#e0413b', color: '#fff', clip: 'polygon(0 0,100% 0,100% 72%,50% 100%,0 72%)' }
    case 'marked':         return { bg: '#7b3fb5', color: '#fff' } // circle via border-radius
    case 'answeredMarked': return { bg: '#7b3fb5', color: '#fff' }
    default:               return { bg: '#e9edf2', color: '#475569' } // notVisited square
  }
}

function PaletteCell({ n, status, active, onClick }:
  { n: number; status: Status; active: boolean; onClick: () => void }) {
  const st = statusStyle(status)
  const circle = status === 'marked' || status === 'answeredMarked'
  return (
    <button onClick={onClick}
      className={`relative w-8 h-8 shrink-0 text-[11px] font-bold grid place-items-center transition ${active ? 'ring-2 ring-blue-600 ring-offset-1' : ''}`}
      style={{
        backgroundColor: st.bg,
        color: st.color,
        borderRadius: circle ? '9999px' : '3px',
        clipPath: circle ? undefined : st.clip,
        border: status === 'notVisited' ? '1px solid #c3ccd6' : undefined,
      }}>
      {n}
      {status === 'answeredMarked' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border border-white grid place-items-center text-[7px] text-white">✓</span>
      )}
    </button>
  )
}

function LegendItem({ shape, label, n }: { shape: Status; label: string; n: number }) {
  const st = statusStyle(shape)
  const circle = shape === 'marked' || shape === 'answeredMarked'
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative w-5 h-5 grid place-items-center text-[9px] font-bold shrink-0"
        style={{
          backgroundColor: st.bg, color: st.color,
          borderRadius: circle ? '9999px' : '2px',
          clipPath: circle ? undefined : st.clip,
          border: shape === 'notVisited' ? '1px solid #c3ccd6' : undefined,
        }}>
        {n}
        {shape === 'answeredMarked' && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-white" />
        )}
      </span>
      <span className="text-slate-600 leading-tight">{label}</span>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-1">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  )
}

function ResultBox({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div className={`rounded-lg py-3 ${color}`}>
      <div className="text-2xl font-black">{n}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  )
}
