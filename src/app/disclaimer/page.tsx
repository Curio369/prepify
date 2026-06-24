import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer — Prepify',
  description: 'Read the Prepify disclaimer covering the accuracy of content, AI-generated material, exam information, external links and the educational nature of our platform.',
  alternates: { canonical: 'https://curioverse.in/disclaimer' },
}

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-black text-white py-32 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-display mb-8">Disclaimer</h1>
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">1. Educational purpose only</h2>
            <p>
              Prepify is an independent educational platform intended to help students practise for
              exams. The content on this website is provided for general informational and study
              purposes only and does not constitute professional, academic or career advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">2. Accuracy of content</h2>
            <p>
              We work hard to keep questions, answers, solutions and exam information accurate and
              up to date. However, some content — including AI-generated solutions and questions
              extracted from uploaded material — may contain errors. We make no warranty as to the
              completeness or accuracy of any content. Always verify important information (such as
              official exam dates, syllabus and marking schemes) with the official conducting body.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">3. Not affiliated with any exam body</h2>
            <p>
              Prepify is not affiliated with, endorsed by, or officially connected to NTA, CBSE,
              UPBEB, or any government or examination authority. Names such as JEE Main, NEET, CTET
              and UPTET are used only to describe the exams our practice material relates to. All
              trademarks belong to their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">4. No guarantee of results</h2>
            <p>
              Using Prepify does not guarantee success in any examination. Outcomes depend on each
              student&apos;s own effort, preparation and circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">5. External links</h2>
            <p>
              Our site may contain links to external websites that are not operated by us. We have no
              control over, and assume no responsibility for, the content or practices of any
              third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">6. Contact</h2>
            <p>
              For any questions about this disclaimer, contact us at{' '}
              <a href="mailto:curiozii369@gmail.com" className="text-white underline">curiozii369@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
