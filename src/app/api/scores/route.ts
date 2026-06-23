import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { getServerUser } from '@/lib/supabase-server'

// Score tracker — records of every test (Prepify auto-logged or manually added)
// so a student can chart their progress over time.

const FIELDS = 'id, test_name, exam_type, marks, max_marks, positive_marks, negative_marks, potential_score, percentile, remarks, source, attempt_date, created_at'

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('score_records')
    .select(FIELDS)
    .eq('user_id', user.id)
    .order('attempt_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ records: data || [] })
}

export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const b = await req.json()
    const { data, error } = await supabase
      .from('score_records')
      .insert({
        user_id: user.id,
        test_name: (b.test_name || 'Untitled Test').slice(0, 160),
        exam_type: b.exam_type || 'JEE Main',
        marks: numOrNull(b.marks),
        max_marks: numOrNull(b.max_marks),
        positive_marks: numOrNull(b.positive_marks),
        negative_marks: numOrNull(b.negative_marks),
        potential_score: numOrNull(b.potential_score),
        percentile: numOrNull(b.percentile),
        remarks: b.remarks || null,
        source: b.source === 'prepify' ? 'prepify' : 'manual',
        attempt_date: b.attempt_date || new Date().toISOString().slice(0, 10),
      })
      .select(FIELDS)
      .single()
    if (error) throw error
    return NextResponse.json({ record: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, ...rest } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const patch: Record<string, any> = {}
    if ('test_name' in rest) patch.test_name = String(rest.test_name).slice(0, 160)
    if ('exam_type' in rest) patch.exam_type = rest.exam_type
    if ('remarks' in rest) patch.remarks = rest.remarks
    if ('attempt_date' in rest) patch.attempt_date = rest.attempt_date
    for (const k of ['marks', 'max_marks', 'positive_marks', 'negative_marks', 'potential_score', 'percentile']) {
      if (k in rest) patch[k] = numOrNull(rest[k])
    }
    if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    const { error } = await supabase.from('score_records').update(patch).eq('id', id).eq('user_id', user.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await supabase.from('score_records').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

function numOrNull(v: any): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = parseFloat(String(v))
  return isNaN(n) ? null : n
}
