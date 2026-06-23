import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'UPTET Syllabus 2024 — Paper 1 & Paper 2 Complete Syllabus | Prepify',
  description: 'Complete UPTET 2024 syllabus for Paper 1 (Class 1-5) and Paper 2 (Class 6-8). Subject-wise topics, exam pattern, marking scheme and free mock tests.',
  keywords: [
    'UPTET syllabus 2024', 'UPTET paper 1 syllabus', 'UPTET paper 2 syllabus',
    'UPTET exam pattern', 'UPTET syllabus in hindi', 'UP teacher eligibility test syllabus',
    'UPTET child development syllabus', 'UPTET language syllabus', 'UPTET maths syllabus',
  ],
  alternates: { canonical: 'https://curioverse.in/uptet/syllabus' },
  openGraph: {
    title: 'UPTET Syllabus 2024 — Complete Paper 1 & 2 | Prepify',
    description: 'Complete UPTET 2024 syllabus with exam pattern, subject-wise topics and free mock tests.',
    url: 'https://curioverse.in/uptet/syllabus',
  },
}

const paper1Subjects = [
  {
    name: 'Child Development & Pedagogy',
    marks: 30,
    topics: [
      'Child Development (Primary School Child)',
      'Concept of Inclusive Education',
      'Learning and Pedagogy',
      'Understanding Children with Special Needs',
      'How Children Learn and Think',
    ],
  },
  {
    name: 'Language I (Hindi)',
    marks: 30,
    topics: [
      'Unseen Prose Passage',
      'Unseen Poem',
      'Grammar & Linguistic Competence',
      'Pedagogy of Language Development',
      'Challenges of Teaching Language in a Diverse Classroom',
    ],
  },
  {
    name: 'Language II (English/Urdu/Sanskrit)',
    marks: 30,
    topics: [
      'Comprehension (Two Unseen Prose Passages)',
      'Grammar & Verbal Ability',
      'Pedagogy of Language Development',
      'Language Skills — Listening, Speaking, Reading, Writing',
    ],
  },
  {
    name: 'Mathematics',
    marks: 30,
    topics: [
      'Number System, Fractions, Decimals',
      'Basic Geometrical Ideas',
      'Mensuration — Area & Perimeter',
      'Data Handling & Patterns',
      'Pedagogical Issues in Mathematics',
    ],
  },
  {
    name: 'Environmental Studies (EVS)',
    marks: 30,
    topics: [
      'Family and Friends, Food, Shelter, Water, Travel',
      'Things We Make and Do',
      'Concept and Scope of EVS',
      'Environmental Pedagogy',
      'Activities, Discussion, Experimentation',
    ],
  },
]

const paper2Subjects = [
  {
    name: 'Child Development & Pedagogy',
    marks: 30,
    topics: [
      'Child Development (Elementary School Child)',
      'Concept of Inclusive Education',
      'Learning and Pedagogy',
      'Motivation and Learning',
      'Factors Contributing to Learning',
    ],
  },
  {
    name: 'Language I (Hindi)',
    marks: 30,
    topics: [
      'Unseen Prose Passage & Poem',
      'Grammar & Linguistic Competence',
      'Pedagogy of Language Development',
    ],
  },
  {
    name: 'Language II (English/Urdu/Sanskrit)',
    marks: 30,
    topics: [
      'Comprehension Passages',
      'Grammar & Verbal Ability',
      'Pedagogy of Language Development',
    ],
  },
  {
    name: 'Mathematics & Science (for Maths/Science teachers)',
    marks: 60,
    topics: [
      'Number System, Algebra, Geometry',
      'Statistics & Probability',
      'Food, Materials, Living World',
      'Moving Things, Natural Phenomena',
      'Pedagogical Issues — Maths & Science',
    ],
  },
  {
    name: 'Social Studies (for Social Studies teachers)',
    marks: 60,
    topics: [
      'History — From earliest societies to modern times',
      'Geography — Resources, Environment, Agriculture',
      'Social and Political Life — Constitution, Democracy, Government',
      'Pedagogical Issues in Social Science',
    ],
  },
]

export default function UPTETSyllabusPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">Prepify</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/uptet" className="text-blue-600 hover:underline">UPTET Mock Tests</Link>
          <Link href="/ctet" className="text-blue-600 hover:underline">CTET Mock Tests</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {' › '}
          <Link href="/uptet" className="hover:text-blue-600">UPTET</Link>
          {' › '}
          <span>Syllabus 2024</span>
        </div>

        <h1 className="text-4xl font-bold mb-3">UPTET Syllabus 2024</h1>
        <p className="text-xl text-gray-600 mb-8">
          Complete syllabus for Uttar Pradesh Teacher Eligibility Test — Paper 1 (Class 1–5) and Paper 2 (Class 6–8)
        </p>

        {/* Exam Pattern Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-3">Paper 1 — Primary Level (Class 1–5)</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr className="py-2"><td className="py-2 text-gray-500">Total Questions</td><td className="font-medium">150 MCQs</td></tr>
                <tr><td className="py-2 text-gray-500">Total Marks</td><td className="font-medium">150</td></tr>
                <tr><td className="py-2 text-gray-500">Duration</td><td className="font-medium">2.5 Hours</td></tr>
                <tr><td className="py-2 text-gray-500">Negative Marking</td><td className="font-medium">None</td></tr>
                <tr><td className="py-2 text-gray-500">Qualifying Marks</td><td className="font-medium">90 (General) / 82 (OBC) / 82 (SC/ST)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-3">Paper 2 — Upper Primary Level (Class 6–8)</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr><td className="py-2 text-gray-500">Total Questions</td><td className="font-medium">150 MCQs</td></tr>
                <tr><td className="py-2 text-gray-500">Total Marks</td><td className="font-medium">150</td></tr>
                <tr><td className="py-2 text-gray-500">Duration</td><td className="font-medium">2.5 Hours</td></tr>
                <tr><td className="py-2 text-gray-500">Negative Marking</td><td className="font-medium">None</td></tr>
                <tr><td className="py-2 text-gray-500">Qualifying Marks</td><td className="font-medium">90 (General) / 82 (OBC) / 82 (SC/ST)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Paper 1 Syllabus */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">Paper 1 Syllabus — Primary Level</h2>
          <div className="space-y-6">
            {paper1Subjects.map((subj) => (
              <div key={subj.name} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{subj.name}</h3>
                  <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{subj.marks} Marks</span>
                </div>
                <ul className="space-y-1">
                  {subj.topics.map(t => (
                    <li key={t} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Paper 2 Syllabus */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">Paper 2 Syllabus — Upper Primary Level</h2>
          <div className="space-y-6">
            {paper2Subjects.map((subj) => (
              <div key={subj.name} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{subj.name}</h3>
                  <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">{subj.marks} Marks</span>
                </div>
                <ul className="space-y-1">
                  {subj.topics.map(t => (
                    <li key={t} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Practice?</h2>
          <p className="text-white/70 mb-6">Take a free UPTET mock test with real NTA-like interface — no payment required</p>
          <Link
            href="/uptet"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition"
          >
            Start Free UPTET Mock Test →
          </Link>
        </div>

        {/* Related links */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Related Resources</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/uptet" className="text-blue-600 hover:underline text-sm">UPTET Mock Tests</Link>
            <Link href="/ctet/syllabus" className="text-blue-600 hover:underline text-sm">CTET Syllabus 2024</Link>
            <Link href="/ctet" className="text-blue-600 hover:underline text-sm">CTET Mock Tests</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
