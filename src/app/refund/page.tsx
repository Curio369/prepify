export default function RefundPolicy() {
  return (
    <main className="min-h-screen bg-black text-white py-32 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-display mb-8">Refund Policy</h1>
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">1. Subscription Cancellations</h2>
            <p>You may cancel your Prepify subscription at any time. Upon cancellation, you will continue to have access to the service through the end of your current billing period.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">2. Refund Eligibility</h2>
            <p>We offer a 7-day money-back guarantee for all new subscriptions. If you are not satisfied with Prepify within your first 7 days of upgrading, please contact us for a full refund.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">3. Exceptional Circumstances</h2>
            <p>Outside of the 7-day window, refunds are generally not provided, but we may grant exceptions at our sole discretion in cases of severe technical issues or billing errors on our end.</p>
          </section>
          <section>
            <h2 className="text-2xl font-display text-white mb-4 mt-8">4. Request a Refund</h2>
            <p>To request a refund, please email our support team at curiozii369@gmail.com with your account details and the reason for your request.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
