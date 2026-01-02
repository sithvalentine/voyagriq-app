"use client";

import { useState, useMemo, useEffect } from 'react';
import { DataStore } from '@/lib/dataStore';
import { Trip } from '@/data/trips';
import { formatCurrency, getAgencyStats } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function AgencyPerformance() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showAIInsights, setShowAIInsights] = useState(false);

  useEffect(() => {
    setTrips(DataStore.getTrips());
  }, []);

  // Calculate agency statistics
  const agencyStats = useMemo(() => getAgencyStats(trips), [trips]);

  // Calculate overall KPIs
  const totalRevenue = useMemo(() =>
    trips.reduce((sum, trip) => sum + trip.Trip_Total_Cost, 0),
    [trips]
  );

  const numAgencies = useMemo(() =>
    new Set(trips.map(t => t.Travel_Agency)).size,
    [trips]
  );

  const avgTripsPerAgency = useMemo(() =>
    trips.length / (numAgencies || 1),
    [numAgencies, trips.length]
  );

  // Prepare data for revenue chart
  const revenueChartData = agencyStats.map(stat => ({
    name: stat.agency,
    revenue: stat.totalRevenue,
  }));

  // Prepare trip count chart data
  const tripCountData = agencyStats.map(stat => ({
    name: stat.agency,
    trips: stat.tripCount,
  }));

  // Calculate trips over time by agency
  const tripsOverTime = useMemo(() => {
    const monthMap = new Map<string, Map<string, number>>();

    trips.forEach(trip => {
      const date = new Date(trip.Start_Date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, new Map());
      }

      const agencyMap = monthMap.get(monthKey)!;
      agencyMap.set(trip.Travel_Agency, (agencyMap.get(trip.Travel_Agency) || 0) + 1);
    });

    const sortedMonths = Array.from(monthMap.keys()).sort();
    const agencies = Array.from(new Set(trips.map(t => t.Travel_Agency)));

    return sortedMonths.map(month => {
      const monthData: any = {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };

      agencies.forEach(agency => {
        monthData[agency] = monthMap.get(month)?.get(agency) || 0;
      });

      return monthData;
    });
  }, []);

  const agencies = Array.from(new Set(trips.map(t => t.Travel_Agency)));
  const agencyColors = ['#0ea5e9', '#8b5cf6', '#10b981'];

  // AI Insights (simulated)
  const topProfitablePatterns = [
    {
      pattern: 'Italy, 4 travelers, 7-9 days',
      avgCost: 20000,
      tripCount: 2
    },
    {
      pattern: 'Japan, 2 travelers, 10-12 days',
      avgCost: 18400,
      tripCount: 1
    },
    {
      pattern: 'France, 2 travelers, 5-7 days',
      avgCost: 13300,
      tripCount: 2
    }
  ];

  const agencyHealthCheck = agencyStats.length > 0
    ? `${agencyStats[0].agency} leads in total revenue (${formatCurrency(agencyStats[0].totalRevenue)}) and trip volume (${agencyStats[0].tripCount} trips). ${agencyStats.length > 1 ? `${agencyStats[1].agency} has ${agencyStats[1].tripCount > agencyStats[0].tripCount ? 'a higher' : 'competitive'} trip volume with an average trip value of ${formatCurrency(agencyStats[1].avgTripValue)}.` : ''} ${agencyStats.length > 2 ? `${agencyStats[2].agency} shows strong per-trip margins at ${formatCurrency(agencyStats[2].avgTripValue)} average—consider featuring their itineraries as premium examples.` : ''}`
    : 'No data available for agency analysis.';

  // Show empty state if no data
  if (trips.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agency Performance</h1>
          <p className="mt-2 text-gray-600">
            Analyze revenue and trip volume across all travel agencies
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trip Data Available</h2>
          <p className="text-gray-600 mb-6">
            Import trip data to see agency performance analytics, comparisons, and insights.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/data"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Go to Data Management
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agency Performance</h1>
        <p className="mt-2 text-gray-600">
          Analyze revenue and trip volume across all travel agencies
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Agency Revenue</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-gray-500 mt-1">Across all agencies</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Number of Agencies</div>
          <div className="text-3xl font-bold text-gray-900">{numAgencies}</div>
          <div className="text-xs text-gray-500 mt-1">Active agencies</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg Trips Per Agency</div>
          <div className="text-3xl font-bold text-gray-900">{avgTripsPerAgency.toFixed(1)}</div>
          <div className="text-xs text-gray-500 mt-1">Total {trips.length} trips</div>
        </div>
      </div>

      {/* Agency Summary Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Agency Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel Agency
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Trip Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top Destination
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agencyStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {stat.agency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    {formatCurrency(stat.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                    {stat.tripCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    {formatCurrency(stat.avgTripValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {stat.topDestination}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Agency */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue by Agency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" width={120} style={{ fontSize: '12px' }} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="revenue" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trip Count by Agency */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Trip Count by Agency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tripCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="trips" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trips Over Time */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Trips Over Time by Agency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={tripsOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: '12px' }} />
            <YAxis />
            <Tooltip />
            <Legend />
            {agencies.map((agency, index) => (
              <Line
                key={agency}
                type="monotone"
                dataKey={agency}
                stroke={agencyColors[index % agencyColors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-sm border border-purple-200 p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">🤖</span>
          <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Get AI-powered analysis of agency performance and profitable trip patterns
        </p>

        <button
          onClick={() => setShowAIInsights(!showAIInsights)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium mb-4"
        >
          {showAIInsights ? 'Hide Insights' : 'Generate AI Insights'}
        </button>

        {showAIInsights && (
          <div className="space-y-6">
            {/* Top Profitable Trip Patterns */}
            <div className="bg-white rounded-lg border border-purple-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Top 3 Most Profitable Trip Patterns
              </h3>
              <div className="space-y-3">
                {topProfitablePatterns.map((pattern, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {index + 1}. {pattern.pattern}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {pattern.tripCount} {pattern.tripCount === 1 ? 'trip' : 'trips'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatCurrency(pattern.avgCost)}</div>
                      <div className="text-xs text-gray-500">avg/trip</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agency Health Check */}
            <div className="bg-white rounded-lg border border-purple-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Agency Health Check</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{agencyHealthCheck}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
