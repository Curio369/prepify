import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CTET Previous Year Question Papers — Free PYQ Practice | Prepify',
  description: 'Practice CTET previous year question papers (PYQ) for 2023, 2022, 2021, 2020, 2019. Free mock tests with answer key and AI explanations on real NTA-like interface.',
  keywords: [
    'CTET previous year papers', 'CTET PYQ', 'CTET question paper 2023',
    'CTET question paper 2022', 'CTET question paper 2021', 'CTET answer key',
    'CTET old papers', 'CTET paper 1 previous year', 'CTET paper 2 previous year',
    'CTET question paper with answer pdf', 'CBSE CTET previous papers',
  ],
  alternates: { canonical: 'https://curioverse.in/ctet/previous-year-papers' },
  openGraph: {
    title: 'CTET Previous Year Papers — Free PYQ Practice | Prepify',
    description: 'Practice CTET PYQs for 2019–2023 with answer key and AI explanations.',
    url: 'https://curioverse.in/ctet/previous-year-papers',
  },
}

const papers = [
  { year: 2023, paper: 'Paper 1', subject: 'All Subjects', questions: 150, available: true },
  { year: 2023, paper: 'Paper 2', subject: 'All Subjects', questions: 150, available: true },
  { year: 2022, paper: 'Paper 1', subject: 'All Subjects', questions: 150, available: true },
  { year: 2022, paper: 'Paper 2', subject: 'All Subjects', questions: 150, available: true },
  { year: 2021, paper: 'Paper 1', subject: 'All Subjects', questions: 150, available: true },
  { year: 2021, paper: 'Paper 2', subject: 'All Subjects', questions: 150, available: true },
  { year: 2020, paper: 'Paper 1', subject: 'All Subjects', questions: 150, available: false },
  { year: 2019, paper: 'Paper 1', subject: 'All Subjects', questions: 150, available: false },
]

const subjects = [
  { name: 'Child Development & Pedagogy', icon: '🧠' },
  { name: 'Hindi Language', icon: '📝' },
  { name: 'English Language', icon: '🔤' },
  { name: 'Mathematics', icon: '📐' },
  { name: 'Environmental Studies', icon: '🌿' },
  { name: 'Social Science', icon: '🗺️' },
]

export default function CTETPYQPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">Prepify</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/uptet" className="text-blue-600 hover:underline">UPTET Mock Tests</Link>
          <Link href="/ctet" className="text-blue-600 hover:underline">CTET Mock Tests</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {' › '}
          <Link href="/ctet" className="hover:text-blue-600">CTET</Link>
          {' › '}
          <span>Previous Year Papers</span>
        </div>

        <h1 className="text-4xl font-bold mb-3">CTET Previous Year Question Papers</h1>
        <p className="text-xl text-gray-600 mb-4">
          Practice CTET PYQs from 2019 to 2023 — with answer key and AI-powered explanations
        </p>
        <p className="text-gray-500 mb-10 text-sm">
          CTET is conducted by CBSE twice a year (July and December). Practicing previous year papers helps you understand the pattern, question style, and CDP weightage — which accounts for 30 out of 150 marks.
        </p>

        {/* Quick start */}
        <div className="bg-blue-600 text-white rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-lg">Practice Full Mock Test Now</p>
            <p className="text-blue-100 text-sm">150 questions • NTA interface • No login required to start</p>
          </div>
          <Link
            href="/ctet"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition whitespace-nowrap"
          >
            Start Mock Test →
          </Link>
        </div>

        {/* Paper list */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Papers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {papers.map((p) => (
              <div
                key={`${p.year}-${p.paper}`}
                className={`border rounded-xl p-5 flex items-center justify-between ${p.available ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm transition' : 'border-gray-100 opacity-50'}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{p.year}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.paper}</span>
                  </div>
                  <p className="text-sm text-gray-500">{p.questions} Questions • {p.subject}</p>
                </div>
                {p.available ? (
                  <Link
                    href="/ctet"
                    className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
                  >
                    Practice
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400">Coming soon</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Subject-wise */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Subject-wise Practice</h2>
          <p className="text-gray-500 text-sm mb-6">Focus on weak areas with subject-wise question banks</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <Link
                key={s.name}
                href="/ctet"
                className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition flex items-center gap-3"
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-sm font-medium">{s.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Key facts */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-3xl font-bold text-blue-600 mb-1">60%</p>
            <p className="font-semibold mb-1">Qualifying Score</p>
            <p className="text-sm text-gray-500">90 out of 150 marks required. CTET has no category-based relaxation unlike UPTET.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-3xl font-bold text-green-600 mb-1">Lifetime</p>
            <p className="font-semibold mb-1">Certificate Validity</p>
            <p className="text-sm text-gray-500">CTET certificate is now valid for lifetime (changed from 7 years in 2021).</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-3xl font-bold text-orange-500 mb-1">2×/year</p>
            <p className="font-semibold mb-1">Exam Frequency</p>
            <p className="text-sm text-gray-500">CBSE conducts CTET typically in July and December each year.</p>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">CTET Preparation Strategy</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3"><span className="font-bold text-amber-600 shrink-0">1.</span><span><strong>CDP is the key</strong> — 30 marks, purely conceptual. Focus on Piaget, Vygotsky, Kohlberg theories. Most aspirants lose marks here.</span></li>
            <li className="flex gap-3"><span className="font-bold text-amber-600 shrink-0">2.</span><span><strong>Language papers are scoring</strong> — Both Language I and II (60 marks total) are straightforward if you practice comprehension passages daily.</span></li>
            <li className="flex gap-3"><span className="font-bold text-amber-600 shrink-0">3.</span><span><strong>Pedagogy &gt; Content</strong> — Questions test HOW to teach, not just WHAT to teach. Understand teaching methods, not just facts.</span></li>
            <li className="flex gap-3"><span className="font-bold text-amber-600 shrink-0">4.</span><span><strong>Time management</strong> — 150 questions in 150 minutes = 1 minute per question. Never spend more than 90 seconds on any question.</span></li>
          </ol>
        </section>

        {/* CTA */}
        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Start Your CTET Preparation Today</h2>
          <p className="text-white/70 mb-6">Free mock tests • Real NTA interface • AI explanations • No payment required</p>
          <Link
            href="/ctet"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition"
          >
            Take Free CTET Mock Test →
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Related Resources</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/ctet/syllabus" className="text-blue-600 hover:underline text-sm">CTET Syllabus 2024</Link>
            <Link href="/uptet/previous-year-papers" className="text-blue-600 hover:underline text-sm">UPTET Previous Year Papers</Link>
            <Link href="/uptet/syllabus" className="text-blue-600 hover:underline text-sm">UPTET Syllabus 2024</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
