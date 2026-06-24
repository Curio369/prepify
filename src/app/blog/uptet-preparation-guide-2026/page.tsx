import type { Metadata } from 'next'
import Link from 'next/link'
import { getPost } from '@/lib/posts'

const post = getPost('uptet-preparation-guide-2026')!

export const metadata: Metadata = {
  title: 'UPTET 2026 Preparation Guide — Pattern, Syllabus & Strategy | Prepify',
  description: post.description,
  keywords: ['UPTET 2026', 'UPTET preparation', 'UPTET exam pattern', 'UPTET eligibility', 'UPTET qualifying marks', 'UPTET strategy', 'UPTET PYQ'],
  alternates: { canonical: 'https://curioverse.in/blog/uptet-preparation-guide-2026' },
  openGraph: {
    title: 'UPTET 2026: Complete Preparation Guide',
    description: post.description,
    url: 'https://curioverse.in/blog/uptet-preparation-guide-2026',
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
          <span>UPTET 2026 Guide</span>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700">UPTET</span>
        <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-3 leading-tight">UPTET 2026: Complete Preparation Guide</h1>
        <p className="text-gray-500 text-sm mb-8">Updated 24 June 2026 · {post.readMins} min read</p>

        <div className="prose-custom text-gray-700 leading-relaxed space-y-8">
          <section>
            <p>
              The Uttar Pradesh Teacher Eligibility Test (UPTET) is a state-level examination conducted by the Uttar
              Pradesh Basic Education Board (UPBEB) to certify candidates for teaching posts in government and aided
              schools across Uttar Pradesh. Clearing UPTET is a mandatory eligibility requirement for anyone aspiring
              to become a primary (Classes 1–5) or upper-primary (Classes 6–8) teacher in the state.
            </p>
            <p className="mt-3">
              This guide covers the exam pattern, eligibility, qualifying marks, and a proven preparation strategy —
              plus where to get free mock tests and previous year papers.
            </p>
          </section>

          {/* Telegram CTA */}
          <div className="not-prose border border-blue-200 bg-blue-50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">📣 Join our UPTET PYQ Telegram channel</p>
              <p className="text-sm text-gray-600 mt-0.5">Free previous year papers, updates and daily practice for UPTET aspirants.</p>
            </div>
            <a
              href="https://t.me/uptet_exam_pyqs"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-700 transition"
            >
              Join Channel →
            </a>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">UPTET Exam Pattern</h2>
            <p>
              UPTET has two papers. <strong>Paper I</strong> is for candidates who want to teach Classes 1–5, and{' '}
              <strong>Paper II</strong> is for those targeting Classes 6–8. Each paper carries 150 marks, contains 150
              multiple-choice questions, and must be completed in 2 hours 30 minutes. There is <strong>no negative
              marking</strong>, so you should attempt every question.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li><strong>Paper I (Class 1–5):</strong> Child Development &amp; Pedagogy, Language I (Hindi), Language II (English/Urdu/Sanskrit), Mathematics, and Environmental Studies — 30 marks each.</li>
              <li><strong>Paper II (Class 6–8):</strong> Child Development &amp; Pedagogy, Language I, Language II, and then either Mathematics &amp; Science or Social Studies — 60 marks.</li>
            </ul>
            <p className="mt-3">
              See the full subject-wise breakdown on the <Link href="/uptet/syllabus" className="text-blue-600 underline">UPTET Syllabus 2026</Link> page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Eligibility</h2>
            <p>
              For Paper I, you generally need a senior secondary (10+2) qualification with at least 50% marks along with
              a diploma/degree in elementary education (such as D.El.Ed or BTC). For Paper II, a bachelor&apos;s degree
              along with the relevant teaching qualification (B.Ed or D.El.Ed) is required. Always confirm the exact
              criteria from the official UPBEB notification for the current cycle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How to Prepare for UPTET</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Master Child Development &amp; Pedagogy (CDP).</strong> It carries 30 marks and is the most scoring section once you understand the theories of Piaget, Vygotsky and Kohlberg. Focus on application, not rote learning.</li>
              <li><strong>Solve previous year papers.</strong> UPTET repeats patterns and even questions. Practising <Link href="/uptet/previous-year-papers" className="text-blue-600 underline">UPTET previous year papers</Link> is the single highest-return activity.</li>
              <li><strong>Practise in a timed, exam-like environment.</strong> Reading notes is not the same as performing under a clock. Take full mock tests on Prepify to build speed and accuracy together.</li>
              <li><strong>Revise language pedagogy.</strong> Both language sections reward comprehension and teaching-method questions — easy marks with consistent practice.</li>
              <li><strong>Track your weak subjects</strong> and give them extra subject-wise practice until your accuracy crosses 80%.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div><p className="font-semibold text-gray-900">Is the UPTET mock test on Prepify free?</p><p>Yes. All UPTET practice — subject-wise tests, full mocks and previous year papers — is completely free.</p></div>
              <div><p className="font-semibold text-gray-900">What are the qualifying marks for UPTET?</p><p>General category candidates need 90 out of 150 (60%). Reserved categories typically need 82.5 (55%). Always verify with the official notification.</p></div>
              <div><p className="font-semibold text-gray-900">How long is the UPTET certificate valid?</p><p>The UPTET certificate is currently valid for 5 years from the date of result; check the latest UPBEB rules.</p></div>
              <div><p className="font-semibold text-gray-900">Is there negative marking in UPTET?</p><p>No. There is no negative marking, so attempt all 150 questions.</p></div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Start your UPTET practice — free</h2>
          <p className="text-white/70 mb-6">Real exam interface, previous year papers, Hindi &amp; English.</p>
          <Link href="/uptet" className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition">
            Take a free UPTET mock test →
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Related</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/uptet/syllabus" className="text-blue-600 hover:underline">UPTET Syllabus 2026</Link>
            <Link href="/uptet/previous-year-papers" className="text-blue-600 hover:underline">UPTET Previous Year Papers</Link>
            <Link href="/blog/ctet-preparation-guide-2026" className="text-blue-600 hover:underline">CTET 2026 Guide</Link>
          </div>
        </div>
      </article>
    </div>
  )
}
