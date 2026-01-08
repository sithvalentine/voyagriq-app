"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription';
import { useTier } from '@/contexts/TierContext';

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useTier();
  const [isMounted, setIsMounted] = useState(false);

  // Track when component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect logged-in users to their trips page
  useEffect(() => {
    if (isMounted && isSignedIn) {
      router.push('/trips');
    }
  }, [isSignedIn, isMounted, router]);

  // Always render landing page during SSR and initial mount to avoid hydration mismatch
  // The redirect will happen after mount

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Know Your Real Profit
            <span className="block text-blue-600">On Every Trip</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            VoyagrIQ pulls your trip costs, commissions, and vendor spend into one place
            so you can spot your most profitable trips, best suppliers, and hidden leaks in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
                Start 14-Day Free Trial
              </button>
            </Link>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow cursor-pointer"
            >
              View Pricing
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No setup fees • No long-term contracts • Cancel anytime
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            Plans That Fit How You Sell Travel
          </h2>
          <p className="text-xl text-center text-purple-100 mb-3">
            Start simple and upgrade as your trips and team grow. No setup fees, no long-term contracts.
          </p>
          <p className="text-lg text-center text-yellow-300 font-semibold mb-12">
            💰 Save big with annual billing: Pay for 12 months, get 14 months!
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Starter */}
            <div className="bg-white text-gray-900 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">${SUBSCRIPTION_TIERS.starter.price}</div>
              <div className="text-gray-500 mb-4">/month</div>
              <p className="text-gray-600 mb-2 font-semibold">Up to 25 trips/month</p>
              <p className="text-sm text-gray-500 mb-6">For solo advisors</p>
              <ul className="text-left text-sm space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>14-day trial on monthly plans</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Core dashboards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Standard reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>CSV/Excel/PDF export</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Cost breakdowns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Commission tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Email support</span>
                </li>
              </ul>
              <Link href="/register?tier=starter">
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer">
                  Start Free Trial
                </button>
              </Link>
            </div>

            {/* Standard */}
            <div className="bg-white text-gray-900 rounded-xl p-8 text-center border-4 border-yellow-400 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Standard</h3>
              <div className="text-5xl font-bold text-purple-600 mb-2">${SUBSCRIPTION_TIERS.standard.price}</div>
              <div className="text-gray-500 mb-4">/month</div>
              <p className="text-gray-600 mb-2 font-semibold">Up to 50 trips/month</p>
              <p className="text-sm text-gray-500 mb-6">For growing agencies</p>
              <ul className="text-left text-sm space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>14-day trial on monthly plans</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Up to 10 users</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Team roles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Advanced filters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Scheduled reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Custom tags</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Agency comparison</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/register?tier=standard">
                <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors cursor-pointer">
                  Start Free Trial
                </button>
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white text-gray-900 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-5xl font-bold text-amber-600 mb-2">${SUBSCRIPTION_TIERS.premium.price}</div>
              <div className="text-gray-500 mb-4">/month</div>
              <p className="text-gray-600 mb-2 font-semibold">Up to 100 trips</p>
              <p className="text-sm text-gray-500 mb-6">For larger agencies</p>
              <ul className="text-left text-sm space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Everything in Standard</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Up to 20 team members</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>White-label PDFs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>API access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Advanced exports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Portfolio management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Account manager</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Quarterly check-ins</span>
                </li>
              </ul>
              <Link href="/register?tier=premium">
                <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer">
                  Get Started
                </button>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link href="/pricing">
              <button className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
                Compare All Features →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Positioning Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            VoyagrIQ is built for travel advisors and agencies that are done guessing about profitability.
          </p>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mt-4">
            It turns your trip data into clear dashboards and reports that show cost per traveler, commission revenue,
            and true profit, with exports to PDF, Excel, and CSV when you need to share.
          </p>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mt-4">
            Instead of fighting spreadsheets or heavy all-in-one systems, you get travel-specific analytics and vendor insights that help you price better, negotiate smarter, and grow with confidence.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-2xl shadow-xl mb-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Maximize Profitability
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="text-center p-6">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Cost Analytics</h3>
            <p className="text-gray-600">
              Instant breakdown of flights, hotels, activities, and more. Identify where your money goes and optimize every dollar.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Vendor Intelligence</h3>
            <p className="text-gray-600">
              Track relationships with multiple vendors per trip. Spot negotiation opportunities and optimize supplier relationships.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-6">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Professional Reports</h3>
            <p className="text-gray-600">
              Export to PDF, Excel, and CSV. White-label options available so reports match your agency brand.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Commission Tracking</h3>
            <p className="text-gray-600">
              Track revenue from every booking. Flexible percentage-based and flat-fee commission models.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="text-center p-6">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Cost Per Traveler</h3>
            <p className="text-gray-600">
              Automatically calculate and track cost efficiency per traveler—a key metric for group travel profitability.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="text-center p-6">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Agency Comparison</h3>
            <p className="text-gray-600">
              Compare performance across agencies or advisors. Identify top performers and share best practices with your team.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Get Started in Minutes
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500">
            <div className="text-4xl font-bold text-blue-500 mb-4">1</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Add Your Trips</h3>
            <p className="text-gray-600 mb-4">
              Enter trip details manually or import from CSV. Takes less than 2 minutes per trip.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Simple form with auto-calculations
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                CSV import for bulk data
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                No technical skills required
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500">
            <div className="text-4xl font-bold text-purple-500 mb-4">2</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Get Instant Insights</h3>
            <p className="text-gray-600 mb-4">
              Our platform analyzes every trip and surfaces optimization opportunities automatically.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Cost efficiency ratings
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Vendor spending patterns
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Revenue projections
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500">
            <div className="text-4xl font-bold text-green-500 mb-4">3</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Make Better Decisions</h3>
            <p className="text-gray-600 mb-4">
              Use data to close more deals, increase trip value, and maximize your commission income.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Export client-ready reports
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Test pricing scenarios
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Track monthly performance
              </li>
            </ul>
          </div>
        </div>
      </div>


      {/* Social Proof / Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Built for Travel Professionals
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Solo Advisors</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 text-xl">→</span>
                <span>Justify premium pricing with data-backed trip breakdowns</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 text-xl">→</span>
                <span>Spot your most profitable trips and best suppliers</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 text-xl">→</span>
                <span>Present professional reports to clients</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3 text-xl">→</span>
                <span>Track your commission revenue effortlessly</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Agency Owners</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-3 text-xl">→</span>
                <span>Compare advisor performance across your team</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-3 text-xl">→</span>
                <span>Set benchmarks and share best practices</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-3 text-xl">→</span>
                <span>White-label reports with your agency branding</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-3 text-xl">→</span>
                <span>Scale from 1 user to 20 team members</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to See Your Real Profit?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join travel advisors who are using data to price better, negotiate smarter, and grow with confidence.
            Choose the plan that fits your agency.
          </p>
          <Link href="/pricing">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
              View Pricing & Get Started
            </button>
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            14-day trial on monthly plans • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
