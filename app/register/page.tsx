'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscription';

function RegisterContent() {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier') as SubscriptionTier | null;
  const intervalParam = searchParams.get('interval') as 'monthly' | 'annual' | null;
  const selectedTier = tierParam || 'starter';

  // Make billingInterval stateful so users can toggle it
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>(intervalParam || 'monthly');

  const tierInfo = SUBSCRIPTION_TIERS[selectedTier];
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing/checking
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service';
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // NEW APPROACH: Don't create Supabase account yet!
    // Instead, redirect to Stripe with registration data in metadata
    // The account will be created AFTER successful payment via webhook

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    try {
      console.log('[register] Selected tier:', selectedTier);
      console.log('[register] Tier from URL param:', tierParam);
      console.log('[register] Creating checkout session for tier:', selectedTier);

      // Create Stripe checkout session with registration data
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          interval: billingInterval,
          // Pass registration data - account will be created after payment
          registrationData: {
            email: formData.email,
            password: formData.password,
            fullName: fullName,
            agencyName: formData.agencyName || null
          }
        }),
      });

      console.log('[register] Stripe checkout response:', response.status);

      if (response.ok) {
        const { url } = await response.json();
        console.log('Stripe checkout URL:', url);
        if (url) {
          // Store registration details for post-payment messaging
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('voyagriq-pending-registration', JSON.stringify({
              email: formData.email,
              tier: selectedTier,
              timestamp: Date.now()
            }));
          }

          // Redirect to Stripe Checkout
          // No account exists yet - it will be created after payment
          window.location.href = url;
          return;
        }
      } else {
        const errorData = await response.json();
        console.error('Stripe checkout error:', errorData);
        setErrors({ general: errorData.error || 'Failed to create checkout session. Please try again.' });
        setLoading(false);
        return;
      }
    } catch (checkoutError) {
      console.error('Error creating checkout session:', checkoutError);
      setErrors({ general: 'Failed to redirect to payment. Please try again.' });
      setLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Start your journey with the {tierInfo.name} plan
          </p>
        </div>

        {/* Billing Interval Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-sm text-gray-600 font-medium">Billing:</span>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-md border border-gray-200">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
                billingInterval === 'annual'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Annual
              <span className="ml-1 text-xs font-normal">
                (Save 17%)
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Selected Plan Banner */}
          <div className={`p-6 ${
            selectedTier === 'starter' ? 'bg-blue-600' :
            selectedTier === 'standard' ? 'bg-purple-600' :
            'bg-amber-600'
          } text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{tierInfo.name} Plan</h2>
                <p className="text-white/90 mt-1">
                  {tierInfo.tripLimit === 'unlimited'
                    ? 'Unlimited trips per month'
                    : `${tierInfo.tripLimit} trips per month`}
                </p>
                {selectedTier !== 'premium' && billingInterval === 'monthly' && (
                  <p className="text-white/90 text-sm mt-1 font-semibold">
                    Includes 14-day free trial
                  </p>
                )}
                {billingInterval === 'annual' && (
                  <p className="text-white/90 text-sm mt-1 font-semibold">
                    Get 2 months free with annual billing!
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">
                  {tierInfo.price === 0
                    ? 'Free'
                    : `$${billingInterval === 'annual'
                        ? Math.round(tierInfo.price * 12 / 14)
                        : tierInfo.price}`}
                </div>
                {tierInfo.price > 0 && (
                  <div className="text-white/90 text-sm">per month</div>
                )}
                {billingInterval === 'annual' && tierInfo.price > 0 && (
                  <div className="text-white/70 text-xs mt-1">
                    Billed ${tierInfo.price * 12} annually
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-8" name="registration">
            <div className="space-y-6">
              {/* General Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.general}
                </div>
              )}

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  autoComplete="off"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="off"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Agency Name (Optional) */}
              <div>
                <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Agency Name (Optional)
                </label>
                <input
                  type="text"
                  id="agencyName"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="8+ chars, 1 uppercase, 1 number, 1 special char"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Plan Features Summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                What's included in your {tierInfo.name} plan:
              </h3>
              <ul className="space-y-2">
                {tierInfo.features.slice(0, 5).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {selectedTier !== 'premium' && (
                <Link href="/pricing" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 inline-block">
                  View all plans and features →
                </Link>
              )}
            </div>

            {/* Legal Agreements */}
            <div className="mt-8 space-y-4">
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className={`mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                      errors.acceptTerms ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline font-medium">
                      Terms of Service
                    </Link>
                    {' '}*
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="ml-8 mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleChange}
                    className={`mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                      errors.acceptPrivacy ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline font-medium">
                      Privacy Policy
                    </Link>
                    {' '}*
                  </span>
                </label>
                {errors.acceptPrivacy && (
                  <p className="ml-8 mt-1 text-sm text-red-600">{errors.acceptPrivacy}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Creating Account...'
                : (selectedTier === 'premium' || billingInterval === 'annual')
                  ? 'Get Started'
                  : 'Start 14-Day Free Trial'}
            </button>

            {selectedTier !== 'premium' && billingInterval === 'monthly' && (
              <p className="mt-4 text-center text-sm text-gray-600">
                Start your 14-day free trial • No credit card required • Cancel anytime
              </p>
            )}
            {billingInterval === 'annual' && (
              <p className="mt-4 text-center text-sm text-gray-600">
                Pay for 12 months, get 14 months • Cancel anytime
              </p>
            )}

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Your data is secure and encrypted</p>
          <p className="mt-2">Cancel anytime • No long-term contracts • 30-day money-back guarantee</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/terms" className="text-gray-500 hover:text-gray-700">
              Terms of Service
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
