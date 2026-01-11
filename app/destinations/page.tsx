"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Trip } from '@/data/trips';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrencyWithSymbol } from '@/lib/currency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface DestinationStats {
  country: string;
  city: string;
  locationKey: string;
  tripCount: number;
  totalCost: number;
  totalRevenue: number;
  avgCostPerTrip: number;
  avgRevenuePerTrip: number;
  profitMargin: number;
  totalTravelers: number;
  avgTravelersPerTrip: number;
  trips: Trip[];
  avgDuration: number; // Average trip length in days
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#84CC16'];

export default function DestinationsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [viewBy, setViewBy] = useState<'country' | 'city'>('country');
  const [sortBy, setSortBy] = useState<'revenue' | 'trips' | 'margin'>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const { currency } = useCurrency();

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('trips')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false });

          if (!error && data) {
            const tripsData: Trip[] = data.map((dbTrip: any) => ({
              Trip_ID: dbTrip.trip_id,
              Client_Name: dbTrip.client_name,
              Travel_Agency: dbTrip.travel_agency || '',
              Start_Date: dbTrip.start_date,
              End_Date: dbTrip.end_date,
              Destination_Country: dbTrip.destination_country,
              Destination_City: dbTrip.destination_city || '',
              Adults: dbTrip.adults,
              Children: dbTrip.children,
              Total_Travelers: dbTrip.total_travelers,
              Flight_Cost: (dbTrip.flight_cost || 0) / 100,
              Hotel_Cost: (dbTrip.hotel_cost || 0) / 100,
              Ground_Transport: (dbTrip.ground_transport || 0) / 100,
              Activities_Tours: (dbTrip.activities_tours || 0) / 100,
              Meals_Cost: (dbTrip.meals_cost || 0) / 100,
              Insurance_Cost: (dbTrip.insurance_cost || 0) / 100,
              Cruise_Cost: (dbTrip.cruise_cost || 0) / 100,
              Other_Costs: (dbTrip.other_costs || 0) / 100,
              Trip_Total_Cost:
                ((dbTrip.flight_cost || 0) +
                (dbTrip.hotel_cost || 0) +
                (dbTrip.ground_transport || 0) +
                (dbTrip.activities_tours || 0) +
                (dbTrip.meals_cost || 0) +
                (dbTrip.insurance_cost || 0) +
                (dbTrip.cruise_cost || 0) +
                (dbTrip.other_costs || 0)) / 100,
              Cost_Per_Traveler: dbTrip.total_travelers > 0
                ? ((dbTrip.flight_cost || 0) +
                   (dbTrip.hotel_cost || 0) +
                   (dbTrip.ground_transport || 0) +
                   (dbTrip.activities_tours || 0) +
                   (dbTrip.meals_cost || 0) +
                   (dbTrip.insurance_cost || 0) +
                   (dbTrip.cruise_cost || 0) +
                   (dbTrip.other_costs || 0)) / 100 / dbTrip.total_travelers
                : 0,
              Commission_Type: dbTrip.commission_rate ? 'percentage' : undefined,
              Commission_Value: dbTrip.commission_rate || undefined,
              Agency_Revenue: (dbTrip.commission_amount || 0) / 100,
              Notes: dbTrip.notes || '',
              Flight_Vendor: dbTrip.flight_vendor,
              Hotel_Vendor: dbTrip.hotel_vendor,
              Ground_Transport_Vendor: dbTrip.ground_transport_vendor,
              Activities_Vendor: dbTrip.activities_vendor,
              Cruise_Operator: dbTrip.cruise_operator,
              Insurance_Vendor: dbTrip.insurance_vendor,
            }));
            setTrips(tripsData);
          }
        }
      } catch (error) {
        console.error('Error loading trips:', error);
      }
    };

    loadTrips();
  }, []);

  // Get unique years from trip start dates
  const years = useMemo(() => {
    const allYears = new Set<string>();
    trips.forEach(trip => {
      const year = new Date(trip.Start_Date).getFullYear().toString();
      allYears.add(year);
    });
    return Array.from(allYears).sort().reverse();
  }, [trips]);

  // Aggregate destination data
  const destinationStats = useMemo(() => {
    const statsMap = new Map<string, DestinationStats>();

    // Filter trips by year first
    const filteredByYear = selectedYear === 'all'
      ? trips
      : trips.filter(trip => {
          const tripYear = new Date(trip.Start_Date).getFullYear().toString();
          return tripYear === selectedYear;
        });

    filteredByYear.forEach(trip => {
      const locationKey = viewBy === 'country'
        ? trip.Destination_Country
        : `${trip.Destination_City}, ${trip.Destination_Country}`;

      if (!statsMap.has(locationKey)) {
        statsMap.set(locationKey, {
          country: trip.Destination_Country,
          city: trip.Destination_City,
          locationKey,
          tripCount: 0,
          totalCost: 0,
          totalRevenue: 0,
          avgCostPerTrip: 0,
          avgRevenuePerTrip: 0,
          profitMargin: 0,
          totalTravelers: 0,
          avgTravelersPerTrip: 0,
          trips: [],
          avgDuration: 0,
        });
      }

      const stats = statsMap.get(locationKey)!;
      stats.tripCount += 1;
      stats.totalCost += trip.Trip_Total_Cost;
      stats.totalRevenue += (trip.Agency_Revenue || 0);
      stats.totalTravelers += trip.Total_Travelers;
      stats.trips.push(trip);

      // Calculate trip duration
      const startDate = new Date(trip.Start_Date);
      const endDate = new Date(trip.End_Date);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      stats.avgDuration = (stats.avgDuration * (stats.tripCount - 1) + duration) / stats.tripCount;
    });

    // Calculate averages and profit margins
    statsMap.forEach(stats => {
      stats.avgCostPerTrip = stats.tripCount > 0 ? stats.totalCost / stats.tripCount : 0;
      stats.avgRevenuePerTrip = stats.tripCount > 0 ? stats.totalRevenue / stats.tripCount : 0;
      stats.profitMargin = stats.totalCost > 0 ? (stats.totalRevenue / stats.totalCost) * 100 : 0;
      stats.avgTravelersPerTrip = stats.tripCount > 0 ? stats.totalTravelers / stats.tripCount : 0;
    });

    return Array.from(statsMap.values());
  }, [trips, selectedYear, viewBy]);

  // Filter by search
  const filteredDestinations = useMemo(() => {
    if (!searchQuery) return destinationStats;
    const query = searchQuery.toLowerCase();
    return destinationStats.filter(d =>
      d.locationKey.toLowerCase().includes(query)
    );
  }, [destinationStats, searchQuery]);

  // Sort destinations
  const sortedDestinations = useMemo(() => {
    const sorted = [...filteredDestinations];
    switch (sortBy) {
      case 'revenue':
        return sorted.sort((a, b) => sortDirection === 'desc' ? b.totalRevenue - a.totalRevenue : a.totalRevenue - b.totalRevenue);
      case 'trips':
        return sorted.sort((a, b) => sortDirection === 'desc' ? b.tripCount - a.tripCount : a.tripCount - b.tripCount);
      case 'margin':
        return sorted.sort((a, b) => sortDirection === 'desc' ? b.profitMargin - a.profitMargin : a.profitMargin - b.profitMargin);
      default:
        return sorted;
    }
  }, [filteredDestinations, sortBy, sortDirection]);

  // Calculate totals
  const totalCost = useMemo(() =>
    filteredDestinations.reduce((sum, d) => sum + d.totalCost, 0),
    [filteredDestinations]
  );

  const totalRevenue = useMemo(() =>
    filteredDestinations.reduce((sum, d) => sum + d.totalRevenue, 0),
    [filteredDestinations]
  );

  const avgProfitMargin = useMemo(() =>
    filteredDestinations.length > 0
      ? filteredDestinations.reduce((sum, d) => sum + d.profitMargin, 0) / filteredDestinations.length
      : 0,
    [filteredDestinations]
  );

  const totalTrips = useMemo(() =>
    filteredDestinations.reduce((sum, d) => sum + d.tripCount, 0),
    [filteredDestinations]
  );

  // Chart data
  const topDestinationsByRevenue = sortedDestinations.slice(0, 10).map(d => ({
    name: d.locationKey,
    revenue: d.totalRevenue,
  }));

  const revenueDistribution = sortedDestinations.slice(0, 8).map(d => ({
    name: d.locationKey,
    value: d.totalRevenue,
  }));

  // Show welcome screen if no data
  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-6">🌍</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">No Destination Data Yet</h1>
          <p className="text-xl text-gray-600 mb-8">
            Add trip data to see destination ROI analysis
          </p>
          <Link
            href="/trips"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg"
          >
            Add Trips →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">🌍</span>
              <h1 className="text-3xl font-bold text-gray-900">Destination ROI Analysis</h1>
            </div>
            <p className="text-gray-600">
              Analyze profitability and performance across destinations
            </p>
          </div>
          <Link href="/trips" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Trips
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Destinations</div>
          <div className="text-3xl font-bold text-blue-600">{filteredDestinations.length}</div>
          <div className="text-xs text-gray-500 mt-1">{viewBy === 'country' ? 'Countries' : 'Cities'}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Trips</div>
          <div className="text-3xl font-bold text-gray-900">{totalTrips}</div>
          <div className="text-xs text-gray-500 mt-1">Across all destinations</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600">{formatCurrencyWithSymbol(totalRevenue, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">Commission earned</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Cost</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(totalCost, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">Trip expenses</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg ROI</div>
          <div className="text-3xl font-bold text-purple-600">{avgProfitMargin.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Return on investment</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Year Filter */}
          {years.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {/* View By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View By
            </label>
            <select
              value={viewBy}
              onChange={(e) => setViewBy(e.target.value as 'country' | 'city')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="country">Country</option>
              <option value="city">City</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Destinations
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field as 'revenue' | 'trips' | 'margin');
                setSortDirection(direction as 'asc' | 'desc');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="revenue-desc">Revenue (High to Low)</option>
              <option value="revenue-asc">Revenue (Low to High)</option>
              <option value="trips-desc">Trips (High to Low)</option>
              <option value="trips-asc">Trips (Low to High)</option>
              <option value="margin-desc">ROI (High to Low)</option>
              <option value="margin-asc">ROI (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Destinations by Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Destinations by Revenue</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topDestinationsByRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => formatCurrencyWithSymbol(Number(value), currency)} />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={revenueDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrencyWithSymbol(Number(value), currency)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trips
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Revenue/Trip
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDestinations.map((destination, index) => (
                <tr key={destination.locationKey} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{destination.locationKey}</div>
                    <div className="text-xs text-gray-500">{destination.totalTravelers} travelers</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{destination.tripCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrencyWithSymbol(destination.totalRevenue, currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-600">
                      {formatCurrencyWithSymbol(destination.avgRevenuePerTrip, currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {formatCurrencyWithSymbol(destination.totalCost, currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-bold ${
                      destination.profitMargin >= 15 ? 'text-green-600' :
                      destination.profitMargin >= 10 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {destination.profitMargin.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-600">
                      {destination.avgDuration.toFixed(1)} days
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedDestinations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No destinations match your filters</p>
        </div>
      )}

      {/* Insights Section */}
      {sortedDestinations.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-2">Highest ROI Destination</div>
              {(() => {
                const bestROI = [...sortedDestinations].sort((a, b) => b.profitMargin - a.profitMargin)[0];
                return bestROI ? (
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-green-600">{bestROI.locationKey}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {bestROI.profitMargin.toFixed(1)}% ROI
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-2">Most Popular Destination</div>
              {(() => {
                const mostPopular = [...sortedDestinations].sort((a, b) => b.tripCount - a.tripCount)[0];
                return mostPopular ? (
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-blue-600">{mostPopular.locationKey}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {mostPopular.tripCount} trips
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-2">Highest Revenue Destination</div>
              {(() => {
                const topRevenue = [...sortedDestinations].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
                return topRevenue ? (
                  <div className="text-sm text-gray-700">
                    <span className="font-bold text-purple-600">{topRevenue.locationKey}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatCurrencyWithSymbol(topRevenue.totalRevenue, currency)} earned
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
