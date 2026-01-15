'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getCurrencyList } from '@/lib/currencies';

export default function CurrencySettings() {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [searchQuery, setSearchQuery] = useState('');
  const [saved, setSaved] = useState(false);

  const currencies = getCurrencyList();

  // Filter currencies based on search
  const filteredCurrencies = currencies.filter(curr =>
    curr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curr.symbol.includes(searchQuery)
  );

  const handleSave = () => {
    setCurrency(selectedCurrency);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const hasChanges = selectedCurrency !== currency;
  const currentCurrencyInfo = currencies.find(c => c.code === currency);
  const selectedCurrencyInfo = currencies.find(c => c.code === selectedCurrency);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/settings"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Currency Settings</h1>
        <p className="mt-2 text-gray-600">
          Select your preferred currency. All amounts will be automatically converted.
        </p>
      </div>

      {/* Save Banner */}
      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-800 font-medium">Currency saved successfully!</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Current Currency Display */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Current Currency</h2>
          <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4">
              {currentCurrencyInfo?.symbol || '$'}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {currentCurrencyInfo?.name || 'US Dollar'}
              </div>
              <div className="text-sm text-gray-600">
                {currency} • Used for all displays and exports
              </div>
            </div>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="p-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Change Currency</h2>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search currencies (e.g., USD, Euro, £)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              Showing {filteredCurrencies.length} of {currencies.length} currencies
            </p>
          </div>

          {/* Currency Grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {filteredCurrencies.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No currencies match your search
                </div>
              ) : (
                <div className="grid gap-px bg-gray-200">
                  {filteredCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => setSelectedCurrency(curr.code)}
                      className={`p-4 text-left bg-white hover:bg-gray-50 transition-colors ${
                        selectedCurrency === curr.code
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                          selectedCurrency === curr.code
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {curr.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{curr.name}</div>
                          <div className="text-sm text-gray-600">{curr.code}</div>
                        </div>
                        {selectedCurrency === curr.code && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Currency Preview */}
          {selectedCurrencyInfo && selectedCurrency !== currency && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">New currency:</p>
              <div className="flex items-center">
                <div className="bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mr-3">
                  {selectedCurrencyInfo.symbol}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedCurrencyInfo.name}</div>
                  <div className="text-sm text-gray-600">{selectedCurrencyInfo.code}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => router.push('/settings')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">About Currency Conversion</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Trip data is stored in USD and converted for display</li>
              <li>• Exchange rates are updated regularly</li>
              <li>• All exports (PDF, Excel, CSV) use your selected currency</li>
              <li>• Changes apply immediately across the entire application</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
