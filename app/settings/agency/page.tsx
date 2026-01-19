'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTier } from '@/contexts/TierContext';
import Link from 'next/link';

interface AgencySettings {
  default_commission_type: 'percentage' | 'flat_fee';
  default_commission_value: number;
  individual_commission_rate: number | null;
  corporate_commission_rate: number | null;
  group_commission_rate: number | null;
  default_markup_percentage: number;
  apply_markup_to_flights: boolean;
  apply_markup_to_hotels: boolean;
  apply_markup_to_activities: boolean;
  currency: string;
}

export default function AgencySettingsPage() {
  const { currentTier } = useTier();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState<AgencySettings>({
    default_commission_type: 'percentage',
    default_commission_value: 15,
    individual_commission_rate: null,
    corporate_commission_rate: null,
    group_commission_rate: null,
    default_markup_percentage: 0,
    apply_markup_to_flights: false,
    apply_markup_to_hotels: false,
    apply_markup_to_activities: false,
    currency: 'USD',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
      } else if (data) {
        setSettings({
          default_commission_type: data.default_commission_type,
          default_commission_value: parseFloat(data.default_commission_value),
          individual_commission_rate: data.individual_commission_rate ? parseFloat(data.individual_commission_rate) : null,
          corporate_commission_rate: data.corporate_commission_rate ? parseFloat(data.corporate_commission_rate) : null,
          group_commission_rate: data.group_commission_rate ? parseFloat(data.group_commission_rate) : null,
          default_markup_percentage: parseFloat(data.default_markup_percentage) || 0,
          apply_markup_to_flights: data.apply_markup_to_flights,
          apply_markup_to_hotels: data.apply_markup_to_hotels,
          apply_markup_to_activities: data.apply_markup_to_activities,
          currency: data.currency || 'USD',
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('agency_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        });

      if (error) {
        throw error;
      }

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/settings" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
            ← Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Agency Settings</h1>
          <p className="text-gray-600 mt-1">Configure default commission rates, markups, and pricing rules for your agency</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          {/* Default Commission Settings */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Default Commission Settings</h2>
            <p className="text-sm text-gray-600 mb-4">These defaults will be applied to new trips unless overridden</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Type
                </label>
                <select
                  value={settings.default_commission_type}
                  onChange={(e) => setSettings({ ...settings, default_commission_type: e.target.value as 'percentage' | 'flat_fee' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat_fee">Flat Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {settings.default_commission_type === 'percentage' ? 'Commission Rate (%)' : 'Flat Fee Amount ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.default_commission_value}
                  onChange={(e) => setSettings({ ...settings, default_commission_value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </section>

          {/* Commission by Client Type */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Commission Rates by Client Type</h2>
            <p className="text-sm text-gray-600 mb-4">Override default commission for specific client types (leave blank to use default)</p>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Individual Clients (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Use default"
                  value={settings.individual_commission_rate ?? ''}
                  onChange={(e) => setSettings({ ...settings, individual_commission_rate: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corporate Clients (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Use default"
                  value={settings.corporate_commission_rate ?? ''}
                  onChange={(e) => setSettings({ ...settings, corporate_commission_rate: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Clients (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Use default"
                  value={settings.group_commission_rate ?? ''}
                  onChange={(e) => setSettings({ ...settings, group_commission_rate: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </section>

          {/* Default Markup Settings */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Default Markup Settings</h2>
            <p className="text-sm text-gray-600 mb-4">Apply automatic markup to cost categories (can be overridden by vendor-specific rules)</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Markup Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.default_markup_percentage}
                onChange={(e) => setSettings({ ...settings, default_markup_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg max-w-xs"
              />
              <p className="text-xs text-gray-500 mt-1">Enter 0 for no default markup</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.apply_markup_to_flights}
                  onChange={(e) => setSettings({ ...settings, apply_markup_to_flights: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Apply default markup to flight costs</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.apply_markup_to_hotels}
                  onChange={(e) => setSettings({ ...settings, apply_markup_to_hotels: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Apply default markup to hotel costs</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.apply_markup_to_activities}
                  onChange={(e) => setSettings({ ...settings, apply_markup_to_activities: e.target.checked })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="ml-2 text-sm text-gray-700">Apply default markup to activities/tours</span>
              </label>
            </div>
          </section>

          {/* Currency */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Currency Settings</h2>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </section>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• <Link href="/settings/vendors" className="underline hover:text-blue-900">Manage vendor-specific pricing rules</Link></li>
            <li>• <Link href="/settings/clients" className="underline hover:text-blue-900">Set up client-specific overrides</Link></li>
            <li>• <Link href="/trips" className="underline hover:text-blue-900">Add trips with automatic pricing</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
