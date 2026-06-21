'use client'
import { useEffect, useState, Suspense } from 'react'
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

function CtetExamContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const subject = searchParams.get('subject') || 'General'
  const limit = searchParams.get('limit') || '10'

  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    async function fetchCtetQuestions() {
      try {
        const res = await fetch(`/api/exams/generate?exam_type=CTET&subject=${encodeURIComponent(subject)}&limit=${limit}`)
        const data = await res.json()
        setQuestions(data.questions || [])
      } catch (error) {
        console.error('Error loading CTET database payload:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCtetQuestions()
  }, [subject, limit])

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return
    setAnswers(prev => ({ ...prev, [current]: opt }))
  }

  const calculateTotalScore = () => {
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) correctCount++
    })
    return correctCount
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-emerald-400 text-sm font-bold font-mono animate-pulse">Assembling CTET Questions...</div>
    </div>
  )

  if (!questions.length) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4 text-center">
      <p className="text-sm text-slate-500 mb-4">No content loaded for this subject pool yet.</p>
      <button onClick={() => router.push('/ctet')} className="text-emerald-400 text-sm font-semibold underline">
        Return to Selection Panel
      </button>
    </div>
  )

  const q = questions[current]

  const activeQuestionText = language === 'en' ? (q.text_en || q.text) : (q.text_hi || q.text_en || q.text)
  const activeOptionsSet = language === 'en' ? (q.options_en || q.options) : (q.options_hi || q.options_en || q.options)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto border-x border-slate-900 shadow-2xl pb-24">

      {/* Header: subject tag + segmented progress bar */}
      <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 flex justify-between items-center z-20">
        <div className="flex-1 min-w-0 pr-3">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono uppercase tracking-widest px-2 py-0.5 rounded-md border border-emerald-500/20">
            {subject}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1 flex-1 max-w-[140px]">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full flex-1 transition-colors ${
                    i === current ? 'bg-white' : i < current ? 'bg-emerald-500/50' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-mono shrink-0">{current + 1} / {questions.length}</span>
          </div>
        </div>

        {(q.text_hi || q.options_hi) && (
          <button
            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 transition shrink-0"
          >
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        )}
      </div>

      <div className="flex-1 px-4 pt-5 pb-2 overflow-y-auto">
        <div className="w-full h-16 bg-slate-900 border border-dashed border-slate-800 rounded-xl mb-5 flex items-center justify-center text-[10px] text-slate-600 tracking-wider uppercase">
          Advertisement
        </div>

        <div className="space-y-4">
          <div className="text-base font-medium leading-relaxed text-slate-200">
            {renderText(activeQuestionText)}
          </div>

          {q.diagram_url && (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-white p-2 flex justify-center">
              <img src={q.diagram_url} alt="Exam Figure" className="max-w-full max-h-56 object-contain" />
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            {['A', 'B', 'C', 'D'].map(opt => {
              const optionTextString = activeOptionsSet?.[opt] || activeOptionsSet?.[opt.toLowerCase()] || ''
              const isSelected = answers[current] === opt
              const isCorrect = q.correct_answer === opt

              let containerStyles = 'border-slate-800 bg-slate-900 active:bg-slate-800'
              let textStyles = 'text-slate-300'
              let badgeStyles = 'border-slate-700 text-slate-500'
              let badgeContent: React.ReactNode = opt

              if (isSubmitted) {
                if (isCorrect) {
                  containerStyles = 'border-emerald-500/40 bg-emerald-500/10'
                  textStyles = 'text-emerald-400 font-medium'
                  badgeStyles = 'bg-emerald-500 border-emerald-500 text-white'
                  badgeContent = <i className="ti ti-check text-[13px]" aria-hidden="true" />
                } else if (isSelected && !isCorrect) {
                  containerStyles = 'border-red-500/40 bg-red-500/10'
                  textStyles = 'text-red-400'
                  badgeStyles = 'bg-red-500 border-red-500 text-white'
                  badgeContent = <i className="ti ti-x text-[13px]" aria-hidden="true" />
                } else {
                  containerStyles = 'border-slate-800 bg-slate-900/50'
                  textStyles = 'text-slate-500'
                }
              } else if (isSelected) {
                containerStyles = 'border-emerald-500 bg-emerald-500/5'
                textStyles = 'text-emerald-400 font-medium'
                badgeStyles = 'bg-emerald-500 border-emerald-500 text-white'
              }

              return (
                <button
                  key={opt}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center gap-3 text-sm leading-normal ${containerStyles}`}
                >
                  <span className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center text-[11px] font-semibold shrink-0 transition-colors ${badgeStyles}`}>
                    {badgeContent}
                  </span>
                  <div className={`flex-1 ${textStyles}`}>{renderText(optionTextString)}</div>
                </button>
              )
            })}
          </div>
        </div>

        {isSubmitted && q.explanation && (
          <div className="mt-4 pl-3.5 pr-3 py-3 border-l-2 border-emerald-500 bg-slate-900/60 rounded-r-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <i className="ti ti-bulb text-[14px] text-emerald-400" aria-hidden="true" />
              <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Explanation</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{q.explanation}</p>
          </div>
        )}

        {isSubmitted && (
          <div className="mt-6 border border-slate-800 bg-slate-900/60 rounded-xl p-5 text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Results</h3>
            <div className="text-4xl font-mono font-black text-white mt-2">
              {calculateTotalScore()} <span className="text-sm text-slate-600">/ {questions.length} Correct</span>
            </div>
            <button
              onClick={() => router.push('/ctet')}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold py-2.5 rounded-xl transition"
            >
              Back to Subjects
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 flex justify-between items-center z-20">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-950 disabled:opacity-30 transition flex items-center gap-1"
        >
          <i className="ti ti-chevron-left text-[14px]" aria-hidden="true" />
          Previous
        </button>

        {!isSubmitted ? (
          <button
            onClick={() => {
              if (current === questions.length - 1) {
                setIsSubmitted(true)
              } else {
                setCurrent(c => c + 1)
              }
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1 ${
              current === questions.length - 1
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-white text-slate-950 hover:bg-slate-200'
              }`}
          >
            {current === questions.length - 1 ? 'Finish & View Score' : 'Next Question'}
            {current !== questions.length - 1 && <i className="ti ti-chevron-right text-[14px]" aria-hidden="true" />}
          </button>
        ) : (
          <button
            onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
            disabled={current === questions.length - 1}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-950 disabled:opacity-30 transition flex items-center gap-1"
          >
            Next Review
            <i className="ti ti-chevron-right text-[14px]" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function CtetExamEngine() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-400 text-sm font-bold font-mono animate-pulse">Loading Test Environment...</div>
      </div>
    }>
      <CtetExamContent />
    </Suspense>
  )
}