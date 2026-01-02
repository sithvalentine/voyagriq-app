'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * RequireAuth component - Protects pages from unauthorized access using Supabase Auth
 * Redirects non-logged-in users to the homepage (or specified redirect)
 *
 * Usage:
 * ```tsx
 * export default function ProtectedPage() {
 *   return (
 *     <RequireAuth>
 *       <YourProtectedContent />
 *     </RequireAuth>
 *   );
 * }
 * ```
 */
export default function RequireAuth({ children, redirectTo = '/' }: RequireAuthProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Don't render anything while loading or redirecting
  if (loading || !user) {
    return null;
  }

  return <>{children}</>;
}
