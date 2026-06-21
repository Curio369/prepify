import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { cropDiagram } from '@/lib/imageProcessor'
import { pdfToAllImageBuffers } from '@/lib/pdfToImage'
import { supabase } from '@/lib/supabase'

const ai = new GoogleGenAI({
  vertexai: true,
  project: 'green-radius-464018-v2',
  location: 'us-central1',
  googleAuthOptions: {
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }
  }
});

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
  "diagramBox": [ymin, xmin, ymax, xmax],
  "fullImageMode": false,
  "subject": "Child Development / Math / EVS / Science / English / Hindi / Social Science / Physics / Chemistry / Biology / General",
  "topic": "specific topic within the subject",
  "difficulty": "easy / medium / hard",
  "language": "english / hindi"
}

General Rules:
- Write ALL math expressions in LaTeX format wrapped in $ for inline and $$ for block
- Options may be labeled as A/B/C/D or (a)/(b)/(c)/(d) — always map them to A, B, C, D in your output
- ALWAYS extract all 4 options for every question
- If no diagram exists, omit "diagramBox" entirely
- Extract EVERY question you can see, even if watermarks or text overlaps the content. Do not skip any question.
- If the page has a header, footer, or watermark, ignore it and focus only on numbered questions.
- If correct answer unknown, put ""
- Return only the JSON array, no markdown
- There are multiple questions on this page. Make sure to extract ALL of them, not just the first one.
- First identify the subject of each question (Physics, Chemistry, Math, Biology, Child Development etc) from context. If not explicitly labeled, judge from question content.
- difficulty: judge based on complexity — easy for direct recall, medium for application, hard for multi-step reasoning
- language: detect if question is in hindi or english

Subject-specific rules:

PHYSICS / MATH:
- Any figure, graph, circuit, free-body diagram, or geometric figure must use "diagramBox", never LaTeX
- Pure equations/expressions with no visual figure go in "text" as LaTeX

CHEMISTRY:
- ALL chemical structures — skeletal/bond-line structures, benzene/cyclic rings, AND condensed/chain structural formulas (e.g. CH3-CH2-C=CH-CH2-CH3 drawn with bond lines) — must ALWAYS use "diagramBox". Never attempt to render any chemical structure as LaTeX text, even if it looks like a simple linear chain.
- Reaction schemes/mechanisms with arrows must use "diagramBox"
- Only use LaTeX "text" for chemistry when there is no drawn structure at all (e.g. plain-text questions about concepts, numericals, named reactions mentioned without a drawn structure)

BIOLOGY:
- Any labeled diagram (cell, organ, anatomical figure, process diagram) must use "diagramBox"
- Plain text questions use "text" as normal (no LaTeX needed unless numerical)

Diagram box rules (applies to all subjects):
- Return ONLY the bounding box of the actual diagram/figure itself, NOT the surrounding text. Coordinates normalized to 1000 as [ymin, xmin, ymax, xmax]
- The diagramBox must contain ONLY the figure/diagram. Do NOT include question text or answer options inside the box. Include all labels and arrows that are part of the figure.
- The diagramBox ymin must start BELOW any question text, at the very top edge of the actual drawn figure. Do NOT include question text lines in the ymin coordinate.
- The diagramBox must fully contain the entire figure including all floating labels like A, B, C at the extremes of the figure.

Full-image fallback mode (use ONLY when options cannot be cleanly separated as text):
- Set "fullImageMode": true
- "diagramBox" must cover the question stem AND all 4 options together, as ONE single box
- Omit "options" entirely
- "correct" still uses A/B/C/D mapped by POSITION
- This is a fallback ONLY

Cross-question box accuracy (CRITICAL):
- Before finalizing each diagramBox, re-check which question NUMBER/LABEL on the page is closest above the figure
- A diagramBox must NEVER cross, touch, or include any part of a neighboring question
- If the page has two columns, do NOT let a diagramBox span both columns
- CRITICAL: If the page consists primarily of solutions, answer keys, or does not contain explicit numbered test questions, return exactly []
`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const examType = formData.get('exam_type') as string || 'General'
    const paper = formData.get('paper') as string || null
    const source = formData.get('source') as string || 'Prepify_Upload'
    const saveToDb = formData.get('save_to_db') === 'true'

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const isPDF = file.type === 'application/pdf'

    const imageBuffers = isPDF
      ? await pdfToAllImageBuffers(fileBuffer)
      : [fileBuffer]

    const allEnrichedQuestions: any[] = []

    for (const imgBuf of imageBuffers) {
      const base64 = imgBuf.toString('base64')

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { data: base64, mimeType: 'image/png' } },
            { text: prompt }
          ]
        }]
      });

      const raw = response.text || ""
      const cleaned = raw.replace(/```json|```/g, '').trim()

      let questions = []
      try {
        if (cleaned) questions = JSON.parse(cleaned)
      } catch (e) {
        console.warn('Skipping page: No valid JSON found')
        continue
      }

      const enriched = await Promise.all(
        questions.map(async (q: any) => {
          if (q.diagramBox && Array.isArray(q.diagramBox)) {
            const diagramBase64 = await cropDiagram(imgBuf, q.diagramBox)
            return { ...q, diagramBase64 }
          }
          return q
        })
      )

      allEnrichedQuestions.push(...enriched)
    }

    // Save to Supabase if requested
    if (saveToDb && allEnrichedQuestions.length > 0) {
      const rows = allEnrichedQuestions.map((q: any) => ({
        text: q.text || '',
        options: q.options || {},
        correct_answer: q.correct || '',
        explanation: q.explanation || null,
        exam_type: examType,
        paper: paper,
        subject: q.subject || 'General',
        topic: q.topic || null,
        difficulty: q.difficulty || 'medium',
        language: q.language || 'english',
        source: source,
        has_latex: (q.text || '').includes('$'),
        has_diagram: !!q.diagramBase64,
      }))

      const { error } = await supabase.from('questions').insert(rows)
      if (error) console.error('Supabase save error:', error)
      else console.log(`Saved ${rows.length} questions to DB`)
    }

    return NextResponse.json({ 
      questions: allEnrichedQuestions,
      saved_to_db: saveToDb && allEnrichedQuestions.length > 0
    })

  } catch (err) {
    console.error('Final Extraction Error:', err)
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}