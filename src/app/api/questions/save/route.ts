import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { questions, exam_type, paper, source, year } = await req.json()

    const rows = questions.map((q: any) => ({
      text: q.text,
      options: q.options,
      correct_answer: q.correct,
      explanation: q.explanation || null,
      exam_type: exam_type || 'CTET',
      paper: paper || null,
      subject: q.subject || 'General',
      topic: q.topic || null,
      difficulty: q.difficulty || 'medium',
      language: q.language || 'english',
      source: source || 'Prepify_Upload',
      year: year || null,
      has_latex: q.text?.includes('$') || false,
      has_diagram: !!q.diagramBase64,
    }))

    const { data, error } = await supabase
      .from('questions')
      .insert(rows)
      .select()

    if (error) throw error

    return NextResponse.json({ saved: data?.length, questions: data })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}