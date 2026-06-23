import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CTET Syllabus 2024 — Paper 1 & Paper 2 Complete Syllabus | Prepify',
  description: 'Complete CTET 2024 syllabus for Paper 1 (Class 1-5) and Paper 2 (Class 6-8). Subject-wise topics, exam pattern, marking scheme and free mock tests by Prepify.',
  keywords: [
    'CTET syllabus 2024', 'CTET paper 1 syllabus', 'CTET paper 2 syllabus',
    'CTET exam pattern 2024', 'central teacher eligibility test syllabus',
    'CTET child development syllabus', 'CTET maths science syllabus',
    'CTET social studies syllabus', 'CTET language syllabus',
  ],
  alternates: { canonical: 'https://curioverse.in/ctet/syllabus' },
  openGraph: {
    title: 'CTET Syllabus 2024 — Complete Paper 1 & 2 | Prepify',
    description: 'Complete CTET 2024 syllabus with exam pattern, subject-wise topics and free mock tests.',
    url: 'https://curioverse.in/ctet/syllabus',
  },
}

const paper1Subjects = [
  {
    name: 'Child Development & Pedagogy',
    marks: 30,
    topics: [
      'Child Development (Primary School Child) — 15 Qs',
      'Concept of Inclusive Education & Children with Special Needs — 5 Qs',
      'Learning and Pedagogy — 10 Qs',
      'Piaget, Kohlberg and Vygotsky — Constructs and Critical Perspectives',
      'Multi-dimensional Intelligence, Language and Thought',
    ],
  },
  {
    name: 'Language I (compulsory)',
    marks: 30,
    topics: [
      'Language Comprehension — 15 Qs (Reading unseen passage)',
      'Pedagogy of Language Development — 15 Qs',
      'Learning and Acquisition',
      'Principles of Language Teaching',
      'Challenges of Teaching Language in a Diverse Classroom',
    ],
  },
  {
    name: 'Language II (compulsory)',
    marks: 30,
    topics: [
      'Comprehension (Two Unseen Prose Passages) — 15 Qs',
      'Pedagogy of Language Development — 15 Qs',
      'Roles of Listening and Speaking — Language and Thinking',
      'Teaching-Learning Materials — Textbook, Multimedia, Multilingual Resource',
    ],
  },
  {
    name: 'Mathematics',
    marks: 30,
    topics: [
      'Content — 15 Qs (Geometry, Shapes & Spatial Understanding, Measurement, Data Handling, Patterns)',
      'Pedagogical Issues — 15 Qs',
      'Nature of Mathematics, Place of Mathematics in Curriculum',
      'Language of Mathematics',
      'Community Mathematics, Error Analysis',
    ],
  },
  {
    name: 'Environmental Studies (EVS)',
    marks: 30,
    topics: [
      'Content — 15 Qs (Family & Friends, Food, Shelter, Water, Travel, Things We Make)',
      'Pedagogical Issues — 15 Qs',
      'Concept and Scope of EVS',
      'Significance of EVS, Integrated EVS',
      'Activities, Experimentation, Practical Work',
    ],
  },
]

const paper2Subjects = [
  {
    name: 'Child Development & Pedagogy (compulsory)',
    marks: 30,
    topics: [
      'Child Development (Elementary School Child) — 15 Qs',
      'Concept of Inclusive Education & Children with Special Needs — 5 Qs',
      'Learning and Pedagogy — 10 Qs',
      'Addressing the Talented, Creative, Specially Abled Learners',
      'Cognition & Emotions, Motivation and Learning',
    ],
  },
  {
    name: 'Language I (compulsory)',
    marks: 30,
    topics: [
      'Language Comprehension — 15 Qs',
      'Pedagogy of Language Development — 15 Qs',
      'Critical Perspective on the Role of Grammar',
      'Diversity in Language Classroom',
    ],
  },
  {
    name: 'Language II (compulsory)',
    marks: 30,
    topics: [
      'Comprehension — 15 Qs',
      'Pedagogy of Language Development — 15 Qs',
      'Language as a Medium of Learning',
      'Remedial Teaching',
    ],
  },
  {
    name: 'Mathematics & Science (for Maths/Science stream)',
    marks: 60,
    topics: [
      'Mathematics — Number System, Algebra, Geometry, Mensuration, Statistics',
      'Science — Food, Materials, The World of the Living',
      'Science — Moving Things, People and Ideas, Natural Phenomena, Natural Resources',
      'Mathematics Pedagogy — Nature of Maths, Problems of Teaching',
      'Science Pedagogy — Nature & Structure of Sciences, Science Teaching',
    ],
  },
  {
    name: 'Social Studies / Social Sciences (for Social Studies stream)',
    marks: 60,
    topics: [
      'History — When, Where and How, From Earliest Societies to Modern Times',
      'Geography — Resources, Environment, Agriculture, Disaster Management',
      'Social & Political Life — Constitution, Democracy, Government, Economic Development',
      'Pedagogical Issues — Concept & Nature of Social Science/Studies',
    ],
  },
]

export default function CTETSyllabusPage() {
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
          <Link href="/ctet" className="hover:text-blue-600">CTET</Link>
          {' › '}
          <span>Syllabus 2024</span>
        </div>

        <h1 className="text-4xl font-bold mb-3">CTET Syllabus 2024</h1>
        <p className="text-xl text-gray-600 mb-8">
          Complete syllabus for Central Teacher Eligibility Test — Paper 1 (Class 1–5) and Paper 2 (Class 6–8)
        </p>

        {/* Exam Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-3">Paper 1 — Primary Level (Class 1–5)</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr><td className="py-2 text-gray-500">Total Questions</td><td className="font-medium">150 MCQs</td></tr>
                <tr><td className="py-2 text-gray-500">Total Marks</td><td className="font-medium">150</td></tr>
                <tr><td className="py-2 text-gray-500">Duration</td><td className="font-medium">2.5 Hours</td></tr>
                <tr><td className="py-2 text-gray-500">Negative Marking</td><td className="font-medium">None</td></tr>
                <tr><td className="py-2 text-gray-500">Qualifying Marks</td><td className="font-medium">90 (60%) for all categories</td></tr>
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
                <tr><td className="py-2 text-gray-500">Qualifying Marks</td><td className="font-medium">90 (60%) for all categories</td></tr>
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

        {/* CTET vs UPTET */}
        <section className="mb-12 bg-gray-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">CTET vs UPTET — Key Differences</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Feature</th>
                  <th className="text-left py-2 text-gray-500 font-medium">CTET</th>
                  <th className="text-left py-2 text-gray-500 font-medium">UPTET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="py-2 text-gray-600">Conducted by</td><td>CBSE</td><td>UPMSP</td></tr>
                <tr><td className="py-2 text-gray-600">Valid for</td><td>Central Govt. schools (KV, NVS)</td><td>UP State Govt. schools</td></tr>
                <tr><td className="py-2 text-gray-600">Validity</td><td>Lifetime</td><td>5 years</td></tr>
                <tr><td className="py-2 text-gray-600">Qualifying %</td><td>60% (all categories)</td><td>60% General / 55% Reserved</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Practice with Free CTET Mock Tests</h2>
          <p className="text-white/70 mb-6">Real NTA-like interface, previous year questions, instant AI explanations</p>
          <Link
            href="/ctet"
            className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition"
          >
            Start Free CTET Mock Test →
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Related Resources</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/ctet" className="text-blue-600 hover:underline text-sm">CTET Mock Tests</Link>
            <Link href="/uptet/syllabus" className="text-blue-600 hover:underline text-sm">UPTET Syllabus 2024</Link>
            <Link href="/uptet" className="text-blue-600 hover:underline text-sm">UPTET Mock Tests</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
