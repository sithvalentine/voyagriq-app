"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataStore } from '@/lib/dataStore';
import { trips } from '@/data/trips';

export default function LoadSampleData() {
  const [loaded, setLoaded] = useState(false);
  const [existingCount, setExistingCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const existing = DataStore.getTrips();
    setExistingCount(existing.length);
  }, []);

  const loadData = () => {
    DataStore.setTrips(trips);
    setLoaded(true);
  };

  const clearData = () => {
    DataStore.clearTrips();
    setExistingCount(0);
    setLoaded(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Load Sample Data</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Status</h2>
        <div className="mb-4">
          <p className="text-gray-700">
            Trips in localStorage: <strong>{existingCount}</strong>
          </p>
          <p className="text-gray-700">
            Sample trips available: <strong>{trips.length}</strong>
          </p>
        </div>

        {loaded && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-semibold">✅ Sample data loaded successfully!</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={loadData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Load Sample Data
          </button>

          {existingCount > 0 && (
            <button
              onClick={clearData}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Sample Data Includes:</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✅ 8 sample trips with realistic data</li>
          <li>✅ Commission tracking (10-15% rates)</li>
          <li>✅ <strong>Vendor/Supplier tracking</strong> (Flight, Hotel, Ground Transport, Activities, Insurance vendors)</li>
          <li>✅ Multiple destinations (Italy, France, Japan, Spain, Greece, Costa Rica, Portugal)</li>
          <li>✅ 3 different travel agencies</li>
          <li>✅ Various trip types and costs</li>
          <li>✅ Dates spread across Q1-Q2 2025</li>
        </ul>
      </div>

      {existingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Note: Vendor Data Update</h3>
          <p className="text-sm text-yellow-800">
            If you loaded sample data before vendor tracking was added, you'll need to <strong>Clear All Data</strong> and then <strong>Load Sample Data</strong> again to see vendor analytics in your reports.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => router.push('/test-analytics')}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          → Go to Analytics Test Page
        </button>

        <button
          onClick={() => router.push('/trips')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          → View All Trips
        </button>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Sample Trip Data Preview:</h3>
        <pre className="text-xs overflow-auto bg-white p-4 rounded border max-h-96">
          {JSON.stringify(trips[0], null, 2)}
        </pre>
      </div>
    </div>
  );
}
