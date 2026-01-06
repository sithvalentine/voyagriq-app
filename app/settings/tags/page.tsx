'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTier } from '@/contexts/TierContext';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
  tripCount: number;
}

const STORAGE_KEY = 'voyagriq-tags';

const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
];

export default function TagsManagement() {
  const { currentTier, isSignedIn } = useTier();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: PRESET_COLORS[0].value,
    description: '',
  });

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    if (currentTier !== 'premium') {
      router.push('/subscription');
      return;
    }

    // Load tags from localStorage
    loadTags();
  }, [isSignedIn, currentTier, router]);

  const loadTags = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTags(parsed);
      } catch (e) {
        console.error('Error loading tags:', e);
      }
    }
  };

  const saveTags = (updatedTags: Tag[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTags));
    setTags(updatedTags);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Tag name is required');
      return;
    }

    if (editingTag) {
      // Update existing tag
      const updatedTags = tags.map(tag =>
        tag.id === editingTag.id
          ? { ...tag, ...formData }
          : tag
      );
      saveTags(updatedTags);
      setEditingTag(null);
    } else {
      // Create new tag
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        name: formData.name,
        color: formData.color,
        description: formData.description,
        tripCount: 0,
      };
      saveTags([...tags, newTag]);
    }

    // Reset form
    setFormData({
      name: '',
      color: PRESET_COLORS[0].value,
      description: '',
    });
    setIsAddingTag(false);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description,
    });
    setIsAddingTag(true);
  };

  const handleDelete = (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag? It will be removed from all trips.')) {
      const updatedTags = tags.filter(tag => tag.id !== tagId);
      saveTags(updatedTags);
    }
  };

  const handleCancel = () => {
    setIsAddingTag(false);
    setEditingTag(null);
    setFormData({
      name: '',
      color: PRESET_COLORS[0].value,
      description: '',
    });
  };

  if (currentTier !== 'premium') {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tag Management</h1>
            <p className="text-gray-600">
              Create and organize custom tags for your trips (Premium feature)
            </p>
          </div>
          {!isAddingTag && (
            <button
              onClick={() => setIsAddingTag(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg cursor-pointer"
            >
              + Create Tag
            </button>
          )}
        </div>
        <Link href="/settings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          ← Back to Settings
        </Link>
      </div>

      {/* Add/Edit Tag Form */}
      {isAddingTag && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tag Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., VIP Client, Honeymoon, Corporate, Budget"
                autoFocus
              />
            </div>

            {/* Tag Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag Color *
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: preset.value })}
                    className={`h-12 rounded-lg border-4 transition-all cursor-pointer ${
                      formData.color === preset.value
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Brief description of when to use this tag..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Tags ({tags.length})</h2>

        {tags.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tags Yet</h3>
            <p className="text-gray-600 mb-6">
              Create tags to organize your trips by client type, trip category, or any custom criteria.
            </p>
            <button
              onClick={() => setIsAddingTag(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Create Your First Tag
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                    {tag.description && (
                      <p className="text-sm text-gray-600 mt-1">{tag.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Used in {tag.tripCount} {tag.tripCount === 1 ? 'trip' : 'trips'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-3">💡 Tag Usage Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Client Segmentation:</strong> Tag trips by client importance (VIP, Regular, New Client)</li>
          <li>• <strong>Trip Categories:</strong> Organize by purpose (Honeymoon, Corporate Event, Family Vacation)</li>
          <li>• <strong>Budget Tiers:</strong> Track by budget level (Luxury, Mid-Range, Budget)</li>
          <li>• <strong>Custom Filters:</strong> Use tags to quickly filter trips in the Trips page</li>
          <li>• <strong>Reporting:</strong> Generate reports filtered by specific tags</li>
        </ul>
      </div>
    </div>
  );
}
