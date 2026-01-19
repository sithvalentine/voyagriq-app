'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTier } from '@/contexts/TierContext';
import Link from 'next/link';

interface VendorRule {
  id: string;
  vendor_name: string;
  vendor_category: 'flight' | 'hotel' | 'ground_transport' | 'activities' | 'cruise' | 'insurance' | 'other';
  rule_type: 'markup' | 'discount' | 'flat_fee' | 'negotiated_rate';
  rule_value: number;
  negotiated_description: string | null;
  minimum_booking_amount: number | null;
  is_active: boolean;
  effective_from: string | null;
  effective_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  vendor_name: string;
  vendor_category: VendorRule['vendor_category'];
  rule_type: VendorRule['rule_type'];
  rule_value: number;
  negotiated_description: string;
  minimum_booking_amount: number | null;
  is_active: boolean;
  effective_from: string;
  effective_until: string;
  notes: string;
}

const VENDOR_CATEGORIES = [
  { value: 'flight', label: 'Flight' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'ground_transport', label: 'Ground Transport' },
  { value: 'activities', label: 'Activities' },
  { value: 'cruise', label: 'Cruise' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
] as const;

const RULE_TYPES = [
  { value: 'markup', label: 'Markup (%)', description: 'Add percentage to cost' },
  { value: 'discount', label: 'Discount (%)', description: 'Subtract percentage from cost' },
  { value: 'flat_fee', label: 'Flat Fee ($)', description: 'Add fixed dollar amount' },
  { value: 'negotiated_rate', label: 'Negotiated Rate (%)', description: 'Pre-negotiated discount' },
] as const;

export default function VendorPricingPage() {
  const { currentTier, isSignedIn } = useTier();
  const router = useRouter();
  const [rules, setRules] = useState<VendorRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<VendorRule | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  const [formData, setFormData] = useState<FormData>({
    vendor_name: '',
    vendor_category: 'hotel',
    rule_type: 'discount',
    rule_value: 0,
    negotiated_description: '',
    minimum_booking_amount: null,
    is_active: true,
    effective_from: '',
    effective_until: '',
    notes: '',
  });

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }
    loadRules();
  }, [isSignedIn, router]);

  const loadRules = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('vendor_pricing_rules')
        .select('*')
        .order('vendor_name', { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading vendor rules:', error);
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

      const ruleData = {
        user_id: user.id,
        vendor_name: formData.vendor_name.trim(),
        vendor_category: formData.vendor_category,
        rule_type: formData.rule_type,
        rule_value: formData.rule_value,
        negotiated_description: formData.negotiated_description || null,
        minimum_booking_amount: formData.minimum_booking_amount || null,
        is_active: formData.is_active,
        effective_from: formData.effective_from || null,
        effective_until: formData.effective_until || null,
        notes: formData.notes || null,
      };

      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('vendor_pricing_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;
      } else {
        // Insert new rule
        const { error } = await supabase
          .from('vendor_pricing_rules')
          .insert([ruleData]);

        if (error) throw error;
      }

      // Reset form and reload
      setShowForm(false);
      setEditingRule(null);
      resetForm();
      await loadRules();
    } catch (error: any) {
      console.error('Error saving vendor rule:', error);
      alert(error.message || 'Failed to save vendor rule');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rule: VendorRule) => {
    setEditingRule(rule);
    setFormData({
      vendor_name: rule.vendor_name,
      vendor_category: rule.vendor_category,
      rule_type: rule.rule_type,
      rule_value: rule.rule_value,
      negotiated_description: rule.negotiated_description || '',
      minimum_booking_amount: rule.minimum_booking_amount,
      is_active: rule.is_active,
      effective_from: rule.effective_from || '',
      effective_until: rule.effective_until || '',
      notes: rule.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor rule?')) return;

    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('vendor_pricing_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadRules();
    } catch (error) {
      console.error('Error deleting vendor rule:', error);
      alert('Failed to delete vendor rule');
    }
  };

  const toggleActive = async (rule: VendorRule) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('vendor_pricing_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;
      await loadRules();
    } catch (error) {
      console.error('Error toggling vendor rule:', error);
      alert('Failed to update vendor rule');
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_name: '',
      vendor_category: 'hotel',
      rule_type: 'discount',
      rule_value: 0,
      negotiated_description: '',
      minimum_booking_amount: null,
      is_active: true,
      effective_from: '',
      effective_until: '',
      notes: '',
    });
  };

  const filteredRules = rules.filter(rule => {
    if (filterCategory !== 'all' && rule.vendor_category !== filterCategory) return false;
    if (filterActive === 'active' && !rule.is_active) return false;
    if (filterActive === 'inactive' && rule.is_active) return false;
    return true;
  });

  const getRuleTypeLabel = (ruleType: string) => {
    const type = RULE_TYPES.find(t => t.value === ruleType);
    return type?.label || ruleType;
  };

  const formatRuleValue = (rule: VendorRule) => {
    if (rule.rule_type === 'flat_fee') {
      return `$${rule.rule_value.toFixed(2)}`;
    }
    return `${rule.rule_value}%`;
  };

  if (!isSignedIn) return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center">Loading vendor pricing rules...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vendor Pricing Rules</h1>
        <p className="text-gray-600">
          Configure vendor-specific markups, discounts, and negotiated rates
        </p>
      </div>

      {/* Tier Limitation Notice */}
      {currentTier === 'starter' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Upgrade Required</h3>
              <p className="text-sm text-gray-700 mb-2">
                Vendor pricing rules are available on Standard and Premium plans.
              </p>
              <Link href="/pricing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Upgrade to unlock vendor management →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Add New Button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-4">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Categories</option>
            {VENDOR_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
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
            setEditingRule(null);
            resetForm();
            setShowForm(true);
          }}
          disabled={currentTier === 'starter'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          + Add Vendor Rule
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingRule ? 'Edit Vendor Rule' : 'Add Vendor Rule'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  placeholder="e.g., Marriott Hotels, Delta Airlines"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Vendor Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Category *
                </label>
                <select
                  required
                  value={formData.vendor_category}
                  onChange={(e) => setFormData({ ...formData, vendor_category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {VENDOR_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Rule Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Type *
                </label>
                <select
                  required
                  value={formData.rule_type}
                  onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {RULE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rule Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.rule_type === 'flat_fee' ? 'Amount ($)' : 'Percentage (%)'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rule_value}
                  onChange={(e) => setFormData({ ...formData, rule_value: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.rule_type === 'flat_fee' ? '50.00' : '10.0'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Minimum Booking Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Booking Amount (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimum_booking_amount || ''}
                  onChange={(e) => setFormData({ ...formData, minimum_booking_amount: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="1000.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rule only applies if booking amount meets or exceeds this threshold
                </p>
              </div>

              {/* Negotiated Description */}
              {formData.rule_type === 'negotiated_rate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Negotiated Rate Description
                  </label>
                  <input
                    type="text"
                    value={formData.negotiated_description}
                    onChange={(e) => setFormData({ ...formData, negotiated_description: e.target.value })}
                    placeholder="e.g., Q1 2026 negotiated rate - 10% off all bookings"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

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

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about this pricing rule..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
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
                  Active (rule will be applied to trips)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? 'Saving...' : (editingRule ? 'Update Rule' : 'Add Rule')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
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

      {/* Rules List */}
      <div className="bg-white rounded-lg shadow">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg font-medium mb-2">No vendor rules found</p>
            <p className="text-sm">
              {currentTier === 'starter'
                ? 'Upgrade to Standard or Premium to add vendor pricing rules'
                : 'Add your first vendor rule to start managing vendor-specific pricing'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min. Amount
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
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className={!rule.is_active ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{rule.vendor_name}</div>
                      {rule.negotiated_description && (
                        <div className="text-xs text-gray-500">{rule.negotiated_description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {VENDOR_CATEGORIES.find(c => c.value === rule.vendor_category)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getRuleTypeLabel(rule.rule_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${
                        rule.rule_type === 'discount' || rule.rule_type === 'negotiated_rate'
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}>
                        {rule.rule_type === 'discount' || rule.rule_type === 'negotiated_rate' ? '-' : '+'}
                        {formatRuleValue(rule)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rule.minimum_booking_amount ? `$${rule.minimum_booking_amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(rule)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          rule.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
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
