import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Prepify — Free Exam Practice for Every Student',
  description: 'Prepify is a free, AI-powered exam practice platform for UPTET, CTET, JEE Main and NEET aspirants. Learn about our mission to make quality exam practice accessible to every student in India.',
  alternates: { canonical: 'https://curioverse.in/about' },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white py-32 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-display mb-8">About Prepify</h1>
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>
            Prepify is a free, AI-powered exam practice platform built for students preparing
            for India&apos;s most important exams — UPTET, CTET, JEE Main and NEET. Our goal is
            simple: give every student, regardless of their location or budget, the same quality
            of exam practice that was once available only to those at expensive coaching centres.
          </p>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">Why we built Prepify</h2>
            <p>
              In most parts of India, the difference between a student who clears an exam and one
              who doesn&apos;t isn&apos;t intelligence — it&apos;s access. A student in a metro city
              gets full mock tests, instant doubt-solving and detailed performance analysis. A student
              in a small town often gets a photocopied question paper and no answer key. Prepify was
              created to close that gap.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">What we offer</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Free mock tests for UPTET and CTET with a real exam-like interface, in Hindi and English.</li>
              <li>A faithful JEE Main / NEET (NTA-style) exam interface so students can practise in the exact environment of the real test.</li>
              <li>An AI engine that turns any uploaded practice paper (DPP) into a fully interactive, timed test with step-by-step solutions.</li>
              <li>A personal library to save tests and a score tracker to chart progress over time.</li>
              <li>Previous year papers, subject-wise practice and detailed syllabus breakdowns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">Our mission</h2>
            <p>
              We believe quality exam preparation should be a right, not a privilege. Everything core
              to Prepify is free to use. We are continuously adding more exams, more questions and more
              study resources so that any student with a phone and an internet connection can prepare
              with confidence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">Get in touch</h2>
            <p>
              Have feedback, a feature request, or want to partner with us? We&apos;d love to hear from
              you — reach out any time at <a href="mailto:curiozii369@gmail.com" className="text-white underline">curiozii369@gmail.com</a> or
              visit our <a href="/contact" className="text-white underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
