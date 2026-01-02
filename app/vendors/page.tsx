"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';
import { Trip } from '@/data/trips';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrencyWithSymbol } from '@/lib/currency';

interface VendorStats {
  vendor: string;
  categories: Set<string>;
  totalSpend: number;
  tripCount: number;
  avgSpendPerTrip: number;
  trips: Trip[];
}

export default function VendorsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'spend' | 'trips' | 'name'>('spend');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const { currency } = useCurrency();

  useEffect(() => {
    setTrips(DataStore.getTrips());
  }, []);

  // Get unique years from trip start dates
  const years = useMemo(() => {
    const allYears = new Set<string>();
    trips.forEach(trip => {
      const year = new Date(trip.Start_Date).getFullYear().toString();
      allYears.add(year);
    });
    return Array.from(allYears).sort().reverse(); // Most recent first
  }, [trips]);

  // Aggregate vendor data
  const vendorStats = useMemo(() => {
    const statsMap = new Map<string, VendorStats>();

    // Filter trips by year first
    const filteredByYear = selectedYear === 'all'
      ? trips
      : trips.filter(trip => {
          const tripYear = new Date(trip.Start_Date).getFullYear().toString();
          return tripYear === selectedYear;
        });

    filteredByYear.forEach(trip => {
      const vendorFields = [
        { vendor: trip.Flight_Vendor, category: 'Flight', cost: trip.Flight_Cost },
        { vendor: trip.Hotel_Vendor, category: 'Hotel', cost: trip.Hotel_Cost },
        { vendor: trip.Ground_Transport_Vendor, category: 'Ground Transport', cost: trip.Ground_Transport },
        { vendor: trip.Activities_Vendor, category: 'Activities', cost: trip.Activities_Tours },
        { vendor: trip.Insurance_Vendor, category: 'Insurance', cost: trip.Insurance_Cost },
      ];

      vendorFields.forEach(({ vendor, category, cost }) => {
        if (vendor) {
          if (!statsMap.has(vendor)) {
            statsMap.set(vendor, {
              vendor,
              categories: new Set(),
              totalSpend: 0,
              tripCount: 0,
              avgSpendPerTrip: 0,
              trips: [],
            });
          }
          const stats = statsMap.get(vendor)!;
          stats.categories.add(category);
          stats.totalSpend += cost;
          if (!stats.trips.find(t => t.Trip_ID === trip.Trip_ID)) {
            stats.tripCount += 1;
            stats.trips.push(trip);
          }
        }
      });
    });

    // Calculate averages
    statsMap.forEach(stats => {
      stats.avgSpendPerTrip = stats.tripCount > 0 ? stats.totalSpend / stats.tripCount : 0;
    });

    return Array.from(statsMap.values());
  }, [trips, selectedYear]);

  // Filter by category
  const filteredVendors = useMemo(() => {
    let filtered = vendorStats;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.categories.has(selectedCategory));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => v.vendor.toLowerCase().includes(query));
    }

    return filtered;
  }, [vendorStats, selectedCategory, searchQuery]);

  // Sort vendors
  const sortedVendors = useMemo(() => {
    const sorted = [...filteredVendors];
    switch (sortBy) {
      case 'spend':
        return sorted.sort((a, b) => sortDirection === 'desc' ? b.totalSpend - a.totalSpend : a.totalSpend - b.totalSpend);
      case 'trips':
        return sorted.sort((a, b) => sortDirection === 'desc' ? b.tripCount - a.tripCount : a.tripCount - b.tripCount);
      case 'name':
        return sorted.sort((a, b) => sortDirection === 'desc' ? b.vendor.localeCompare(a.vendor) : a.vendor.localeCompare(b.vendor));
      default:
        return sorted;
    }
  }, [filteredVendors, sortBy, sortDirection]);

  // Calculate total stats
  const totalSpend = useMemo(() =>
    filteredVendors.reduce((sum, v) => sum + v.totalSpend, 0),
    [filteredVendors]
  );

  const totalTrips = useMemo(() => {
    const uniqueTrips = new Set<string>();
    filteredVendors.forEach(v => v.trips.forEach(t => uniqueTrips.add(t.Trip_ID)));
    return uniqueTrips.size;
  }, [filteredVendors]);

  const avgSpendPerVendor = useMemo(() =>
    filteredVendors.length > 0 ? totalSpend / filteredVendors.length : 0,
    [totalSpend, filteredVendors]
  );

  // Show welcome screen if no data
  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-6">🏢</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">No Vendor Data Yet</h1>
          <p className="text-xl text-gray-600 mb-8">
            Add trip data with vendor information to see analytics
          </p>
          <Link
            href="/data"
            className="inline-block px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold text-lg shadow-lg"
          >
            Add Trip Data →
          </Link>
        </div>
      </div>
    );
  }

  if (vendorStats.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-6">🏢</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">No Vendors Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your trips don't have vendor information yet. Add vendor data to your trips to see analytics.
          </p>
          <Link
            href="/trips"
            className="inline-block px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold text-lg shadow-lg"
          >
            View Trips →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <span className="text-3xl mr-3">🏢</span>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
        </div>
        <p className="text-gray-600">
          Analyze your vendor relationships and spending patterns
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Vendors</div>
          <div className="text-3xl font-bold text-purple-600">{filteredVendors.length}</div>
          <div className="text-xs text-gray-500 mt-1">Unique suppliers</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Spend</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(totalSpend, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">Across all vendors</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg Per Vendor</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(avgSpendPerVendor, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">Average spending</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Trips Tracked</div>
          <div className="text-3xl font-bold text-gray-900">{totalTrips}</div>
          <div className="text-xs text-gray-500 mt-1">With vendor data</div>
        </div>
      </div>

      {/* Filters and Search */}
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

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Vendors
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by vendor name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Flight">Flight</option>
              <option value="Hotel">Hotel</option>
              <option value="Ground Transport">Ground Transport</option>
              <option value="Activities">Activities</option>
              <option value="Insurance">Insurance</option>
            </select>
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
                setSortBy(field as 'spend' | 'trips' | 'name');
                setSortDirection(direction as 'asc' | 'desc');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="spend-desc">Total Spend (High to Low)</option>
              <option value="spend-asc">Total Spend (Low to High)</option>
              <option value="trips-desc">Trip Count (High to Low)</option>
              <option value="trips-asc">Trip Count (Low to High)</option>
              <option value="name-asc">Vendor Name (A-Z)</option>
              <option value="name-desc">Vendor Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spend
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Per Trip
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedVendors.map((vendor) => (
                <tr key={vendor.vendor} className="hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{vendor.vendor}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(vendor.categories).map(cat => (
                        <span
                          key={cat}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrencyWithSymbol(vendor.totalSpend, currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{vendor.tripCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-600">
                      {formatCurrencyWithSymbol(vendor.avgSpendPerTrip, currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-purple-600">
                      {totalSpend > 0 ? ((vendor.totalSpend / totalSpend) * 100).toFixed(1) : 0}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedVendors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No vendors match your filters</p>
        </div>
      )}
    </div>
  );
}
