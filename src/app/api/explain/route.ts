import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getServerUser, createSupabaseServerClient } from '@/lib/supabase-server'

const DAILY_LIMIT = 90

// us-central1, gemini-2.5-flash — cheaper, separate from extraction quota
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'green-radius-464018-v2',
  location: 'us-central1',
  ...(process.env.GCP_CLIENT_EMAIL ? {
    googleAuthOptions: {
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }
    }
  } : {})
})

export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 90 AI explains per user per day
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('explain_uses_today, explain_date')
    .eq('id', user.id)
    .single()

  if (profileErr) return NextResponse.json({ error: 'Profile not found' }, { status: 500 })

  const usesToday = profile.explain_date === today ? (profile.explain_uses_today ?? 0) : 0

  if (usesToday >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Daily limit reached (${DAILY_LIMIT} AI explanations/day). Resets at midnight.` },
      { status: 429 }
    )
  }

  // Increment counter
  await supabase.from('profiles').update({
    explain_uses_today: usesToday + 1,
    explain_date: today,
  }).eq('id', user.id)

  const { questionText, optionsText, correctAnswer, userAnswer, subject, language } = await req.json()
  const inHindi = language === 'hi'

  const prompt = `You are a helpful exam tutor for competitive exams like CTET and UPTET.

Question: ${questionText}

Options:
${optionsText}

Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer || 'Not attempted'}
Subject: ${subject || 'General'}

Give a clear, concise explanation (3–5 sentences) of WHY ${correctAnswer} is correct.
If the student got it wrong, briefly explain why their choice was incorrect too.
${inHindi ? 'Respond entirely in simple Hindi (Devanagari script). No English.' : 'Use simple language.'}
No markdown formatting — plain text only.`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })

    return NextResponse.json({ explanation: response.text || '' })
  } catch (err) {
    console.error('Explain error:', err)
    return NextResponse.json({ error: 'AI explanation failed' }, { status: 500 })
  }
}
