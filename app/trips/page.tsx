"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';
import { Trip } from '@/data/trips';
import { formatDateRange, filterTrips } from '@/lib/utils';
import { useTier } from '@/contexts/TierContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrencyWithSymbol } from '@/lib/currency';
import TrialExpiredScreen from '@/components/TrialExpiredScreen';
import * as XLSX from 'xlsx';
import { EnhancedReportGenerator, WhiteLabelConfig } from '@/lib/enhancedReportGenerator';

type SortField = 'tripId' | 'clientName' | 'agency' | 'destination' | 'date' | 'travelers' | 'totalCost' | 'costPerTraveler';
type SortDirection = 'asc' | 'desc';

export default function TripsOverview() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('tripId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { currentTier, isTrialExpired, isSignedIn } = useTier();
  const { currency } = useCurrency();

  // Load trips on mount
  useEffect(() => {
    setTrips(DataStore.getTrips());
  }, []);

  // AUTHENTICATION CHECK - Redirect non-logged-in users to homepage
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  // Check if user has access to advanced filters
  const hasAdvancedFilters = currentTier === 'standard' || currentTier === 'premium';

  // Get unique values for filters
  const agencies = useMemo(() => Array.from(new Set(trips.map(t => t.Travel_Agency))).sort(), [trips]);
  const countries = useMemo(() => Array.from(new Set(trips.map(t => t.Destination_Country))).sort(), [trips]);
  const vendors = useMemo(() => {
    const allVendors = new Set<string>();
    trips.forEach(trip => {
      if (trip.Flight_Vendor) allVendors.add(trip.Flight_Vendor);
      if (trip.Hotel_Vendor) allVendors.add(trip.Hotel_Vendor);
      if (trip.Ground_Transport_Vendor) allVendors.add(trip.Ground_Transport_Vendor);
      if (trip.Activities_Vendor) allVendors.add(trip.Activities_Vendor);
      if (trip.Insurance_Vendor) allVendors.add(trip.Insurance_Vendor);
    });
    return Array.from(allVendors).sort();
  }, [trips]);

  // Get unique years from trip start dates
  const years = useMemo(() => {
    const allYears = new Set<string>();
    trips.forEach(trip => {
      const year = new Date(trip.Start_Date).getFullYear().toString();
      allYears.add(year);
    });
    return Array.from(allYears).sort().reverse(); // Most recent first
  }, [trips]);

  // Apply filters
  const filteredTrips = useMemo(() => {
    let filtered = filterTrips(trips, {
      agencies: selectedAgencies.length > 0 ? selectedAgencies : undefined,
      countries: selectedCountries.length > 0 ? selectedCountries : undefined,
    });

    // Vendor filter
    if (selectedVendors.length > 0) {
      filtered = filtered.filter(trip =>
        selectedVendors.includes(trip.Flight_Vendor || '') ||
        selectedVendors.includes(trip.Hotel_Vendor || '') ||
        selectedVendors.includes(trip.Ground_Transport_Vendor || '') ||
        selectedVendors.includes(trip.Activities_Vendor || '') ||
        selectedVendors.includes(trip.Insurance_Vendor || '')
      );
    }

    // Year filter (available to all tiers)
    if (selectedYear !== 'all') {
      filtered = filtered.filter(trip => {
        const tripYear = new Date(trip.Start_Date).getFullYear().toString();
        return tripYear === selectedYear;
      });
    }

    // Advanced search (Standard/Premium only)
    if (hasAdvancedFilters && searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip =>
        trip.Trip_ID.toLowerCase().includes(query) ||
        trip.Client_Name.toLowerCase().includes(query) ||
        trip.Destination_City.toLowerCase().includes(query) ||
        trip.Destination_Country.toLowerCase().includes(query)
      );
    }

    // Advanced date range filter (Standard/Premium only)
    if (hasAdvancedFilters && (dateRange.start || dateRange.end)) {
      filtered = filtered.filter(trip => {
        const tripStart = new Date(trip.Start_Date);
        if (dateRange.start && tripStart < new Date(dateRange.start)) return false;
        if (dateRange.end && tripStart > new Date(dateRange.end)) return false;
        return true;
      });
    }

    return filtered;
  }, [trips, selectedAgencies, selectedCountries, selectedVendors, selectedYear, searchQuery, dateRange, hasAdvancedFilters]);

  // Sort trips
  const sortedTrips = useMemo(() => {
    const sorted = [...filteredTrips];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'tripId':
          compareValue = a.Trip_ID.localeCompare(b.Trip_ID);
          break;
        case 'clientName':
          compareValue = a.Client_Name.localeCompare(b.Client_Name);
          break;
        case 'agency':
          compareValue = a.Travel_Agency.localeCompare(b.Travel_Agency);
          break;
        case 'destination':
          compareValue = `${a.Destination_City}, ${a.Destination_Country}`.localeCompare(
            `${b.Destination_City}, ${b.Destination_Country}`
          );
          break;
        case 'date':
          compareValue = new Date(a.Start_Date).getTime() - new Date(b.Start_Date).getTime();
          break;
        case 'travelers':
          compareValue = a.Total_Travelers - b.Total_Travelers;
          break;
        case 'totalCost':
          compareValue = a.Trip_Total_Cost - b.Trip_Total_Cost;
          break;
        case 'costPerTraveler':
          compareValue = a.Cost_Per_Traveler - b.Cost_Per_Traveler;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [filteredTrips, sortField, sortDirection]);

  // Calculate KPIs
  const totalRevenue = useMemo(() =>
    filteredTrips.reduce((sum, trip) => sum + (trip.Agency_Revenue || 0), 0),
    [filteredTrips]
  );

  const totalTripCosts = useMemo(() =>
    filteredTrips.reduce((sum, trip) => sum + trip.Trip_Total_Cost, 0),
    [filteredTrips]
  );

  const avgTripValue = useMemo(() =>
    filteredTrips.length > 0 ? totalTripCosts / filteredTrips.length : 0,
    [totalTripCosts, filteredTrips]
  );

  const avgCostPerTraveler = useMemo(() =>
    filteredTrips.length > 0
      ? filteredTrips.reduce((sum, trip) => sum + trip.Cost_Per_Traveler, 0) / filteredTrips.length
      : 0,
    [filteredTrips]
  );

  const toggleAgency = (agency: string) => {
    setSelectedAgencies(prev =>
      prev.includes(agency) ? prev.filter(a => a !== agency) : [...prev, agency]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const toggleVendor = (vendor: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendor) ? prev.filter(v => v !== vendor) : [...prev, vendor]
    );
  };

  const clearFilters = () => {
    setSelectedAgencies([]);
    setSelectedCountries([]);
    setSelectedVendors([]);
    setSelectedYear('all');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field - default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (filteredTrips.length === 0) return;

    // Helper function to escape CSV values (handles commas, quotes, newlines)
    const escapeCSV = (value: string | number): string => {
      const str = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Trip_ID', 'Client_Name', 'Travel_Agency', 'Start_Date', 'End_Date',
      'Destination_Country', 'Destination_City', 'Adults', 'Children', 'Total_Travelers',
      'Flight_Cost', 'Hotel_Cost', 'Ground_Transport', 'Activities_Tours',
      'Meals_Cost', 'Insurance_Cost', 'Other_Costs', 'Trip_Total_Cost',
      'Cost_Per_Traveler', 'Agency_Revenue', 'Commission_Type', 'Commission_Value', 'Notes',
      'Flight_Vendor', 'Hotel_Vendor', 'Ground_Transport_Vendor', 'Activities_Vendor', 'Insurance_Vendor'
    ];

    const rows = filteredTrips.map(trip => [
      escapeCSV(trip.Trip_ID),
      escapeCSV(trip.Client_Name),
      escapeCSV(trip.Travel_Agency),
      escapeCSV(trip.Start_Date),
      escapeCSV(trip.End_Date),
      escapeCSV(trip.Destination_Country),
      escapeCSV(trip.Destination_City),
      escapeCSV(trip.Adults),
      escapeCSV(trip.Children),
      escapeCSV(trip.Total_Travelers),
      escapeCSV(formatCurrencyWithSymbol(trip.Flight_Cost, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Hotel_Cost, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Ground_Transport, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Activities_Tours, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Meals_Cost, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Insurance_Cost, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Other_Costs, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Trip_Total_Cost, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency)),
      escapeCSV(formatCurrencyWithSymbol(trip.Agency_Revenue || 0, currency)),
      escapeCSV(trip.Commission_Type || ''),
      escapeCSV(trip.Commission_Value || ''),
      escapeCSV(trip.Notes || ''),
      escapeCSV(trip.Flight_Vendor || ''),
      escapeCSV(trip.Hotel_Vendor || ''),
      escapeCSV(trip.Ground_Transport_Vendor || ''),
      escapeCSV(trip.Activities_Vendor || ''),
      escapeCSV(trip.Insurance_Vendor || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-trips-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (filteredTrips.length === 0) return;

    // Create worksheet data with headers
    const worksheetData = [
      ['Trip_ID', 'Client_Name', 'Travel_Agency', 'Start_Date', 'End_Date',
       'Destination_Country', 'Destination_City', 'Adults', 'Children', 'Total_Travelers',
       'Flight_Cost', 'Hotel_Cost', 'Ground_Transport', 'Activities_Tours',
       'Meals_Cost', 'Insurance_Cost', 'Other_Costs', 'Trip_Total_Cost',
       'Cost_Per_Traveler', 'Agency_Revenue', 'Commission_Type', 'Commission_Value', 'Notes',
       'Flight_Vendor', 'Hotel_Vendor', 'Ground_Transport_Vendor', 'Activities_Vendor', 'Insurance_Vendor'],
      ...filteredTrips.map(trip => [
        trip.Trip_ID,
        trip.Client_Name,
        trip.Travel_Agency,
        trip.Start_Date,
        trip.End_Date,
        trip.Destination_Country,
        trip.Destination_City,
        trip.Adults,
        trip.Children,
        trip.Total_Travelers,
        formatCurrencyWithSymbol(trip.Flight_Cost, currency),
        formatCurrencyWithSymbol(trip.Hotel_Cost, currency),
        formatCurrencyWithSymbol(trip.Ground_Transport, currency),
        formatCurrencyWithSymbol(trip.Activities_Tours, currency),
        formatCurrencyWithSymbol(trip.Meals_Cost, currency),
        formatCurrencyWithSymbol(trip.Insurance_Cost, currency),
        formatCurrencyWithSymbol(trip.Other_Costs, currency),
        formatCurrencyWithSymbol(trip.Trip_Total_Cost, currency),
        formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency),
        formatCurrencyWithSymbol(trip.Agency_Revenue || 0, currency),
        trip.Commission_Type || '',
        trip.Commission_Value || '',
        trip.Notes || '',
        trip.Flight_Vendor || '',
        trip.Hotel_Vendor || '',
        trip.Ground_Transport_Vendor || '',
        trip.Activities_Vendor || '',
        trip.Insurance_Vendor || ''
      ])
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 10 }, // Trip_ID
      { wch: 20 }, // Client_Name
      { wch: 20 }, // Travel_Agency
      { wch: 12 }, // Start_Date
      { wch: 12 }, // End_Date
      { wch: 18 }, // Destination_Country
      { wch: 18 }, // Destination_City
      { wch: 8 },  // Adults
      { wch: 8 },  // Children
      { wch: 14 }, // Total_Travelers
      { wch: 12 }, // Flight_Cost
      { wch: 12 }, // Hotel_Cost
      { wch: 15 }, // Ground_Transport
      { wch: 15 }, // Activities_Tours
      { wch: 12 }, // Meals_Cost
      { wch: 14 }, // Insurance_Cost
      { wch: 12 }, // Other_Costs
      { wch: 15 }, // Trip_Total_Cost
      { wch: 16 }, // Cost_Per_Traveler
      { wch: 15 }, // Agency_Revenue
      { wch: 16 }, // Commission_Type
      { wch: 16 }, // Commission_Value
      { wch: 30 }, // Notes
      { wch: 20 }, // Flight_Vendor
      { wch: 20 }, // Hotel_Vendor
      { wch: 25 }, // Ground_Transport_Vendor
      { wch: 20 }, // Activities_Vendor
      { wch: 20 }  // Insurance_Vendor
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'All Trips');

    // Generate file and trigger download
    XLSX.writeFile(wb, `all-trips-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('CSV file appears to be empty');
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim());
      const newTrips: Trip[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const tripData: any = {};

          headers.forEach((header, index) => {
            tripData[header] = values[index] || '';
          });

          // Create trip object with required fields
          const trip: Trip = {
            Trip_ID: tripData.Trip_ID || `IMP-${Date.now()}-${i}`,
            Client_Name: tripData.Client_Name || 'Unknown Client',
            Travel_Agency: tripData.Travel_Agency || 'Unknown Agency',
            Start_Date: tripData.Start_Date || new Date().toISOString().split('T')[0],
            End_Date: tripData.End_Date || new Date().toISOString().split('T')[0],
            Destination_Country: tripData.Destination_Country || 'Unknown',
            Destination_City: tripData.Destination_City || 'Unknown',
            Adults: parseInt(tripData.Adults) || 1,
            Children: parseInt(tripData.Children) || 0,
            Total_Travelers: parseInt(tripData.Total_Travelers) || 1,
            Flight_Cost: parseFloat(tripData.Flight_Cost?.replace(/[^0-9.-]/g, '')) || 0,
            Hotel_Cost: parseFloat(tripData.Hotel_Cost?.replace(/[^0-9.-]/g, '')) || 0,
            Ground_Transport: parseFloat(tripData.Ground_Transport?.replace(/[^0-9.-]/g, '')) || 0,
            Activities_Tours: parseFloat(tripData.Activities_Tours?.replace(/[^0-9.-]/g, '')) || 0,
            Meals_Cost: parseFloat(tripData.Meals_Cost?.replace(/[^0-9.-]/g, '')) || 0,
            Insurance_Cost: parseFloat(tripData.Insurance_Cost?.replace(/[^0-9.-]/g, '')) || 0,
            Other_Costs: parseFloat(tripData.Other_Costs?.replace(/[^0-9.-]/g, '')) || 0,
            Trip_Total_Cost: parseFloat(tripData.Trip_Total_Cost?.replace(/[^0-9.-]/g, '')) || 0,
            Cost_Per_Traveler: parseFloat(tripData.Cost_Per_Traveler?.replace(/[^0-9.-]/g, '')) || 0,
            Agency_Revenue: parseFloat(tripData.Agency_Revenue?.replace(/[^0-9.-]/g, '')) || 0,
            Commission_Type: tripData.Commission_Type || 'Fixed',
            Commission_Value: tripData.Commission_Value || '',
            Notes: tripData.Notes || '',
            Flight_Vendor: tripData.Flight_Vendor || '',
            Hotel_Vendor: tripData.Hotel_Vendor || '',
            Ground_Transport_Vendor: tripData.Ground_Transport_Vendor || '',
            Activities_Vendor: tripData.Activities_Vendor || '',
            Insurance_Vendor: tripData.Insurance_Vendor || ''
          };

          newTrips.push(trip);
          successCount++;
        } catch (error) {
          console.error(`Error parsing line ${i + 1}:`, error);
          errorCount++;
        }
      }

      if (newTrips.length > 0) {
        const existingTrips = DataStore.getTrips();
        const allTrips = [...existingTrips, ...newTrips];
        DataStore.setTrips(allTrips);
        setTrips(allTrips);
        alert(`✅ Import Complete!\n\nSuccessfully imported: ${successCount} trips\nErrors: ${errorCount}\n\nThe page will refresh to show your imported data.`);
        window.location.reload();
      } else {
        alert('No valid trips found in CSV file');
      }
    };

    reader.onerror = () => {
      alert('Error reading file');
    };

    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  const handleExportPDF = () => {
    if (filteredTrips.length === 0) return;

    try {
      // Load white-label config if Premium user
      let whiteLabelConfig: WhiteLabelConfig | undefined;
      if (currentTier === 'premium') {
        const stored = localStorage.getItem('voyagriq-white-label');
        if (stored) {
          const config = JSON.parse(stored);
          whiteLabelConfig = {
            companyName: config.companyName,
            logoUrl: config.logo, // Note: settings page stores as 'logo', not 'logoUrl'
            primaryColor: config.primaryColor,
            secondaryColor: config.secondaryColor,
            accentColor: config.accentColor,
          };
        }
      }

      // Generate enhanced report
      const reportGenerator = new EnhancedReportGenerator(
        filteredTrips,
        currentTier,
        whiteLabelConfig,
        currency
      );

      reportGenerator.generate();
      reportGenerator.save();
    } catch (error) {
      console.error('=== ERROR GENERATING PDF ===');
      console.error('Error:', error);
      console.error('Stack:', (error as Error).stack);
      alert('Error generating PDF: ' + (error as Error).message + '\n\nCheck console for details.');
    }
  };

  // Block access if not signed in (show nothing while redirecting)
  if (!isSignedIn) {
    return null;
  }

  // Block access if trial expired
  if (isTrialExpired) {
    return <TrialExpiredScreen />;
  }

  // Show welcome screen if no data
  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">No Trips Yet</h1>
          <p className="text-xl text-gray-600 mb-8">
            Get started by adding your trip data to see analytics and insights
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/data"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg"
            >
              Add Your First Trip →
            </Link>

            <label className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg shadow-lg cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import from CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-3">💡 Quick Start Tips</h3>
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li>• <strong>Add manually:</strong> Click "Add Your First Trip" to enter trip details one by one</li>
              <li>• <strong>Import CSV:</strong> Upload a CSV file with your existing trip data for bulk import</li>
              <li>• <strong>Load samples:</strong> Use Dev Mode (Account page) to load sample data for testing</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Trips</h1>
          <p className="mt-2 text-gray-600">
            View and analyze all trip bookings across your agencies
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
          {filteredTrips.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            <button
              onClick={handleExportExcel}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue (Commission)</div>
          <div className="text-3xl font-bold text-green-600">{formatCurrencyWithSymbol(totalRevenue, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Agency earnings
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Trip Costs</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(totalTripCosts, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">
            All trip expenses
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Average Trip Value</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(avgTripValue, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg Cost Per Traveler</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(avgCostPerTraveler, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Across all travelers
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Filters
            {hasAdvancedFilters && (
              <span className="ml-2 text-xs font-normal text-purple-600 bg-purple-50 px-2 py-1 rounded">
                Advanced
              </span>
            )}
          </h2>
          {(selectedAgencies.length > 0 || selectedCountries.length > 0 || selectedVendors.length > 0 || selectedYear !== 'all' || searchQuery || dateRange.start || dateRange.end) && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Year Filter - Available to all tiers */}
        {years.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        {/* Advanced Search - Standard/Premium Only */}
        {hasAdvancedFilters && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Trips
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Trip ID, Client Name, or Destination..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}

        {/* Advanced Date Range - Standard/Premium Only */}
        {hasAdvancedFilters && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (From)
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (To)
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Upgrade CTA for Free/Starter */}
        {!hasAdvancedFilters && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Unlock Advanced Search & Filters
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  Upgrade to Standard to search by client name, trip ID, destination, and filter by date ranges.
                </p>
                <Link href="/pricing" className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                  Upgrade to Standard →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Agency Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Agency
            </label>
            <div className="space-y-2">
              {agencies.map(agency => (
                <label key={agency} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAgencies.includes(agency)}
                    onChange={() => toggleAgency(agency)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{agency}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Country
            </label>
            <div className="space-y-2">
              {countries.map(country => (
                <label key={country} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country)}
                    onChange={() => toggleCountry(country)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vendor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor/Supplier
              <span className="ml-2 text-xs font-normal text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                New
              </span>
            </label>
            {vendors.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {vendors.map(vendor => (
                  <label key={vendor} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor)}
                      onChange={() => toggleVendor(vendor)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{vendor}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No vendor data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('tripId')}
                >
                  <div className="flex items-center gap-2">
                    Trip ID
                    {sortField === 'tripId' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('clientName')}
                >
                  <div className="flex items-center gap-2">
                    Client Name
                    {sortField === 'clientName' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('agency')}
                >
                  <div className="flex items-center gap-2">
                    Travel Agency
                    {sortField === 'agency' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('destination')}
                >
                  <div className="flex items-center gap-2">
                    Destination
                    {sortField === 'destination' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Dates
                    {sortField === 'date' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('travelers')}
                >
                  <div className="flex items-center gap-2">
                    Travelers
                    {sortField === 'travelers' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('totalCost')}
                >
                  <div className="flex items-center gap-2">
                    Total Cost
                    {sortField === 'totalCost' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('costPerTraveler')}
                >
                  <div className="flex items-center gap-2">
                    Cost/Traveler
                    {sortField === 'costPerTraveler' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No trips found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                sortedTrips.map(trip => (
                  <tr key={trip.Trip_ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.Trip_ID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.Client_Name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trip.Travel_Agency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trip.Destination_City}, {trip.Destination_Country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateRange(trip.Start_Date, trip.End_Date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trip.Total_Travelers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrencyWithSymbol(trip.Trip_Total_Cost, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/trips/${trip.Trip_ID}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
