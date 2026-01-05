'use client';

import Link from 'next/link';
import { useTier } from '@/contexts/TierContext';

export default function ExportOptionsPage() {
  const { currentTier } = useTier();
  const isPremium = currentTier === 'premium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Export & Integration Options
          </h1>
          <p className="text-xl text-gray-600">
            Export your trip data in multiple formats or integrate with external systems
          </p>
        </div>

        {/* Standard Export Options (All Tiers) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Standard Export Options</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">📄</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">PDF Reports</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">All Plans</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Generate professional PDF reports with charts, analytics, and insights. Perfect for sharing with clients or team members.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Trip summaries with cost breakdowns</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Commission tracking and analysis</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Visual charts and graphs</span>
                </div>
                {isPremium && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-purple-500">✓</span>
                    <span className="font-semibold">White-label branding (Premium)</span>
                  </div>
                )}
              </div>
              <Link href="/data">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  View Dashboard & Export
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">📊</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Excel Exports</h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">All Plans</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Export your trip data to Excel (XLSX) format for custom analysis, pivot tables, and integration with existing workflows.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Complete trip data export</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Vendor and supplier details</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Commission calculations</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Ready for pivot tables</span>
                </div>
              </div>
              <Link href="/trips">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Go to Trips & Export
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Advanced Export Options (Premium) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Advanced Export Formats</h2>
            {!isPremium && (
              <Link href="/subscription">
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm">
                  Upgrade to Premium
                </button>
              </Link>
            )}
          </div>

          <div className={`grid md:grid-cols-2 gap-6 ${!isPremium ? 'opacity-60' : ''}`}>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">📊</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Google Sheets</h3>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Premium Only</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Direct export to Google Sheets with automatic formatting, formulas, and real-time collaboration features.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>One-click export to Google Sheets</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Pre-formatted templates</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Automatic formula calculations</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Team collaboration enabled</span>
                </div>
              </div>
              {!isPremium && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800 mb-4">
                  Planned for future release
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🔗</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">JSON API</h3>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Premium Only</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                RESTful API access for custom integrations and automation. Build your own tools and workflows.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Full REST API access</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Read and write trip data</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Webhook support</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Rate limits: 1,000 req/hour</span>
                </div>
              </div>
              {isPremium ? (
                <div className="space-y-2">
                  <Link href="/settings/api-keys">
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                      Manage API Keys
                    </button>
                  </Link>
                  <Link href="/api-docs">
                    <button className="w-full px-4 py-2 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                      View API Documentation
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded p-3 text-xs text-purple-800 mb-4">
                  Available now for Premium users
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">📄</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">XML Export</h3>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Premium Only</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Standard XML format for legacy system compatibility and enterprise integrations.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Industry-standard XML schema</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Legacy system integration</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Custom XML templates</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Batch export support</span>
                </div>
              </div>
              {!isPremium && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800 mb-4">
                  Planned for future release
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">💾</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">CSV Bulk Export</h3>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Premium Only</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Export all your data with custom field selection, filtering, and advanced formatting options.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Custom field selection</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Advanced filtering options</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Date range selection</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500">✓</span>
                  <span>Bulk export of all trips</span>
                </div>
              </div>
              {!isPremium && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800 mb-4">
                  Planned for future release
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integration Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Integrations</h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
            <p className="text-gray-700 mb-6">
              Premium users can integrate VoyagrIQ with popular business tools and accounting software.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-gray-900 mb-2">💼 QuickBooks</div>
                <p className="text-sm text-gray-600">Sync trip costs and commissions with QuickBooks for seamless accounting</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Coming Soon</span>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-gray-900 mb-2">📊 Xero</div>
                <p className="text-sm text-gray-600">Automated expense tracking and reconciliation with Xero</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Coming Soon</span>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-bold text-gray-900 mb-2">🚀 Salesforce</div>
                <p className="text-sm text-gray-600">CRM integration for client management and reporting</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Coming Soon</span>
              </div>
            </div>
            {isPremium ? (
              <p className="text-sm text-gray-600">
                Interested in a specific integration? <a href="mailto:support@tripcostinsights.com?subject=Integration Request" className="text-blue-600 hover:underline font-semibold">Contact us</a> and we'll prioritize it.
              </p>
            ) : (
              <Link href="/subscription">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Upgrade to Premium for Integrations
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Exports?</h2>
          <p className="text-gray-600 mb-6">
            Our support team can help you choose the right export format and integrate with your existing systems.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/about">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                View Help & Support
              </button>
            </Link>
            <a href="mailto:support@tripcostinsights.com" className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
