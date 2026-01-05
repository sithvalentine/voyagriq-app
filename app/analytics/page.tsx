"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';
import { Trip } from '@/data/trips';
import { formatCurrency } from '@/lib/utils';
import { useTier } from '@/contexts/TierContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AgencyMetrics {
  agencyName: string;
  tripCount: number;
  totalRevenue: number;
  avgTripValue: number;
  totalTravelers: number;
  avgCostPerTraveler: number;
  totalCommission: number;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

export default function AgencyAnalytics() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const { currentTier } = useTier();
  const hasAccess = currentTier === 'standard' || currentTier === 'premium';
  const isPremium = currentTier === 'premium';

  useEffect(() => {
    setTrips(DataStore.getTrips());
  }, []);

  // Calculate metrics by agency
  const agencyMetrics = useMemo<AgencyMetrics[]>(() => {
    const agencyMap = new Map<string, Trip[]>();

    trips.forEach(trip => {
      const agency = trip.Travel_Agency;
      if (!agencyMap.has(agency)) {
        agencyMap.set(agency, []);
      }
      agencyMap.get(agency)!.push(trip);
    });

    const metrics: AgencyMetrics[] = [];

    agencyMap.forEach((agencyTrips, agencyName) => {
      const tripCount = agencyTrips.length;
      const totalRevenue = agencyTrips.reduce((sum, trip) => sum + (trip.Agency_Revenue || 0), 0);
      const totalTripCosts = agencyTrips.reduce((sum, trip) => sum + trip.Trip_Total_Cost, 0);
      const avgTripValue = totalTripCosts / tripCount;
      const totalTravelers = agencyTrips.reduce((sum, trip) => sum + trip.Total_Travelers, 0);
      const avgCostPerTraveler = agencyTrips.reduce((sum, trip) => sum + trip.Cost_Per_Traveler, 0) / tripCount;
      const totalCommission = totalRevenue; // Same as totalRevenue now

      metrics.push({
        agencyName,
        tripCount,
        totalRevenue,
        avgTripValue,
        totalTravelers,
        avgCostPerTraveler,
        totalCommission,
      });
    });

    return metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [trips]);

  // Chart data
  const revenueChartData = agencyMetrics.map(m => ({
    name: m.agencyName,
    revenue: m.totalRevenue,
  }));

  const tripCountChartData = agencyMetrics.map(m => ({
    name: m.agencyName,
    trips: m.tripCount,
  }));

  const pieChartData = agencyMetrics.map(m => ({
    name: m.agencyName,
    value: m.totalRevenue,
  }));

  // If no access, show upgrade screen
  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agency Performance Comparison
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Compare revenue, trip volume, and performance metrics across all your travel agencies.
            Available on Standard and Premium plans.
          </p>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Unlock This Feature:</h3>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Revenue comparison by agency</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Trip volume and trends</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Commission tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Visual charts and graphs</span>
              </li>
            </ul>
            <Link href="/pricing">
              <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors">
                Upgrade to Standard
              </button>
            </Link>
          </div>
          <Link href="/trips" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to All Trips
          </Link>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (trips.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">No Data Yet</h1>
          <p className="text-xl text-gray-600 mb-8">
            Add trips to see agency performance comparison
          </p>
          <Link href="/data">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Add Your First Trip
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Agency Performance Comparison
              </h1>
              {isPremium ? (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-pink-100 text-amber-800 text-xs font-bold rounded-full">
                  ⭐ PREMIUM
                </span>
              ) : (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  STANDARD
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-600">
              Compare metrics across {agencyMetrics.length} {agencyMetrics.length === 1 ? 'agency' : 'agencies'}
            </p>
          </div>
          <Link href="/trips" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to All Trips
          </Link>
        </div>
      </div>

      {/* Premium Features Banner */}
      {isPremium && (
        <div className="bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⭐</span>
                <h3 className="text-xl font-bold text-gray-900">Premium Analytics Enabled</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                You have access to advanced features including white-label reports, API access, and AI-powered insights.
              </p>
              <div className="flex gap-3">
                <Link href="/settings/white-label">
                  <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                    🎨 White-Label Settings
                  </button>
                </Link>
                <Link href="/api-docs">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                    🔌 API Access
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Agencies</div>
          <div className="text-3xl font-bold text-gray-900">{agencyMetrics.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Trips</div>
          <div className="text-3xl font-bold text-gray-900">{trips.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue (Commission)</div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(agencyMetrics.reduce((sum, m) => sum + m.totalRevenue, 0))}
          </div>
          <div className="text-xs text-gray-500 mt-1">Agency earnings</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg Commission Per Trip</div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(
              trips.length > 0
                ? agencyMetrics.reduce((sum, m) => sum + m.totalRevenue, 0) / trips.length
                : 0
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">Per booking</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue by Agency */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Agency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trip Count by Agency */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Volume by Agency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tripCountChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="trips" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Trip Value */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Avg Trip Value by Agency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agencyMetrics.map(m => ({ name: m.agencyName, avgValue: m.avgTripValue }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="avgValue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Detailed Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agency Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trips
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Trip Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Travelers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Cost/Traveler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agencyMetrics.map((metrics, index) => (
                <tr key={metrics.agencyName} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metrics.agencyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metrics.tripCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {formatCurrency(metrics.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(metrics.avgTripValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metrics.totalTravelers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(metrics.avgCostPerTraveler)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {formatCurrency(metrics.totalCommission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
