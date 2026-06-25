import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { cropDiagram } from '@/lib/imageProcessor'
import { pdfToAllImageBuffers } from '@/lib/pdfToImage'
import { getServerUser } from '@/lib/supabase-server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

// Extraction is long-running (multi-page PDFs → many Gemini calls). Ask Vercel
// for the longest function budget available so big PDFs don't get cut off.
export const maxDuration = 300

// Storage + question inserts run through the service-role client (bypasses RLS).
// This route is already auth-guarded below, so only signed-in users reach it.

// Use service account creds on Vercel; fall back to ADC (gcloud auth) locally
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'green-radius-464018-v2',
  location: 'global',
  ...(process.env.GCP_CLIENT_EMAIL ? {
    googleAuthOptions: {
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }
    }
  } : {})
});

const prompt = `You are analyzing a DPP (Daily Practice Paper) or test paper image.
Extract ALL questions from this image and generate a step-by-step solution for each.
Return ONLY a valid JSON array, nothing else.

Each question must follow this exact format:
{
  "id": 1,
  "text_en": "full question text in English (use LaTeX for math using $...$ for inline and $$...$$ for block. Leave blank if purely Hindi)",
  "text_hi": "full question text in Hindi (use LaTeX for math using $...$ for inline and $$...$$ for block. Leave blank if purely English)",
  "options_en": {
    "A": "English option A text",
    "B": "English option B text",
    "C": "English option C text",
    "D": "English option D text"
  },
  "options_hi": {
    "A": "Hindi option A text",
    "B": "Hindi option B text",
    "C": "Hindi option C text",
    "D": "Hindi option D text"
  },
  "correct": "A",
  "question_type": "mcq",
  "explanation": "Generate a clear, step-by-step solution or explanation for this question in English. Do not leave this blank.",
  "diagramBox": [ymin, xmin, ymax, xmax],
  "fullImageMode": false,
  "subject": "Child Development / Math / EVS / Science / English / Hindi / Sanskrit / Social Science / Physics / Chemistry / Biology / General",
  "topic": "specific topic within the subject",
  "difficulty": "easy / medium / hard"
}

Question type rules:
- "question_type" is "mcq" for normal multiple-choice questions (with A/B/C/D options) — set "correct" to A/B/C/D.
- "question_type" is "numerical" for integer/decimal answer questions (e.g. JEE/NEET numerical-value type) that have NO options and require a number as the answer. For these: put the numeric answer in "correct" (e.g. "4", "9.8", "-2"), and leave options_en and options_hi as empty objects {}.
- If unsure, default to "mcq".

General Rules:
- Write ALL math expressions in LaTeX format wrapped in $ for inline and $$ for block
- Options may be labeled as A/B/C/D or (a)/(b)/(c)/(d) — always map them to A, B, C, D in your output
- ALWAYS extract all 4 options for every question in both languages if available on the page.
- If no diagram exists, omit "diagramBox" entirely
- Extract EVERY question you can see. Do not skip any question.
- If the page has a header, footer, or watermark, ignore it and focus only on numbered questions.
- If correct answer unknown, put ""
- There are multiple questions on this page. Make sure to extract ALL of them.
- First identify the subject of each question from context.
- difficulty: judge based on complexity — easy for direct recall, medium for application, hard for multi-step reasoning

Subject-specific rules:

PHYSICS / MATH:
- Any figure, graph, circuit, free-body diagram, or geometric figure must use "diagramBox", never LaTeX
- Pure equations/expressions with no visual figure go in text as LaTeX

CHEMISTRY:
- ALL chemical structures (skeletal, cyclic rings, condensed chain formulas with bond lines) must ALWAYS use "diagramBox". Never render chemical structures as LaTeX text.
- Reaction schemes/mechanisms with arrows must use "diagramBox"

BIOLOGY:
- Any labeled diagram (cell, organ, anatomical figure) must use "diagramBox"

Diagram box rules (applies to all subjects):
- Return ONLY the bounding box of the actual diagram/figure itself, NOT the surrounding text. Coordinates normalized to 1000 as [ymin, xmin, ymax, xmax]
- The diagramBox must contain ONLY the figure/diagram. Do NOT include question text or answer options inside the box. Include all labels and arrows that are part of the figure.
- The diagramBox ymin must start BELOW any question text, at the very top edge of the actual drawn figure.
- The diagramBox must fully contain the entire figure.

Full-image fallback mode (use ONLY when options cannot be cleanly separated as text):
- Set "fullImageMode": true
- "diagramBox" must cover the question stem AND all 4 options together, as ONE single box
- Omit "options_en" and "options_hi" entirely
- "correct" still uses A/B/C/D mapped by POSITION

Cross-question box accuracy (CRITICAL):
- Before finalizing each diagramBox, re-check which question NUMBER/LABEL on the page is closest above the figure
- A diagramBox must NEVER cross, touch, or include any part of a neighboring question
- If the page has two columns, do NOT let a diagramBox span both columns
- CRITICAL: If the page consists primarily of solutions, answer keys, or does not contain explicit numbered test questions, return exactly []
`

export async function POST(req: NextRequest) {
  // ── Auth guard: verify user is logged in before spending any tokens ──
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
  }

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

    // Diagnostics: page count + per-page rendered size. A near-empty PNG
    // (e.g. < ~10KB) usually means the page rendered blank (unembedded fonts).
    console.log(
      `[extract] file=${file.name} type=${file.type} isPDF=${isPDF} ` +
      `pdfBytes=${fileBuffer.length} pages=${imageBuffers.length} ` +
      `pageSizes=[${imageBuffers.map(b => b.length).join(', ')}]`
    )

    // Send one page image to Gemini and return its enriched questions.
    // Isolated + try/caught so one bad page can never sink the whole upload.
    async function processPage(imgBuf: Buffer): Promise<any[]> {
      const base64 = imgBuf.toString('base64')
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [{
            role: 'user',
            parts: [
              { inlineData: { data: base64, mimeType: 'image/png' } },
              { text: prompt }
            ]
          }],
          config: {
            responseMimeType: "application/json", // Forces pristine JSON output
          }
        });

        const raw = response.text || "[]"
        console.log(`[extract] gemini raw (first 500 chars): ${raw.slice(0, 500)}`)

        let questions = []
        try {
          questions = JSON.parse(raw)
        } catch {
          console.warn('Skipping page: No valid JSON found')
          return []
        }
        if (!Array.isArray(questions)) return []
        console.log(`[extract] page parsed ${questions.length} questions`)

        return await Promise.all(
          questions.map(async (q: any) => {
            if (q.diagramBox && Array.isArray(q.diagramBox)) {
              const diagramBase64 = await cropDiagram(imgBuf, q.diagramBox)
              return { ...q, diagramBase64 }
            }
            return q
          })
        )
      } catch (e) {
        console.error('[extract] page failed:', e)
        return []
      }
    }

    // Process pages with bounded concurrency. A serial loop times out on big
    // PDFs (26 pages × ~10-40s each > Vercel's 300s limit); running a small pool
    // in parallel keeps total time near the slowest few pages. Results are kept
    // in page order so question sequence is preserved.
    const PAGE_CONCURRENCY = 6
    const pageResults: any[][] = new Array(imageBuffers.length)
    let nextPage = 0
    async function worker() {
      while (nextPage < imageBuffers.length) {
        const i = nextPage++
        pageResults[i] = await processPage(imageBuffers[i])
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(PAGE_CONCURRENCY, imageBuffers.length) }, worker)
    )
    const allEnrichedQuestions: any[] = pageResults.flat()

    // Save to Supabase if requested
    if (saveToDb && allEnrichedQuestions.length > 0) {
      const rows = await Promise.all(
        allEnrichedQuestions.map(async (q: any) => {
          let publicUrl = null;

          // If a diagram was cropped, upload it to Supabase Storage
          if (q.diagramBase64) {
            try {
              const buffer = Buffer.from(q.diagramBase64, 'base64');
              const fileName = `${examType.toLowerCase()}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('dpp_images')
                .upload(fileName, buffer, {
                  contentType: 'image/webp',
                  upsert: true,
                });

              if (uploadError) {
                console.error('Storage Upload Error:', uploadError);
              } else if (uploadData) {
                // Retrieve the public URL for the uploaded file
                const { data: urlData } = supabase.storage
                  .from('dpp_images')
                  .getPublicUrl(fileName);

                publicUrl = urlData?.publicUrl || null;
              }
            } catch (uploadImgErr) {
              console.error('Failed to process storage upload:', uploadImgErr);
            }
          }

          return {
            // Legacy NOT-NULL columns — fall back to whichever language is present
            text: q.text_en || q.text_hi || '',
            options: q.options_en || q.options_hi || q.options || {},
            text_en: q.text_en || '',
            text_hi: q.text_hi || '',
            options_en: q.options_en || {},
            options_hi: q.options_hi || {},
            correct_answer: q.correct || '',
            explanation: q.explanation || null,
            exam_type: examType,
            paper: paper,
            subject: q.subject || 'General',
            topic: q.topic || null,
            difficulty: q.difficulty || 'medium',
            source: source,
            from_upload: 'yes', // came through the user-facing /upload → /api/extract pipeline
            has_latex: ((q.text_en || '').includes('$') || (q.text_hi || '').includes('$')),
            has_diagram: !!publicUrl,
            diagram_url: publicUrl
          };
        })
      );

      const { error } = await supabase.from('questions').insert(rows);
      if (error) console.error('Supabase save error:', error);
      else console.log(`Saved ${rows.length} bilingual questions with images to DB`);
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