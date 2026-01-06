'use client';

import Link from 'next/link';
import { useTier } from '@/contexts/TierContext';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface APIKey {
  id: string;
  name: string;
  key?: string; // Only present when first created
  key_prefix: string;
  created_at: Date;
  last_used_at: Date | null;
  requests_count: number;
  rate_limit: number;
  is_active: boolean;
}

export default function APIKeysPage() {
  const { currentTier } = useTier();
  const isPremium = currentTier === 'premium';

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Load API keys from backend
  useEffect(() => {
    if (isPremium) {
      loadAPIKeys();
    } else {
      setIsLoading(false);
    }
  }, [isPremium]);

  const loadAPIKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load API keys');
      }

      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (err: any) {
      console.error('Error loading API keys:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      setIsCreating(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create API key');
      }

      const data = await response.json();
      setShowNewKey(data.apiKey.key);
      setNewKeyName('');
      setShowCreateModal(false);

      // Reload API keys list
      await loadAPIKeys();
    } catch (err: any) {
      console.error('Error creating API key:', err);
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone and will immediately revoke access.')) {
      return;
    }

    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/api-keys', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      // Reload API keys list
      await loadAPIKeys();
    } catch (err: any) {
      console.error('Error deleting API key:', err);
      setError(err.message);
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <div className="font-semibold text-red-900">Error</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* New Key Display */}
        {showNewKey && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">✓</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">API Key Created!</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
                <div className="bg-white border-2 border-green-400 rounded-lg p-4 font-mono text-sm break-all relative">
                  {showNewKey}
                  <button
                    onClick={() => copyToClipboard(showNewKey, 'new-key')}
                    className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 cursor-pointer"
                  >
                    {copiedKeyId === 'new-key' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowNewKey(null)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm cursor-pointer"
            >
              Got it
            </button>
          </div>
        )}

        {/* API Keys List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your API Keys</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
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
                          {key.key_prefix}...
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-semibold cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Created</div>
                      <div className="font-medium text-gray-900">
                        {new Date(key.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Last Used</div>
                      <div className="font-medium text-gray-900">
                        {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Requests</div>
                      <div className="font-medium text-gray-900">
                        {key.requests_count.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Rate Limit</div>
                      <div className="font-medium text-gray-900">
                        {key.rate_limit}/hour
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
                  disabled={isCreating}
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
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || isCreating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCreating ? 'Creating...' : 'Create Key'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
