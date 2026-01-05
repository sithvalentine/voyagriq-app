'use client';

import Link from 'next/link';
import { useTier } from '@/contexts/TierContext';
import { useState, useEffect } from 'react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: Date;
  lastUsed: Date | null;
  requests: number;
}

export default function APIKeysPage() {
  const { currentTier } = useTier();
  const isPremium = currentTier === 'premium';

  // Load API keys from localStorage
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Load API keys from localStorage on mount
  useEffect(() => {
    if (isPremium) {
      const stored = localStorage.getItem('voyagriq-api-keys');
      if (stored) {
        try {
          const keys = JSON.parse(stored);
          // Convert date strings back to Date objects
          const parsedKeys = keys.map((k: any) => ({
            ...k,
            created: new Date(k.created),
            lastUsed: k.lastUsed ? new Date(k.lastUsed) : null,
          }));
          setApiKeys(parsedKeys);
        } catch (e) {
          console.error('Error loading API keys:', e);
        }
      } else {
        // Create demo key for Premium users on first visit
        const demoKey: APIKey = {
          id: 'key_demo_premium',
          name: 'Demo API Key',
          key: 'tci_premium_demo_key_12345',
          created: new Date(),
          lastUsed: null,
          requests: 0,
        };
        setApiKeys([demoKey]);
        localStorage.setItem('voyagriq-api-keys', JSON.stringify([demoKey]));
      }
    }
    setIsLoaded(true);
  }, [isPremium]);

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && isPremium) {
      localStorage.setItem('voyagriq-api-keys', JSON.stringify(apiKeys));
    }
  }, [apiKeys, isLoaded, isPremium]);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    // Generate a fake API key
    const newKey: APIKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `tci_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      created: new Date(),
      lastUsed: null,
      requests: 0,
    };

    setApiKeys([...apiKeys, newKey]);
    setShowKey(newKey.key);
    setNewKeyName('');
    setShowCreateModal(false);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-8">
            <Link href="/account" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-block">
              ← Back to Account
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">API Keys</h1>
            <p className="text-gray-600">Manage your API keys for programmatic access</p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-pink-50 border-2 border-amber-300 rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔒</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h2>
                <p className="text-gray-700 mb-4">
                  API access is available exclusively on the <span className="font-bold text-amber-600">Premium Plan</span>.
                  Upgrade to automate your workflows and integrate with your existing systems.
                </p>
                <div className="flex gap-3">
                  <Link href="/pricing">
                    <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                      Upgrade to Premium
                    </button>
                  </Link>
                  <Link href="/api-docs">
                    <button className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
                      View API Documentation
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-block">
            ← Back to Account
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">API Keys</h1>
              <p className="text-gray-600">Manage your API keys for programmatic access</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
            >
              + Create New Key
            </button>
          </div>
        </div>

        {/* API Documentation Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div className="flex-1">
              <div className="font-semibold text-blue-900">Need help getting started?</div>
              <div className="text-sm text-blue-700">Check out our comprehensive API documentation</div>
            </div>
            <Link href="/api-docs">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm cursor-pointer">
                View Docs
              </button>
            </Link>
          </div>
        </div>

        {/* New Key Display Modal */}
        {showKey && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">✓</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">API Key Created!</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
                <div className="bg-white border-2 border-green-400 rounded-lg p-4 font-mono text-sm break-all relative">
                  {showKey}
                  <button
                    onClick={() => copyToClipboard(showKey, 'new-key')}
                    className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 cursor-pointer"
                  >
                    {copiedKeyId === 'new-key' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowKey(null)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm cursor-pointer"
            >
              Got it
            </button>
          </div>
        )}

        {/* API Keys List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your API Keys</h2>

          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔑</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No API Keys Yet</h3>
              <p className="text-gray-600 mb-6">Create your first API key to start using the API</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Create API Key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{key.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-sm text-gray-500 font-mono">
                          {key.key.substring(0, 20)}...
                        </div>
                        <button
                          onClick={() => copyToClipboard(key.key, key.id)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-semibold cursor-pointer"
                          title="Copy full API key"
                        >
                          {copiedKeyId === key.id ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Created</div>
                      <div className="font-medium text-gray-900">
                        {key.created.toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Last Used</div>
                      <div className="font-medium text-gray-900">
                        {key.lastUsed ? key.lastUsed.toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Requests</div>
                      <div className="font-medium text-gray-900">
                        {key.requests.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create API Key</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Server, Development, Mobile App"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose a descriptive name to help you identify this key later
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKeyName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Create Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
