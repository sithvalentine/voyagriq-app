'use client';

import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';
import { SUBSCRIPTION_TIERS, getNextTier } from '@/lib/subscription';
import { useTier } from '@/contexts/TierContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function AccountPage() {
  const { currentTier, userName, userEmail, trialStartDate, isTrialActive, daysLeftInTrial, setCurrentTier, devMode, toggleDevMode } = useTier();
  const { user } = useAuth();
  const [billingLoading, setBillingLoading] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Check if running on localhost
  useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];
  const nextTier = getNextTier(currentTier);
  const nextTierInfo = nextTier ? SUBSCRIPTION_TIERS[nextTier] : null;

  const trips = DataStore.getTrips();
  const tripCount = trips.length;
  const tripLimit = tierInfo.tripLimit;
  const usagePercentage = tripLimit === 'unlimited' ? 0 : (tripCount / tripLimit) * 100;

  // Calculate account creation date (from trial start or use current date)
  const accountCreatedDate = trialStartDate || new Date();
  const accountCreatedString = accountCreatedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Tier switcher handler
  const handleTierSwitch = (tier: 'starter' | 'standard' | 'premium') => {
    setCurrentTier(tier);
    // Force a hard reload to ensure all contexts and pages update
    setTimeout(() => {
      window.location.href = window.location.href;
    }, 100);
  };

  const handleLoadSampleData = () => {
    window.location.href = '/load-sample-data';
  };

  const handleManageBilling = async () => {
    // Check if in dev mode
    if (devMode || (typeof window !== 'undefined' && localStorage.getItem('voyagriq-dev-mode') === 'true')) {
      alert(
        '🔧 Developer Mode Active\n\n' +
        'Billing portal is disabled in dev mode.\n\n' +
        'In production, this would redirect to Stripe\'s billing portal where customers can:\n' +
        '• Update payment methods\n' +
        '• View invoices\n' +
        '• Cancel subscription\n' +
        '• Update billing info'
      );
      return;
    }

    if (!user) {
      alert('Please sign in to manage billing');
      return;
    }

    setBillingLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create billing portal session');
      }

      // Redirect to Stripe billing portal
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
      alert(error.message || 'Failed to open billing portal. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) {
      alert('Please sign in to cancel subscription');
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to cancel your subscription?\n\n' +
      'You will still have access until the end of your current billing period.\n\n' +
      'Click OK to proceed to the billing portal where you can cancel.'
    );

    if (confirmed) {
      handleManageBilling();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your subscription and account preferences</p>
        </div>

        {/* Development Mode Toggle - Only show on localhost */}
        {isLocalhost && (
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              <h3 className="text-xl font-bold text-gray-900">Developer Mode</h3>
              {devMode && <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded">ENABLED</span>}
            </div>
            <button
              onClick={toggleDevMode}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                devMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {devMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
            </button>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Enable developer mode to access tier switching and sample data tools for testing
          </p>
        </div>
        )}

        {/* Development Tier Switcher - Only visible when dev mode is on */}
        {devMode && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <h3 className="text-xl font-bold text-gray-900">Quick Tier Switching</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Switch between subscription tiers instantly for testing features
            </p>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleTierSwitch('starter')}
                disabled={currentTier === 'starter'}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentTier === 'starter'
                    ? 'bg-blue-600 text-white ring-4 ring-blue-300 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                }`}
              >
                {currentTier === 'starter' ? '✓ ' : ''}Starter
              </button>
              <button
                onClick={() => handleTierSwitch('standard')}
                disabled={currentTier === 'standard'}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentTier === 'standard'
                    ? 'bg-purple-600 text-white ring-4 ring-purple-300 cursor-not-allowed'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer'
                }`}
              >
                {currentTier === 'standard' ? '✓ ' : ''}Standard
              </button>
              <button
                onClick={() => handleTierSwitch('premium')}
                disabled={currentTier === 'premium'}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentTier === 'premium'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white ring-4 ring-amber-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-100 to-pink-100 text-amber-800 hover:from-amber-200 hover:to-pink-200 cursor-pointer'
                }`}
              >
                {currentTier === 'premium' ? '✓ ' : ''}Premium
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Current tier: <span className="font-bold">{tierInfo.name}</span> - Click a button to switch and reload
            </p>

            <div className="mt-6 pt-6 border-t border-yellow-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📦</span>
                <h4 className="font-bold text-gray-900">Sample Data</h4>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Load sample trips with commission data for testing
              </p>
              <button
                onClick={handleLoadSampleData}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        )}

        {/* Advanced Settings - Premium Features (Standard & Premium only) */}
        {(currentTier === 'standard' || currentTier === 'premium') && (
          <div className="mb-6">
            <Link href="/settings">
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-lg">
                ⚙️ Advanced Settings (Team, Branding, API)
              </button>
            </Link>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Current Plan</div>
              <h2 className="text-3xl font-bold text-gray-900">{tierInfo.name}</h2>
              <div className="text-2xl font-bold text-primary-600 mt-2">
                ${tierInfo.price}/month
              </div>
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
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
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
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Upgrade to {nextTierInfo.name} for ${nextTierInfo.price}/month →
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="text-gray-900 font-medium">{userName || 'Not set'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="text-gray-900 font-medium">{userEmail || 'Not set'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
              <div className="text-gray-900 font-medium">{accountCreatedString}</div>
            </div>

            {isTrialActive && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial Status</label>
                <div className="text-gray-900 font-medium">
                  {daysLeftInTrial} {daysLeftInTrial === 1 ? 'day' : 'days'} remaining
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Your trial ends on {trialStartDate && new Date(trialStartDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
              <div className="text-gray-900 font-medium">Monthly</div>
              <div className="text-xs text-gray-500 mt-1">
                {isTrialActive ? 'Billing starts after trial ends' : 'Next billing date: First of next month'}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-6" />

          <div className="space-y-3">
            <Link href="/pricing">
              <button className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors cursor-pointer">
                Change Plan
              </button>
            </Link>
            <button
              onClick={handleManageBilling}
              disabled={billingLoading}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {billingLoading ? 'Loading...' : 'Manage Billing'}
            </button>
            <button
              onClick={handleCancelSubscription}
              disabled={billingLoading}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Subscription
            </button>
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
