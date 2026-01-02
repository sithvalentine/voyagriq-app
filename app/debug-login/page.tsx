'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugLogin() {
  const router = useRouter();

  useEffect(() => {
    // Enable dev mode
    localStorage.setItem('voyagriq-dev-mode', 'true');

    // Set mock auth for testing (bypasses Supabase)
    localStorage.setItem('voyagriq-test-mode', 'true');

    console.log('✅ Debug mode enabled');
    console.log('✅ Dev mode enabled');
    console.log('🚀 Redirecting to trips...');

    // Redirect to trips after a brief moment
    setTimeout(() => {
      router.push('/trips');
    }, 500);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900">Debug Login Active</h1>
        <p className="text-gray-600 mt-2">Setting up test environment...</p>
        <p className="text-sm text-gray-500 mt-4">Redirecting to trips page...</p>
      </div>
    </div>
  );
}
