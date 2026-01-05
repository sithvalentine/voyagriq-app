'use client';

import Link from 'next/link';
import { useTier } from '@/contexts/TierContext';
import { useState } from 'react';

export default function APIDocsPage() {
  const { currentTier } = useTier();
  const isPremium = currentTier === 'premium';
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/trips',
      description: 'List all trips',
      params: [
        { name: 'limit', type: 'number', description: 'Number of trips to return (max 100)' },
        { name: 'offset', type: 'number', description: 'Number of trips to skip' },
        { name: 'agency', type: 'string', description: 'Filter by travel agency' },
      ],
      response: `{
  "trips": [
    {
      "Trip_ID": "T001",
      "Client_Name": "John Doe",
      "Trip_Total_Cost": 5000,
      ...
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}`,
    },
    {
      method: 'GET',
      path: '/api/trips/:id',
      description: 'Get a specific trip by ID',
      params: [],
      response: `{
  "Trip_ID": "T001",
  "Client_Name": "John Doe",
  "Travel_Agency": "Wanderlust Travel",
  "Trip_Total_Cost": 5000,
  "Start_Date": "2024-01-15",
  "End_Date": "2024-01-22",
  ...
}`,
    },
    {
      method: 'POST',
      path: '/api/trips',
      description: 'Create a new trip',
      params: [],
      response: `{
  "success": true,
  "trip": {
    "Trip_ID": "T026",
    "Client_Name": "Jane Smith",
    ...
  }
}`,
    },
    {
      method: 'PUT',
      path: '/api/trips/:id',
      description: 'Update an existing trip',
      params: [],
      response: `{
  "success": true,
  "trip": {
    "Trip_ID": "T001",
    ...
  }
}`,
    },
    {
      method: 'DELETE',
      path: '/api/trips/:id',
      description: 'Delete a trip',
      params: [],
      response: `{
  "success": true,
  "message": "Trip T001 deleted successfully"
}`,
    },
    {
      method: 'GET',
      path: '/api/analytics',
      description: 'Get analytics data',
      params: [
        { name: 'startDate', type: 'string', description: 'Start date (YYYY-MM-DD)' },
        { name: 'endDate', type: 'string', description: 'End date (YYYY-MM-DD)' },
      ],
      response: `{
  "totalRevenue": 125000,
  "totalTrips": 25,
  "avgTripValue": 5000,
  "topAgencies": [...],
  ...
}`,
    },
    {
      method: 'GET',
      path: '/api/vendors',
      description: 'Get vendor analytics',
      params: [],
      response: `{
  "vendors": [
    {
      "name": "Delta Airlines",
      "category": "Flight",
      "totalSpent": 45000,
      "tripCount": 15
    }
  ]
}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 inline-block">
            ← Back to Account
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Documentation</h1>
          <p className="text-gray-600">Access your trip data programmatically with our REST API</p>
        </div>

        {/* Premium Lock Banner */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-amber-50 to-pink-50 border-2 border-amber-300 rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔒</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h2>
                <p className="text-gray-700 mb-4">
                  API access is available exclusively on the <span className="font-bold text-amber-600">Premium Plan</span>.
                  Upgrade to automate your workflows and integrate with your existing systems.
                </p>
                <Link href="/pricing">
                  <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Upgrade to Premium
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Get Your API Key</h3>
              <p className="text-gray-600 mb-3">
                {isPremium ? (
                  <>Generate an API key from your <Link href="/settings/api-keys" className="text-primary-600 hover:text-primary-700 font-medium">API Keys settings page</Link>.</>
                ) : (
                  <>Upgrade to Premium to generate API keys.</>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Authentication</h3>
              <p className="text-gray-600 mb-3">Include your API key in the request header:</p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto relative">
                <code>Authorization: Bearer YOUR_API_KEY</code>
                <button
                  onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                  className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  {copiedEndpoint === 'auth' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Base URL</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto relative">
                <code>https://api.tripcostinsights.com</code>
                <button
                  onClick={() => copyToClipboard('https://api.tripcostinsights.com', 'base')}
                  className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  {copiedEndpoint === 'base' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Rate Limits</h3>
              <p className="text-gray-600">
                Premium accounts: <span className="font-semibold">1,000 requests per hour</span>
              </p>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>

          <div className="space-y-6">
            {endpoints.map((endpoint, idx) => (
              <div key={idx} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`px-3 py-1 rounded font-mono text-sm font-bold ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-lg font-mono font-semibold text-gray-900">{endpoint.path}</code>
                </div>

                <p className="text-gray-600 mb-3">{endpoint.description}</p>

                {endpoint.params.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Query Parameters</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {endpoint.params.map((param, pidx) => (
                        <div key={pidx} className="text-sm">
                          <code className="text-purple-600 font-mono font-semibold">{param.name}</code>
                          <span className="text-gray-500 ml-2">({param.type})</span>
                          <span className="text-gray-700 ml-2">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Example Response</h4>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto relative">
                    <pre>{endpoint.response}</pre>
                    <button
                      onClick={() => copyToClipboard(endpoint.response, endpoint.path)}
                      className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                    >
                      {copiedEndpoint === endpoint.path ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example Code */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Example Code</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">JavaScript / Node.js</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto relative">
                <pre>{`const axios = require('axios');

const apiKey = 'YOUR_API_KEY';
const baseURL = 'https://api.tripcostinsights.com';

async function getTrips() {
  try {
    const response = await axios.get(\`\${baseURL}/api/trips\`, {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`
      },
      params: {
        limit: 10,
        offset: 0
      }
    });

    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getTrips();`}</pre>
                <button
                  onClick={() => copyToClipboard(`const axios = require('axios');

const apiKey = 'YOUR_API_KEY';
const baseURL = 'https://api.tripcostinsights.com';

async function getTrips() {
  try {
    const response = await axios.get(\`\${baseURL}/api/trips\`, {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`
      },
      params: {
        limit: 10,
        offset: 0
      }
    });

    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getTrips();`, 'js')}
                  className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  {copiedEndpoint === 'js' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Python</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto relative">
                <pre>{`import requests

api_key = 'YOUR_API_KEY'
base_url = 'https://api.tripcostinsights.com'

headers = {
    'Authorization': f'Bearer {api_key}'
}

params = {
    'limit': 10,
    'offset': 0
}

response = requests.get(f'{base_url}/api/trips', headers=headers, params=params)

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f'Error: {response.status_code}')`}</pre>
                <button
                  onClick={() => copyToClipboard(`import requests

api_key = 'YOUR_API_KEY'
base_url = 'https://api.tripcostinsights.com'

headers = {
    'Authorization': f'Bearer {api_key}'
}

params = {
    'limit': 10,
    'offset': 0
}

response = requests.get(f'{base_url}/api/trips', headers=headers, params=params)

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f'Error: {response.status_code}')`, 'py')}
                  className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  {copiedEndpoint === 'py' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Codes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Error Codes</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <code className="px-3 py-1 bg-red-100 text-red-700 rounded font-mono text-sm font-bold">400</code>
              <div>
                <div className="font-semibold text-gray-900">Bad Request</div>
                <div className="text-sm text-gray-600">Invalid request parameters</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="px-3 py-1 bg-red-100 text-red-700 rounded font-mono text-sm font-bold">401</code>
              <div>
                <div className="font-semibold text-gray-900">Unauthorized</div>
                <div className="text-sm text-gray-600">Invalid or missing API key</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="px-3 py-1 bg-red-100 text-red-700 rounded font-mono text-sm font-bold">403</code>
              <div>
                <div className="font-semibold text-gray-900">Forbidden</div>
                <div className="text-sm text-gray-600">API access not enabled for your plan</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="px-3 py-1 bg-red-100 text-red-700 rounded font-mono text-sm font-bold">404</code>
              <div>
                <div className="font-semibold text-gray-900">Not Found</div>
                <div className="text-sm text-gray-600">Resource not found</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="px-3 py-1 bg-red-100 text-red-700 rounded font-mono text-sm font-bold">429</code>
              <div>
                <div className="font-semibold text-gray-900">Too Many Requests</div>
                <div className="text-sm text-gray-600">Rate limit exceeded</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <code className="px-3 py-1 bg-red-100 text-red-700 rounded font-mono text-sm font-bold">500</code>
              <div>
                <div className="font-semibold text-gray-900">Internal Server Error</div>
                <div className="text-sm text-gray-600">Server error - please contact support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
