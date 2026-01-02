'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnableDevModePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'enabling' | 'success' | 'error'>('enabling');

  useEffect(() => {
    try {
      // Set dev mode in localStorage (for AuthContext)
      localStorage.setItem('voyagriq-dev-mode', 'true');

      // Set dev mode in cookies (for middleware)
      document.cookie = 'voyagriq-dev-mode=true; path=/; max-age=31536000'; // 1 year

      setStatus('success');

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error enabling dev mode:', error);
      setStatus('error');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'enabling' && (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Enabling Dev Mode...</h1>
            <p className="text-gray-600">Setting up development bypass</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dev Mode Enabled!</h1>
            <p className="text-gray-600 mb-4">
              You can now access the app without completing Stripe payment.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to home page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">
              Could not enable dev mode. Please check the console.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 font-semibold mb-2">Development Mode Only</p>
          <p className="text-xs text-yellow-700">
            This bypass only works in development environment and will not work in production.
          </p>
        </div>
      </div>
    </div>
  );
}
