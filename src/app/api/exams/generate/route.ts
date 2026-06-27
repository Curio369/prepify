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
    const sortBySubject = searchParams.get('sort') === 'subject'

    if (sortBySubject && subjects) {
      // Full Mock mode: fetch each subject independently so a popular subject
      // (CDP, Language I Hindi) can't crowd out subjects with fewer rows in the DB.
      const subjectList = subjects.split(',').map(s => s.trim()).filter(Boolean)
      const PER_SECTION = 30
      const result: any[] = []

      for (let i = 0; i < subjectList.length; i++) {
        const subj = subjectList[i]
        const isLast = i === subjectList.length - 1
        const needed = isLast ? limit - PER_SECTION * (subjectList.length - 1) : PER_SECTION
        const pool = needed * 4 // fetch 4× so shuffle has variety

        const { data: rows, error: rowErr } = await supabase
          .from('questions')
          .select('*')
          .eq('exam_type', examType)
          .eq('subject', subj)
          .limit(pool)

        if (rowErr) { console.error(`fetch error for subject ${subj}:`, rowErr); continue }
        if (!rows || rows.length === 0) {
          console.warn(`no questions found for subject: ${subj} exam_type: ${examType}`)
          continue
        }

        const shuffled = shuffle(rows)
        result.push(...shuffled.slice(0, needed))
      }

      return NextResponse.json({ questions: result })
    }

    // Single-subject / PYQ / topic practice path
    let query = supabase.from('questions').select('*').eq('exam_type', examType);

    if (subjects) {
      const list = subjects.split(',').map(s => s.trim()).filter(Boolean)
      query = query.in('subject', list)
    } else if (subject && subject !== 'All') {
      query = query.eq('subject', subject)
    }

    if (year) query = query.eq('year', year)

    if (ordered) {
      // PYQ mode: strict upload order preserves original paper sequence
      query = query.order('created_at', { ascending: true })
    }

    const { data, error } = await query.limit(ordered ? limit : limit * 4);
    if (error) throw error;
    if (!data || data.length === 0) return NextResponse.json({ questions: [] });

    const selected = ordered ? data : shuffle(data).slice(0, limit)

    return NextResponse.json({ questions: selected });
  } catch (err: any) {
    console.error('Generate Exam Error:', err);
    return NextResponse.json({ error: 'Failed to generate exam' }, { status: 500 });
  }
}
