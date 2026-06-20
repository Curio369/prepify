'use client'
import { useEffect, useState } from 'react'

export default function Results() {
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [score, setScore] = useState(0)

  useEffect(() => {
    const q = JSON.parse(localStorage.getItem('questions') || '[]')
    const a = JSON.parse(localStorage.getItem('answers') || '{}')
    setQuestions(q)
    setAnswers(a)
    const s = q.filter((q: any, i: number) => q.correct === a[i]).length
    setScore(s)
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Score: {score} / {questions.length}</h1>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <p><b>Q{i+1}:</b> {q.text}</p>
          <p>Your answer: <b>{answers[i] || 'Not attempted'}</b></p>
          <p>Correct: <b>{q.correct}</b></p>
        </div>
      ))}
    </div>
  )
}