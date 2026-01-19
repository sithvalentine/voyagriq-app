'use client';

import { useRouter } from 'next/navigation';
import { useTier } from '@/contexts/TierContext';
import Link from 'next/link';

export default function SettingsPage() {
  const { currentTier, isSignedIn } = useTier();
  const router = useRouter();

  if (!isSignedIn) {
    router.push('/login');
    return null;
  }

  const settingsOptions = [
    {
      title: 'Agency Settings',
      description: 'Configure default commission rates, markups, and pricing rules',
      href: '/settings/agency',
      icon: '🏢',
      tier: 'starter', // Available for all tiers
    },
    {
      title: 'Currency',
      description: 'Select your preferred currency for displaying costs',
      href: '/settings/currency',
      icon: '💱',
      tier: 'starter', // Available for all tiers
    },
    {
      title: 'Vendor Pricing',
      description: 'Manage vendor-specific markups, discounts, and negotiated rates',
      href: '/settings/vendors',
      icon: '🏪',
      tier: 'standard', // Available for Standard and Premium
    },
    {
      title: 'Client Pricing',
      description: 'Configure client-specific pricing for VIP clients and special agreements',
      href: '/settings/clients',
      icon: '👥',
      tier: 'premium', // Available for Premium and Enterprise
    },
    {
      title: 'Team Management',
      description: 'Invite team members and manage permissions',
      href: '/settings/team',
      icon: '🤝',
      tier: 'standard', // Available for Standard and Premium
    },
    {
      title: 'White-Label Branding',
      description: 'Customize PDF reports with your logo and colors',
      href: '/settings/white-label',
      icon: '🎨',
      tier: 'premium',
    },
    {
      title: 'Tag Management',
      description: 'Create and organize custom tags for your trips',
      href: '/settings/tags',
      icon: '🏷️',
      tier: 'premium',
    },
    {
      title: 'API Keys',
      description: 'Manage API keys for automation and integrations',
      href: '/settings/api-keys',
      icon: '🔑',
      tier: 'premium',
    },
  ];

  const availableSettings = settingsOptions.filter(setting => {
    if (setting.tier === 'starter') {
      return true; // Available for all tiers
    }
    if (setting.tier === 'standard') {
      return currentTier === 'standard' || currentTier === 'premium' || currentTier === 'enterprise';
    }
    if (setting.tier === 'premium') {
      return currentTier === 'premium' || currentTier === 'enterprise';
    }
    return false;
  });

  const lockedSettings = settingsOptions.filter(setting => {
    if (setting.tier === 'standard') {
      return currentTier === 'starter';
    }
    if (setting.tier === 'premium') {
      return currentTier !== 'premium';
    }
    return false;
  });

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and Premium features
        </p>
      </div>

      {/* Available Settings */}
      {availableSettings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSettings.map((setting) => (
              <Link key={setting.href} href={setting.href}>
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{setting.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {setting.title}
                      </h3>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Locked Settings (Non-Premium Users) */}
      {lockedSettings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedSettings.map((setting) => (
              <div
                key={setting.href}
                className="bg-gray-100 rounded-lg shadow-lg p-6 relative opacity-75"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl grayscale">{setting.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {setting.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">
                        PREMIUM
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                    <Link href="/pricing">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                        Upgrade to unlock →
                      </button>
                    </Link>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/account" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Account
        </Link>
      </div>
    </div>
  );
}
