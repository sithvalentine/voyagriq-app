'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; data?: { user: User | null } }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://voyagriq.com';
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) return { error, data: undefined };

      // Profile will be created automatically by database trigger
      return { error: null, data: { user: data.user } };
    } catch (error: any) {
      return { error, data: undefined };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error);
        return { error };
      }

      // Check dev mode from localStorage (only check localStorage, not NODE_ENV on client)
      const devMode = typeof window !== 'undefined' &&
                     localStorage.getItem('voyagriq-dev-mode') === 'true';

      // Check if user has a Stripe customer ID
      if (data.user && !devMode) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id, subscription_tier')
            .eq('id', data.user.id)
            .single();

          // If no Stripe customer ID and NOT in dev mode, redirect to Stripe Checkout
          if (profile && !profile.stripe_customer_id) {
            const tier = profile.subscription_tier || 'starter';

            // Create Stripe checkout session
            try {
              const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier, userId: data.user.id }),
              });

              if (response.ok) {
                const { url } = await response.json();
                if (url && typeof window !== 'undefined') {
                  window.location.href = url;
                  return { error: null };
                }
              }
            } catch (checkoutError) {
              console.error('Error creating checkout session:', checkoutError);
            }
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
        }
      }

      // Only redirect to trips if we didn't redirect to Stripe
      // Use router.push for smooth navigation without page reload
      router.push('/trips');
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: error.message ? { message: error.message } : error };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all auth-related data from storage
      if (typeof window !== 'undefined') {
        // Clear dev mode flag
        localStorage.removeItem('voyagriq-dev-mode');

        // Clear Supabase session from localStorage
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });

        // Clear Supabase session from sessionStorage
        const sessionStorageKeys = Object.keys(sessionStorage);
        sessionStorageKeys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });

        // Force a hard reload to ensure session is cleared (especially in Safari)
        window.location.href = '/';
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect even if signOut fails
      if (typeof window !== 'undefined') {
        // Clear dev mode flag
        localStorage.removeItem('voyagriq-dev-mode');

        // Still try to clear storage
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });

        const sessionStorageKeys = Object.keys(sessionStorage);
        sessionStorageKeys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });

        window.location.href = '/';
      } else {
        router.push('/');
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://voyagriq.com';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
