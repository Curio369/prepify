import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { getServerUser } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  // Auth guard: only signed-in users may insert questions
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
  }

  try {
    const { questions, exam_type, paper, source, year } = await req.json()

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 })
    }
    // Cap batch size to prevent a single request flooding the table
    if (questions.length > 200) {
      return NextResponse.json({ error: 'Too many questions in one request (max 200)' }, { status: 400 })
    }

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