'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

function renderText(text: string) {
  if (!text) return null
  const sanitized = text.replace(/–/g, '-').replace(/—/g, '-').replace(/−/g, '-')
  const parts = sanitized.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g)
  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      try { return <BlockMath key={i} math={part.slice(2, -2)} /> } catch { return <span key={i}>{part}</span> }
    } else if (part.startsWith('$') && part.endsWith('$')) {
      try { return <InlineMath key={i} math={part.slice(1, -1)} /> } catch { return <span key={i}>{part}</span> }
    }
    return <span key={i}>{part}</span>
  })
}

const CHEER_EN = [
  "Excellent work! Every attempt makes you stronger. 💪",
  "You're on the right track. Keep going! 🚀",
  "Practice makes perfect — you're getting there! ⭐",
  "Great effort! Consistency is the key to success. 🏆",
]
const CHEER_HI = [
  "शानदार प्रयास! हर कोशिश आपको बेहतर बनाती है। 💪",
  "आप सही रास्ते पर हैं। आगे बढ़ते रहें! 🚀",
  "अभ्यास से ही सफलता मिलती है — आप बेहतरीन कर रहे हैं! ⭐",
  "बहुत अच्छा! निरंतरता ही सफलता की कुंजी है। 🏆",
]

function Confetti() {
  const colors = ['#10b981','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#f97316']
  const pieces = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${0.8 + Math.random() * 0.8}s`,
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
  }))

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotate})`,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

interface Question {
  id: number
  text_en?: string
  text_hi?: string
  options_en?: Record<string, string>
  options_hi?: Record<string, string>
  options?: Record<string, string>
  correct_answer: string
  explanation?: string
  subject?: string
}

interface Result {
  questions: Question[]
  answers: Record<number, string>
  examType: string
  subject: string
  timerMinutes?: number
  language?: 'en' | 'hi'
  savedAt: number
}

async function translateToHindi(text: string): Promise<string> {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`
  )
  const data = await res.json()
  return data?.responseData?.translatedText || text
}

// Shows a DB explanation, auto-translating to Hindi when language='hi'
function DBExplanation({ text, language }: { text: string; language: 'en' | 'hi' }) {
  const [displayed, setDisplayed] = useState(text)
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    if (language !== 'hi') { setDisplayed(text); return }
    setTranslating(true)
    translateToHindi(text)
      .then(t => setDisplayed(t))
      .finally(() => setTranslating(false))
  }, [text, language])

  return (
    <div className="pl-4 pr-3 py-3 border-l-2 border-emerald-500 bg-slate-900/60 rounded-r-xl">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          {language === 'hi' ? 'व्याख्या' : 'Explanation'}
        </div>
        {language === 'hi' && (
          <span className="text-[9px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">
            {translating ? 'अनुवाद हो रहा है…' : 'अनुवादित'}
          </span>
        )}
      </div>
      <p className={`text-slate-400 text-sm leading-relaxed transition-opacity ${translating ? 'opacity-40' : ''}`}>
        {displayed}
      </p>
    </div>
  )
}

function AIExplainButton({ question, userAnswer, language }: { question: Question; userAnswer: string | undefined; language: 'en' | 'hi' }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [explanation, setExplanation] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function fetchExplain() {
    setState('loading')
    const optLines = Object.entries(question.options_en || question.options || {})
      .map(([k, v]) => `${k}. ${v}`).join('\n')
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.text_en || question.text_hi || '',
          optionsText: optLines,
          correctAnswer: question.correct_answer,
          userAnswer: userAnswer || 'Not attempted',
          subject: question.subject,
          language,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error || 'Failed'); setState('error'); return }
      setExplanation(data.explanation)
      setState('done')
    } catch {
      setErrorMsg('Network error'); setState('error')
    }
  }

  if (state === 'idle') return (
    <button onClick={fetchExplain}
      className="mt-3 flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition">
      <span>✦</span> {language === 'hi' ? 'AI से समझें' : 'Explain with AI'}
    </button>
  )
  if (state === 'loading') return (
    <div className="mt-3 text-xs text-slate-500 animate-pulse">
      {language === 'hi' ? 'AI सोच रहा है…' : 'AI is thinking...'}
    </div>
  )
  if (state === 'error') return <div className="mt-3 text-xs text-red-400">{errorMsg}</div>

  return (
    <div className="mt-3 bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">✦ AI Generated</span>
        <span className="text-[9px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">Gemini 2.5 Flash</span>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{explanation}</p>
    </div>
  )
}

function QuestionCard({ q, i, userAns, language }: { q: Question; i: number; userAns: string | undefined; language: 'en' | 'hi' }) {
  const [expanded, setExpanded] = useState(false)
  const isCorrect = userAns === q.correct_answer
  const isSkipped = userAns === undefined

  const enText = q.text_en
  const hiText = q.text_hi
  const enOpts = q.options_en || q.options
  const hiOpts = q.options_hi

  return (
    <div className={`border rounded-2xl overflow-hidden ${isCorrect ? 'border-emerald-500/30' : isSkipped ? 'border-slate-700' : 'border-red-500/30'}`}>
      <button onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-white/[0.02] transition">
        <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : isSkipped ? 'bg-slate-700 text-slate-400' : 'bg-red-500 text-white'}`}>
          {isCorrect ? '✓' : isSkipped ? '–' : '✗'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-slate-600 mb-1">Q{i + 1} · {q.subject || 'General'}</div>
          <div className="text-sm text-slate-300 line-clamp-2">{enText || hiText || ''}</div>
          {hiText && hiText !== enText && (
            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{hiText}</div>
          )}
        </div>
        <span className="text-slate-600 text-xs shrink-0 mt-1">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-5 pt-1 bg-slate-900/40 border-t border-white/[0.04] space-y-5">

          {/* Bilingual question text */}
          {enText && (
            <div>
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">English</div>
              <div className="text-sm text-slate-200 leading-relaxed">{renderText(enText)}</div>
            </div>
          )}
          {hiText && (
            <div>
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">हिन्दी</div>
              <div className="text-sm text-slate-300 leading-relaxed">{renderText(hiText)}</div>
            </div>
          )}

          {/* Bilingual options */}
          <div className="space-y-2">
            {Object.keys(enOpts || hiOpts || {}).map(key => {
              const isOpt = key === q.correct_answer
              const isUser = key === userAns
              const enVal = enOpts?.[key]
              const hiVal = hiOpts?.[key]
              return (
                <div key={key} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${isOpt ? 'border-emerald-500/40 bg-emerald-500/10' : isUser && !isOpt ? 'border-red-500/40 bg-red-500/10' : 'border-slate-800'}`}>
                  <span className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${isOpt ? 'border-emerald-500 bg-emerald-500 text-white' : isUser ? 'border-red-500 bg-red-500 text-white' : 'border-slate-700 text-slate-500'}`}>
                    {isOpt ? '✓' : isUser ? '✗' : key}
                  </span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    {enVal && <div className={`text-sm leading-snug ${isOpt ? 'text-emerald-300' : isUser && !isOpt ? 'text-red-400' : 'text-slate-400'}`}>{renderText(enVal)}</div>}
                    {hiVal && hiVal !== enVal && <div className={`text-xs leading-snug ${isOpt ? 'text-emerald-500/80' : isUser && !isOpt ? 'text-red-500/70' : 'text-slate-600'}`}>{renderText(hiVal)}</div>}
                  </div>
                  <div className="shrink-0 space-y-0.5 text-right">
                    {isOpt && <div className="text-[10px] text-emerald-500 font-bold">Correct</div>}
                    {isUser && !isOpt && <div className="text-[10px] text-red-400 font-bold">Your answer</div>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Explanation: DB first (auto-translated), AI fallback */}
          {q.explanation ? (
            <DBExplanation text={q.explanation} language={language} />
          ) : (
            <AIExplainButton question={q} userAnswer={userAns} language={language} />
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<Result | null>(null)
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'skipped'>('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const cheerRef = useRef('')

  useEffect(() => {
    const raw = localStorage.getItem('prepify_last_result')
    if (!raw) return
    try {
      const parsed: Result = JSON.parse(raw)
      setResult(parsed)
      // Trigger confetti & pick cheer message
      const lang = parsed.language || 'en'
      const pool = lang === 'hi' ? CHEER_HI : CHEER_EN
      cheerRef.current = pool[Math.floor(Math.random() * pool.length)]
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2500)
    } catch { /* malformed */ }
  }, [])

  if (!result) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400 text-sm">
      <p>No result found. Complete an exam first.</p>
      <button onClick={() => router.push('/')} className="text-emerald-400 underline">Go home</button>
    </div>
  )

  const { questions, answers, examType, language } = result
  const correct = questions.filter((q, i) => answers[i] === q.correct_answer).length
  const wrong = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct_answer).length
  const skipped = questions.filter((_, i) => answers[i] === undefined).length
  const pct = Math.round((correct / questions.length) * 100)

  const filtered = questions
    .map((q, i) => ({ q, i, userAns: answers[i] }))
    .filter(({ q, i, userAns }) => {
      if (filter === 'correct') return userAns === q.correct_answer
      if (filter === 'wrong') return userAns !== undefined && userAns !== q.correct_answer
      if (filter === 'skipped') return userAns === undefined
      return true
    })

  const subjectMap: Record<string, { correct: number; total: number }> = {}
  questions.forEach((q, i) => {
    const s = q.subject || 'General'
    if (!subjectMap[s]) subjectMap[s] = { correct: 0, total: 0 }
    subjectMap[s].total++
    if (answers[i] === q.correct_answer) subjectMap[s].correct++
  })
  const weakSubjects = Object.entries(subjectMap)
    .filter(([, v]) => v.correct / v.total < 0.5)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))

  const scoreColor = pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {showConfetti && <Confetti />}

      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-300 text-sm transition">← Back</button>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{examType} · Results</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* Cheer banner */}
        {cheerRef.current && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4 text-center">
            <p className="text-sm text-emerald-300 font-medium">{cheerRef.current}</p>
          </div>
        )}

        {/* Score card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6">
          {/* Score + label */}
          <div className="flex flex-col items-center mb-5">
            <div className={`text-7xl font-mono font-black leading-none ${scoreColor}`}>
              {pct}<span className="text-3xl text-slate-500">%</span>
            </div>
            <div className="text-slate-400 text-sm mt-2">
              {pct >= 70 ? (language === 'hi' ? 'बहुत बढ़िया!' : 'Great job!') : pct >= 40 ? (language === 'hi' ? 'और अभ्यास करें' : 'Keep practising') : (language === 'hi' ? 'और मेहनत चाहिए' : 'Needs work')}
            </div>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl py-3 px-2 flex flex-col items-center gap-1">
              <span className="text-emerald-400 text-lg leading-none">✓</span>
              <div className="text-2xl font-mono font-black text-emerald-400 leading-none">{correct}</div>
              <div className="text-[10px] text-emerald-500/70 uppercase tracking-wider font-semibold">{language === 'hi' ? 'सही' : 'Correct'}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl py-3 px-2 flex flex-col items-center gap-1">
              <span className="text-red-400 text-lg leading-none">✗</span>
              <div className="text-2xl font-mono font-black text-red-400 leading-none">{wrong}</div>
              <div className="text-[10px] text-red-500/70 uppercase tracking-wider font-semibold">{language === 'hi' ? 'गलत' : 'Wrong'}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl py-3 px-2 flex flex-col items-center gap-1">
              <span className="text-slate-400 text-lg leading-none">–</span>
              <div className="text-2xl font-mono font-black text-slate-400 leading-none">{skipped}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{language === 'hi' ? 'छोड़ा' : 'Skipped'}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>

          {Object.keys(subjectMap).length > 1 && (
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                {language === 'hi' ? 'विषय अनुसार प्रदर्शन' : 'Subject Breakdown'}
              </p>
              {Object.entries(subjectMap).map(([s, v]) => {
                const sp = Math.round((v.correct / v.total) * 100)
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-40 truncate shrink-0">{s}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${sp >= 70 ? 'bg-emerald-500' : sp >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${sp}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-400 shrink-0">{v.correct}/{v.total}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {weakSubjects.length > 0 && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3">
              {language === 'hi' ? 'सुधार की आवश्यकता' : 'Areas to Improve'}
            </p>
            <ul className="space-y-1.5">
              {weakSubjects.map(([s, v]) => (
                <li key={s} className="text-sm text-slate-300 flex items-center gap-2">
                  <span className="text-yellow-500">→</span>
                  <span><span className="font-semibold">{s}</span> — {v.correct}/{v.total} correct ({Math.round((v.correct / v.total) * 100)}%)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Question review */}
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['all', 'wrong', 'correct', 'skipped'] as const).map(f => {
              const labels = { all: language === 'hi' ? 'सभी' : 'All', wrong: language === 'hi' ? 'गलत' : 'Wrong', correct: language === 'hi' ? 'सही' : 'Correct', skipped: language === 'hi' ? 'छोड़े' : 'Skipped' }
              const counts = { all: questions.length, wrong, correct, skipped }
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === f ? 'bg-slate-700 text-white' : 'bg-slate-800/60 text-slate-500 hover:text-slate-300'}`}>
                  {labels[f]} ({counts[f]})
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {filtered.map(({ q, i, userAns }) => (
              <QuestionCard key={i} q={q} i={i} userAns={userAns} language={language || 'en'} />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button onClick={() => router.back()} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold py-3 rounded-xl text-sm transition">
            ← {language === 'hi' ? 'वापस' : 'Back to Exam'}
          </button>
          <button onClick={() => router.push('/')} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition">
            {language === 'hi' ? 'होम' : 'Home'}
          </button>
        </div>
      </div>
    </div>
  )
}
