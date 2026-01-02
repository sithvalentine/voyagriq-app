import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last Updated: December 29, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using VoyagrIQ ("Service"), you agree to be bound by these Terms of Service ("Terms").
                If you do not agree to these Terms, please do not use our Service.
              </p>
              <p className="text-gray-700 mb-4">
                These Terms apply to all users of the Service, including without limitation users who are browsers, vendors,
                customers, merchants, and/or contributors of content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                VoyagrIQ provides travel cost analysis, business intelligence, and reporting tools for travel
                advisors and agencies. The Service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Trip cost tracking and analysis</li>
                <li>Commission and revenue management</li>
                <li>Business intelligence and analytics</li>
                <li>PDF and Excel report generation</li>
                <li>API access (Premium tier only)</li>
                <li>White-label branding (Premium tier only)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration and Security</h2>
              <p className="text-gray-700 mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Immediately notify us of any unauthorized access or security breach</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans and Billing</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Free Trial</h3>
              <p className="text-gray-700 mb-4">
                New users on Starter and Standard plans receive a 14-day free trial. No credit card is required for the trial.
                After the trial period ends, you must subscribe to a paid plan to continue using the Service.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Subscription Tiers</h3>
              <p className="text-gray-700 mb-4">
                We offer three subscription tiers:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Starter ($49/month):</strong> Up to 25 trips per month, single user, core analytics</li>
                <li><strong>Standard ($99/month):</strong> Up to 50 trips per month, up to 10 users, business intelligence, scheduled reports</li>
                <li><strong>Premium ($199/month):</strong> Up to 100 trips per month, up to 20 team members, API access, white-label branding, priority support</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Payment Terms</h3>
              <p className="text-gray-700 mb-4">
                Subscriptions are billed monthly in advance. Payment is due on the same day each month as your subscription start date.
                All fees are non-refundable except as required by law or as expressly stated in these Terms.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Cancellation</h3>
              <p className="text-gray-700 mb-4">
                You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period.
                You will retain access to paid features until the end of the billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload malicious code, viruses, or harmful software</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for competitive analysis or benchmarking</li>
                <li>Resell or redistribute the Service without authorization</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Ownership and Privacy</h2>
              <p className="text-gray-700 mb-4">
                You retain all rights to the data you input into the Service. We do not claim ownership of your data.
                By using the Service, you grant us a limited license to use your data solely to provide and improve the Service.
              </p>
              <p className="text-gray-700 mb-4">
                Our collection and use of personal information is described in our{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. API Terms (Premium Users)</h2>
              <p className="text-gray-700 mb-4">
                If you subscribe to the Premium plan, you receive access to our API. Additional terms apply:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Rate limits apply (1,000 requests per hour)</li>
                <li>API keys must be kept confidential and secure</li>
                <li>You are responsible for all activity using your API keys</li>
                <li>We may modify or discontinue API features with 30 days notice</li>
                <li>Abuse or excessive usage may result in API access suspension</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The Service, including its original content, features, and functionality, is owned by VoyagrIQ
                and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-700 mb-4">
                You may not copy, modify, distribute, sell, or lease any part of our Service without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRIP COST INSIGHTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY,
                OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="text-gray-700 mb-4">
                Our total liability to you for all claims arising from or relating to the Service shall not exceed the amount
                you paid us in the twelve (12) months prior to the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Warranty Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="text-gray-700 mb-4">
                We do not warrant that the Service will be uninterrupted, error-free, or completely secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify, defend, and hold harmless VoyagrIQ and its officers, directors, employees,
                and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your data or content submitted to the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Modifications to Service</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time with or
                without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms
                on this page and updating the "Last Updated" date. Your continued use of the Service after changes become effective
                constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability,
                for any reason, including if you breach these Terms.
              </p>
              <p className="text-gray-700 mb-4">
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by
                their nature should survive termination shall survive, including ownership provisions, warranty disclaimers,
                and limitations of liability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States,
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance
                with the rules of the American Arbitration Association. You agree to waive any right to a jury trial or to participate
                in a class action lawsuit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>VoyagrIQ</strong><br />
                  Email: james@mintgoldwyn.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
