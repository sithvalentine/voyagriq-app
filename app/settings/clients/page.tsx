'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTier } from '@/contexts/TierContext';
import Link from 'next/link';

interface ClientOverride {
  id: string;
  client_name: string;
  client_id: string | null;
  client_type: 'individual' | 'corporate' | 'group' | null;
  override_type: 'commission_rate' | 'markup' | 'discount' | 'flat_fee';
  override_value: number;
  description: string | null;
  is_active: boolean;
  effective_from: string | null;
  effective_until: string | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  client_name: string;
  client_id: string;
  client_type: ClientOverride['client_type'];
  override_type: ClientOverride['override_type'];
  override_value: number;
  description: string;
  is_active: boolean;
  effective_from: string;
  effective_until: string;
}

const CLIENT_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'group', label: 'Group' },
] as const;

const OVERRIDE_TYPES = [
  { value: 'commission_rate', label: 'Commission Rate (%)', description: 'Override default commission' },
  { value: 'markup', label: 'Markup (%)', description: 'Add percentage markup' },
  { value: 'discount', label: 'Discount (%)', description: 'Apply percentage discount' },
  { value: 'flat_fee', label: 'Flat Fee ($)', description: 'Add fixed dollar amount' },
] as const;

export default function ClientPricingPage() {
  const { currentTier, isSignedIn } = useTier();
  const router = useRouter();
  const [overrides, setOverrides] = useState<ClientOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOverride, setEditingOverride] = useState<ClientOverride | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<FormData>({
    client_name: '',
    client_id: '',
    client_type: 'individual',
    override_type: 'discount',
    override_value: 0,
    description: '',
    is_active: true,
    effective_from: '',
    effective_until: '',
  });

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }
    loadOverrides();
  }, [isSignedIn, router]);

  const loadOverrides = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('client_pricing_overrides')
        .select('*')
        .order('client_name', { ascending: true });

      if (error) throw error;
      setOverrides(data || []);
    } catch (error) {
      console.error('Error loading client overrides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const overrideData = {
        user_id: user.id,
        client_name: formData.client_name.trim(),
        client_id: formData.client_id || null,
        client_type: formData.client_type,
        override_type: formData.override_type,
        override_value: formData.override_value,
        description: formData.description || null,
        is_active: formData.is_active,
        effective_from: formData.effective_from || null,
        effective_until: formData.effective_until || null,
      };

      if (editingOverride) {
        // Update existing override
        const { error } = await supabase
          .from('client_pricing_overrides')
          .update(overrideData)
          .eq('id', editingOverride.id);

        if (error) throw error;
      } else {
        // Insert new override
        const { error } = await supabase
          .from('client_pricing_overrides')
          .insert([overrideData]);

        if (error) throw error;
      }

      // Reset form and reload
      setShowForm(false);
      setEditingOverride(null);
      resetForm();
      await loadOverrides();
    } catch (error: any) {
      console.error('Error saving client override:', error);
      alert(error.message || 'Failed to save client override');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (override: ClientOverride) => {
    setEditingOverride(override);
    setFormData({
      client_name: override.client_name,
      client_id: override.client_id || '',
      client_type: override.client_type || 'individual',
      override_type: override.override_type,
      override_value: override.override_value,
      description: override.description || '',
      is_active: override.is_active,
      effective_from: override.effective_from || '',
      effective_until: override.effective_until || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client override?')) return;

    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('client_pricing_overrides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadOverrides();
    } catch (error) {
      console.error('Error deleting client override:', error);
      alert('Failed to delete client override');
    }
  };

  const toggleActive = async (override: ClientOverride) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('client_pricing_overrides')
        .update({ is_active: !override.is_active })
        .eq('id', override.id);

      if (error) throw error;
      await loadOverrides();
    } catch (error) {
      console.error('Error toggling client override:', error);
      alert('Failed to update client override');
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_id: '',
      client_type: 'individual',
      override_type: 'discount',
      override_value: 0,
      description: '',
      is_active: true,
      effective_from: '',
      effective_until: '',
    });
  };

  const filteredOverrides = overrides.filter(override => {
    if (filterType !== 'all' && override.client_type !== filterType) return false;
    if (filterActive === 'active' && !override.is_active) return false;
    if (filterActive === 'inactive' && override.is_active) return false;
    if (searchQuery && !override.client_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getOverrideTypeLabel = (overrideType: string) => {
    const type = OVERRIDE_TYPES.find(t => t.value === overrideType);
    return type?.label || overrideType;
  };

  const formatOverrideValue = (override: ClientOverride) => {
    if (override.override_type === 'flat_fee') {
      return `$${override.override_value.toFixed(2)}`;
    }
    return `${override.override_value}%`;
  };

  if (!isSignedIn) return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center">Loading client pricing overrides...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Client Pricing Overrides</h1>
        <p className="text-gray-600">
          Configure client-specific pricing for VIP clients, corporate accounts, and special agreements
        </p>
      </div>

      {/* Tier Limitation Notice */}
      {(currentTier === 'starter' || currentTier === 'standard') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Premium Feature</h3>
              <p className="text-sm text-gray-700 mb-2">
                Client pricing overrides are available on Premium and Enterprise plans.
              </p>
              <Link href="/pricing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Upgrade to Premium to unlock client management →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg w-64"
          />

          {/* Client Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Client Types</option>
            {CLIENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingOverride(null);
            resetForm();
            setShowForm(true);
          }}
          disabled={currentTier === 'starter' || currentTier === 'standard'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          + Add Client Override
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingOverride ? 'Edit Client Override' : 'Add Client Override'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="e.g., John Smith, Acme Corporation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  placeholder="Internal client reference ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Client Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Type
                </label>
                <select
                  value={formData.client_type || 'individual'}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {CLIENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Override Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Override Type *
                </label>
                <select
                  required
                  value={formData.override_type}
                  onChange={(e) => setFormData({ ...formData, override_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {OVERRIDE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Override Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.override_type === 'flat_fee' ? 'Amount ($)' : 'Percentage (%)'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.override_value}
                  onChange={(e) => setFormData({ ...formData, override_value: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.override_type === 'flat_fee' ? '50.00' : '5.0'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="e.g., VIP client - 5% discount on all trips, Corporate rate agreement"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Effective Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective From
                  </label>
                  <input
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Until
                  </label>
                  <input
                    type="date"
                    value={formData.effective_until}
                    onChange={(e) => setFormData({ ...formData, effective_until: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active (override will be applied to trips)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? 'Saving...' : (editingOverride ? 'Update Override' : 'Add Override')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOverride(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overrides List */}
      <div className="bg-white rounded-lg shadow">
        {filteredOverrides.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg font-medium mb-2">No client overrides found</p>
            <p className="text-sm">
              {(currentTier === 'starter' || currentTier === 'standard')
                ? 'Upgrade to Premium to add client-specific pricing'
                : searchQuery
                ? 'No clients match your search'
                : 'Add your first client override to start managing client-specific pricing'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Override Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOverrides.map((override) => (
                  <tr key={override.id} className={!override.is_active ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{override.client_name}</div>
                      {override.description && (
                        <div className="text-xs text-gray-500 mt-1">{override.description}</div>
                      )}
                      {override.client_id && (
                        <div className="text-xs text-gray-400 mt-1">ID: {override.client_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {override.client_type && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          {CLIENT_TYPES.find(t => t.value === override.client_type)?.label || override.client_type}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getOverrideTypeLabel(override.override_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${
                        override.override_type === 'discount'
                          ? 'text-green-600'
                          : override.override_type === 'commission_rate'
                          ? 'text-blue-600'
                          : 'text-orange-600'
                      }`}>
                        {override.override_type === 'discount' ? '-' : override.override_type === 'commission_rate' ? '' : '+'}
                        {formatOverrideValue(override)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(override)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          override.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {override.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(override)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(override.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/settings" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}
