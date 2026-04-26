export default function TermsPage() {
  return (
    <div className="bg-bg min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-h1 text-text-primary mb-4">Terms of Service</h1>
          <p className="text-body text-text-secondary">
            Last updated: April 26, 2026
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-bg-card rounded-card p-8 border border-border">
            <h2 className="font-display text-h2 text-text-primary mb-4">About LandedNZ</h2>
            <p className="text-body text-text-primary mb-6">
              LandedNZ provides settlement guidance and task recommendations for skilled migrants to New Zealand.
              Our service is designed to help you navigate the complex process of settling in New Zealand.
            </p>

            <h2 className="font-display text-h2 text-text-primary mb-4 mt-8">Service Disclaimer</h2>
            <p className="text-body text-text-primary mb-4">
              LandedNZ provides general guidance and information only. Our recommendations are not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body text-text-primary mb-6">
              <li>Legal advice or immigration consultation</li>
              <li>Financial or tax advice</li>
              <li>Guaranteed to apply to your specific situation</li>
              <li>A substitute for professional advice where required</li>
            </ul>

            <h2 className="font-display text-h2 text-text-primary mb-4 mt-8">Your Responsibilities</h2>
            <p className="text-body text-text-primary mb-4">
              As a user of LandedNZ, you are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body text-text-primary mb-6">
              <li>Verifying all information with official New Zealand government sources</li>
              <li>Seeking professional advice for complex legal, financial, or immigration matters</li>
              <li>Meeting all deadlines and requirements as specified by NZ Immigration and other authorities</li>
              <li>Providing accurate information in your profile</li>
            </ul>

            <h2 className="font-display text-h2 text-text-primary mb-4 mt-8">Limitation of Liability</h2>
            <p className="text-body text-text-primary mb-6">
              LandedNZ shall not be liable for any damages or losses resulting from your use of our service,
              including but not limited to missed deadlines, incorrect information, or decisions made based on our guidance.
            </p>

            <h2 className="font-display text-h2 text-text-primary mb-4 mt-8">Contact Us</h2>
            <p className="text-body text-text-primary">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@landednz.com" className="text-primary hover:underline">
                support@landednz.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}