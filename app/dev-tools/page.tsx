"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DevTools() {
  const router = useRouter();
  const [devMode, setDevMode] = useState(false);
  const [bypassLogin, setBypassLogin] = useState(false);
  const [currentTier, setCurrentTier] = useState('premium');
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalhost(localhost);

      if (localhost) {
        setDevMode(localStorage.getItem('voyagriq-dev-mode') === 'true');
        setBypassLogin(localStorage.getItem('voyagriq-bypass-login') === 'true');
        setCurrentTier(localStorage.getItem('voyagriq-dev-tier') || 'premium');
      }
    }
  }, []);

  const toggleDevMode = () => {
    if (typeof window !== 'undefined') {
      const newValue = !devMode;
      setDevMode(newValue);
      if (newValue) {
        localStorage.setItem('voyagriq-dev-mode', 'true');
        console.log('✅ Dev Mode ENABLED');
      } else {
        localStorage.removeItem('voyagriq-dev-mode');
        localStorage.removeItem('voyagriq-bypass-login');
        setBypassLogin(false);
        console.log('❌ Dev Mode DISABLED');
      }
    }
  };

  const toggleBypassLogin = () => {
    if (typeof window !== 'undefined' && devMode) {
      const newValue = !bypassLogin;
      setBypassLogin(newValue);
      if (newValue) {
        localStorage.setItem('voyagriq-bypass-login', 'true');
        console.log('✅ Login Bypass ENABLED - Refresh page to apply');
        // Redirect to trips page
        setTimeout(() => {
          window.location.href = '/trips';
        }, 1000);
      } else {
        localStorage.removeItem('voyagriq-bypass-login');
        console.log('❌ Login Bypass DISABLED - Refresh page to apply');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    }
  };

  const changeTier = (tier: string) => {
    if (typeof window !== 'undefined' && devMode) {
      setCurrentTier(tier);
      localStorage.setItem('voyagriq-dev-tier', tier);
      console.log(`✅ Tier changed to: ${tier.toUpperCase()} - Refresh page to apply`);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const clearAllData = () => {
    if (typeof window !== 'undefined' && confirm('Are you sure you want to clear all app data? This will reset everything including trips, settings, and dev preferences.')) {
      // Clear all localStorage except Supabase auth
      const keysToKeep = Object.keys(localStorage).filter(key => key.startsWith('sb-'));
      localStorage.clear();
      keysToKeep.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) localStorage.setItem(key, value);
      });

      console.log('🗑️ All app data cleared - Refresh page');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  if (!isLocalhost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Access Denied</h1>
          <p className="text-gray-600">
            Dev Tools are only available on localhost for security reasons.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🔧 Developer Tools</h1>
            <div className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
              LOCALHOST ONLY
            </div>
          </div>

          <div className="space-y-6">
            {/* Dev Mode Toggle */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Development Mode</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable developer features and bypass subscription checks
                  </p>
                </div>
                <button
                  onClick={toggleDevMode}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    devMode ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      devMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {devMode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-800 font-medium">✅ Dev Mode Active</p>
                  <p className="text-xs text-green-700 mt-1">
                    Subscription checks disabled • Full feature access enabled
                  </p>
                </div>
              )}
            </div>

            {/* Login Bypass */}
            <div className={`border rounded-lg p-6 ${devMode ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Login Bypass</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Skip authentication and use a mock user session
                  </p>
                </div>
                <button
                  onClick={toggleBypassLogin}
                  disabled={!devMode}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    bypassLogin && devMode ? 'bg-blue-600' : 'bg-gray-300'
                  } ${!devMode ? 'cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      bypassLogin && devMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {!devMode && (
                <p className="text-sm text-gray-500 italic">Enable Dev Mode first</p>
              )}
              {bypassLogin && devMode && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800 font-medium">🔓 Login Bypass Active</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Using mock user session • No authentication required
                  </p>
                </div>
              )}
            </div>

            {/* Tier Selection */}
            <div className={`border rounded-lg p-6 ${devMode ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Tier</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select which tier to simulate (requires Dev Mode)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['starter', 'standard', 'premium', 'enterprise'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => changeTier(tier)}
                    disabled={!devMode}
                    className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                      currentTier === tier && devMode
                        ? 'bg-purple-600 text-white'
                        : devMode
                        ? 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                ))}
              </div>
              {devMode && (
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mt-4">
                  <p className="text-sm text-purple-800 font-medium">
                    Current Tier: <span className="uppercase font-bold">{currentTier}</span>
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Refresh page after changing tier
                  </p>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <h2 className="text-xl font-semibold text-red-900 mb-4">⚠️ Danger Zone</h2>
              <p className="text-sm text-red-700 mb-4">
                Clear all app data including trips, settings, and preferences
              </p>
              <button
                onClick={clearAllData}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Clear All App Data
              </button>
            </div>

            {/* Quick Actions */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/trips')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Trips Dashboard
                </button>
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Go to Settings
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reload Application
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📚 How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Enable <strong>Development Mode</strong> to unlock all features</li>
            <li>Enable <strong>Login Bypass</strong> to skip authentication (will redirect to /trips)</li>
            <li>Select your desired <strong>Subscription Tier</strong> to test tier-specific features</li>
            <li>The page will auto-refresh when changing settings</li>
            <li>Access dev tools anytime at <code className="bg-blue-100 px-2 py-1 rounded">/dev-tools</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
