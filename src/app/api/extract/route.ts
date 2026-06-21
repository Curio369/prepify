import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { cropDiagram } from '@/lib/imageProcessor'
import { pdfToAllImageBuffers } from '@/lib/pdfToImage'

const ai = new GoogleGenAI({
  vertexai: true,
  project: 'green-radius-464018-v2',
  location: 'global',
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
  "fullImageMode": false
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
- First identify the subject of each question (Physics, Chemistry, Math, Biology) from context. If not explicitly labeled, judge from question content.

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

Full-image fallback mode (use ONLY when options cannot be cleanly separated as text — e.g. options are themselves diagrams/structures, handwritten, or visually too messy to split into 4 clean text/LaTeX strings):
- Set "fullImageMode": true
- "diagramBox" must cover the question stem AND all 4 options together, as ONE single box, in their original top-to-bottom or grid layout exactly as printed
- Omit "options" entirely (no A/B/C/D text needed) — leave "text" empty too
- "correct" still uses A/B/C/D, mapped by POSITION in the image: 1st option = A, 2nd = B, 3rd = C, 4th = D
- This is a fallback ONLY. Default behavior (separate text "options") should be used whenever options are plain text/LaTeX, even if the question stem itself is an image
- Do not use fullImageMode just because the stem has a diagram — only use it when the OPTIONS themselves can't be cleanly extracted as text

Cross-question box accuracy (CRITICAL — pages often have multiple questions, columns, or questions stacked closely):
- Before finalizing each diagramBox, re-check which question NUMBER/LABEL on the page is closest above the figure. The diagramBox belongs ONLY to that question. Never assign a figure to the wrong question.
- A diagramBox must NEVER cross, touch, or include any part of a neighboring question's number label, question text, or options — even if figures are visually close together or the page has a column layout.
- If the page has two columns, do NOT let a diagramBox span both columns or bleed from one column into the other.
- If multiple figures appear close together, double check each box is tightly scoped to only its own question's figure before outputting.
- Before returning, verify: for every question with a diagramBox, the box's vertical position (ymin) is directly below that SAME question's number on the page, not a different question's number.
- CRITICAL: Some pages contain Answer Keys, Detailed Solutions, or Explanations instead of test questions. If the page consists primarily of solutions, answer keys, or does not contain explicit numbered test questions, you MUST return exactly []. Do NOT attempt to format solutions as questions.
`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const isPDF = file.type === 'application/pdf'

    // 1. Get an array of PNG buffers (one for every page)
    const imageBuffers = isPDF 
      ? await pdfToAllImageBuffers(fileBuffer) 
      : [fileBuffer]

    let allEnrichedQuestions: any[] = []

    // 2. Loop through every single page image
    for (const imgBuf of imageBuffers) {
      const base64 = imgBuf.toString('base64')
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { data: base64, mimeType: 'image/png' } },
            { text: prompt }
          ]
        }]
      });

      const raw = response.text || "";
      const cleaned = raw.replace(/```json|```/g, '').trim()
      
      let questions = []
      try {
        if (cleaned) questions = JSON.parse(cleaned)
      } catch (e) {
        console.warn('Skipping page: No valid JSON found')
        continue
      }

      // 3. Crop diagrams for every question on THIS page
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

    // 4. Return the complete 30-question array
    return NextResponse.json({ questions: allEnrichedQuestions })

  } catch (err) {
    console.error('Final Extraction Error:', err)
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}