'use client';

import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';
import { SUBSCRIPTION_TIERS, getNextTier } from '@/lib/subscription';
import { useTier } from '@/contexts/TierContext';

export default function SubscriptionPage() {
  const { currentTier, isTrialActive, daysLeftInTrial, trialStartDate } = useTier();
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];
  const nextTier = getNextTier(currentTier);
  const nextTierInfo = nextTier ? SUBSCRIPTION_TIERS[nextTier] : null;

  const trips = DataStore.getTrips();
  const tripCount = trips.length;
  const tripLimit = tierInfo.tripLimit;
  const usagePercentage = tripLimit === 'unlimited' ? 0 : (tripCount / tripLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your plan, usage, and billing</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Current Plan</div>
              <h2 className="text-3xl font-bold text-gray-900">{tierInfo.name}</h2>
              <div className="text-2xl font-bold text-primary-600 mt-2">
                ${tierInfo.price}/month
              </div>
              {isTrialActive && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                  <span>🎁</span>
                  <span>Trial: {daysLeftInTrial} {daysLeftInTrial === 1 ? 'day' : 'days'} left</span>
                </div>
              )}
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              currentTier === 'starter' ? 'bg-blue-100 text-blue-700' :
              currentTier === 'standard' ? 'bg-purple-100 text-purple-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {tierInfo.name}
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-medium mb-1">Trips This Month</div>
              <div className="text-3xl font-bold text-blue-900">
                {tripCount}
                <span className="text-lg font-normal text-blue-700">
                  {' '}/ {tripLimit === 'unlimited' ? '∞' : tripLimit}
                </span>
              </div>
              {tripLimit !== 'unlimited' && (
                <div className="mt-2">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {usagePercentage.toFixed(0)}% used
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="text-sm text-purple-700 font-medium mb-1">Team Members</div>
              <div className="text-3xl font-bold text-purple-900">
                1
                <span className="text-lg font-normal text-purple-700">
                  {' '}/ {tierInfo.userLimit === 999 ? '∞' : tierInfo.userLimit}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="text-sm text-green-700 font-medium mb-1">Total Revenue Tracked</div>
              <div className="text-3xl font-bold text-green-900">
                ${trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Billing Info */}
          {isTrialActive && trialStartDate && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">Free Trial Active</h4>
                  <p className="text-sm text-blue-800">
                    Your trial ends on {new Date(trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                    {' '}After that, you'll be charged ${tierInfo.price}/month. Cancel anytime before trial ends.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade CTA if not on highest tier */}
          {nextTierInfo && (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Upgrade to {nextTierInfo.name}
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Get {nextTierInfo.tripLimit === 'unlimited' ? 'unlimited' : nextTierInfo.tripLimit} trips/month and {nextTierInfo.userLimit} team members
                  </p>
                  <div className="text-2xl font-bold text-purple-600">
                    ${nextTierInfo.price}/month
                  </div>
                </div>
                <Link href="/pricing">
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors cursor-pointer">
                    Upgrade Now
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Plan Includes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tierInfo.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="text-green-500 text-xl mt-1">✓</div>
                <div className="text-gray-700">{feature}</div>
              </div>
            ))}
          </div>

          {nextTierInfo && (
            <>
              <div className="border-t border-gray-200 my-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upgrade to {nextTierInfo.name} to unlock</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nextTierInfo.features.filter(feature => !tierInfo.features.includes(feature)).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="text-purple-500 text-xl mt-1">✓</div>
                    <div className="text-gray-700 font-medium">{feature}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/pricing">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                    Upgrade to {nextTierInfo.name} for ${nextTierInfo.price}/month →
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Billing Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Billing & Subscription</h3>

          <div className="space-y-3">
            <Link href="/pricing">
              <button className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors cursor-pointer">
                Change Plan
              </button>
            </Link>
            <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
              Manage Payment Method
            </button>
            <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
              View Billing History
            </button>
            <button className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors cursor-pointer border border-red-200">
              Cancel Subscription
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500 text-center">
            Need help? <Link href="/account" className="text-primary-600 hover:text-primary-700 font-medium">Visit Account Settings</Link> or contact support
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
