export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-black text-white py-32 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-display mb-8">Terms of Service</h1>
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">1. Acceptance of Terms</h2>
            <p>By accessing or using Prepify, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">2. Description of Service</h2>
            <p>Prepify is a platform that transforms physical study materials into interactive digital exam environments. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">4. Contact Us</h2>
            <p>For any questions regarding these terms, contact curiozii369@gmail.com.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
