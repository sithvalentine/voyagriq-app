"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription';
import { useTier } from '@/contexts/TierContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency, CURRENCY_SYMBOLS } from '@/lib/currency';

interface DropdownItem {
  href: string;
  label: string;
  badge?: string;
}

interface NavItem {
  label: string;
  href?: string;
  badge?: string;
  dropdown?: DropdownItem[];
}

export default function Navigation() {
  const pathname = usePathname();
  const { currentTier, isTrialActive, daysLeftInTrial, isTrialExpired, isSignedIn, devMode } = useTier();
  const { signOut } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const tierInfo = currentTier ? SUBSCRIPTION_TIERS[currentTier] : null;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  const hasAdvancedFeatures = currentTier === 'standard' || currentTier === 'premium';
  const isPremium = currentTier === 'premium';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMobileDropdown(null);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await signOut();
  };

  const toggleMobileDropdown = (label: string) => {
    setOpenMobileDropdown(openMobileDropdown === label ? null : label);
  };

  // Build navigation structure with dropdowns
  const navItems: NavItem[] = isSignedIn ? [
    {
      label: 'Trips',
      dropdown: [
        { href: '/trips', label: 'All Trips' },
        { href: '/vendors', label: 'Vendors & Suppliers' },
        ...(isPremium ? [{ href: '/settings/white-label', label: 'White-Label Branding', badge: 'Premium' }] : []),
      ]
    },
    ...(hasAdvancedFeatures ? [{
      label: 'Analytics',
      dropdown: [
        { href: '/analytics', label: 'Dashboard', badge: isPremium ? 'Premium' : 'Standard' },
        { href: '/reports', label: 'Scheduled Reports', badge: isPremium ? 'Premium' : 'Standard' },
        { href: '/export-options', label: 'Export Options' },
        ...(isPremium ? [
          { href: '/settings/api-keys', label: 'API Keys', badge: 'Premium' },
          { href: '/api-docs', label: 'API Documentation', badge: 'Premium' },
        ] : []),
        ...(devMode ? [{ href: '/test-analytics', label: 'Test Analytics', badge: 'Dev' }] : []),
      ]
    }] : []),
    {
      label: 'Account',
      dropdown: [
        { href: '/account', label: 'Settings' },
        { href: '/subscription', label: 'Subscription' },
      ]
    },
    { href: '/about', label: 'About' },
  ] : [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">
                VoyagrIQ
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item, idx) => {
                if (item.dropdown) {
                  // Dropdown menu item (desktop)
                  return (
                    <div
                      key={idx}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        className={`inline-flex items-center gap-1 px-1 pt-1 border-b-2 text-sm font-medium transition-colors h-16 ${
                          item.dropdown.some(d => pathname === d.href)
                            ? 'border-primary-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                        aria-label={`${item.label} menu`}
                      >
                        {item.label}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Desktop Dropdown menu */}
                      {openDropdown === item.label && (
                        <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.href}
                              href={dropdownItem.href}
                              className={`flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                pathname === dropdownItem.href
                                  ? 'bg-blue-50 text-blue-700 font-semibold'
                                  : 'text-gray-700'
                              }`}
                            >
                              <span>{dropdownItem.label}</span>
                              {dropdownItem.badge && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  dropdownItem.badge === 'Premium'
                                    ? 'bg-gradient-to-r from-amber-100 to-pink-100 text-amber-800'
                                    : dropdownItem.badge === 'Standard'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {dropdownItem.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // Regular link (desktop)
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={`inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {item.label}
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.badge === 'Premium'
                            ? 'bg-gradient-to-r from-amber-100 to-pink-100 text-amber-800'
                            : item.badge === 'Standard'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }
              })}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {/* Currency Dropdown - Hidden on small mobile */}
            {isSignedIn && (
              <div
                className="hidden sm:block relative"
                onMouseEnter={() => setShowCurrencyDropdown(true)}
                onMouseLeave={() => setShowCurrencyDropdown(false)}
              >
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
                  aria-label="Change currency"
                >
                  <span>{CURRENCY_SYMBOLS[currency]} {currency}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Currency Dropdown menu */}
                {showCurrencyDropdown && (
                  <div className="absolute top-full right-0 pt-1 z-50">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-40">
                      {(['USD', 'EUR', 'GBP'] as Currency[]).map((curr) => (
                        <button
                          key={curr}
                          onClick={() => {
                            setCurrency(curr);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            currency === curr
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-gray-700'
                          }`}
                          aria-label={`Switch to ${curr}`}
                        >
                          <span>{CURRENCY_SYMBOLS[curr]} {curr}</span>
                          {currency === curr && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trial/Tier Badges - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Trial Countdown Badge */}
              {isSignedIn && isTrialActive && (
                <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  daysLeftInTrial <= 2 ? 'bg-red-100 text-red-700 animate-pulse' :
                  daysLeftInTrial <= 4 ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  Trial: {daysLeftInTrial} {daysLeftInTrial === 1 ? 'day' : 'days'} left
                </div>
              )}
              {/* Trial Expired Badge */}
              {isSignedIn && isTrialExpired && (
                <Link href="/pricing">
                  <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer animate-pulse">
                    Trial Expired - Subscribe Now
                  </div>
                </Link>
              )}
              {/* Tier Badge */}
              {isSignedIn && tierInfo && (
                <Link href="/subscription">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity ${
                    currentTier === 'starter' ? 'bg-blue-100 text-blue-700' :
                    currentTier === 'standard' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {tierInfo.name}
                  </div>
                </Link>
              )}
            </div>

            {/* Desktop Buttons - Hidden on mobile */}
            {isSignedIn ? (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
                  aria-label="Logout"
                >
                  Logout
                </button>
                <Link
                  href="/data"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  aria-label="Add new trip"
                >
                  + Add Trip
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Mobile Navigation Items */}
            {navItems.map((item, idx) => {
              if (item.dropdown) {
                // Mobile Dropdown
                return (
                  <div key={idx}>
                    <button
                      onClick={() => toggleMobileDropdown(item.label)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      aria-expanded={openMobileDropdown === item.label}
                      aria-label={`${item.label} menu`}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${openMobileDropdown === item.label ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openMobileDropdown === item.label && (
                      <div className="pl-4 space-y-1 mt-1">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                              pathname === dropdownItem.href
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <span>{dropdownItem.label}</span>
                            {dropdownItem.badge && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                dropdownItem.badge === 'Premium'
                                  ? 'bg-gradient-to-r from-amber-100 to-pink-100 text-amber-800'
                                  : dropdownItem.badge === 'Standard'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {dropdownItem.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Mobile Regular Link
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
            })}

            {/* Mobile Currency Selector */}
            {isSignedIn && (
              <div className="sm:hidden pt-2 border-t border-gray-200 mt-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Currency
                </div>
                <div className="space-y-1">
                  {(['USD', 'EUR', 'GBP'] as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrency(curr);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        currency === curr
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      aria-label={`Switch to ${curr}`}
                    >
                      <span>{CURRENCY_SYMBOLS[curr]} {curr}</span>
                      {currency === curr && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Action Buttons */}
            {isSignedIn ? (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/data"
                  className="block w-full px-3 py-2 bg-blue-600 text-white text-center rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors"
                >
                  + Add Trip
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 text-red-600 hover:bg-red-50 text-center rounded-lg text-base font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/pricing"
                  className="block w-full px-3 py-2 bg-blue-600 text-white text-center rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="block w-full px-3 py-2 text-gray-700 hover:bg-gray-50 text-center rounded-lg text-base font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Trial/Tier Info */}
            {isSignedIn && (
              <div className="sm:hidden pt-3 border-t border-gray-200 space-y-2">
                {isTrialActive && (
                  <div className={`px-3 py-2 rounded-lg text-sm font-semibold text-center ${
                    daysLeftInTrial <= 2 ? 'bg-red-100 text-red-700' :
                    daysLeftInTrial <= 4 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    Trial: {daysLeftInTrial} {daysLeftInTrial === 1 ? 'day' : 'days'} left
                  </div>
                )}
                {isTrialExpired && (
                  <Link href="/pricing">
                    <div className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors text-center">
                      Trial Expired - Subscribe Now
                    </div>
                  </Link>
                )}
                {tierInfo && (
                  <Link href="/subscription">
                    <div className={`px-3 py-2 rounded-lg text-sm font-bold text-center ${
                      currentTier === 'starter' ? 'bg-blue-100 text-blue-700' :
                      currentTier === 'standard' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      Current Plan: {tierInfo.name}
                    </div>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
