"use client";

import Link from 'next/link';
import { useTier } from '@/contexts/TierContext';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription';

export default function TrialExpiredScreen() {
  const { currentTier } = useTier();
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Icon */}
        <div className="text-6xl mb-6">⏰</div>

        {/* Headline */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your Trial Has Ended
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Your 14-day free trial of the <span className="font-semibold text-gray-900">{tierInfo.name}</span> plan has expired.
          Subscribe now to continue enjoying all the features!
        </p>

        {/* What You'll Keep */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Continue With {tierInfo.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            {tierInfo.features.slice(1, 7).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6 mb-8">
          <div className="text-5xl font-bold mb-2">
            ${tierInfo.price}
            <span className="text-2xl font-normal">/month</span>
          </div>
          <p className="text-purple-100">
            Cancel anytime • Full access • No hidden fees
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link href="/pricing" className="flex-1 sm:flex-initial">
            <button className="w-full px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg">
              Subscribe to {tierInfo.name}
            </button>
          </Link>
          <Link href="/pricing" className="flex-1 sm:flex-initial">
            <button className="w-full px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-bold text-lg hover:bg-purple-50 transition-colors">
              View All Plans
            </button>
          </Link>
        </div>

        {/* Fine Print */}
        <p className="text-sm text-gray-500">
          Your data is safe and will be accessible once you subscribe.
        </p>
      </div>
    </div>
  );
}
