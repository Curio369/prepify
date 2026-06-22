'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

function renderText(text: string) {
  if (!text) return null
  const sanitized = text
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\u2212/g, '-')
  const parts = sanitized.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g)
  return parts.map((part, i) => {
    if (part.startsWith('$$')) return <BlockMath key={i} math={part.slice(2, -2)} />
    if (part.startsWith('$')) return <InlineMath key={i} math={part.slice(1, -1)} />
    return <span key={i}>{part}</span>
  })
}

type QuestionStatus = 'unattempted' | 'attempted' | 'review' | 'attempted-review'

function ExamContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const examType = searchParams.get('exam_type')
  const subject = searchParams.get('subject')
  const limit = searchParams.get('limit') || '10'

  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [status, setStatus] = useState<Record<number, QuestionStatus>>({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [showPalette, setShowPalette] = useState(true)
  const [loading, setLoading] = useState(true)

  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    async function loadExamData() {
      if (examType && subject) {
        try {
          const res = await fetch(`/api/exams/generate?exam_type=${examType}&subject=${encodeURIComponent(subject)}&limit=${limit}`);
          const data = await res.json();
          setQuestions(data.questions || []);
        } catch (error) {
          console.error('Error fetching questions from database:', error);
        } finally {
          setLoading(false);
        }
      } else {
        const q = localStorage.getItem('questions')
        if (q && q !== 'undefined') {
          setQuestions(JSON.parse(q))
        }
        setLoading(false)
      }
    }
    loadExamData()
  }, [examType, subject, limit])

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true)
    localStorage.setItem('answers', JSON.stringify(answers))
  }, [answers])

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return }
    if (isSubmitted) return
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, handleSubmit, isSubmitted])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  function selectAnswer(opt: string) {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [current]: opt }))
    setStatus(prev => ({
      ...prev,
      [current]: prev[current] === 'review' ? 'attempted-review' : 'attempted'
    }))
  }

  function toggleReview() {
    if (isSubmitted) return;
    setStatus(prev => {
      const s = prev[current]
      if (s === 'attempted') return { ...prev, [current]: 'attempted-review' }
      if (s === 'attempted-review') return { ...prev, [current]: 'attempted' }
      if (s === 'review') return { ...prev, [current]: 'unattempted' }
      return { ...prev, [current]: 'review' }
    })
  }

  function getStatusColor(i: number) {
    const s = status[i] || 'unattempted'
    if (s === 'attempted') return 'bg-green-600 text-white'
    if (s === 'attempted-review') return 'bg-purple-600 text-white'
    if (s === 'review') return 'bg-orange-500 text-white'
    return 'bg-white/10 text-white/50'
  }

  function calculateScore() {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) score += 1;
    });
    return score;
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-emerald-500 text-sm font-bold font-mono animate-pulse">Initializing exam environment...</div>
    </div>
  )

  if (!questions.length) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/50 text-sm">No exam content loaded. Return to dashboard.</div>
    </div>
  )

  const q = questions[current]
  const attempted = Object.keys(answers).length
  const notAttempted = questions.length - attempted

  const questionText = language === 'en' ? (q.text_en || q.text) : (q.text_hi || q.text_en || q.text)
  const activeOptions = language === 'en' ? (q.options_en || q.options) : (q.options_hi || q.options_en || q.options)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-lg tracking-wider text-emerald-400">PREPIFY</span>
          <span className="text-white/30 text-xs font-mono">{examType ? `${examType.toUpperCase()} MODE` : 'SANDBOX MODE'}</span>
        </div>

        {(q.text_hi || q.options_hi) && (
          <button
            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-slate-300 font-medium px-3 py-1 rounded-full transition-all"
          >
            Translate: {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        )}

        <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPalette(p => !p)}
            className="text-white/40 hover:text-white text-xs transition-colors"
          >
            {showPalette ? 'Hide' : 'Show'} Palette
          </button>
          <button
            onClick={handleSubmit}
            className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-white/30 text-sm font-mono">Q{current + 1}</span>
              <span className="text-white/20 text-sm">of {questions.length}</span>
              {(status[current] === 'review' || status[current] === 'attempted-review') && (
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full">Marked for review</span>
              )}
            </div>

            <div className="text-white text-lg leading-relaxed mb-6">
              {renderText(questionText)}
            </div>

            {(q.diagram_url || q.diagramBase64) && (
              <div className="mb-6 border border-white/10 rounded-xl overflow-hidden inline-block bg-white p-2">
                <img
                  src={q.diagram_url || q.diagramBase64}
                  alt="Exam Diagram Vector"
                  className="max-w-full max-h-72 object-contain"
                />
              </div>
            )}

            <div className="space-y-3 mb-8">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optionRawText = activeOptions?.[opt] || activeOptions?.[opt.toLowerCase()] || activeOptions?.[`(${opt.toLowerCase()})`] || ''
                const isSelected = answers[current] === opt
                const isCorrect = q.correct_answer === opt

                let conditionalBorder = 'border-white/10 text-white/70 hover:border-white/30 hover:bg-white/5'

                if (isSubmitted) {
                  if (isCorrect) conditionalBorder = 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  else if (isSelected && !isCorrect) conditionalBorder = 'border-red-500 bg-red-500/10 text-red-400'
                } else if (isSelected) {
                  conditionalBorder = 'border-white bg-white/10 text-white'
                }

                return (
                  <button
                    key={opt}
                    disabled={isSubmitted}
                    onClick={() => selectAnswer(opt)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${conditionalBorder}`}
                  >
                    <span className={`font-mono text-sm mt-0.5 shrink-0 ${isSelected ? 'text-white' : 'text-white/30'}`}>{opt}.</span>
                    <span>{renderText(optionRawText)}</span>
                  </button>
                )
              })}
            </div>

            {isSubmitted && q.explanation && (
              <div className="bg-zinc-900 border border-emerald-500/20 rounded-xl p-5 mb-8">
                <h4 className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  ✨ Instant AI Explanation
                </h4>
                <div className="text-zinc-300 text-sm leading-relaxed">{renderText(q.explanation)}</div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setCurrent(c => c - 1)}
                disabled={current === 0}
                className="px-5 py-2.5 rounded-full border border-white/20 text-sm text-white/70 hover:text-white hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              <button
                onClick={toggleReview}
                disabled={isSubmitted}
                className="px-5 py-2.5 rounded-full border border-orange-500/40 text-orange-400 text-sm hover:bg-orange-500/10 transition-all disabled:opacity-20"
              >
                Mark for Review
              </button>
              <button
                onClick={() => {
                  if (!isSubmitted && answers[current]) {
                    setAnswers(prev => { const n = { ...prev }; delete n[current]; return n })
                    setStatus(prev => ({ ...prev, [current]: 'unattempted' }))
                  }
                }}
                disabled={isSubmitted}
                className="px-5 py-2.5 rounded-full border border-white/10 text-white/40 text-sm hover:text-white/70 transition-all disabled:opacity-20"
              >
                Clear
              </button>
              <button
                onClick={() => setCurrent(c => c + 1)}
                disabled={current === questions.length - 1}
                className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all ml-auto"
              >
                Next →
              </button>
            </div>

            {isSubmitted && (
              <div className="mt-8 border border-zinc-800 bg-zinc-900/50 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-emerald-400 mb-1">Performance Report Generated</h3>
                <p className="text-sm text-zinc-400">Review your metrics or select an alternate configuration.</p>
                <div className="text-3xl font-mono font-black mt-4 text-white">
                  {calculateScore()} <span className="text-lg text-zinc-600">/ {questions.length} Correct</span>
                </div>
                <button
                  onClick={() => router.push('/ctet')}
                  className="mt-4 text-xs font-semibold bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-full hover:bg-zinc-700 transition"
                >
                  Exit Exam Space
                </button>
              </div>
            )}
          </div>
        </div>

        {showPalette && (
          <div className="w-64 border-l border-white/10 p-4 overflow-y-auto shrink-0 bg-zinc-950 flex flex-col justify-between">
            <div>
              <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">Question Palette</p>
              <div className="space-y-2 mb-4 text-xs text-white/40">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-600" />Answered</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-600" />Answered + Review</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-500" />Marked for Review</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white/10" />Not Attempted</div>
              </div>
              <div className="grid grid-cols-5 gap-1.5 mb-6">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`aspect-square rounded text-xs font-mono transition-all ${getStatusColor(i)} ${
                      current === i ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-white/50">
                  <span>Answered</span><span className="text-green-400 font-bold font-mono">{attempted}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Not Answered</span><span className="text-white/40 font-mono">{notAttempted}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Total Base</span><span className="font-mono">{questions.length}</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitted}
                className="w-full py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-20"
              >
                {isSubmitted ? 'Exam Submitted' : 'Submit Complete Exam'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Exam() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-500 text-sm font-bold font-mono animate-pulse">Initializing exam environment...</div>
      </div>
    }>
      <ExamContent />
    </Suspense>
  )
}