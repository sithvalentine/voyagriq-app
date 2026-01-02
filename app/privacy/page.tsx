import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last Updated: December 29, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                VoyagrIQ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p className="text-gray-700 mb-4">
                By using VoyagrIQ, you agree to the collection and use of information in accordance with this policy.
                If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">
                When you register for an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Company/Agency name</li>
                <li>Payment information (processed securely by third-party payment processors)</li>
                <li>Subscription tier and billing history</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Trip and Business Data</h3>
              <p className="text-gray-700 mb-4">
                You voluntarily provide trip and business information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Trip details (destinations, dates, costs)</li>
                <li>Client information</li>
                <li>Vendor and supplier information</li>
                <li>Commission and revenue data</li>
                <li>Custom notes and tags</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Usage Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect information about how you interact with our Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Device information (browser type, operating system, device type)</li>
                <li>IP address and general location</li>
                <li>Pages visited and features used</li>
                <li>Time and date of access</li>
                <li>API usage statistics (for Premium users)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.4 Cookies and Tracking Technologies</h3>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences (currency, tier selection in dev mode)</li>
                <li>Analyze Service usage and performance</li>
                <li>Provide personalized features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process your transactions and manage your subscription</li>
                <li>Send you service-related communications and updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Generate analytics and business intelligence insights</li>
                <li>Detect, prevent, and address technical issues or fraud</li>
                <li>Comply with legal obligations and enforce our Terms of Service</li>
                <li>Send marketing communications (with your consent, which you can withdraw at any time)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Local Storage</h3>
              <p className="text-gray-700 mb-4">
                For this demo version, your data is stored locally in your browser using localStorage. This means:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Data persists only on your current device and browser</li>
                <li>Clearing browser data will delete your information</li>
                <li>Data is not synchronized across devices</li>
                <li>We do not have access to data stored in your browser's localStorage</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Security Measures</h3>
              <p className="text-gray-700 mb-4">
                We implement reasonable security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Encryption of data in transit using HTTPS/SSL</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information by authorized personnel only</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to
                protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in
                the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We may share your information with trusted third-party service providers who assist us in:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Payment processing (e.g., Stripe, PayPal)</li>
                <li>Email communications</li>
                <li>Hosting and infrastructure</li>
                <li>Analytics and performance monitoring</li>
              </ul>
              <p className="text-gray-700 mb-4">
                These providers are contractually obligated to protect your information and use it only for the purposes we specify.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose your information if required to do so by law or in response to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Valid legal processes (subpoenas, court orders)</li>
                <li>Requests by government authorities</li>
                <li>Enforcement of our Terms of Service</li>
                <li>Protection of our rights, property, or safety</li>
                <li>Investigation of fraud or security issues</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.3 Business Transfers</h3>
              <p className="text-gray-700 mb-4">
                In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred
                to the acquiring entity. We will notify you of any such change in ownership or control of your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal information:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Access and Portability</h3>
              <p className="text-gray-700 mb-4">
                You can access, review, and export your data at any time through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Your account dashboard</li>
                <li>Export features (CSV, Excel, PDF)</li>
                <li>API access (Premium users)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 Correction and Updates</h3>
              <p className="text-gray-700 mb-4">
                You can update your personal information and trip data directly through the Service at any time.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.3 Deletion</h3>
              <p className="text-gray-700 mb-4">
                You can request deletion of your account and data by contacting us at james@mintgoldwyn.com.
                Upon request, we will delete your personal information, except where retention is required by law.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.4 Marketing Communications</h3>
              <p className="text-gray-700 mb-4">
                You can opt out of marketing emails by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Clicking the "unsubscribe" link in any marketing email</li>
                <li>Updating your email preferences in your account settings</li>
                <li>Contacting us directly</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Note: You cannot opt out of service-related communications (e.g., account notifications, billing alerts).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as your account is active or as needed to provide the Service.
                After account deletion, we will retain certain information as required by law or for legitimate business purposes
                (e.g., fraud prevention, dispute resolution) for up to 7 years.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Service is not intended for users under the age of 18. We do not knowingly collect personal information
                from children. If we discover that a child has provided us with personal information, we will promptly delete
                such information from our systems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence.
                These countries may have data protection laws that differ from the laws of your country.
              </p>
              <p className="text-gray-700 mb-4">
                If you are located in the European Economic Area (EEA), we will ensure that appropriate safeguards are in place
                to protect your information in accordance with GDPR requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. GDPR Compliance (EU Users)</h2>
              <p className="text-gray-700 mb-4">
                If you are a resident of the European Economic Area, you have additional rights under the General Data Protection
                Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to certain types of processing</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, please contact us at james@mintgoldwyn.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. CCPA Compliance (California Users)</h2>
              <p className="text-gray-700 mb-4">
                If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Right to know what personal information is collected, used, and shared</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, please contact us at james@mintgoldwyn.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Third-Party Links</h2>
              <p className="text-gray-700 mb-4">
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy
                practices of these third parties. We encourage you to read their privacy policies before providing any information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Posting the updated policy on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending an email notification (for significant changes)</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Your continued use of the Service after changes become effective constitutes acceptance of the revised Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>VoyagrIQ</strong><br />
                  Privacy Team<br />
                  Email: james@mintgoldwyn.com<br />
                  Support: james@mintgoldwyn.com
                </p>
              </div>
              <p className="text-gray-700 mt-4">
                We will respond to your inquiry within 30 days.
              </p>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                Terms of Service
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/about" className="text-primary-600 hover:text-primary-700 font-medium">
                About Us
              </Link>
              <span className="text-gray-400">•</span>
              <a href="mailto:james@mintgoldwyn.com" className="text-primary-600 hover:text-primary-700 font-medium">
                Contact Privacy Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
