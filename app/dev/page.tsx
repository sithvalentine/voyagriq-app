"use client";

import Link from 'next/link';

export default function DevPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-xl font-bold text-yellow-900">Development Mode</h1>
          </div>
          <p className="text-yellow-800">
            This is a development/testing page with no authentication required.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Navigation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Pages */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Main Pages</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/trips" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Trips
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Reports
                  </Link>
                </li>
                <li>
                  <Link href="/export-options" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Export Options
                  </Link>
                </li>
              </ul>
            </div>

            {/* Settings */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/settings" className="text-purple-600 hover:text-purple-700 font-medium">
                    → General Settings
                  </Link>
                </li>
                <li>
                  <Link href="/settings/team" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Team Settings
                  </Link>
                </li>
                <li>
                  <Link href="/settings/white-label" className="text-purple-600 hover:text-purple-700 font-medium">
                    → White-Label
                  </Link>
                </li>
                <li>
                  <Link href="/settings/api-keys" className="text-purple-600 hover:text-purple-700 font-medium">
                    → API Keys
                  </Link>
                </li>
              </ul>
            </div>

            {/* Data */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Data Management</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/data" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Data Import
                  </Link>
                </li>
                <li>
                  <Link href="/vendors" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Vendors
                  </Link>
                </li>
                <li>
                  <Link href="/agencies" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Agencies
                  </Link>
                </li>
                <li>
                  <Link href="/destinations" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Destinations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Marketing */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Marketing Pages</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/pricing" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-purple-600 hover:text-purple-700 font-medium">
                    → About
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Testing */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Testing & Dev Tools</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dev-tools" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Dev Tools
                  </Link>
                </li>
                <li>
                  <Link href="/test-analytics" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Test Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/load-sample-data" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Load Sample Data
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs" className="text-purple-600 hover:text-purple-700 font-medium">
                    → API Documentation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-3">Account Pages</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Register
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Account Settings
                  </Link>
                </li>
                <li>
                  <Link href="/subscription" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Subscription
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This dev page bypasses authentication. Some features may not work without a valid user session.
          </p>
        </div>
      </div>
    </div>
  );
}
