export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-black text-white py-32 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-display mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, subscribe to our service, or communicate with us. This may include your name, email address, and usage data within Prepify.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">2. How We Use Your Information</h2>
            <p>We use the information we collect to operate, maintain, and provide the features and functionality of Prepify, including generating interactive exam environments from your uploaded materials.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at curiozii369@gmail.com.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
