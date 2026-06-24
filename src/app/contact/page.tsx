import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Prepify — Support, Feedback & Partnerships',
  description: 'Get in touch with the Prepify team for support, feedback, bug reports, content suggestions or partnership enquiries. We typically respond within 1–2 working days.',
  alternates: { canonical: 'https://curioverse.in/contact' },
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white py-32 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-display mb-8">Contact Us</h1>
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>
            We&apos;d genuinely love to hear from you. Whether you&apos;ve found a bug, have an idea to
            make Prepify better, want to report a problem with a question, or are interested in
            partnering with us — please get in touch.
          </p>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">Email</h2>
            <p>
              The fastest way to reach us is by email:{' '}
              <a href="mailto:curiozii369@gmail.com" className="text-white underline">curiozii369@gmail.com</a>
            </p>
            <p className="mt-2">We typically respond within 1–2 working days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">What you can contact us about</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Support</strong> — trouble signing in, uploading a paper, or running a test.</li>
              <li><strong className="text-white">Content issues</strong> — a wrong answer, a typo, or a question that didn&apos;t extract correctly.</li>
              <li><strong className="text-white">Feature requests</strong> — exams you&apos;d like us to add, or tools that would help your prep.</li>
              <li><strong className="text-white">Partnerships</strong> — coaching institutes, educators and creators who want to work with us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">Operated by</h2>
            <p>
              Prepify is operated under Curioverse (curioverse.in). For any privacy-related requests,
              please see our <a href="/privacy" className="text-white underline">Privacy Policy</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
