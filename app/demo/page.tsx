"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoModePage() {
  const router = useRouter();

  const enableDemoMode = () => {
    // Set demo mode flag in localStorage
    localStorage.setItem('voyagriq-demo-mode', 'true');
    localStorage.setItem('voyagriq-demo-user', JSON.stringify({
      id: 'demo-user-123',
      email: 'demo@voyagriq.com',
      user_metadata: {
        first_name: 'Demo',
        last_name: 'User',
      }
    }));
    localStorage.setItem('voyagriq-demo-tier', 'premium');

    alert('Demo mode enabled! You can now browse the app without login. This is for LOCAL TESTING ONLY.');
    router.push('/trips');
  };

  const disableDemoMode = () => {
    localStorage.removeItem('voyagriq-demo-mode');
    localStorage.removeItem('voyagriq-demo-user');
    localStorage.removeItem('voyagriq-demo-tier');

    alert('Demo mode disabled.');
    router.push('/');
  };

  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('voyagriq-demo-mode') === 'true';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-red-900">⚠️ LOCAL DEMO MODE</h1>
          </div>
          <p className="text-red-800 font-semibold">
            FOR LOCAL DEVELOPMENT/TESTING ONLY - NEVER USE IN PRODUCTION
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Demo Mode Status</h2>

          {isDemoMode ? (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold mb-2">✓ Demo Mode is ENABLED</p>
              <p className="text-sm text-green-700">
                You can browse the app without authentication. This uses localStorage to simulate a logged-in user.
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-800 font-semibold mb-2">Demo Mode is DISABLED</p>
              <p className="text-sm text-gray-700">
                Enable demo mode to test the app without logging in.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What Demo Mode Does:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Sets a fake user ID in localStorage</li>
                <li>Bypasses authentication checks in the UI</li>
                <li>Allows you to navigate freely</li>
                <li>Gives you "Premium" tier access</li>
                <li>Uses mock data for testing</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">⚠️ Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>This ONLY works on localhost</li>
                <li>Backend API calls may still fail</li>
                <li>Data won't be saved to the database</li>
                <li>Clear browser storage to reset</li>
              </ul>
            </div>

            <div className="flex gap-4 mt-6">
              {!isDemoMode ? (
                <button
                  onClick={enableDemoMode}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Enable Demo Mode
                </button>
              ) : (
                <>
                  <button
                    onClick={disableDemoMode}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Disable Demo Mode
                  </button>
                  <Link
                    href="/trips"
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                  >
                    Go to App →
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> If you need to test with real authentication, use a test account instead of demo mode.
          </p>
        </div>
      </div>
    </div>
  );
}
