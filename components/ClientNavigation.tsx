"use client";

import dynamic from 'next/dynamic';

// Dynamically import Navigation with no SSR to prevent hydration issues
const NavigationComponent = dynamic(() => import('./Navigation'), {
  ssr: false,
  loading: () => (
    <nav className="bg-white border-b border-gray-200 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              VoyagrIQ
            </span>
          </div>
        </div>
      </div>
    </nav>
  ),
});

export default function ClientNavigation() {
  return <NavigationComponent />;
}
