// Blog post registry — drives the /blog index and related-post links.
// Each post has its own page under /blog/<slug>/page.tsx.

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string        // ISO date
  category: string
  readMins: number
}

export const POSTS: PostMeta[] = [
  {
    slug: 'uptet-preparation-guide-2026',
    title: 'UPTET 2026: Complete Preparation Guide',
    description: 'Exam pattern, eligibility, qualifying marks, a proven preparation strategy and FAQs for the UPTET 2026 exam — plus free mock tests and PYQs.',
    date: '2026-06-24',
    category: 'UPTET',
    readMins: 6,
  },
  {
    slug: 'ctet-preparation-guide-2026',
    title: 'CTET 2026: Complete Preparation Guide',
    description: 'Everything you need for CTET 2026 — exam pattern, qualifying marks, certificate validity, a subject-wise strategy and FAQs, with free mock tests and PYQs.',
    date: '2026-06-24',
    category: 'CTET',
    readMins: 6,
  },
]

export function getPost(slug: string): PostMeta | undefined {
  return POSTS.find(p => p.slug === slug)
}
