'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DebugLogoutPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await signOut();
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 1000);
    };
    logout();
  }, [signOut, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-semibold">Signing out and clearing session...</p>
        <p className="text-gray-500 text-sm mt-2">You'll be redirected to the homepage</p>
      </div>
    </div>
  );
}
