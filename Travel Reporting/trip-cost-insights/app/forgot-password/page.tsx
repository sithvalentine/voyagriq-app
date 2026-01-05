'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    // Generate a reset token (for demo purposes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expirationTime = Date.now() + (60 * 60 * 1000); // 1 hour from now

    // Store reset token in localStorage (demo mode)
    const resetData = {
      email,
      token: resetToken,
      expires: expirationTime,
    };
    localStorage.setItem('password-reset-token', JSON.stringify(resetData));

    // Generate the reset link
    const link = `${window.location.origin}/reset-password?token=${resetToken}`;
    setResetLink(link);
    setIsSubmitted(true);

    // TODO: In production, this would call your backend API to send an email
    console.log('Password reset requested for:', email);
    console.log('Reset token:', resetToken);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resetLink);
    alert('Reset link copied to clipboard!');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600">
                We've sent a password reset link to:
              </p>
              <p className="text-blue-600 font-semibold mt-1">{email}</p>
            </div>

            {/* Demo Mode - Show Reset Link */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xl">🔧</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Demo Mode</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Since this is a demo app without email functionality, here's your password reset link:
                  </p>
                </div>
              </div>

              <div className="bg-white rounded border border-yellow-400 p-3 mb-3 break-all text-sm font-mono text-gray-800">
                {resetLink}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy Link
                </button>
                <Link href={`/reset-password?token=${resetLink.split('token=')[1]}`} className="flex-1">
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                    Reset Password →
                  </button>
                </Link>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <p className="text-sm text-gray-700">
                  Click the link in the email (or use the demo link above)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">2.</span>
                <p className="text-sm text-gray-700">
                  Enter and confirm your new password
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">3.</span>
                <p className="text-sm text-gray-700">
                  Sign in with your new password
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-600 text-center">
                The reset link will expire in <strong>1 hour</strong>.<br />
                If you don't receive an email, check your spam folder.
              </p>
            </div>

            {/* Back to Login */}
            <Link href="/login">
              <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                ← Back to Login
              </button>
            </Link>

            {/* Resend Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setResetLink('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Back to Login
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Send Reset Link
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="text-xs text-gray-600">
                  <strong>Security Note:</strong> If an account exists with this email,
                  you will receive a password reset link. For security reasons, we don't
                  reveal whether an account exists.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link href="/about" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
