'use client'
/**
 * NTAExamInterface — pixel-perfect replica of the real NTA CBT exam screen
 * (JEE Main / NEET family), Prepify-branded, English only. Shows the NTA
 * General Instructions page first (unless the user opted to skip it), then the
 * exam: candidate header, section tabs, numbered MCQ + numerical questions,
 * the exact question-status palette, and NTA action buttons.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { ExamSkin } from '@/lib/examSkins'
import NtaInstructions from './NtaInstructions'

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

type Status = 'notVisited' | 'notAnswered' | 'answered' | 'marked' | 'answeredMarked'
interface NormQ { raw: any; subject: string; isNumerical: boolean }

const OPTS = ['A', 'B', 'C', 'D'] // internal values; displayed as 1–4

function canonicalSubject(s: string | undefined): string {
  if (!s) return 'General'
  const t = s.trim()
  if (/^math/i.test(t)) return 'Mathematics'
  return t
}
function detectNumerical(q: any): boolean {
  if (q.question_type === 'numerical' || q.type === 'numerical') return true
  const hasOptions = (q.options_en && Object.keys(q.options_en).length) ||
    (q.options && Object.keys(q.options).length)
  if (!hasOptions && q.correct != null && /^-?\d/.test(String(q.correct).trim())) return true
  return false
}

export default function NTAExamInterface({ skin }: { skin: ExamSkin }) {
  const router = useRouter()

  const [questions, setQuestions] = useState<NormQ[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [current, setCurrent] = useState(0)
  const [paletteOpen, setPaletteOpen] = useState(true)

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [status, setStatus] = useState<Record<number, Status>>({})
  const [draft, setDraft] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Report-an-issue state
  const [reportOpen, setReportOpen] = useState(false)
  const [reportType, setReportType] = useState<string | null>(null)
  const [reportNote, setReportNote] = useState('')
  const [reportStatus, setReportStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // ── Load questions + instruction preference ──
  useEffect(() => {
    let qs: any[] = []
    try { const raw = localStorage.getItem('questions'); if (raw && raw !== 'undefined') qs = JSON.parse(raw) } catch { }
    const normalized: NormQ[] = (qs || []).map(q => ({ raw: q, subject: canonicalSubject(q.subject), isNumerical: detectNumerical(q) }))
    const order = skin.subjectOrder.map(canonicalSubject)
    const rank = (s: string) => { const i = order.indexOf(s); return i === -1 ? order.length + 1 : i }
    const seen: string[] = []
    normalized.forEach(n => { if (!seen.includes(n.subject)) seen.push(n.subject) })
    normalized.sort((a, b) => { const ra = rank(a.subject), rb = rank(b.subject); return ra !== rb ? ra - rb : seen.indexOf(a.subject) - seen.indexOf(b.subject) })
    setQuestions(normalized)
    const dur = Math.min(180, Math.max(10, Math.round((normalized.length || 1) * skin.minutesPerQuestion)))
    setTimeLeft(dur * 60)
    const skip = typeof window !== 'undefined' && localStorage.getItem('nta_skip_instructions') === 'yes'
    setShowInstructions(!skip)
    setLoaded(true)
  }, [skin])

  const sections = useMemo(() => {
    const out: { subject: string; start: number; end: number }[] = []
    let i = 0
    while (i < questions.length) {
      const subj = questions[i].subject; const start = i
      while (i < questions.length && questions[i].subject === subj) i++
      out.push({ subject: subj, start, end: i - 1 })
    }
    return out
  }, [questions])
  const currentSection = sections.find(s => current >= s.start && current <= s.end)

  // mark visited
  useEffect(() => {
    if (!loaded || isSubmitted || showInstructions) return
    setStatus(prev => prev[current] ? prev : { ...prev, [current]: 'notAnswered' })
    setDraft(answers[current] ?? '')
  }, [current, loaded, isSubmitted, showInstructions]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true); setShowResult(true); setShowSubmitConfirm(false); setCurrent(0)
  }, [])

  useEffect(() => {
    if (timeLeft === null || isSubmitted || showInstructions) return
    if (timeLeft <= 0) { handleSubmit(); return }
    const t = setInterval(() => setTimeLeft(s => (s ?? 1) - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, isSubmitted, showInstructions, handleSubmit])

  function fmt(s: number) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  function saveAndNext(markReview = false) {
    setAnswers(prev => { const n = { ...prev }; if (draft !== '') n[current] = draft; else delete n[current]; return n })
    setStatus(prev => ({ ...prev, [current]: draft !== '' ? (markReview ? 'answeredMarked' : 'answered') : (markReview ? 'marked' : 'notAnswered') }))
    goNext()
  }
  function markForReviewAndNext() {
    setAnswers(prev => { const n = { ...prev }; if (draft !== '') n[current] = draft; return n })
    setStatus(prev => ({ ...prev, [current]: draft !== '' ? 'answeredMarked' : 'marked' }))
    goNext()
  }
  function clearResponse() {
    setDraft(''); setAnswers(prev => { const n = { ...prev }; delete n[current]; return n })
    setStatus(prev => ({ ...prev, [current]: 'notAnswered' }))
  }
  function goNext() { setCurrent(c => Math.min(questions.length - 1, c + 1)) }
  function goPrev() { setCurrent(c => Math.max(0, c - 1)) }

  // Reset the report dialog on question change
  useEffect(() => { setReportOpen(false); setReportType(null); setReportNote(''); setReportStatus('idle') }, [current])

  async function submitReport() {
    if (!reportType) return
    const cq = questions[current]?.raw
    setReportStatus('sending')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: cq?.id, exam_type: skin.name, subject: cq?.subject,
          issue_type: reportType, note: reportNote,
          question_text: cq?.text_en || cq?.text || '',
        }),
      })
      setReportStatus(res.ok ? 'sent' : 'error')
    } catch { setReportStatus('error') }
  }

  function keypad(val: string) {
    if (isSubmitted) return
    if (val === 'back') return setDraft(d => d.slice(0, -1))
    if (val === 'clr') return setDraft('')
    if (val === '.') return setDraft(d => (d.includes('.') ? d : d + '.'))
    if (val === '-') return setDraft(d => (d.startsWith('-') ? d.slice(1) : '-' + d))
    setDraft(d => d + val)
  }

  const result = useMemo(() => {
    let correct = 0, incorrect = 0, attempted = 0, marks = 0
    const perSection: Record<string, { correct: number; incorrect: number; marks: number }> = {}
    questions.forEach((nq, i) => {
      const st = status[i]; const ans = answers[i]
      if (!(st === 'answered' || st === 'answeredMarked') || ans == null || ans === '') return
      attempted++
      let right: boolean
      if (nq.isNumerical) { const a = parseFloat(ans), b = parseFloat(String(nq.raw.correct)); right = !isNaN(a) && !isNaN(b) && Math.abs(a - b) < 0.01 }
      else right = String(ans).toUpperCase() === String(nq.raw.correct).toUpperCase()
      const sec = (perSection[nq.subject] ||= { correct: 0, incorrect: 0, marks: 0 })
      if (right) { correct++; marks += skin.marking.correct; sec.correct++; sec.marks += skin.marking.correct }
      else { incorrect++; const neg = nq.isNumerical ? skin.marking.numericalWrong : skin.marking.wrong; marks += neg; sec.incorrect++; sec.marks += neg }
    })
    return { correct, incorrect, attempted, marks, maxMarks: questions.length * skin.marking.correct, perSection, unattempted: questions.length - attempted }
  }, [questions, answers, status, skin])

  const counts = useMemo(() => {
    const c = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, answeredMarked: 0 }
    questions.forEach((_, i) => { c[(status[i] || 'notVisited') as Status]++ })
    return c
  }, [questions, status])

  // persist result to the saved test + score tracker, once
  const recordedRef = useRef(false)
  useEffect(() => {
    if (!isSubmitted || recordedRef.current) return
    recordedRef.current = true
    const id = typeof window !== 'undefined' ? localStorage.getItem('current_test_id') : null
    const name = (typeof window !== 'undefined' && localStorage.getItem('current_test_name')) || `${skin.name} Test`
    if (id) fetch('/api/tests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, result: { marks: result.marks, maxMarks: result.maxMarks, correct: result.correct, incorrect: result.incorrect, attempted: result.attempted, at: Date.now() } }) }).catch(() => { })
    fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test_name: name, exam_type: skin.name, marks: result.marks, max_marks: result.maxMarks, positive_marks: result.correct * skin.marking.correct, negative_marks: result.incorrect * Math.abs(skin.marking.wrong), source: 'prepify' }) }).catch(() => { })
  }, [isSubmitted, result, skin])

  if (!loaded) return <div className="min-h-screen bg-[#eef1f5] grid place-items-center"><div className="text-slate-500 text-sm animate-pulse">Loading…</div></div>

  if (showInstructions) return (
    <NtaInstructions skin={skin} onProceed={(dontShowAgain) => {
      if (dontShowAgain) { try { localStorage.setItem('nta_skip_instructions', 'yes') } catch { } }
      setShowInstructions(false)
    }} />
  )

  if (!questions.length) return (
    <div className="min-h-screen bg-[#eef1f5] grid place-items-center text-slate-600 text-center px-6">
      <div><p className="text-sm mb-3">No questions loaded. Upload a paper first.</p>
        <button onClick={() => router.push('/upload')} className="text-blue-700 underline text-sm">Go to Upload</button></div>
    </div>
  )

  const nq = questions[current]
  const q = nq.raw
  const text = q.text_en || q.text || ''
  const opts = q.options_en || q.options || {}
  const diagram = q.diagram_url || q.diagramBase64
  // "Image-first" questions (match-the-column / passages / multi-figure) carry their
  // whole body as one image. Detect via the explicit flag OR the tell-tale shape of a
  // saved row: empty text + a diagram. Render the image big and skip the (garbled) text.
  const imageFirst = !!(diagram && (q.fullImageMode || !text.trim()))
  const lowTime = timeLeft !== null && timeLeft < 300
  const negMark = nq.isNumerical ? skin.marking.numericalWrong : skin.marking.wrong

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-800 flex flex-col" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* ══ Candidate header ══ */}
      <header className="bg-white border-b border-slate-300">
        <div className="flex items-stretch justify-between">
          <div className="flex items-center gap-3 px-3 md:px-5 py-2.5">
            <div className="w-12 h-12 rounded bg-slate-200 grid place-items-center text-slate-400 text-2xl shrink-0">👤</div>
            <div className="text-[11px] md:text-xs leading-5">
              <div><span className="text-slate-500">Candidate Name : </span><span className="text-orange-600 font-semibold">Candidate</span></div>
              <div><span className="text-slate-500">Exam Name : </span><span className="text-orange-600 font-semibold">{skin.fullName}</span></div>
              <div><span className="text-slate-500">Subject : </span><span className="text-orange-600 font-semibold">{currentSection?.subject || skin.name}</span></div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-slate-500">Remaining Time :</span>
                {timeLeft !== null && (
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-white tabular-nums ${lowTime ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}>{fmt(timeLeft)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 md:px-5">
            <div className="w-8 h-8 rounded bg-blue-700 text-white grid place-items-center font-bold text-sm">P</div>
            <span className="border border-slate-300 rounded px-3 py-1 bg-slate-50 text-slate-700 text-sm">English</span>
          </div>
        </div>
        {/* Section tabs */}
        <div className="flex overflow-x-auto border-t border-slate-200">
          {sections.map(sec => {
            const active = currentSection?.subject === sec.subject
            return (
              <button key={sec.subject + sec.start} onClick={() => setCurrent(sec.start)}
                className={`px-5 py-2 text-xs md:text-sm font-semibold whitespace-nowrap border-r border-slate-200 transition ${active ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                {sec.subject}
              </button>
            )
          })}
        </div>
      </header>

      {/* ══ Body ══ */}
      <div className="flex flex-1 min-h-0">
        {/* Question pane */}
        <main className="flex-1 min-w-0 flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
            <div className="font-bold text-slate-800 text-sm">Question {current + 1}:
              <span className="ml-3 font-normal text-slate-500 text-xs">{nq.isNumerical ? 'Numerical' : 'Multiple Choice (Single Correct)'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-green-700 font-semibold">Marks: +{skin.marking.correct}</span>
              <span className="text-red-600 font-semibold">{negMark}</span>
              <button onClick={() => setReportOpen(true)} title="Report a problem with this question"
                className="flex items-center gap-1 text-slate-400 hover:text-amber-600 transition">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Report
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-7 py-5">
            <div className="max-w-3xl">
              {!imageFirst && text.trim() && (
                <div className="text-[15px] md:text-base leading-relaxed text-slate-900 mb-5">{renderText(text)}</div>
              )}
              {diagram && (
                <div className="inline-block border border-slate-200 rounded bg-white p-1.5 mb-5">
                  <img
                    src={diagram}
                    alt={imageFirst ? 'Question' : 'Diagram'}
                    className={`max-w-full object-contain ${imageFirst ? 'max-h-[78vh]' : 'max-h-72'}`}
                  />
                </div>
              )}

              {!nq.isNumerical ? (
                <div>
                  <p className="text-slate-500 text-sm font-semibold mb-2">Options :</p>
                  <div className="space-y-2.5">
                    {OPTS.map((opt, idx) => {
                      const optText = opts?.[opt] || opts?.[opt.toLowerCase()] || ''
                      const selected = (isSubmitted ? answers[current] : draft) === opt
                      const isCorrect = String(q.correct).toUpperCase() === opt
                      let cls = 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/40'
                      if (isSubmitted) { if (isCorrect) cls = 'border-green-500 bg-green-50'; else if (selected) cls = 'border-red-400 bg-red-50'; else cls = 'border-slate-200 opacity-70' }
                      else if (selected) cls = 'border-blue-600 bg-blue-50'
                      return (
                        <label key={opt} className={`flex items-start gap-3 px-4 py-3 rounded border transition ${cls} ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}>
                          <input type="radio" name={`q-${current}`} checked={selected} disabled={isSubmitted} onChange={() => setDraft(opt)} className="mt-1 accent-blue-700" />
                          <span className="font-semibold text-slate-600 shrink-0">{idx + 1}.</span>
                          <span className="flex-1 text-sm text-slate-800 leading-snug">{renderText(optText)}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="max-w-xs">
                  <p className="text-slate-500 text-sm font-semibold mb-2">Your Answer :</p>
                  <div className="border-2 border-slate-300 rounded h-12 px-3 grid items-center text-lg font-mono bg-slate-50 mb-3">
                    {(isSubmitted ? answers[current] : draft) || <span className="text-slate-400 text-sm">Enter your answer</span>}
                  </div>
                  {!isSubmitted && (
                    <div className="grid grid-cols-3 gap-1.5">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '-'].map(k => (
                        <button key={k} onClick={() => keypad(k)} className="h-10 rounded border border-slate-300 bg-white hover:bg-slate-100 font-mono text-base font-semibold text-slate-700 transition">{k}</button>
                      ))}
                      <button onClick={() => keypad('back')} className="h-10 rounded border border-slate-300 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-600">⌫</button>
                      <button onClick={() => keypad('clr')} className="h-10 col-span-2 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600">Clear</button>
                    </div>
                  )}
                  {isSubmitted && <p className="text-sm mt-2">Correct answer: <span className="font-mono font-bold text-green-700">{String(q.correct)}</span></p>}
                </div>
              )}

              {isSubmitted && q.explanation && (
                <div className="mt-6 border-l-4 border-blue-500 bg-blue-50/50 pl-4 py-3 rounded-r max-w-3xl">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1">Solution</div>
                  <div className="text-sm text-slate-700 leading-relaxed">{renderText(q.explanation)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons (NTA exact) */}
          <div className="border-t border-slate-300 bg-slate-100 px-2 md:px-3 py-2.5 flex flex-wrap items-center gap-2">
            {!isSubmitted ? (
              <>
                <button onClick={() => markForReviewAndNext()} className="text-xs font-bold px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 uppercase transition">Mark for Review &amp; Next</button>
                <button onClick={clearResponse} className="text-xs font-bold px-3 py-2 rounded border border-slate-400 text-slate-600 hover:bg-slate-200 uppercase transition">Clear</button>
                <button onClick={() => saveAndNext(true)} className="text-xs font-bold px-3 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 uppercase transition hidden sm:inline-block">Save &amp; Mark for Review</button>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={goPrev} disabled={current === 0} className="text-xs font-bold px-3 py-2 rounded border border-slate-400 text-slate-600 hover:bg-slate-200 disabled:opacity-40 uppercase transition">&laquo; Back</button>
                  <button onClick={() => saveAndNext(false)} className="text-sm font-bold px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700 uppercase transition">Save &amp; Next</button>
                  {/* Submit lives in the action row on desktop; on mobile the green Submit Test bar handles it */}
                  <button onClick={() => setShowSubmitConfirm(true)} className="hidden md:inline-block text-sm font-bold px-5 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 uppercase transition">Submit</button>
                </div>
              </>
            ) : (
              <>
                <button onClick={goPrev} disabled={current === 0} className="text-xs font-bold px-3 py-2 rounded border border-slate-400 text-slate-600 hover:bg-slate-200 disabled:opacity-40 uppercase transition">&laquo; Prev</button>
                <button onClick={goNext} disabled={current === questions.length - 1} className="text-xs font-bold px-3 py-2 rounded border border-slate-400 text-slate-600 hover:bg-slate-200 disabled:opacity-40 uppercase transition">Next &raquo;</button>
                <button onClick={() => setShowResult(true)} className="ml-auto text-xs font-bold px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 uppercase transition">View Result</button>
                <span className="text-sm font-bold text-slate-700">{result.marks} / {result.maxMarks}</span>
              </>
            )}
          </div>
        </main>

        {/* Collapse handle */}
        <button onClick={() => setPaletteOpen(p => !p)} className="hidden lg:grid place-items-center w-6 bg-slate-300 hover:bg-slate-400 text-slate-700 text-sm font-bold transition" title={paletteOpen ? 'Hide palette' : 'Show palette'}>
          {paletteOpen ? '›' : '‹'}
        </button>

        {/* Palette panel */}
        {paletteOpen && (
          <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border-l border-slate-200">
            <div className="m-3 p-3 border border-dashed border-slate-300 rounded grid grid-cols-2 gap-y-2 text-[11px]">
              <Legend kind="notVisited" label="Not Visited" n={counts.notVisited} />
              <Legend kind="notAnswered" label="Not Answered" n={counts.notAnswered} />
              <Legend kind="answered" label="Answered" n={counts.answered} />
              <Legend kind="marked" label="Marked for Review" n={counts.marked} />
              <div className="col-span-2"><Legend kind="answeredMarked" label="Answered & Marked (will be evaluated)" n={counts.answeredMarked} /></div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {sections.map(sec => (
                <div key={sec.subject + sec.start} className="mb-4">
                  <div className="text-[11px] font-bold text-white uppercase tracking-wide mb-2 bg-blue-700 px-2 py-1 rounded-sm">{sec.subject}</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: sec.end - sec.start + 1 }, (_, k) => {
                      const idx = sec.start + k
                      return <Cell key={idx} n={idx + 1} status={status[idx] || 'notVisited'} active={idx === current} onClick={() => setCurrent(idx)} />
                    })}
                  </div>
                </div>
              ))}
            </div>
            {!isSubmitted && (
              <div className="px-3 py-3 border-t border-slate-200">
                <button onClick={() => setShowSubmitConfirm(true)} className="w-full bg-green-600 text-white font-bold py-2.5 rounded hover:bg-green-700 text-sm uppercase transition">Submit Test</button>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* mobile palette + submit */}
      <div className="lg:hidden border-t border-slate-300 bg-white px-3 py-2 flex items-center gap-2 overflow-x-auto">
        {questions.map((_, i) => <Cell key={i} n={i + 1} status={status[i] || 'notVisited'} active={i === current} onClick={() => setCurrent(i)} />)}
      </div>
      {!isSubmitted && <div className="lg:hidden border-t border-slate-300 bg-slate-100 px-3 py-2"><button onClick={() => setShowSubmitConfirm(true)} className="w-full bg-green-600 text-white font-bold py-2.5 rounded text-sm uppercase">Submit Test</button></div>}

      {/* Submit confirm */}
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
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 border border-slate-300 text-slate-600 font-semibold py-2 rounded hover:bg-slate-50 text-sm">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-blue-700 text-white font-bold py-2 rounded hover:bg-blue-800 text-sm">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Report issue modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4" onClick={e => { if (e.target === e.currentTarget) setReportOpen(false) }}>
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl">
            {reportStatus === 'sent' ? (
              <div className="text-center py-3">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-semibold text-slate-800 mb-1">Thanks for reporting!</p>
                <p className="text-slate-500 text-sm mb-5">We&apos;ll review this question and fix it.</p>
                <button onClick={() => setReportOpen(false)} className="w-full bg-blue-700 text-white font-bold py-2.5 rounded text-sm hover:bg-blue-800 transition">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm">Report a problem · Q{current + 1}</h3>
                  <button onClick={() => setReportOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg leading-none">×</button>
                </div>
                <p className="text-slate-500 text-xs mb-4">What&apos;s wrong with this question?</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {([
                    { value: 'diagram_missing', label: 'Diagram missing' },
                    { value: 'wrong_answer', label: 'Wrong answer' },
                    { value: 'unclear', label: 'Unclear / typo' },
                    { value: 'options', label: 'Options issue' },
                    { value: 'other', label: 'Other' },
                  ]).map(o => (
                    <button key={o.value} onClick={() => setReportType(o.value)}
                      className={`py-2 px-2.5 rounded border text-xs font-medium transition ${reportType === o.value ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
                <textarea value={reportNote} onChange={e => setReportNote(e.target.value)} placeholder="Add a detail (optional)…" maxLength={500}
                  className="w-full h-16 resize-none border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 transition mb-2" />
                {reportStatus === 'error' && <p className="text-red-500 text-xs mb-2">Couldn&apos;t send — please try again.</p>}
                <div className="flex gap-2">
                  <button onClick={() => setReportOpen(false)} className="flex-1 border border-slate-300 text-slate-600 font-medium py-2.5 rounded text-sm hover:bg-slate-50 transition">Cancel</button>
                  <button onClick={submitReport} disabled={!reportType || reportStatus === 'sending'}
                    className="flex-1 bg-amber-500 text-white font-bold py-2.5 rounded text-sm hover:bg-amber-600 disabled:opacity-40 transition">
                    {reportStatus === 'sending' ? 'Sending…' : 'Submit report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {isSubmitted && showResult && (
        <div className="fixed inset-0 z-40 bg-black/30 grid place-items-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{skin.name} · Result</div>
              <div className="text-4xl font-black text-slate-800 mt-1">{result.marks}<span className="text-lg text-slate-400 font-normal"> / {result.maxMarks}</span></div>
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
            <button onClick={() => { setShowResult(false); setCurrent(0) }} className="w-full bg-blue-700 text-white font-bold py-2.5 rounded hover:bg-blue-800 text-sm mb-2">See Analysis</button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => router.push('/library')} className="border border-slate-300 text-slate-600 font-semibold py-2.5 rounded hover:bg-slate-50 text-sm">Go to Library</button>
              <button onClick={() => router.push('/upload')} className="border border-slate-300 text-slate-600 font-semibold py-2.5 rounded hover:bg-slate-50 text-sm">Practice More</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── palette helpers ──
function shapeStyle(s: Status): React.CSSProperties {
  switch (s) {
    case 'answered': return { background: '#22a447', color: '#fff', clipPath: 'polygon(50% 0,100% 28%,100% 100%,0 100%,0 28%)' }
    case 'notAnswered': return { background: '#e0413b', color: '#fff', clipPath: 'polygon(0 0,100% 0,100% 72%,50% 100%,0 72%)' }
    case 'marked': return { background: '#7b3fb5', color: '#fff', borderRadius: '9999px' }
    case 'answeredMarked': return { background: '#7b3fb5', color: '#fff', borderRadius: '9999px' }
    default: return { background: '#e9edf2', color: '#475569', border: '1px solid #c3ccd6', borderRadius: 3 }
  }
}
function Cell({ n, status, active, onClick }: { n: number; status: Status; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative w-9 h-9 text-[11px] font-bold grid place-items-center transition ${active ? 'ring-2 ring-blue-600 ring-offset-1' : ''}`} style={shapeStyle(status)}>
      {String(n).padStart(2, '0')}
      {status === 'answeredMarked' && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border border-white grid place-items-center text-[7px] text-white">✓</span>}
    </button>
  )
}
function Legend({ kind, label, n }: { kind: Status; label: string; n: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative w-6 h-6 grid place-items-center text-[9px] font-bold shrink-0" style={shapeStyle(kind)}>
        {n}{kind === 'answeredMarked' && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-white" />}
      </span>
      <span className="text-slate-600 leading-tight">{label}</span>
    </div>
  )
}
function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">{label}</span><span className={`font-bold ${color}`}>{value}</span></div>
}
function ResultBox({ n, label, color }: { n: number; label: string; color: string }) {
  return <div className={`rounded-lg py-3 ${color}`}><div className="text-2xl font-black">{n}</div><div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</div></div>
}
