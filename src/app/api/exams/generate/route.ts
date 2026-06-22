import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('exam_type') || 'CTET';
    const subject = searchParams.get('subject');
    const subjects = searchParams.get('subjects'); // comma-separated for full exam
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const ordered = searchParams.get('ordered') === 'true'
    // sort=subject: groups all questions by subject name then by upload order
    // Used for Full Mock exams (no year filter) to avoid cross-year interleaving
    const sortBySubject = searchParams.get('sort') === 'subject'

    let query = supabase.from('questions').select('*').eq('exam_type', examType);

    if (subjects) {
      const list = subjects.split(',').map(s => s.trim()).filter(Boolean)
      query = query.in('subject', list)
    } else if (subject && subject !== 'All') {
      query = query.eq('subject', subject)
    }

    if (year) query = query.eq('year', year)

    if (sortBySubject) {
      // Group by subject alphabetically, then by upload order within each subject
      query = query.order('subject', { ascending: true }).order('created_at', { ascending: true })
    } else if (ordered) {
      // PYQ mode: strict upload order preserves original paper sequence
      query = query.order('created_at', { ascending: true })
    }

    const { data, error } = await query.limit(limit);
    if (error) throw error;
    if (!data || data.length === 0) return NextResponse.json({ questions: [] });

    const selected = (ordered || sortBySubject) ? data : shuffle(data).slice(0, limit);
    return NextResponse.json({ questions: selected });
  } catch (err: any) {
    console.error('Generate Exam Error:', err);
    return NextResponse.json({ error: 'Failed to generate exam' }, { status: 500 });
  }
}
