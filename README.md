# 🚀 PREPIFY — AI-Powered Exam Practice Platform

<div align="center">

![Prepify Banner](https://img.shields.io/badge/PREPIFY-AI%20Exam%20Practice-black?style=for-the-badge&labelColor=000000&color=4F46E5)

**Turn any practice paper into a real exam. Instantly.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini-Flash%20(Vertex%20AI)-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live · curioverse.in](https://curioverse.in) · [Report Bug](https://github.com/Curio369/prepify/issues) · [Request Feature](https://github.com/Curio369/prepify/issues)

</div>

---

## 🧭 What Prepify Is

Prepify is **two products under one roof**. They share the same exam engine, auth, and database — but they serve different students and should not be confused with each other.

| | 🅰️ **DPP Engine** *(the core product)* | 🅱️ **UPTET / CTET Prep** *(the side product)* |
|---|---|---|
| **Who it's for** | JEE, NEET, NDA & competitive-exam aspirants (teens) | Aspiring government school teachers (UPTET / CTET) |
| **Where questions come from** | The student **uploads** their own DPP / test paper; AI extracts it live | A **pre-built, curated question bank** (PYQs + topic banks) |
| **Core magic** | AI vision turns a photo of a paper into a playable exam | Ready-made bilingual mock tests in the real exam pattern |
| **Interface** | Shared **timed exam interface** (timer, palette, mark-for-review) | The **same** shared exam interface |
| **Status** | Main focus, the long-term bet | Built quickly as a standalone vertical; lives at `/uptet` & `/ctet` |

> ⚠️ **These two are intentionally separate.** The DPP Engine is "bring your own paper." The UPTET/CTET vertical is "we already have the papers." They reuse the **same single exam interface** today, but the content sources and user journeys are different by design.
>
> 🚧 **Note on the interface:** right now there is **one shared, generic exam interface**. Building **exam-specific interfaces** — a real NTA-style screen for JEE Main / NEET, etc. — is the **next item on the roadmap**, planned right after the UPTET/CTET work. UPTET/CTET do **not** use an NTA interface; they simply use the shared exam interface.

```
🅰️  📸 Upload DPP   → 🤖 AI Extracts → 📝 Real Exam UI → 📊 AI Solutions
🅱️  🎯 Pick a mode  → 💾 DB Question Bank → 📝 Real Exam UI → 📊 Score + Analysis
```

---

## 📖 Table of Contents

- [Segment A — The DPP Engine](#-segment-a--the-dpp-engine-core-product)
- [Segment B — UPTET / CTET Prep](#-segment-b--uptet--ctet-prep-side-product)
- [Shared Architecture](#-shared-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Pipeline Deep Dive](#-pipeline-deep-dive)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Roadmap](#-roadmap)
- [Business Model](#-business-model)
- [Contributing](#-contributing)

---

# 🅰️ Segment A — The DPP Engine (Core Product)

## 🎯 The Problem

India has **2.5 million+ JEE/NEET aspirants** every year. The difference between a student at Allen Kota and a student in a small town is not intelligence — it is **access**.

| The Gap | Rich Student (Kota) | Poor Student (Small Town) |
|---|---|---|
| Quality DPPs | Paid coaching, printed sheets | Photocopied or nothing |
| Exam Simulation | Full NTA mock tests | No interface, just paper |
| Solutions | Instant from teachers | Wait days or never |
| Performance Analysis | Detailed reports | Self-evaluated or none |

Today a student downloads a coaching DPP from a Telegram channel as a PDF/image, prints or annotates it, solves on paper, then hunts for the answer key. There is no timer, no real interface, no instant explanation.

**Prepify closes this gap.** A kid in a small town with a 4G phone gets the **exact same practice quality** as someone in Kota.

## 💡 The Solution

1. Student **uploads** any coaching DPP or test paper (image or PDF)
2. AI **extracts** every question, both languages, options, correct answer, subject, topic, difficulty — and a step-by-step solution
3. Diagrams (physics figures, chemistry structures, biology labels) are **cropped out** and re-attached to their question
4. Questions **render in a timed exam interface** with a countdown timer, question palette and mark-for-review *(exam-specific NTA-style screens for JEE Main / NEET are on the roadmap)*
5. On submit, the student gets a **score + instant AI explanations** for every question
6. Every upload can **feed a crowdsourced question bank** — the platform's content grows by itself

### The Full User Journey

```mermaid
flowchart TD
    A([👤 Student]) --> B[Opens Prepify]
    B --> C[Sign in required]
    C --> D[Upload DPP]
    D --> E{File Type?}
    E -->|Image| F[JPEG/PNG/WebP]
    E -->|PDF| G[PDF → page images]
    F --> H["/api/extract Route"]
    G --> H
    H --> I[Send to Gemini Flash Vision]
    I --> J[AI reads every question, both languages]
    J --> K{Has Diagrams?}
    K -->|Yes| L[Get diagramBox coordinates]
    K -->|No| M[Text + Options Only]
    L --> N[Sharp crops diagram region]
    N --> O[Attach cropped image to question]
    M --> P[Structured JSON]
    O --> P
    P --> Q{Save to question bank?}
    Q -->|Yes| R[(Supabase: questions + Storage)]
    Q --> S[Redirect to /exam]
    R --> S
    S --> T[Real exam interface + timer]
    T --> U{Submit or Time Up?}
    U --> V[Score + AI explanations]
    V --> A

    style A fill:#4F46E5,color:#fff
    style I fill:#4285F4,color:#fff
    style N fill:#16A34A,color:#fff
    style T fill:#7C3AED,color:#fff
    style V fill:#DC2626,color:#fff
```

### Key DPP-Engine Features

- 📸 **Image & PDF upload** — multi-page PDFs are split into page images automatically
- 🌐 **Bilingual extraction** — every question captured in English *and* Hindi where present, with a live language toggle in the exam
- ✂️ **Smart diagram cropping** — figures are detected and cut out so chemistry structures / physics diagrams render crisply (see [Pipeline Deep Dive](#-pipeline-deep-dive))
- 🧮 **LaTeX math** via KaTeX — `$inline$` and `$$block$$`
- ⏱️ **Real exam interface** — timer, question palette, mark-for-review, clear-response
- ✨ **Instant AI solutions** — explanations are generated during extraction and revealed after submit
- 🔁 **Crowdsourced bank** — uploads optionally persist to a shared, subject-tagged question bank

---

# 🅱️ Segment B — UPTET / CTET Prep (Side Product)

A **separate vertical** for candidates of India's teacher-eligibility tests (UPTET — Uttar Pradesh, and CTET — Central). Unlike the DPP Engine, students here **don't upload anything** — Prepify ships a ready-made, curated bilingual question bank and exam structure.

> This segment was built quickly as a standalone offering. It reuses the shared exam engine but has its own landing pages, question bank, exam-generation logic, and SEO content.

### What it offers

- 🗂️ **Curated bilingual question bank** — PYQs and topic banks imported via [`scripts/importPYQ.ts`](scripts/importPYQ.ts), tagged by `exam_type`, `subject`, `paper`, and `year`
- 🎛️ **Three practice modes** (`/uptet`, `/ctet`):
  - **Topic / Subject practice** — drill a single subject (CDP, Language I/II, Maths, EVS, Science, Social Studies)
  - **Full Mock** — a complete paper assembled with the real section structure (≈30 questions per section, 60 for the Paper II optional)
  - **PYQ mode** — year-wise previous papers, served in original order
- 🧩 **Real paper structure** — Paper I (Class 1–5) & Paper II (Class 6–8), Language II choice (English / Urdu / Sanskrit), and the Paper II stream choice (Maths & Science / Social Studies)
- 🪄 **Learning vs Exam mode** — instant answer reveal for study, or timed submit-then-analyse for a mock
- 🔎 **SEO content pages** — `/uptet/syllabus`, `/ctet/syllabus`, `/uptet/previous-year-papers`, `/ctet/previous-year-papers`, plus `sitemap.ts` and `robots.ts` to rank for "UPTET/CTET syllabus / PYQ" searches

### How a UPTET/CTET exam is assembled

```mermaid
flowchart LR
    A([👤 Candidate]) --> B["/uptet or /ctet"]
    B --> C{Mode}
    C -->|Topic| D[Pick subject]
    C -->|Full Mock| E["Pick Paper I/II + Lang II + stream"]
    C -->|PYQ| F[Pick year + paper]
    D --> G["/api/exams/generate"]
    E --> G
    F --> G
    G --> H[(Supabase questions)]
    H --> I{Sort strategy}
    I -->|Topic| J[Shuffle subject pool]
    I -->|Full Mock| K["Group by subject → shuffle each section"]
    I -->|PYQ| L[Preserve original order]
    J --> M[Exam interface]
    K --> M
    L --> M
    M --> N["Score + analysis"]

    style A fill:#0891B2,color:#fff
    style G fill:#4285F4,color:#fff
    style M fill:#7C3AED,color:#fff
```

---

# 🏗️ Shared Architecture

Both segments sit on the same foundation. The difference is **where questions originate** (live AI extraction vs. the DB bank) — everything downstream (auth, exam UI, scoring) is shared.

```mermaid
graph TB
    subgraph CLIENT ["🌐 Client (Browser)"]
        LP["Landing /"]
        UP["Upload /upload (A)"]
        UPTET["/uptet · /ctet (B)"]
        EP["Exam UI: /exam · /uptet/exam · /ctet/exam"]
        RP["Results /results"]
    end

    subgraph SERVER ["⚡ Next.js Server (App Router)"]
        EX["(A) /api/extract — live extraction"]
        GEN["(B) /api/exams/generate — bank to exam"]
        SOL["/api/solutions · /api/explain"]
        QS["/api/questions · /api/questions/save"]
        CB["/auth/callback — OAuth"]
    end

    subgraph AI ["🤖 AI Layer"]
        GV["Gemini Flash — Vision + Reasoning via Vertex AI"]
    end

    subgraph PROC ["🔧 Processing"]
        SH["Sharp — diagram cropping"]
        PDF["pdf-to-png-converter — PDF to images"]
    end

    subgraph DB ["💾 Supabase"]
        PG[("PostgreSQL — questions, profiles")]
        ST[("Storage — dpp_images")]
        AUTH["Auth — Google OAuth + RLS"]
    end

    UP -->|POST multipart| EX
    EX --> GV
    EX --> SH
    EX --> PDF
    EX --> ST
    EX --> PG
    UPTET --> GEN
    GEN --> PG
    EP --> SOL
    SOL --> GV
    EP --> AUTH
    UP --> AUTH
```

### Security model

- 🔐 **Auth-guarded routes** — `/exam`, `/upload`, `/results` use a client `useRequireAuth` guard; `/api/extract` and `/api/questions/save` verify the server-side session before spending any tokens
- 🛡️ **Row Level Security** — the public `anon` key only has read access; all trusted writes go through a `service_role` client (`supabase-admin.ts`) that bypasses RLS
- 📦 **Batch caps** — bulk insert endpoints cap request size to prevent table flooding

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | File routing, API routes, SSR/metadata |
| **UI** | React 19 + TypeScript | Type safety, modern concurrent React |
| **Styling** | Tailwind CSS v4 + shadcn/ui (Radix) | Rapid, consistent design system |
| **AI** | Gemini Flash via **Vertex AI** (`@google/genai`) | Vision + reasoning, native PDF, JSON mode |
| **Image Processing** | Sharp | Fast diagram crop, PNG/JPEG/WebP conversion |
| **PDF** | pdf-to-png-converter / pdf2pic | PDF pages → images without ImageMagick |
| **Math** | KaTeX + react-katex | Client-side LaTeX, no server needed |
| **Database / Auth / Storage** | Supabase (PostgreSQL + Auth + Storage + RLS) | One backend, Google OAuth, RLS |
| **Hosting** | Vercel | Instant Next.js deploys |
| **Analytics** | Vercel Analytics | Privacy-friendly page/visitor metrics |

---

## 📁 Project Structure

```
prepify/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── extract/route.ts        # 🅰️ Core: live DPP extraction pipeline
│   │   │   ├── exams/generate/route.ts  # 🅱️ Build UPTET/CTET exam from DB bank
│   │   │   ├── solutions/route.ts       # AI solutions for submitted exams
│   │   │   ├── explain/route.ts         # On-demand single-question explanation
│   │   │   └── questions/
│   │   │       ├── route.ts             # Question bank read
│   │   │       └── save/route.ts        # Auth-guarded bulk insert (service_role)
│   │   ├── auth/callback/route.ts       # Supabase OAuth callback
│   │   ├── upload/page.tsx              # 🅰️ DPP upload interface
│   │   ├── exam/page.tsx                # Shared real-exam interface (from upload)
│   │   ├── results/page.tsx             # Score + solutions
│   │   ├── uptet/                       # 🅱️ UPTET vertical
│   │   │   ├── page.tsx                 #    modes: subject / full mock / PYQ
│   │   │   ├── exam/page.tsx            #    exam runner
│   │   │   ├── layout.tsx               #    per-route SEO metadata
│   │   │   ├── syllabus/page.tsx        #    SEO content
│   │   │   └── previous-year-papers/    #    SEO content
│   │   ├── ctet/                        # 🅱️ CTET vertical (mirrors /uptet)
│   │   ├── login/ · privacy/ · terms/ · refund/
│   │   ├── sitemap.ts · robots.ts       # SEO
│   │   ├── layout.tsx                   # Root layout (metadata, analytics)
│   │   └── page.tsx                     # Landing page
│   ├── components/
│   │   ├── upload/DPPUploader.tsx
│   │   ├── exam/                        # ExamEngine, QuestionCard, QuestionPalette, ExamTimer
│   │   ├── landing/                     # hero, features, pricing, navigation, …
│   │   ├── ads/AdUnit.tsx
│   │   └── ui/                          # shadcn/ui components
│   ├── lib/
│   │   ├── gemini.ts                    # AI client setup
│   │   ├── imageProcessor.ts            # Sharp crop logic
│   │   ├── pdfToImage.ts                # PDF → image buffers
│   │   ├── supabase.ts                  # Public (anon) client — RLS-respecting reads
│   │   ├── supabase-admin.ts            # service_role client — trusted writes
│   │   ├── supabase-server.ts           # Server session / getServerUser()
│   │   └── useRequireAuth.ts            # Client route guard
│   └── types/
├── scripts/
│   └── importPYQ.ts                     # 🅱️ Bulk-import UPTET/CTET PYQs into the bank
├── public/
├── .env.local                          # Secrets (never commit!)
└── package.json
```

---

## 🔌 API Reference

### 🅰️ `POST /api/extract` — live DPP extraction *(auth required)*

Accepts a DPP image or PDF, returns structured bilingual questions; optionally persists them.

**Request** — `multipart/form-data`:
| Field | Notes |
|---|---|
| `file` | image/jpeg, png, webp, or application/pdf |
| `exam_type` | tag for the saved questions (default `General`) |
| `save_to_db` | `"true"` to persist to the bank + Storage |

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "text_en": "A ring of radius $R$ rolls over a rough surface with velocity $v_0$.",
      "text_hi": "...",
      "options_en": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "options_hi": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct": "A",
      "explanation": "Step-by-step solution …",
      "subject": "Physics",
      "topic": "Rotational Motion",
      "difficulty": "hard",
      "diagramBox": [292, 270, 440, 500],
      "diagramBase64": "data:image/jpeg;base64,/9j/4AAQ..."
    }
  ],
  "saved_to_db": true
}
```

`diagramBox` is `[ymin, xmin, ymax, xmax]`, normalized to **0–1000** (Gemini's coordinate space).

### 🅱️ `GET /api/exams/generate` — assemble an exam from the bank

| Query param | Purpose |
|---|---|
| `exam_type` | `UPTET` / `CTET` |
| `subject` / `subjects` | single subject, or comma-list for a full paper |
| `year` | filter to a PYQ year |
| `limit` | number of questions |
| `sort=subject` | group & shuffle per section (full mock) |
| `ordered=true` | preserve original order (PYQ mode) |

### Other routes
- `POST /api/solutions` — solutions for a completed attempt
- `POST /api/explain` — explanation for a single question
- `GET /api/questions` — read the bank · `POST /api/questions/save` — auth-guarded bulk insert
- `GET /auth/callback` — Supabase OAuth callback

---

## 🔬 Pipeline Deep Dive

*(applies to the 🅰️ DPP Engine)*

### 1. Prompt engineering

Getting Gemini to reliably extract structured data from noisy, watermarked coaching material was the hardest problem. The production prompt:

- Returns **JSON only** (enforced via `responseMimeType: "application/json"`)
- Extracts **both languages** (`text_en` / `text_hi`, `options_en` / `options_hi`)
- Generates an **explanation per question** inline
- Tags **subject / topic / difficulty**
- Has **subject-specific diagram rules** — chemistry structures, physics figures, biology labels must use `diagramBox`, never LaTeX
- Has a **full-image fallback** (`fullImageMode`) when options can't be cleanly separated as text
- Returns `[]` for pure answer-key / solution pages

**Key learnings:** numbered rules beat bullets; explicit "never/always" reduces hallucination; separating *extraction* rules from *diagram* rules reduces confusion; an explicit watermark instruction was critical for coaching DPPs.

### 2. The Sharp coordinate system

Gemini returns coordinates normalized to 1000; Sharp needs real pixels:

```
image 1200×1600, diagramBox = [292, 270, 440, 500]  (ymin, xmin, ymax, xmax)

left   = (270/1000) × 1200 = 324px
top    = (292/1000) × 1600 = 467px
width  = ((500-270)/1000) × 1200 = 276px
height = ((440-292)/1000) × 1600 = 237px
+ padding on all sides, clamped to image bounds → crop → Base64
```

### 3. KaTeX rendering

```typescript
function renderText(text: string) {
  if (!text) return null;
  const sanitized = text
    .replace(/–/g, '-')   // en dash
    .replace(/—/g, '-')   // em dash
    .replace(/−/g, '-');  // math minus
  const parts = sanitized.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith('$$')) return <BlockMath key={i} math={part.slice(2, -2)} />;
    if (part.startsWith('$'))  return <InlineMath key={i} math={part.slice(1, -1)} />;
    return <span key={i}>{part}</span>;
  });
}
```

### 4. PDF handling

Sharp can't read PDF buffers directly. PDFs are first rasterized to per-page images (`pdf-to-png-converter`), then each page runs through the same Gemini → Sharp pipeline as a normal image.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Cloud project with **Vertex AI** enabled (or a Gemini API key)
- A Supabase project

### Installation

```bash
git clone https://github.com/Curio369/prepify.git
cd prepify
npm install

cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Importing UPTET/CTET questions (Segment B)

```bash
npx tsx scripts/importPYQ.ts   # bulk-loads PYQs into the question bank (uses service_role key)
```

---

## 🔐 Environment Variables

```env
# ── Google / Vertex AI (Segment A extraction) ──
GCP_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# (locally you can use `gcloud auth application-default login` instead)

# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only, bypasses RLS
```

> ⚠️ **Never commit `.env.local`.** The `service_role` key must stay server-side only.

---

## 🗺️ Roadmap

### ✅ Done
**Shared**
- [x] Real exam interface — timer, question palette, mark-for-review, clear-response
- [x] KaTeX math rendering · bilingual (EN/HI) toggle
- [x] Google OAuth (Supabase) + auth-guarded routes
- [x] Row Level Security + service-role write path
- [x] Live at `curioverse.in` (Vercel) + Vercel Analytics

**🅰️ DPP Engine**
- [x] Image & multi-page PDF upload
- [x] Gemini vision extraction (bilingual, subject/topic/difficulty)
- [x] Diagram detection + Sharp cropping → Supabase Storage
- [x] Inline AI explanations
- [x] Save uploads to crowdsourced question bank

**🅱️ UPTET/CTET**
- [x] Curated bilingual question bank + bulk PYQ importer
- [x] Subject / Full-Mock / PYQ modes with real section structure
- [x] Paper I & II, Language II + stream selectors
- [x] SEO content pages, sitemap, robots, per-route metadata

### 🚧 Next
- [ ] **Exam-specific interfaces** — dedicated NTA-style screens per exam (JEE Main, NEET, …), replacing the single shared interface *(immediate next task, after UPTET/CTET)*
- [ ] Payment gateway (subscriptions) + upload-limit enforcement
- [ ] Exam history per user · performance analytics dashboard
- [ ] Weak-chapter detection → personalized practice sets
- [ ] Browse / filter the question bank directly (practice mode, no timer)
- [ ] B2B portal for coaching institutes

---

## 💰 Business Model

The **DPP Engine** is the monetizable core: free users get a limited number of uploads (enforced via `profiles.upload_limit` / `uploads_this_month`); heavy users subscribe. The **UPTET/CTET** vertical is currently a free, SEO-driven acquisition channel.

| Plan | Price | Features |
|---|---|---|
| **Free** | ₹0 | A few DPP uploads (daily cap), full exam UI, basic solutions, free UPTET/CTET mocks |
| **Student Pro** | paid | Higher/unlimited uploads, full AI solutions, question bank access |
| **Coaching B2B** | paid | Bulk digitization, white-label, analytics |

> 💡 Pricing/tier numbers are indicative — the payment gateway is the next milestone.

### The flywheel (Segment A's unfair advantage)

```mermaid
graph LR
    A[More students upload DPPs] --> B[Bigger question bank]
    B --> C[Better practice experience]
    C --> D[More students join]
    D --> A
    style A fill:#4F46E5,color:#fff
    style B fill:#7C3AED,color:#fff
    style C fill:#2563EB,color:#fff
    style D fill:#0891B2,color:#fff
```

Unlike platforms that pay crores to author content, Prepify's bank **builds itself** with every upload.

---

## 🤝 Contributing

```bash
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# open a Pull Request
```

**Commit convention:** `feat:` · `fix:` · `docs:` · `style:` · `refactor:` · `perf:` · `test:`

---

## 👥 Team

| Name | Role | GitHub |
|---|---|---|
| Curio | Founder, Full Stack + AI | [@Curio369](https://github.com/Curio369) |

---

## 📄 License

MIT — see [LICENSE](LICENSE).

## 🙏 Acknowledgments


- 🤖 **Claude (Anthropic)** — AI pair-programmer through the build
- [Google Gemini / Vertex AI](https://ai.google.dev) — vision + reasoning
- [Supabase](https://supabase.com) — auth, Postgres, storage
- [KaTeX](https://katex.org) · [Sharp](https://sharp.pixelplumbing.com) · [shadcn/ui](https://ui.shadcn.com)
- Every JEE/NEET/NDA aspirant and future teacher who deserves a fair shot

---

<div align="center">

**Built with ❤️ for every student in India who deserves a fair shot.**

[⭐ Star this repo](https://github.com/Curio369/prepify) · [🐛 Report a bug](https://github.com/Curio369/prepify/issues) · [💡 Request a feature](https://github.com/Curio369/prepify/issues)

</div>
