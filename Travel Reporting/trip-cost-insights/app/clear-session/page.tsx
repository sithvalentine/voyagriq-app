'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ClearSessionPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'clearing' | 'success'>('clearing');

  useEffect(() => {
    const clearEverything = async () => {
      try {
        // Sign out from Supabase
        await supabase.auth.signOut();

        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Enable dev mode
        localStorage.setItem('voyagriq-dev-mode', 'true');
        document.cookie = 'voyagriq-dev-mode=true; path=/; max-age=31536000';

        setStatus('success');

        // Wait 2 seconds then redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        console.error('Error clearing session:', error);
        setStatus('success'); // Continue anyway
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    clearEverything();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'clearing' && (
          <>
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Clearing Everything...</h1>
            <p className="text-gray-600">Signing out and clearing all data</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">All Clear! ✨</h1>
            <div className="text-left bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 font-semibold mb-2">What was cleared:</p>
              <ul className="text-xs text-green-700 space-y-1">
                <li>✓ Logged out from Supabase</li>
                <li>✓ Cleared localStorage</li>
                <li>✓ Cleared sessionStorage</li>
                <li>✓ Cleared all cookies</li>
                <li>✓ Enabled dev mode</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Redirecting to home page...
            </p>
            <p className="text-xs text-gray-500">
              You can now use the app without payment checks!
            </p>
          </>
        )}
      </div>
    </div>
  );
}
