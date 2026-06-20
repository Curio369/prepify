import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cropDiagram } from '@/lib/imageProcessor'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const prompt = `You are analyzing a DPP (Daily Practice Paper) or test paper image.
Extract ALL questions from this image.
Return ONLY a valid JSON array, nothing else.

Each question must follow this exact format:
{
  "id": 1,
  "text": "full question text here in LaTeX for math using $...$ for inline and $$...$$ for block",
  "options": {
    "A": "option A text",
    "B": "option B text",
    "C": "option C text",
    "D": "option D text"
  },
  "correct": "A",
  "diagramBox": [ymin, xmin, ymax, xmax]
}

Rules:
- Write ALL math expressions in LaTeX format wrapped in $ for inline and $$ for block
- Options may be labeled as A/B/C/D or (a)/(b)/(c)/(d) — always map them to A, B, C, D in your output
- ALWAYS extract all 4 options for every question
- If a question has a diagram or figure, return ONLY the bounding box of the actual diagram/figure itself, NOT the surrounding text. Coordinates normalized to 1000 as [ymin, xmin, ymax, xmax]
- If no diagram exists, omit "diagramBox" entirely
- If correct answer unknown, put ""
- Return only the JSON array, no markdown`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const fileBuffer = Buffer.from(bytes)
    const isPDF = file.type === 'application/pdf'

    const base64 = fileBuffer.toString('base64')
    const mimeType = file.type as any

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      prompt
    ])

    const raw = result.response.text()
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const questions = JSON.parse(cleaned)
    console.log('Extracted:', JSON.stringify(questions, null, 2))

    // Only crop diagrams for images, skip for PDFs
    const enriched = await Promise.all(
      questions.map(async (q: any) => {
        if (!isPDF && q.diagramBox && Array.isArray(q.diagramBox)) {
          const diagramBase64 = await cropDiagram(fileBuffer, q.diagramBox)
          return { ...q, diagramBase64 }
        }
        return q
      })
    )

    return NextResponse.json({ questions: enriched })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}