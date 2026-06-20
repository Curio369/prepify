'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

function renderText(text: string) {
  if (!text) return null;

  // 1. Clean up weird dashes from Gemini
  const sanitized = text
    .replace(/\u2013/g, '-') 
    .replace(/\u2014/g, '-') 
    .replace(/\u2212/g, '-'); 

  // 2. Split the cleaned text
  const parts = sanitized.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  // 3. Render the math
  return parts.map((part, i) => {
    if (part.startsWith('$$')) return <BlockMath key={i} math={part.slice(2, -2)} />;
    if (part.startsWith('$')) return <InlineMath key={i} math={part.slice(1, -1)} />;
    return <span key={i}>{part}</span>;
  });
}

export default function Exam() {
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const router = useRouter()

  useEffect(() => {
    const q = localStorage.getItem('questions')
    if (q && q !== 'undefined') setQuestions(JSON.parse(q))
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) handleSubmit()
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  function handleSubmit() {
    localStorage.setItem('answers', JSON.stringify(answers))
    router.push('/results')
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  if (!questions.length) return <p>Loading...</p>
  const q = questions[current]

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Question {current + 1} of {questions.length}</h2>
        <h2 style={{ color: timeLeft < 300 ? 'red' : 'inherit' }}>⏱ {formatTime(timeLeft)}</h2>
      </div>

      <p>{renderText(q.text)}</p>
      {q.diagramBase64 && (
      <img
        src={q.diagramBase64}
        alt="diagram"
        style={{ maxWidth: '100%', margin: '12px 0', border: '1px solid #444' }}
      />
    )}

      {['A', 'B', 'C', 'D'].map((opt, i) => {
  const optionText = q.options?.[opt] 
    || q.options?.[opt.toLowerCase()]
    || q.options?.[`(${opt.toLowerCase()})`]
    || ''
  return (
    <div key={opt} style={{ margin: '8px 0' }}>
      <label>
        <input type="radio" name="opt" value={opt}
          checked={answers[current] === opt}
          onChange={() => setAnswers({ ...answers, [current]: opt })} />
        {' '}<span>{renderText(optionText)}</span>
      </label>
    </div>
  )
})}

      <br />
      <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>Prev</button>
      {' '}
      <button onClick={() => setCurrent(c => c + 1)} disabled={current === questions.length - 1}>Next</button>
      {' '}
      <button onClick={handleSubmit} style={{ color: 'red' }}>Submit</button>
    </div>
  )
}