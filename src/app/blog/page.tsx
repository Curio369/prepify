import type { Metadata } from 'next'
import Link from 'next/link'
import { POSTS } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Prepify Blog — UPTET, CTET, JEE & NEET Preparation Guides',
  description: 'Free preparation guides, exam patterns, syllabus breakdowns and strategy articles for UPTET, CTET, JEE Main and NEET aspirants.',
  alternates: { canonical: 'https://curioverse.in/blog' },
  openGraph: {
    title: 'Prepify Blog — Exam Preparation Guides',
    description: 'Free preparation guides and strategy articles for UPTET, CTET, JEE Main and NEET.',
    url: 'https://curioverse.in/blog',
  },
}

const BADGE: Record<string, string> = {
  UPTET: 'bg-orange-50 text-orange-700',
  CTET: 'bg-violet-50 text-violet-700',
  'JEE Main': 'bg-blue-50 text-blue-700',
  NEET: 'bg-emerald-50 text-emerald-700',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight">Prepify</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/uptet" className="text-blue-600 hover:underline">UPTET</Link>
          <Link href="/ctet" className="text-blue-600 hover:underline">CTET</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Prepify Blog</h1>
        <p className="text-lg text-gray-600 mb-10">
          Free preparation guides, exam patterns and strategy for India&apos;s teaching and entrance exams.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(p => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE[p.category] || 'bg-gray-100 text-gray-600'}`}>{p.category}</span>
                <span className="text-gray-400 text-xs">{fmt(p.date)} · {p.readMins} min read</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 leading-snug">{p.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{p.description}</p>
              <span className="inline-block mt-4 text-blue-600 text-sm font-medium">Read guide →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
