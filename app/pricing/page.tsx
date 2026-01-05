'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription';
import { useTier } from '@/contexts/TierContext';
import { useAuth } from '@/contexts/AuthContext';

export default function PricingPage() {
  const { currentTier } = useTier();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  const handleSubscribe = async (tier: 'starter' | 'standard' | 'premium') => {
    // If not logged in, redirect to register with tier parameter
    if (!user) {
      router.push(`/register?tier=${tier}&interval=${billingInterval}`);
      return;
    }

    try {
      setLoading(tier);

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, userId: user.id, interval: billingInterval }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  // Calculate annual price (12 months, get 14 months = 2 months free)
  const getDisplayPrice = (monthlyPrice: number) => {
    if (billingInterval === 'annual') {
      return monthlyPrice * 12; // Pay for 12 months
    }
    return monthlyPrice;
  };

  const getPriceLabel = (monthlyPrice: number) => {
    if (billingInterval === 'annual') {
      const annualPrice = monthlyPrice * 12;
      const monthlyEquivalent = annualPrice / 14; // Spread over 14 months
      return `$${annualPrice}/year (${monthlyEquivalent.toFixed(0)}/mo effective)`;
    }
    return `$${monthlyPrice}/month`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Professional travel analytics for agencies of all sizes. Start with what you need, upgrade as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 bg-white rounded-full p-2 shadow-md max-w-md mx-auto">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-2 rounded-full font-semibold transition-all relative ${
                billingInterval === 'annual'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                2 FREE
              </span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {billingInterval === 'annual' ? '🎉 Get 2 months free!' : 'Billed monthly'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {/* Starter Tier */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow relative">
            <div className="absolute top-0 right-0 bg-blue-400 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
              14-DAY FREE TRIAL
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{SUBSCRIPTION_TIERS.starter.name}</h2>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">${getDisplayPrice(SUBSCRIPTION_TIERS.starter.price)}</span>
                <span className="text-blue-100">/{billingInterval === 'annual' ? 'year' : 'month'}</span>
              </div>
              {billingInterval === 'annual' && (
                <p className="text-blue-100 text-sm mt-1">${Math.round(SUBSCRIPTION_TIERS.starter.price * 12 / 14)}/mo</p>
              )}
              <p className="text-blue-100 mt-2">Perfect for solo advisors</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {SUBSCRIPTION_TIERS.starter.tripLimit} trips
                </div>
                <div className="text-gray-600">per month</div>
              </div>

              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_TIERS.starter.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {user && currentTier === 'starter' ? (
                <button className="w-full py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe('starter')}
                  disabled={loading === 'starter'}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'starter' ? 'Processing...' : 'Get Started'}
                </button>
              )}
            </div>
          </div>

          {/* Standard Tier - POPULAR */}
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-500 overflow-hidden transform scale-105 relative">
            <div className="absolute top-0 left-0 bg-blue-400 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
              14-DAY FREE TRIAL
            </div>
            <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
              MOST POPULAR
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{SUBSCRIPTION_TIERS.standard.name}</h2>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">${getDisplayPrice(SUBSCRIPTION_TIERS.standard.price)}</span>
                <span className="text-purple-100">/{billingInterval === 'annual' ? 'year' : 'month'}</span>
              </div>
              {billingInterval === 'annual' && (
                <p className="text-purple-100 text-sm mt-1">${Math.round(SUBSCRIPTION_TIERS.standard.price * 12 / 14)}/mo</p>
              )}
              <p className="text-purple-100 mt-2">Ideal for growing teams</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {SUBSCRIPTION_TIERS.standard.tripLimit} trips
                </div>
                <div className="text-gray-600">per month</div>
              </div>

              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_TIERS.standard.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {user && currentTier === 'standard' ? (
                <button className="w-full py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe('standard')}
                  disabled={loading === 'standard'}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'standard' ? 'Processing...' : 'Get Started'}
                </button>
              )}
            </div>
          </div>

          {/* Premium Tier */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{SUBSCRIPTION_TIERS.premium.name}</h2>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">${getDisplayPrice(SUBSCRIPTION_TIERS.premium.price)}</span>
                <span className="text-amber-100">/{billingInterval === 'annual' ? 'year' : 'month'}</span>
              </div>
              {billingInterval === 'annual' && (
                <p className="text-amber-100 text-sm mt-1">${Math.round(SUBSCRIPTION_TIERS.premium.price * 12 / 14)}/mo</p>
              )}
              <p className="text-amber-100 mt-2">Enterprise-ready solution</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {SUBSCRIPTION_TIERS.premium.tripLimit} trips
                </div>
                <div className="text-gray-600">per month</div>
              </div>

              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_TIERS.premium.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {user && currentTier === 'premium' ? (
                <button className="w-full py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe('premium')}
                  disabled={loading === 'premium'}
                  className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'premium' ? 'Processing...' : 'Get Started'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Compare All Features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-blue-600 font-semibold">Starter<br/><span className="text-xs text-gray-500 font-normal">(14-day trial)</span></th>
                  <th className="text-center py-4 px-4 text-purple-600 font-semibold">Standard<br/><span className="text-xs text-gray-500 font-normal">(14-day trial)</span></th>
                  <th className="text-center py-4 px-4 text-amber-600 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-4 text-gray-700">Monthly trip limit</td>
                  <td className="py-4 px-4 text-center font-semibold text-gray-900">25</td>
                  <td className="py-4 px-4 text-center font-semibold text-gray-900">50</td>
                  <td className="py-4 px-4 text-center font-semibold text-gray-900">100</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Team members</td>
                  <td className="py-4 px-4 text-center font-semibold text-gray-900">1</td>
                  <td className="py-4 px-4 text-center font-semibold text-gray-900">10</td>
                  <td className="py-4 px-4 text-center font-semibold text-gray-900">20</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Analytics dashboards</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Commission tracking</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Business intelligence</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">CSV/Excel/PDF export</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Custom client tags</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Scheduled reports</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Advanced filters & search</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Agency performance comparison</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">API access</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">White-label reports</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Dedicated account manager</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-gray-400">—</td>
                  <td className="py-4 px-4 text-center text-green-500 text-xl">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's the annual billing discount?
              </h3>
              <p className="text-gray-600">
                Pay for 12 months upfront and get 14 months of service—that's 2 months completely free! This applies to all tiers and saves you approximately 14% compared to paying monthly.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade at any time. When upgrading, you'll be charged a prorated amount for the remainder of your billing cycle. Downgrades take effect at the start of your next billing cycle. You can also switch between monthly and annual billing.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my trip limit?
              </h3>
              <p className="text-gray-600">
                If you reach your monthly trip limit, you'll be prompted to upgrade to a higher tier. Your existing data remains safe and accessible, but you won't be able to add new trips until you upgrade or your monthly limit resets.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! All plans include a 14-day free trial. Payment details are required to start your trial, but you won't be charged until the trial ends. Cancel anytime during the trial at no cost.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank transfers for annual subscriptions. All payments are processed securely through Stripe.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do trip limits reset monthly?
              </h3>
              <p className="text-gray-600">
                Yes! Your trip limit resets on your billing anniversary date each month. For example, if you signed up on the 15th, your limit resets on the 15th of each month.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to transform your travel agency analytics?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial today. Cancel anytime - experience the full power of VoyagrIQ risk-free.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleSubscribe('starter')}
              disabled={loading === 'starter'}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'starter' ? 'Processing...' : 'Start Free Trial'}
            </button>
            <button
              onClick={() => handleSubscribe('standard')}
              disabled={loading === 'standard'}
              className="px-8 py-4 bg-purple-800 text-white border-2 border-white rounded-lg font-bold text-lg hover:bg-purple-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'standard' ? 'Processing...' : 'Try Standard (Most Popular)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
