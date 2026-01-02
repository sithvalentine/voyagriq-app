'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DisableDevModePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'disabling' | 'success' | 'error'>('disabling');

  useEffect(() => {
    try {
      // Remove dev mode from localStorage
      localStorage.removeItem('voyagriq-dev-mode');

      // Remove dev mode cookie
      document.cookie = 'voyagriq-dev-mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      setStatus('success');

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error disabling dev mode:', error);
      setStatus('error');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'disabling' && (
          <>
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Disabling Dev Mode...</h1>
            <p className="text-gray-600">Removing development bypass</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dev Mode Disabled!</h1>
            <p className="text-gray-600 mb-4">
              Payment checks are now active. You'll need a valid subscription to access protected pages.
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
              Could not disable dev mode. Please check the console.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 font-semibold mb-2">Normal Mode Restored</p>
          <p className="text-xs text-blue-700">
            All payment checks are now enforced as designed.
          </p>
        </div>
      </div>
    </div>
  );
}
