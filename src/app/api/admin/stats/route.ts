import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// Aggregate counts for the admin dashboard. Superadmin-only.
async function count(table: string, build?: (q: any) => any): Promise<number> {
  try {
    let q = supabase.from(table).select('id', { count: 'exact', head: true })
    if (build) q = build(q)
    const { count } = await q
    return count || 0
  } catch {
    return 0
  }
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [
    questions, uptet, ctet, jee, neet, uploads,
    savedTests, scores, reportsOpen, reportsTotal, users,
  ] = await Promise.all([
    count('questions'),
    count('questions', q => q.eq('exam_type', 'UPTET')),
    count('questions', q => q.eq('exam_type', 'CTET')),
    count('questions', q => q.eq('exam_type', 'JEE Main')),
    count('questions', q => q.eq('exam_type', 'NEET')),
    count('questions', q => q.eq('from_upload', 'yes')),
    count('saved_tests'),
    count('score_records'),
    count('question_reports', q => q.eq('status', 'open')),
    count('question_reports'),
    count('profiles'),
  ])

  return NextResponse.json({
    questions, uptet, ctet, jee, neet, uploads,
    savedTests, scores, reportsOpen, reportsTotal, users,
  })
}
