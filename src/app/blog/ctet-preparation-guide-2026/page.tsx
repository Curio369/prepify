import type { Metadata } from 'next'
import Link from 'next/link'
import { getPost } from '@/lib/posts'

const post = getPost('ctet-preparation-guide-2026')!

export const metadata: Metadata = {
  title: 'CTET 2026 Preparation Guide — Pattern, Syllabus & Strategy | Prepify',
  description: post.description,
  keywords: ['CTET 2026', 'CTET preparation', 'CTET exam pattern', 'CTET qualifying marks', 'CTET certificate validity', 'CTET strategy', 'CTET PYQ'],
  alternates: { canonical: 'https://curioverse.in/blog/ctet-preparation-guide-2026' },
  openGraph: {
    title: 'CTET 2026: Complete Preparation Guide',
    description: post.description,
    url: 'https://curioverse.in/blog/ctet-preparation-guide-2026',
    type: 'article',
  },
}

export default function Post() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">Prepify</Link>
        <Link href="/blog" className="text-blue-600 hover:underline text-sm">← All guides</Link>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">Home</Link> {' › '}
          <Link href="/blog" className="hover:text-blue-600">Blog</Link> {' › '}
          <span>CTET 2026 Guide</span>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">CTET</span>
        <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-3 leading-tight">CTET 2026: Complete Preparation Guide</h1>
        <p className="text-gray-500 text-sm mb-8">Updated 24 June 2026 · {post.readMins} min read</p>

        <div className="text-gray-700 leading-relaxed space-y-8">
          <section>
            <p>
              The Central Teacher Eligibility Test (CTET) is a national-level exam conducted by the Central Board of
              Secondary Education (CBSE) twice a year. A valid CTET certificate is mandatory for teaching posts in
              central government schools such as Kendriya Vidyalayas (KVS) and Navodaya Vidyalayas (NVS), and is
              accepted by many private and state schools too.
            </p>
            <p className="mt-3">
              Here&apos;s the exam pattern, qualifying marks, certificate validity and a subject-wise strategy — with
              free mock tests and previous year papers to practise on.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">CTET Exam Pattern</h2>
            <p>
              CTET has two papers. <strong>Paper I</strong> is for aspiring teachers of Classes 1–5; <strong>Paper II</strong>{' '}
              is for Classes 6–8. Each paper has 150 MCQs for 150 marks in 2 hours 30 minutes, with <strong>no negative
              marking</strong>.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li><strong>Paper I:</strong> Child Development &amp; Pedagogy, Language I, Language II, Mathematics, Environmental Studies — 30 marks each.</li>
              <li><strong>Paper II:</strong> Child Development &amp; Pedagogy, Language I, Language II, and Mathematics &amp; Science or Social Studies (60 marks).</li>
            </ul>
            <p className="mt-3">
              Full details on the <Link href="/ctet/syllabus" className="text-blue-600 underline">CTET Syllabus 2026</Link> page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How to Prepare for CTET</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Prioritise Child Development &amp; Pedagogy.</strong> 30 marks of conceptual, scoring questions — master the major learning theories and their classroom application.</li>
              <li><strong>Drill previous year papers.</strong> CTET reuses themes heavily; our <Link href="/ctet/previous-year-papers" className="text-blue-600 underline">CTET previous year papers</Link> are the fastest way to learn the pattern.</li>
              <li><strong>Take timed full mocks</strong> on Prepify to build exam temperament and time management.</li>
              <li><strong>Score the language sections</strong> — comprehension and pedagogy questions are reliable, high-return marks.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div><p className="font-semibold text-gray-900">Are CTET mock tests on Prepify free?</p><p>Yes — subject-wise practice, full mocks and previous year papers are all free.</p></div>
              <div><p className="font-semibold text-gray-900">What is the qualifying mark for CTET?</p><p>You need 60% (90 out of 150) to qualify. There is no category-based relaxation in the qualifying percentage at the central level.</p></div>
              <div><p className="font-semibold text-gray-900">How long is the CTET certificate valid?</p><p>The CTET certificate is now valid for a lifetime.</p></div>
              <div><p className="font-semibold text-gray-900">How many times is CTET held each year?</p><p>CBSE typically conducts CTET twice a year, usually around July and December.</p></div>
            </div>
          </section>
        </div>

        <div className="mt-12 bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Start your CTET practice — free</h2>
          <p className="text-white/70 mb-6">Real exam interface, previous year papers, Hindi &amp; English.</p>
          <Link href="/ctet" className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition">
            Take a free CTET mock test →
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Related</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/ctet/syllabus" className="text-blue-600 hover:underline">CTET Syllabus 2026</Link>
            <Link href="/ctet/previous-year-papers" className="text-blue-600 hover:underline">CTET Previous Year Papers</Link>
            <Link href="/blog/uptet-preparation-guide-2026" className="text-blue-600 hover:underline">UPTET 2026 Guide</Link>
          </div>
        </div>
      </article>
    </div>
  )
}
