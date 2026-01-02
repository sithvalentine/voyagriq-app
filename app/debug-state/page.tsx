'use client';

import { useEffect, useState } from 'react';
import { useTier } from '@/contexts/TierContext';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugStatePage() {
  const { user } = useAuth();
  const { currentTier, devMode } = useTier();
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});
  const [cookies, setCookies] = useState<string>('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get localStorage
    const storageData: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        storageData[key] = window.localStorage.getItem(key) || '';
      }
    }
    setLocalStorageData(storageData);

    // Get cookies
    setCookies(document.cookie);

    // Get env vars
    setEnvVars({
      NODE_ENV: process.env.NODE_ENV || 'not set',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug State</h1>

        {/* Auth State */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><strong>Logged In:</strong> {user ? 'Yes' : 'No'}</div>
            <div><strong>User ID:</strong> {user?.id || 'None'}</div>
            <div><strong>Email:</strong> {user?.email || 'None'}</div>
          </div>
        </div>

        {/* Tier State */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tier & Dev Mode</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><strong>Current Tier:</strong> {currentTier || 'None'}</div>
            <div><strong>Dev Mode (Context):</strong> {devMode ? 'Enabled ✅' : 'Disabled ❌'}</div>
          </div>
        </div>

        {/* LocalStorage */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">LocalStorage</h2>
          {Object.keys(localStorageData).length === 0 ? (
            <p className="text-gray-500">Empty</p>
          ) : (
            <div className="space-y-2 font-mono text-xs max-h-96 overflow-auto">
              {Object.entries(localStorageData).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-2">
                  <div className="font-bold text-blue-600">{key}</div>
                  <div className="text-gray-600 break-all">{value.substring(0, 100)}{value.length > 100 ? '...' : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cookies</h2>
          {!cookies ? (
            <p className="text-gray-500">No cookies</p>
          ) : (
            <div className="space-y-2 font-mono text-xs max-h-96 overflow-auto">
              {cookies.split('; ').map((cookie, idx) => {
                const [key, ...valueParts] = cookie.split('=');
                const value = valueParts.join('=');
                return (
                  <div key={idx} className="border-b border-gray-200 pb-2">
                    <div className="font-bold text-blue-600">{key}</div>
                    <div className="text-gray-600 break-all">{value.substring(0, 100)}{value.length > 100 ? '...' : ''}</div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-semibold text-yellow-800 mb-1">Looking for:</p>
            <p className="text-xs text-yellow-700 font-mono">voyagriq-dev-mode=true</p>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                localStorage.setItem('voyagriq-dev-mode', 'true');
                document.cookie = 'voyagriq-dev-mode=true; path=/; max-age=31536000';
                window.location.reload();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              Enable Dev Mode & Reload
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('voyagriq-dev-mode');
                document.cookie = 'voyagriq-dev-mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.reload();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
            >
              Disable Dev Mode & Reload
            </button>
            <a
              href="/clear-session"
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
              Clear Everything
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
