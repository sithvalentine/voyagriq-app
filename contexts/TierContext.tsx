"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/lib/subscription';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface TierContextType {
  currentTier: SubscriptionTier;
  setCurrentTier: (tier: SubscriptionTier) => void;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysLeftInTrial: number;
  hasActiveSubscription: boolean;
  isSignedIn: boolean;
  signIn: (tier: SubscriptionTier, userName: string, userEmail: string) => void;
  signOut: () => void;
  userName: string | null;
  userEmail: string | null;
  devMode: boolean;
  toggleDevMode: () => void;
  profileLoading: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

const DEV_MODE_KEY = 'voyagriq-dev-mode';

export function TierProvider({ children }: { children: ReactNode }) {
  const { user, signOut: authSignOut } = useAuth();
  const [currentTier, setCurrentTierState] = useState<SubscriptionTier>('starter');
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [devMode, setDevMode] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Check for test mode on mount (client-side only) - ONLY on localhost
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isTestMode = isLocalhost && localStorage.getItem('voyagriq-dev-mode') === 'true';
      setTestMode(isTestMode);
    }
  }, []);

  // Check if user is signed in OR in test mode
  const isSignedIn = !!user || testMode;

  // Calculate trial status
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];
  const trialEndDate = trialStartDate && tierInfo.hasTrial
    ? new Date(trialStartDate.getTime() + (tierInfo.trialDays || 14) * 24 * 60 * 60 * 1000)
    : null;

  const now = new Date();
  const isTrialActive = !hasActiveSubscription && trialEndDate ? now < trialEndDate : false;
  const isTrialExpired = !hasActiveSubscription && trialEndDate ? now >= trialEndDate : false;

  const daysLeftInTrial = trialEndDate && isTrialActive
    ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Fetch user profile from Supabase when user changes
  useEffect(() => {
    async function loadProfile() {
      // Check for test mode first (bypasses all Supabase checks) - ONLY on localhost
      const isLocalhost = typeof window !== 'undefined' &&
                          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const testMode = isLocalhost &&
                       typeof window !== 'undefined' &&
                       localStorage.getItem('voyagriq-dev-mode') === 'true';

      if (testMode) {
        // In dev mode, check for saved tier in localStorage
        const savedTier = localStorage.getItem('voyagriq-dev-tier') as SubscriptionTier;
        if (savedTier && (savedTier === 'starter' || savedTier === 'standard' || savedTier === 'premium' || savedTier === 'enterprise')) {
          setCurrentTierState(savedTier);
        } else {
          // Default to premium if no saved tier
          setCurrentTierState('premium');
          localStorage.setItem('voyagriq-dev-tier', 'premium');
        }
        setTrialStartDate(new Date());
        setHasActiveSubscription(true);
        setUserName('Test User');
        setUserEmail('test@example.com');
        setProfileLoading(false);
        return;
      }

      if (!user) {
        // No user signed in - clear state
        setCurrentTierState('starter');
        setTrialStartDate(null);
        setHasActiveSubscription(false);
        setUserName(null);
        setUserEmail(null);
        setProfileLoading(false);
        return;
      }

      try {
        // Add timeout to profile fetch
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );

        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

        if (error) {
          console.error('Error loading profile:', error);
          // Set defaults on error
          setCurrentTierState('starter');
          setUserName(user.email?.split('@')[0] || 'User');
          setUserEmail(user.email || null);
          setProfileLoading(false);
          return;
        }

        if (profile) {
          // Update state with profile data
          setCurrentTierState(profile.subscription_tier as SubscriptionTier || 'starter');
          setUserName(profile.full_name || user.email?.split('@')[0] || null);
          setUserEmail(profile.email || user.email || null);
          setTrialStartDate(profile.trial_start_date ? new Date(profile.trial_start_date) : null);
          setHasActiveSubscription(profile.subscription_status === 'active');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        // Set defaults on error
        setCurrentTierState('starter');
        setUserName(user.email?.split('@')[0] || 'User');
        setUserEmail(user.email || null);
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  // Load dev mode from localStorage (separate useEffect to avoid hydration issues)
  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const storedDevMode = localStorage.getItem(DEV_MODE_KEY);
      if (storedDevMode === 'true') {
        setDevMode(true);
      }
    }
  }, []);

  const setCurrentTier = async (tier: SubscriptionTier) => {
    setCurrentTierState(tier);

    // In dev mode, save to localStorage
    if (typeof window !== 'undefined' && localStorage.getItem('voyagriq-dev-mode') === 'true') {
      localStorage.setItem('voyagriq-dev-tier', tier);
    }

    // Update in Supabase if user is signed in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ subscription_tier: tier })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating tier:', error);
      }
    }
  };

  // Legacy signIn function - kept for compatibility but not recommended
  // New users should use the AuthContext signUp/signIn functions instead
  const signIn = (tier: SubscriptionTier, name: string, email: string) => {
    console.warn('TierContext.signIn is deprecated. Use AuthContext signUp/signIn instead.');
    setUserName(name);
    setUserEmail(email);
    setCurrentTierState(tier);
  };

  const signOut = async () => {
    // Clear local state
    setCurrentTierState('starter');
    setTrialStartDate(null);
    setHasActiveSubscription(false);
    setUserName(null);
    setUserEmail(null);

    // Sign out from Supabase
    await authSignOut();
  };

  const toggleDevMode = () => {
    // Only allow toggling dev mode on localhost
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost) {
        console.warn('Dev mode can only be enabled on localhost');
        return;
      }
    }
    const newDevMode = !devMode;
    setDevMode(newDevMode);
    localStorage.setItem(DEV_MODE_KEY, newDevMode.toString());
  };

  // Always render the provider to avoid hooks issues
  // Let consuming components handle loading state via profileLoading flag
  return (
    <TierContext.Provider value={{
      currentTier,
      setCurrentTier,
      trialStartDate,
      trialEndDate,
      isTrialActive,
      isTrialExpired,
      daysLeftInTrial,
      hasActiveSubscription,
      isSignedIn,
      signIn,
      signOut,
      userName,
      userEmail,
      devMode,
      toggleDevMode,
      profileLoading,
    }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}
