'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

function renderText(text: string) {
  if (!text) return null
  const sanitized = text.replace(/\u2013/g, '-').replace(/\u2014/g, '-').replace(/\u2212/g, '-')
  const parts = sanitized.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g)
  return parts.map((part, i) => {
    if (part.startsWith('$$')) return <BlockMath key={i} math={part.slice(2, -2)} />
    if (part.startsWith('$')) return <InlineMath key={i} math={part.slice(1, -1)} />
    return <span key={i}>{part}</span>
  })
}

export default function Results() {
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [score, setScore] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const q = JSON.parse(localStorage.getItem('questions') || '[]')
    const a = JSON.parse(localStorage.getItem('answers') || '{}')
    setQuestions(q)
    setAnswers(a)
    const s = q.filter((q: any, i: number) => q.correct === a[i]).length
    setScore(s)
  }, [])

  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0
  const correct = score
  const incorrect = Object.keys(answers).filter((i) => answers[+i] && answers[+i] !== questions[+i]?.correct).length
  const unattempted = questions.length - Object.keys(answers).filter(i => answers[+i]).length

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="font-display text-lg">PREPIFY</span>
        <button
          onClick={() => router.push('/upload')}
          className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          New Exam →
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Score header */}
        <div className="text-center mb-12">
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">Exam Complete</p>
          <div className="text-8xl font-display text-white mb-2">{percentage}%</div>
          <p className="text-white/50 text-lg">{score} out of {questions.length} correct</p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-display text-green-400">{correct}</div>
              <div className="text-xs text-white/30 mt-1">Correct</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-display text-red-400">{incorrect}</div>
              <div className="text-xs text-white/30 mt-1">Incorrect</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-display text-white/40">{unattempted}</div>
              <div className="text-xs text-white/30 mt-1">Unattempted</div>
            </div>
          </div>
        </div>

        {/* Question review */}
        <div className="space-y-4">
          <h2 className="text-white/30 text-xs font-mono uppercase tracking-widest mb-6">Question Review</h2>
          {questions.map((q, i) => {
            const userAns = answers[i]
            const isCorrect = userAns === q.correct
            const isUnattempted = !userAns
            return (
              <div
                key={i}
                className={`border rounded-xl p-5 transition-all ${
                  isUnattempted
                    ? 'border-white/10 bg-white/[0.02]'
                    : isCorrect
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className="text-white/30 text-xs font-mono shrink-0">Q{i + 1}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    isUnattempted
                      ? 'bg-white/10 text-white/40'
                      : isCorrect
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isUnattempted ? 'Not Attempted' : isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>

                <div className="text-white/80 text-sm mb-3">{renderText(q.text)}</div>

                <div className="flex flex-wrap gap-3 text-xs">
                  {!isUnattempted && (
                    <span className={`px-3 py-1 rounded-full ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      Your answer: {userAns}
                    </span>
                  )}
                  {q.correct && (
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500">
                      Correct: {q.correct}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/upload')}
            className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition-colors"
          >
            Practice Another DPP →
          </button>
        </div>
      </div>
    </div>
  )
}