'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function SetupSubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const tier = searchParams.get('tier') || 'starter';

  const redirectToCheckout = async () => {
    if (!user || isRedirecting) return;

    setIsRedirecting(true);
    setError(null);

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Error setting up subscription:', err);
      setError(err.message || 'Failed to set up subscription');
      setIsRedirecting(false);
      setShowOptions(true);
    }
  };

  useEffect(() => {
    if (!user) {
      // If no user, redirect to login
      router.push('/login');
      return;
    }

    // Check if they've been here before (from Stripe back button)
    const hasSeenPaymentPage = sessionStorage.getItem('seen-payment-page');

    if (hasSeenPaymentPage === 'true') {
      // They clicked back from Stripe without completing payment
      // Sign them out immediately to prevent unauthorized access
      sessionStorage.removeItem('seen-payment-page');
      signOut().then(() => {
        router.push('/login?message=payment_required');
      });
    } else {
      // First time here, auto-redirect to Stripe
      sessionStorage.setItem('seen-payment-page', 'true');
      redirectToCheckout();
    }
  }, [user, router, signOut]);

  // Show options if they returned from Stripe (back button) or error
  if (showOptions || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Subscription
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              To access VoyagrIQ, you need to complete your subscription payment.
              Choose an option below:
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={redirectToCheckout}
              disabled={isRedirecting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? 'Redirecting...' : 'Continue to Payment'}
            </button>

            <button
              onClick={() => router.push('/pricing')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              View Pricing Plans
            </button>

            <button
              onClick={async () => {
                sessionStorage.removeItem('seen-payment-page');
                await signOut();
                router.push('/');
              }}
              className="w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Cancel and Sign Out
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Questions? Contact us at james@mintgoldwyn.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Setting Up Your Subscription
        </h1>

        <p className="text-gray-600 mb-6">
          Please wait while we redirect you to complete your subscription setup...
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

export default function SetupSubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <SetupSubscriptionContent />
    </Suspense>
  );
}
