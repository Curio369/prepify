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
      // Fetch a large pool so we have enough to shuffle within each subject
      query = query.order('subject', { ascending: true })
    } else if (ordered) {
      // PYQ mode: strict upload order preserves original paper sequence
      query = query.order('created_at', { ascending: true })
    }

    const fetchLimit = sortBySubject ? limit * 4 : limit;
    const { data, error } = await query.limit(fetchLimit);
    if (error) throw error;
    if (!data || data.length === 0) return NextResponse.json({ questions: [] });

    let selected: typeof data;

    if (sortBySubject) {
      // Group by subject, shuffle each group independently (mix years within each section)
      const groups: Record<string, typeof data> = {}
      for (const q of data) {
        const key = q.subject || 'General'
        if (!groups[key]) groups[key] = []
        groups[key].push(q)
      }
      const subjectKeys = Object.keys(groups).sort()
      const PER_SECTION = 30  // every UPTET/CTET section is 30Q except the Paper II optional (60Q)
      const result: typeof data = []
      for (let i = 0; i < subjectKeys.length; i++) {
        const shuffled = shuffle(groups[subjectKeys[i]])
        // Last subject gets whatever is left (handles Paper II Social Studies = 60Q)
        const isLast = i === subjectKeys.length - 1
        const count = isLast ? limit - PER_SECTION * (subjectKeys.length - 1) : PER_SECTION
        result.push(...shuffled.slice(0, count))
      }
      selected = result
    } else if (ordered) {
      selected = data
    } else {
      selected = shuffle(data).slice(0, limit)
    }

    return NextResponse.json({ questions: selected });
  } catch (err: any) {
    console.error('Generate Exam Error:', err);
    return NextResponse.json({ error: 'Failed to generate exam' }, { status: 500 });
  }
}
