'use client';

import { useEffect, useState } from 'react';

export default function DevEnvironmentBanner() {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Check if we're in development environment
    setIsDev(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  if (!isDev) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🔧</span>
          <div>
            <span className="font-bold text-lg">DEVELOPMENT ENVIRONMENT</span>
            <span className="ml-3 text-sm opacity-90">localhost:3000</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="/account"
            className="px-3 py-1 bg-white/90 hover:bg-white rounded-lg font-semibold transition-colors"
          >
            Enable Dev Mode
          </a>
          <a
            href="/login"
            className="px-3 py-1 bg-black/20 hover:bg-black/30 rounded-lg font-semibold transition-colors"
          >
            Quick Login
          </a>
        </div>
      </div>
    </div>
  );
}
