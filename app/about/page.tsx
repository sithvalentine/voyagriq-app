'use client';

import Link from 'next/link';
import { useTier } from '@/contexts/TierContext';

export default function AboutPage() {
  const { isSignedIn, currentTier, userName } = useTier();

  // Signed-in version: Help & Support page
  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help & Support
            </h1>
            <p className="text-xl text-gray-600">
              Welcome, {userName}! Here's everything you need to get the most out of VoyagrIQ.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/trips">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">🧳</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Trips</h3>
                <p className="text-gray-600 text-sm">
                  Add, edit, and organize your trip data
                </p>
              </div>
            </Link>

            <Link href="/data">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">View Dashboard</h3>
                <p className="text-gray-600 text-sm">
                  See your analytics and insights
                </p>
              </div>
            </Link>

            <Link href="/account">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="text-4xl mb-3">⚙️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Account Settings</h3>
                <p className="text-gray-600 text-sm">
                  Manage your profile and subscription
                </p>
              </div>
            </Link>
          </div>

          {/* Getting Started Guide */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Add Your First Trip</h3>
                  <p className="text-gray-600 text-sm">
                    Go to <Link href="/trips" className="text-blue-600 hover:underline">Trips</Link> and click "Add Trip" to enter your trip details, costs, and commission information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">View Your Analytics</h3>
                  <p className="text-gray-600 text-sm">
                    Visit the <Link href="/data" className="text-blue-600 hover:underline">Dashboard</Link> to see charts, metrics, and insights about your trips and commissions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Generate Reports</h3>
                  <p className="text-gray-600 text-sm">
                    Export your data to PDF or Excel from any page. Premium users can also schedule automated reports.
                  </p>
                </div>
              </div>

              {currentTier !== 'premium' && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Upgrade for More Features</h3>
                    <p className="text-gray-600 text-sm">
                      Check out <Link href="/subscription" className="text-blue-600 hover:underline">Subscription</Link> to unlock advanced analytics, API access, and white-label reports.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Guides by Tier */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Plan Features</h2>
            <div className="mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                {currentTier} Plan
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">Add and manage trips</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">Track commissions and costs</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">Export to PDF and Excel</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">View analytics dashboard</span>
              </div>

              {(currentTier === 'standard' || currentTier === 'premium') && (
                <>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Advanced Business Intelligence</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Scheduled Reports</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Multi-user support</span>
                  </div>
                </>
              )}

              {currentTier === 'premium' && (
                <>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">API Access (<Link href="/api-docs" className="text-blue-600 hover:underline">View Docs</Link>)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">White-Label Branding (<Link href="/settings/white-label" className="text-blue-600 hover:underline">Configure</Link>)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Up to 100 trips per month and 20 team members</span>
                  </div>
                </>
              )}
            </div>

            {currentTier !== 'premium' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link href="/subscription">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Upgrade to Unlock More Features →
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">How do I export my trip data?</h3>
                <p className="text-gray-600 text-sm">
                  You can export data from the <Link href="/trips" className="text-blue-600 hover:underline">Trips</Link> page
                  or <Link href="/data" className="text-blue-600 hover:underline">Dashboard</Link> page.
                  Look for the "Export to PDF" or "Export to Excel" buttons. Premium users also have API access for programmatic exports.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">How do I add team members?</h3>
                <p className="text-gray-600 text-sm">
                  Team member management is available on Standard and Premium plans. Go to <Link href="/account" className="text-blue-600 hover:underline">Account Settings</Link> to invite team members.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Can I import existing trip data?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! You can use the CSV import feature on the <Link href="/trips" className="text-blue-600 hover:underline">Trips</Link> page,
                  or use our API (Premium only) to programmatically import data. Contact support for bulk import assistance.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">How do I change my subscription plan?</h3>
                <p className="text-gray-600 text-sm">
                  Visit <Link href="/subscription" className="text-blue-600 hover:underline">Subscription Settings</Link> to upgrade or downgrade your plan at any time.
                  Changes take effect immediately, and you'll be billed prorated amounts.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Is my data secure?</h3>
                <p className="text-gray-600 text-sm">
                  Yes. All data is encrypted in transit and at rest. We follow industry best practices for security and comply with data protection regulations.
                  See our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> for details.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
            <p className="text-blue-100 mb-6">
              Our support team is here to help you get the most out of VoyagrIQ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:support@tripcostinsights.com" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                📧 Email Support
              </a>
              <a href="mailto:support@tripcostinsights.com?subject=Feature Request" className="px-6 py-3 bg-purple-800 text-white rounded-lg font-semibold hover:bg-purple-900 transition-colors">
                💡 Request a Feature
              </a>
            </div>
            <p className="text-sm text-blue-100 mt-4">
              Response time: Within 24 hours for all plans • Priority support for Premium users
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Non-signed-in version: Marketing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Transform Your Travel Agency Analytics
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              VoyagrIQ is the comprehensive analytics platform designed specifically for travel agencies.
              Track commissions, analyze trip costs, and gain actionable insights to grow your business.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/pricing">
                <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  Start Free Trial
                </button>
              </Link>
              <Link href="/login">
                <button className="px-8 py-4 bg-purple-800 text-white border-2 border-white rounded-lg font-bold text-lg hover:bg-purple-900 transition-colors cursor-pointer">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Problem Statement */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            The Challenge Travel Agencies Face
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scattered Data</h3>
              <p className="text-gray-600">
                Trip costs, commissions, and client information spread across spreadsheets, emails, and booking systems.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time-Consuming Reports</h3>
              <p className="text-gray-600">
                Hours spent manually compiling data and creating reports for clients or internal analysis.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Limited Insights</h3>
              <p className="text-gray-600">
                Difficulty identifying profitable destinations, top-performing agencies, or trends in commission rates.
              </p>
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            How VoyagrIQ Helps
          </h2>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  All Your Trip Data in One Place
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Track trip costs, commissions, and agency fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Organize by destination, traveler, or booking agency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Import existing data or start fresh</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Secure cloud storage with automatic backups</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Powerful Analytics & Reports
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Real-time dashboards with key metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Visual charts showing trends and patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Professional PDF reports for clients</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Export to Excel for deeper analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Commission Tracking</h3>
              <p className="text-gray-600 text-sm">
                Automatically calculate total commissions, track commission rates, and identify your most profitable bookings.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Destination Analysis</h3>
              <p className="text-gray-600 text-sm">
                See which countries and destinations generate the most revenue and commission for your agency.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Agency Performance</h3>
              <p className="text-gray-600 text-sm">
                Compare booking agencies, track partner performance, and optimize your agency relationships.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Business Intelligence</h3>
              <p className="text-gray-600 text-sm">
                Advanced analytics with trend analysis, forecasting, and actionable insights to grow your business.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Professional Reports</h3>
              <p className="text-gray-600 text-sm">
                Generate beautiful PDF reports with charts and insights. Perfect for sharing with clients or stakeholders.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600 text-sm">
                Multi-user support for agencies. Add team members, assign roles, and collaborate on trip management.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Who Uses VoyagrIQ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">🧳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Independent Travel Advisors</h3>
              <p className="text-gray-600">
                Solo advisors tracking personal bookings, commissions, and building client relationships.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Small Travel Agencies</h3>
              <p className="text-gray-600">
                Agencies with 2-10 advisors looking to centralize data and improve team efficiency.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Large Travel Networks</h3>
              <p className="text-gray-600">
                Enterprise agencies managing hundreds of trips per month with multiple team members.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">
            The Results You Can Expect
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Save 5+ Hours Per Week</h3>
                <p className="text-blue-100">
                  Eliminate manual data entry and report generation. Focus on what matters: serving your clients.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Make Data-Driven Decisions</h3>
                <p className="text-blue-100">
                  Identify trends, optimize partnerships, and focus on your most profitable destinations.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Professional Client Reports</h3>
                <p className="text-blue-100">
                  Impress clients with detailed trip analytics and beautiful PDF reports.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">📈</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Grow Your Revenue</h3>
                <p className="text-blue-100">
                  Track commission rates, negotiate better deals, and maximize profitability on every booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of travel agencies already using VoyagrIQ.
            Start your 14-day free trial today – no credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/pricing">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-lg">
                View Pricing & Plans
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors cursor-pointer">
                Sign In
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
