import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { getServerUser } from '@/lib/supabase-server'

// Question issue reports submitted by exam-takers (e.g. "diagram missing").
// Uses the service-role client so anonymous exam-takers can report too.

const VALID_TYPES = ['diagram_missing', 'wrong_answer', 'unclear', 'options', 'other']

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    if (!b.issue_type || !VALID_TYPES.includes(b.issue_type)) {
      return NextResponse.json({ error: 'Invalid issue type' }, { status: 400 })
    }

    const user = await getServerUser() // optional — null for anonymous reporters

    const { error } = await supabase.from('question_reports').insert({
      question_id: b.question_id != null ? String(b.question_id) : null,
      exam_type: b.exam_type || null,
      subject: b.subject || null,
      issue_type: b.issue_type,
      note: (b.note || '').slice(0, 500) || null,
      question_text: (b.question_text || '').slice(0, 1000) || null,
      reporter_id: user?.id || null,
    })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Report submit error:', err)
    return NextResponse.json({ error: err.message || 'Failed to submit report' }, { status: 500 })
  }
}
