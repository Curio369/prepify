import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { getServerUser } from '@/lib/supabase-server'

const SAVE_LIMIT = 50

// GET /api/tests          → list the current user's saved tests (no questions payload)
// GET /api/tests?id=<id>  → fetch one full test (with questions) to re-open token-free
export async function GET(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')

  if (id) {
    const { data, error } = await supabase
      .from('saved_tests')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ test: data })
  }

  // List view — omit the heavy questions column
  const { data, error } = await supabase
    .from('saved_tests')
    .select('id, name, exam_type, exam_skin, question_count, last_result, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tests: data || [], limit: SAVE_LIMIT, used: data?.length || 0 })
}

// POST /api/tests → save a freshly-extracted test to the user's library
export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, exam_type, exam_skin, questions } = await req.json()
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No questions to save' }, { status: 400 })
    }

    // Enforce the 50-test cap server-side
    const { count } = await supabase
      .from('saved_tests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count || 0) >= SAVE_LIMIT) {
      return NextResponse.json(
        { error: `Library full (${SAVE_LIMIT} max). Delete a test to save a new one.`, full: true },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('saved_tests')
      .insert({
        user_id: user.id,
        name: (name || 'Untitled Test').slice(0, 120),
        exam_type: exam_type || 'General',
        exam_skin: exam_skin || 'GENERIC',
        questions,
        question_count: questions.length,
      })
      .select('id')
      .single()
    if (error) throw error

    return NextResponse.json({ id: data.id })
  } catch (err: any) {
    console.error('Save test error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save' }, { status: 500 })
  }
}

// PATCH /api/tests → rename a test and/or attach an attempt result
export async function PATCH(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, name, result } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (typeof name === 'string') patch.name = name.slice(0, 120)
    if (result !== undefined) patch.last_result = result
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { error } = await supabase
      .from('saved_tests')
      .update(patch)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update' }, { status: 500 })
  }
}

// DELETE /api/tests?id=<id>
export async function DELETE(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('saved_tests')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
