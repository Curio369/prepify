'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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

export default function Exam() {
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [status, setStatus] = useState<Record<number, QuestionStatus>>({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [showPalette, setShowPalette] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const q = localStorage.getItem('questions')
    if (q && q !== 'undefined') setQuestions(JSON.parse(q))
  }, [])

  const handleSubmit = useCallback(() => {
    localStorage.setItem('answers', JSON.stringify(answers))
    router.push('/results')
  }, [answers, router])

  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, handleSubmit])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  function selectAnswer(opt: string) {
    setAnswers(prev => ({ ...prev, [current]: opt }))
    setStatus(prev => ({
      ...prev,
      [current]: prev[current] === 'review' ? 'attempted-review' : 'attempted'
    }))
  }

  function toggleReview() {
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

  if (!questions.length) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/50 text-sm">Loading exam...</div>
    </div>
  )

  const q = questions[current]
  const attempted = Object.keys(answers).length
  const notAttempted = questions.length - attempted

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-lg">PREPIFY</span>
          <span className="text-white/30 text-xs font-mono">EXAM MODE</span>
        </div>
        <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
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
        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-3xl">
            {/* Question number */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-white/30 text-sm font-mono">Q{current + 1}</span>
              <span className="text-white/20 text-sm">of {questions.length}</span>
              {status[current] === 'review' || status[current] === 'attempted-review' ? (
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full">Marked for review</span>
              ) : null}
            </div>

            {/* Question text */}
            <div className="text-white text-lg leading-relaxed mb-6">
              {renderText(q.text)}
            </div>

            {/* Diagram */}
            {q.diagramBase64 && (
              <div className="mb-6 border border-white/10 rounded-xl overflow-hidden inline-block">
                <img src={q.diagramBase64} alt="diagram" className="max-w-full max-h-72 object-contain" />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-8">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optionText = q.options?.[opt] || q.options?.[opt.toLowerCase()] || q.options?.[`(${opt.toLowerCase()})`] || ''
                const isSelected = answers[current] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(opt)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                      isSelected
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/10 text-white/70 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    <span className={`font-mono text-sm mt-0.5 shrink-0 ${isSelected ? 'text-white' : 'text-white/30'}`}>{opt}.</span>
                    <span>{renderText(optionText)}</span>
                  </button>
                )
              })}
            </div>

            {/* Navigation buttons */}
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
                className="px-5 py-2.5 rounded-full border border-orange-500/40 text-orange-400 text-sm hover:bg-orange-500/10 transition-all"
              >
                Mark for Review
              </button>
              <button
                onClick={() => {
                  if (answers[current]) {
                    setAnswers(prev => { const n = { ...prev }; delete n[current]; return n })
                    setStatus(prev => ({ ...prev, [current]: 'unattempted' }))
                  }
                }}
                className="px-5 py-2.5 rounded-full border border-white/10 text-white/40 text-sm hover:text-white/70 transition-all"
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
          </div>
        </div>

        {/* Question Palette */}
        {showPalette && (
          <div className="w-64 border-l border-white/10 p-4 overflow-y-auto shrink-0">
            <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">Question Palette</p>

            {/* Legend */}
            <div className="space-y-2 mb-4 text-xs text-white/40">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-600" />Answered</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-600" />Answered + Review</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-500" />Marked for Review</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white/10" />Not Attempted</div>
            </div>

            {/* Grid */}
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

            {/* Summary */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Answered</span><span className="text-green-400">{attempted}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Not Answered</span><span className="text-white/40">{notAttempted}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Total</span><span>{questions.length}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-4 w-full py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Submit Exam
            </button>
          </div>
        )}
      </div>
    </div>
  )
}