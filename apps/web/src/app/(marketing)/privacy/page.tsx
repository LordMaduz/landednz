export default function PrivacyPage() {
  return (
    <div className="bg-bg min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-h1 text-text-primary mb-4">Privacy Policy</h1>
          <p className="text-body text-text-secondary">
            Last updated: April 26, 2026
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-bg-card rounded-card p-8 border border-border">
            <h2 className="font-display text-h2 text-text-primary mb-4">Information We Collect</h2>
            <p className="text-body text-text-primary mb-6">
              When you use LandedNZ, we collect information necessary to provide our settlement guidance service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body text-text-primary mb-6">
              <li>Profile information (visa type, city, family situation, occupation)</li>
              <li>Arrival date to personalize deadlines and urgency</li>
              <li>Task completion progress to track your settlement journey</li>
              <li>Chat conversations to provide relevant AI guidance</li>
            </ul>

            <h2 className="font-display text-h2 text-text-primary mb-4 mt-8">How We Use Your Information</h2>
            <p className="text-body text-text-primary mb-4">
              Your information is used exclusively to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body text-text-primary mb-6">
              <li>Generate your personalized settlement roadmap</li>
              <li>Provide relevant task recommendations and deadlines</li>
              <li>Offer AI-powered settlement guidance through our chat feature</li>
              <li>Send helpful reminders about important deadlines</li>
            </ul>

            <h2 className="font-display text-h2 text-text-primary mb-4 mt-8">Data Security</h2>
            <p className="text-body text-text-primary mb-6">
              We use industry-standard security measures to protect your data. All information is encrypted and stored securely.
            </p>

            <h2 className="font-display text-h2 text-text-primary mb-4 mt-8">Contact Us</h2>
            <p className="text-body text-text-primary">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@landednz.com" className="text-primary hover:underline">
                privacy@landednz.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}