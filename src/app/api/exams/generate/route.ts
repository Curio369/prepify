import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('exam_type') || 'CTET';
    const subject = searchParams.get('subject');
    const limitStr = searchParams.get('limit') || '10';
    const limit = parseInt(limitStr, 10);

    // Start building query
    let query = supabase
      .from('questions')
      .select('*')
      .eq('exam_type', examType);

    if (subject && subject !== 'All') {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Shuffle rows in memory for a randomized test generation experience
    const shuffled = data.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, limit);

    return NextResponse.json({ questions: selectedQuestions });
  } catch (err: any) {
    console.error('Generate Exam Error:', err);
    return NextResponse.json({ error: 'Failed to generate test configuration' }, { status: 500 });
  }
}