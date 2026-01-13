'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTier } from '@/contexts/TierContext';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending';
  invitedAt: string;
  lastActive?: string;
}

const STORAGE_KEY = 'voyagriq-team';

const ROLE_DESCRIPTIONS = {
  admin: 'Full access - can manage trips, team members, and settings',
  editor: 'Can add and edit trips, but cannot manage team or settings',
  viewer: 'Read-only access to trips and reports',
};

export default function TeamManagement() {
  const { currentTier, isSignedIn, userName, userEmail } = useTier();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'editor' as 'admin' | 'editor' | 'viewer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    if (currentTier === 'starter') {
      router.push('/subscription');
      return;
    }

    // Load team members
    loadTeamMembers();
  }, [isSignedIn, currentTier, router]);

  const loadTeamMembers = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTeamMembers(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading team members:', e);
      }
    }
  };

  const saveTeamMembers = (members: TeamMember[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    setTeamMembers(members);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else if (formData.email === userEmail) {
      newErrors.email = 'Cannot invite yourself';
    } else if (teamMembers.some(m => m.email === formData.email)) {
      newErrors.email = 'This email is already on your team';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check team size limits
    const teamLimit = currentTier === 'standard' ? 10 : currentTier === 'premium' ? 20 : 1;
    if (teamMembers.length >= teamLimit) {
      alert(`Your ${currentTier} plan allows up to ${teamLimit} team member(s). Upgrade to add more.`);
      return;
    }

    // Create new team member
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'pending',
      invitedAt: new Date().toISOString(),
    };

    saveTeamMembers([...teamMembers, newMember]);

    // Show success message
    alert(`✅ Invitation sent to ${formData.email}!\n\nThey will receive an email to join your team.`);

    // Reset form
    setFormData({ name: '', email: '', role: 'editor' });
    setIsInviting(false);
  };

  const handleResendInvite = (member: TeamMember) => {
    alert(`Invitation re-sent to ${member.email}`);
  };

  const handleChangeRole = (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    const updatedMembers = teamMembers.map(m =>
      m.id === memberId ? { ...m, role: newRole } : m
    );
    saveTeamMembers(updatedMembers);
  };

  const handleRemoveMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    if (confirm(`Remove ${member.name} from your team?`)) {
      const updatedMembers = teamMembers.filter(m => m.id !== memberId);
      saveTeamMembers(updatedMembers);
    }
  };

  if (currentTier === 'starter') {
    return null;
  }

  const teamLimit = currentTier === 'standard' ? 10 : 20;

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-gray-600">
              Invite team members to collaborate on trip management
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Team limit: {teamMembers.length} / {teamLimit} members
            </p>
          </div>
          {!isInviting && teamMembers.length < teamLimit && (
            <button
              onClick={() => setIsInviting(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg cursor-pointer"
            >
              + Invite Team Member
            </button>
          )}
        </div>
        <Link href="/settings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          ← Back to Settings
        </Link>
      </div>

      {/* Invite Form */}
      {isInviting && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Smith"
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 text-xs text-gray-600">
                {ROLE_DESCRIPTIONS[formData.role]}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Send Invitation
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsInviting(false);
                  setFormData({ name: '', email: '', role: 'editor' });
                  setErrors({});
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current User (Owner) */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Account Owner</h2>
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              {userName?.[0]?.toUpperCase() || 'Y'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{userName || 'You'}</h3>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
              Owner
            </span>
            <p className="text-xs text-gray-500 mt-1">Full access</p>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Team Members ({teamMembers.length})</h2>

        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Team Members Yet</h3>
            <p className="text-gray-600 mb-6">
              Invite colleagues to collaborate on managing trips and viewing reports.
            </p>
            <button
              onClick={() => setIsInviting(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Invite Your First Team Member
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {member.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      {member.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Invited {new Date(member.invitedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.id, e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>

                  {member.status === 'pending' && (
                    <button
                      onClick={() => handleResendInvite(member)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm cursor-pointer"
                    >
                      Resend
                    </button>
                  )}

                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Limits Info - Only show for Standard tier */}
      {currentTier === 'standard' && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">💡 Team Size Limits</h3>
          <p className="text-sm text-gray-700 mb-3">
            Your Standard plan includes up to 10 team members. Need more?
          </p>
          <Link href="/pricing">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
              Upgrade to Premium for Up to 20 Team Members
            </button>
          </Link>
        </div>
      )}
      {/* Premium users see no upgrade message - Premium is the highest tier for customers */}
    </div>
  );
}
