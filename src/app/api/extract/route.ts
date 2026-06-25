import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { cropDiagram } from '@/lib/imageProcessor'
import { getServerUser } from '@/lib/supabase-server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

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
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/^"|"$|\\r/g, '').replace(/\\n/g, '\n'),
      }
    }
  } : {})
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
  "question_type": "mcq",
  "explanation": "Generate a clear, step-by-step solution or explanation for this question in English. Do not leave this blank.",
  "diagramBox": [ymin, xmin, ymax, xmax],
  "fullImageMode": false,
  "subject": "Physics / Chemistry / Math / Biology / General",
  "topic": "specific topic within the subject",
  "difficulty": "easy / medium / hard"
}

Question type rules:
- "question_type" is "mcq" for normal multiple-choice questions (with A/B/C/D options) — set "correct" to A/B/C/D.
- "question_type" is "numerical" for integer/decimal answer questions (e.g. JEE/NEET numerical-value type) that have NO options and require a number as the answer. For these: put the numeric answer in "correct" (e.g. "4", "9.8", "-2"), and leave options as an empty object {}.
- If unsure, default to "mcq".

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
- difficulty: judge based on complexity — easy for direct recall, medium for application, hard for multi-step reasoning

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
- Coordinates are normalized to 1000 as [ymin, xmin, ymax, xmax].
- The box must be PIXEL-TIGHT around the visual figure only — no whitespace, no question text, no option text inside the box.
- ymin: the y-coordinate of the topmost pixel of the drawn figure (not the question text above it).
- ymax: the y-coordinate of the bottommost pixel of the figure (not the options below it).
- xmin: leftmost pixel of the figure.
- xmax: rightmost pixel of the figure.
- Include axis labels, arrows, and callouts that are visually attached to the figure. Include all floating labels like A, B, C at the extremes of the figure.
- Do NOT include the question stem text, option labels (A/B/C/D), or any text that is not physically drawn as part of the figure.
- If no diagram/figure exists on that question, omit "diagramBox" entirely — do not guess.
- Think step by step: first locate the exact pixel rows where the figure starts and ends, then set ymin/ymax. Then locate the exact pixel columns, set xmin/xmax.

Full-image fallback mode (use ONLY when options cannot be cleanly separated as text — e.g. options are themselves diagrams/structures, handwritten, or visually too messy to split into 4 clean text/LaTeX strings):
- Set "fullImageMode": true
- "diagramBox" must cover the question stem AND all 4 options together, as ONE single box, in their original top-to-bottom or grid layout exactly as printed
- Omit "options" entirely (no A/B/C/D text needed) — leave "text" empty too
- "correct" still uses A/B/C/D, mapped by POSITION in the image: 1st option = A, 2nd = B, 3rd = C, 4th = D
- This is a fallback ONLY. Default behavior (separate text "options") should be used whenever options are plain text/LaTeX, even if the question stem itself is an image
- Do not use fullImageMode just because the stem has a diagram — only use it when the OPTIONS themselves can't be cleanly extracted as text

Cross-question box accuracy (CRITICAL):
- Before finalizing each diagramBox, re-check which question NUMBER on the page is directly above the figure. The diagramBox belongs ONLY to that question.
- A diagramBox must NEVER cross, touch, or include any part of a neighboring question's number label, question text, or options — even if figures are visually close together or the page has a column layout.
- If the page has two columns, do NOT let a diagramBox span both columns or bleed from one column into the other.
- If multiple figures appear close together, double check each box is tightly scoped to only its own question's figure before outputting.
- CRITICAL: If the page consists primarily of solutions, answer keys, or does not contain explicit numbered test questions, return exactly []`


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

    const allEnrichedQuestions: any[] = []

    if (isPDF) {
      // General Method: Pass the raw PDF directly to Gemini for flawless text quality
      const base64 = fileBuffer.toString('base64')
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { data: base64, mimeType: 'application/pdf' } },
            { text: prompt }
          ]
        }],
        config: {
          responseMimeType: "application/json",
        }
      });

      let raw = response.text || "[]"
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      }

      let questions = []
      try {
        questions = JSON.parse(raw)
      } catch (e) {
        console.warn('Skipping PDF: No valid JSON found', e)
      }

      // For raw PDFs, we do not crop diagrams as we don't have an image buffer to crop from.
      const enriched = questions.map((q: any) => {
        delete q.diagramBox
        return q
      })
      
      allEnrichedQuestions.push(...enriched)
    } else {
      // Process standard images
      const base64 = fileBuffer.toString('base64')

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { data: base64, mimeType: file.type } },
            { text: prompt }
          ]
        }],
        config: {
          responseMimeType: "application/json",
        }
      });

      let raw = response.text || "[]"
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      }

      let questions = []
      try {
        questions = JSON.parse(raw)
      } catch (e) {
        console.warn('Skipping image: No valid JSON found', e)
      }

      const enriched = await Promise.all(
        questions.map(async (q: any) => {
          if (q.diagramBox && Array.isArray(q.diagramBox)) {
            const diagramBase64 = await cropDiagram(fileBuffer, q.diagramBox)
            return { ...q, diagramBase64 }
          }
          return q
        })
      )

      allEnrichedQuestions.push(...enriched)
    }

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
            text: q.text || q.text_en || q.text_hi || '',
            options: q.options || q.options_en || q.options_hi || {},
            text_en: q.text || q.text_en || '',
            text_hi: q.text_hi || '',
            options_en: q.options || q.options_en || {},
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
            has_latex: ((q.text || q.text_en || '').includes('$') || (q.text_hi || '').includes('$')),
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