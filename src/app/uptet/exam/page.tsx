'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ExamEngine from '@/components/exam/ExamEngine'

function UptetExamContent() {
  const s = useSearchParams()
  const subject = s.get('subject') || 'Child Development and Pedagogy'
  const subjects = s.get('subjects') || undefined
  const limit = s.get('limit') || '10'
  const timer = s.get('timer') ? parseInt(s.get('timer')!) : undefined
  const year = s.get('year') || undefined
  const ordered = s.get('ordered') === 'true'

  return (
    <ExamEngine
      examType="UPTET"
      subject={subject}
      subjects={subjects}
      limit={limit}
      backPath="/uptet"
      timerMinutes={timer}
      year={year}
      ordered={ordered}
    />
  )
}

export default function UptetExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-400 text-sm font-bold font-mono animate-pulse">Loading...</div>
      </div>
    }>
      <UptetExamContent />
    </Suspense>
  )
}
