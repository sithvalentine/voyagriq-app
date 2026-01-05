"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';
import { Trip } from '@/data/trips';
import {
  formatDateRange,
  calculateTripDays,
  calculateCostPerDay,
  getCategoryBreakdown,
  analyzeTripInsights,
  findOptimizationOpportunities,
} from '@/lib/utils';
import { generateTripReportPDF } from '@/lib/pdfGenerator';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription';
import { useTier } from '@/contexts/TierContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrencyWithSymbol } from '@/lib/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import { COUNTRIES } from '@/lib/countries';

export default function TripDetail() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { currentTier } = useTier();
  const { currency } = useCurrency();

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log('[Trip Detail] No user found, falling back to localStorage');
          const trips = DataStore.getTrips();
          setAllTrips(trips);
          setTrip(trips.find(t => t.Trip_ID === tripId));
          return;
        }

        // Fetch all trips from Supabase for comparison data
        const { data: dbTrips, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Trip Detail] Error loading trips:', error);
          const trips = DataStore.getTrips();
          setAllTrips(trips);
          setTrip(trips.find(t => t.Trip_ID === tripId));
          return;
        }

        // Convert database trips to Trip format (same conversion as trips page)
        const convertedTrips: Trip[] = (dbTrips || []).map((dbTrip: any) => {
          const tripTotalCost = (dbTrip.trip_total_cost || 0) / 100;
          const totalTravelers = dbTrip.total_travelers || 1;

          return {
            Trip_ID: dbTrip.trip_id,
            Client_Name: dbTrip.client_name,
            Travel_Agency: dbTrip.travel_agency || '',
            Start_Date: dbTrip.start_date,
            End_Date: dbTrip.end_date,
            Destination_Country: dbTrip.destination_country,
            Destination_City: dbTrip.destination_city || '',
            Adults: dbTrip.adults || 0,
            Children: dbTrip.children || 0,
            Total_Travelers: totalTravelers,
            Flight_Cost: (dbTrip.flight_cost || 0) / 100,
            Hotel_Cost: (dbTrip.hotel_cost || 0) / 100,
            Ground_Transport: (dbTrip.ground_transport || 0) / 100,
            Activities_Tours: (dbTrip.activities_tours || 0) / 100,
            Meals_Cost: (dbTrip.meals_cost || 0) / 100,
            Insurance_Cost: (dbTrip.insurance_cost || 0) / 100,
            Other_Costs: (dbTrip.other_costs || 0) / 100,
            Trip_Total_Cost: tripTotalCost,
            Cost_Per_Traveler: tripTotalCost / totalTravelers,
            Currency: dbTrip.currency || 'USD',
            Commission_Type: dbTrip.commission_rate ? 'percentage' : undefined,
            Commission_Value: dbTrip.commission_rate || undefined,
            Agency_Revenue: (dbTrip.commission_amount || 0) / 100,
            Client_ID: dbTrip.client_id || '',
            Client_Type: dbTrip.client_type || 'individual',
            Notes: '',
          };
        });

        console.log(`[Trip Detail] Loaded ${convertedTrips.length} trips from database`);
        setAllTrips(convertedTrips);
        setTrip(convertedTrips.find(t => t.Trip_ID === tripId));
      } catch (error) {
        console.error('[Trip Detail] Error in loadTrip:', error);
        const trips = DataStore.getTrips();
        setAllTrips(trips);
        setTrip(trips.find(t => t.Trip_ID === tripId));
      }
    };

    loadTrip();
  }, [tripId]);

  const handleExportPDF = () => {
    if (trip) {
      const includeBI = currentTier === 'standard' || currentTier === 'premium';
      generateTripReportPDF(trip, allTrips, currentTier, {
        includeBusinessIntelligence: includeBI,
        agencyName: trip.Travel_Agency,
        currency: currency
      });
    }
  };

  const handleExportCSV = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!trip) return;
    e.currentTarget.blur();

    const headers = [
      'Trip_ID', 'Client_Name', 'Travel_Agency', 'Start_Date', 'End_Date',
      'Destination_Country', 'Destination_City', 'Adults', 'Children', 'Total_Travelers',
      'Flight_Cost', 'Hotel_Cost', 'Ground_Transport', 'Activities_Tours',
      'Meals_Cost', 'Insurance_Cost', 'Other_Costs', 'Trip_Total_Cost',
      'Cost_Per_Traveler', 'Agency_Revenue', 'Commission_Type', 'Commission_Value', 'Notes',
      'Flight_Vendor', 'Hotel_Vendor', 'Ground_Transport_Vendor', 'Activities_Vendor', 'Insurance_Vendor'
    ];

    // Helper function to escape CSV values (handles commas, quotes, newlines)
    const escapeCSV = (value: string | number): string => {
      const str = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const row = [
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
    ];

    const csvContent = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip-${trip.Trip_ID}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!trip) return;

    if (!confirm(`Are you sure you want to delete trip ${trip.Trip_ID}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please log in to delete trips');
        return;
      }

      // Delete from Supabase
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('user_id', user.id)
        .eq('trip_id', trip.Trip_ID);

      if (error) {
        console.error('Error deleting trip:', error);
        alert(`Failed to delete trip: ${error.message}`);
        return;
      }

      // Also delete from localStorage for backwards compatibility
      DataStore.deleteTrip(trip.Trip_ID);

      router.push('/trips');
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditSave = (updatedTrip: Trip) => {
    DataStore.updateTrip(trip!.Trip_ID, updatedTrip);
    setTrip(updatedTrip);
    setIsEditing(false);
    // Refresh all trips for comparison
    setAllTrips(DataStore.getTrips());
  };

  const handleExportExcel = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!trip) return;
    e.currentTarget.blur();

    const wb = XLSX.utils.book_new();

    // Sheet 1: Trip Summary
    const summaryData = [
      ['TRIP COST REPORT'],
      [''],
      ['Trip Information'],
      ['Trip ID', trip.Trip_ID],
      ['Client Name', trip.Client_Name],
      ['Travel Agency', trip.Travel_Agency],
      ['Destination', `${trip.Destination_City}, ${trip.Destination_Country}`],
      ['Travel Dates', `${trip.Start_Date} to ${trip.End_Date}`],
      ['Total Travelers', trip.Total_Travelers],
      ['Adults', trip.Adults],
      ['Children', trip.Children],
      [''],
      ['Cost Breakdown', 'Amount', '% of Total'],
      ['Flight', formatCurrencyWithSymbol(trip.Flight_Cost, currency), `${((trip.Flight_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
      ['Hotel', formatCurrencyWithSymbol(trip.Hotel_Cost, currency), `${((trip.Hotel_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
      ['Ground Transport', formatCurrencyWithSymbol(trip.Ground_Transport, currency), `${((trip.Ground_Transport / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
      ['Activities & Tours', formatCurrencyWithSymbol(trip.Activities_Tours, currency), `${((trip.Activities_Tours / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
      ['Meals', formatCurrencyWithSymbol(trip.Meals_Cost, currency), `${((trip.Meals_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
      ['Insurance', formatCurrencyWithSymbol(trip.Insurance_Cost, currency), `${((trip.Insurance_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
      ['Other', formatCurrencyWithSymbol(trip.Other_Costs, currency), `${((trip.Other_Costs / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
      [''],
      ['TOTAL TRIP COST', formatCurrencyWithSymbol(trip.Trip_Total_Cost, currency)],
      ['Cost Per Traveler', formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency)],
      [''],
    ];

    if (trip.Agency_Revenue) {
      const commissionLabel = trip.Commission_Type === 'percentage'
        ? `Agency Commission (${trip.Commission_Value}%)`
        : 'Agency Flat Fee Commission';
      summaryData.push([commissionLabel, formatCurrencyWithSymbol(trip.Agency_Revenue, currency)]);
      summaryData.push(['Commission Rate', `${((trip.Agency_Revenue / trip.Trip_Total_Cost) * 100).toFixed(1)}%`]);
    }

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Sheet 2: Analytics
    const tripDays = Math.ceil((new Date(trip.End_Date).getTime() - new Date(trip.Start_Date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const costPerDay = trip.Trip_Total_Cost / tripDays;

    const analyticsData = [
      ['TRIP ANALYTICS'],
      [''],
      ['Trip Duration', `${tripDays} days`],
      ['Cost Per Day', formatCurrencyWithSymbol(costPerDay, currency)],
      ['Cost Per Traveler', formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency)],
      ['Average Daily Cost Per Person', formatCurrencyWithSymbol(costPerDay / trip.Total_Travelers, currency)],
      [''],
      ['Top Spending Categories'],
      ['Category', 'Amount', 'Rank'],
    ];

    const categories = [
      { name: 'Flight', amount: trip.Flight_Cost },
      { name: 'Hotel', amount: trip.Hotel_Cost },
      { name: 'Activities', amount: trip.Activities_Tours },
      { name: 'Ground Transport', amount: trip.Ground_Transport },
      { name: 'Meals', amount: trip.Meals_Cost },
      { name: 'Insurance', amount: trip.Insurance_Cost },
      { name: 'Other', amount: trip.Other_Costs },
    ];

    categories
      .sort((a, b) => b.amount - a.amount)
      .forEach((cat, idx) => {
        analyticsData.push([cat.name, formatCurrencyWithSymbol(cat.amount, currency), `#${idx + 1}`]);
      });

    const wsAnalytics = XLSX.utils.aoa_to_sheet(analyticsData);
    wsAnalytics['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsAnalytics, 'Analytics');

    // Sheet 3: Business Intelligence (Standard/Premium only)
    if (currentTier === 'standard' || currentTier === 'premium') {
      const insights = analyzeTripInsights(trip, allTrips);
      const opportunities = findOptimizationOpportunities(trip, allTrips);

      const biData = [
        ['BUSINESS INTELLIGENCE INSIGHTS'],
        [''],
        ['Executive Summary'],
        [`This ${tripDays}-day trip to ${trip.Destination_City}, ${trip.Destination_Country} generated $${(trip.Agency_Revenue || 0).toLocaleString()} in commission`],
        [`(${((trip.Agency_Revenue || 0) / trip.Trip_Total_Cost * 100).toFixed(1)}% of total trip cost). Daily cost: $${costPerDay.toFixed(0)}. Cost efficiency: ${insights.costEfficiency}.`],
        [''],
        ['Key Performance Indicators'],
        ['Metric', 'Value', 'Status'],
        ['Cost Efficiency', insights.costEfficiency, insights.costEfficiency === 'Excellent' || insights.costEfficiency === 'Good' ? '✓ Good' : '⚠ Review'],
        ['Hotel/Flight Ratio', `${insights.hotelToFlightRatio.toFixed(2)}x`, insights.hotelToFlightRatio > 2 ? 'High' : insights.hotelToFlightRatio < 0.5 ? 'Low' : 'Optimal'],
        ['Activities Investment', `$${insights.experienceInvestment.toLocaleString()}`, `${((insights.experienceInvestment / trip.Trip_Total_Cost) * 100).toFixed(0)}% of total`],
        [''],
        ['Optimization Opportunities'],
        ['Priority', 'Category', 'Recommendation', 'Potential Savings'],
      ];

      opportunities.slice(0, 5).forEach(opp => {
        biData.push([
          opp.priority,
          opp.category,
          opp.recommendation,
          opp.potentialSaving ? `$${opp.potentialSaving.toLocaleString()}` : 'N/A'
        ]);
      });

      if (opportunities.length === 0) {
        biData.push(['✓', 'No major optimization opportunities found', 'This trip is well-optimized!', '']);
      }

      const wsBi = XLSX.utils.aoa_to_sheet(biData);
      wsBi['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 60 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, wsBi, 'Business Intelligence');
    }

    // Sheet 4: Raw Data
    const rawData = [
      ['COMPLETE TRIP DATA'],
      [''],
      ['Field', 'Value'],
      ['Trip ID', trip.Trip_ID],
      ['Client Name', trip.Client_Name],
      ['Travel Agency', trip.Travel_Agency],
      ['Start Date', trip.Start_Date],
      ['End Date', trip.End_Date],
      ['Destination Country', trip.Destination_Country],
      ['Destination City', trip.Destination_City],
      ['Adults', trip.Adults],
      ['Children', trip.Children],
      ['Total Travelers', trip.Total_Travelers],
      [''],
      ['Cost Category', 'Amount'],
      ['Flight Cost', trip.Flight_Cost],
      ['Hotel Cost', trip.Hotel_Cost],
      ['Ground Transport', trip.Ground_Transport],
      ['Activities & Tours', trip.Activities_Tours],
      ['Meals Cost', trip.Meals_Cost],
      ['Insurance Cost', trip.Insurance_Cost],
      ['Other Costs', trip.Other_Costs],
      [''],
      ['Vendor/Supplier', 'Name'],
      ['Flight Vendor', trip.Flight_Vendor || 'N/A'],
      ['Hotel Vendor', trip.Hotel_Vendor || 'N/A'],
      ['Ground Transport Vendor', trip.Ground_Transport_Vendor || 'N/A'],
      ['Activities Vendor', trip.Activities_Vendor || 'N/A'],
      ['Insurance Vendor', trip.Insurance_Vendor || 'N/A'],
      [''],
      ['TOTALS'],
      ['Trip Total Cost', trip.Trip_Total_Cost],
      ['Cost Per Traveler', trip.Cost_Per_Traveler],
      ['Agency Revenue', trip.Agency_Revenue || 0],
      ['Commission Type', trip.Commission_Type || 'N/A'],
      ['Commission Value', trip.Commission_Value || 'N/A'],
      [''],
      ['Notes', trip.Notes || 'None'],
    ];

    const wsRaw = XLSX.utils.aoa_to_sheet(rawData);
    wsRaw['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw Data');

    // Generate file and trigger download
    const filename = `trip-${trip.Trip_ID}-${trip.Client_Name.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  if (!trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Back to All Trips
          </Link>
        </div>
      </div>
    );
  }

  const tripDays = calculateTripDays(trip.Start_Date, trip.End_Date);
  const costPerDay = calculateCostPerDay(trip);
  const categoryBreakdown = getCategoryBreakdown(trip);
  const insights = analyzeTripInsights(trip, allTrips);
  const opportunities = findOptimizationOpportunities(trip, allTrips);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link href="/trips" className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-6 inline-block">
        ← Back to All Trips
      </Link>

      {/* Trip Summary Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trip Cost Analysis Report
            </h1>
            <div className="text-sm text-gray-500">
              Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Trip
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <div className="w-px h-8 bg-gray-300"></div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">Trip ID</div>
              <div className="text-2xl font-bold text-gray-900">{trip.Trip_ID}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Client Name</div>
            <div className="text-sm font-semibold text-gray-900">{trip.Client_Name}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Travel Agency</div>
            <div className="text-sm font-semibold text-gray-900">{trip.Travel_Agency}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Destination</div>
            <div className="text-sm font-semibold text-gray-900">
              {trip.Destination_City}, {trip.Destination_Country}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Dates</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatDateRange(trip.Start_Date, trip.End_Date)}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor/Supplier Information */}
      {(trip.Flight_Vendor || trip.Hotel_Vendor || trip.Ground_Transport_Vendor || trip.Activities_Vendor || trip.Insurance_Vendor) && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border-2 border-purple-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🏢</span>
            <h2 className="text-xl font-bold text-gray-900">Vendor & Supplier Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trip.Flight_Vendor && (
              <div className="bg-white rounded-lg border border-purple-200 p-4">
                <div className="text-xs font-semibold text-purple-600 uppercase mb-1">Flight</div>
                <div className="text-sm font-bold text-gray-900">{trip.Flight_Vendor}</div>
                <div className="text-xs text-gray-600 mt-1">{formatCurrencyWithSymbol(trip.Flight_Cost, currency)}</div>
              </div>
            )}
            {trip.Hotel_Vendor && (
              <div className="bg-white rounded-lg border border-purple-200 p-4">
                <div className="text-xs font-semibold text-purple-600 uppercase mb-1">Hotel</div>
                <div className="text-sm font-bold text-gray-900">{trip.Hotel_Vendor}</div>
                <div className="text-xs text-gray-600 mt-1">{formatCurrencyWithSymbol(trip.Hotel_Cost, currency)}</div>
              </div>
            )}
            {trip.Ground_Transport_Vendor && (
              <div className="bg-white rounded-lg border border-purple-200 p-4">
                <div className="text-xs font-semibold text-purple-600 uppercase mb-1">Ground Transport</div>
                <div className="text-sm font-bold text-gray-900">{trip.Ground_Transport_Vendor}</div>
                <div className="text-xs text-gray-600 mt-1">{formatCurrencyWithSymbol(trip.Ground_Transport, currency)}</div>
              </div>
            )}
            {trip.Activities_Vendor && (
              <div className="bg-white rounded-lg border border-purple-200 p-4">
                <div className="text-xs font-semibold text-purple-600 uppercase mb-1">Activities & Tours</div>
                <div className="text-sm font-bold text-gray-900">{trip.Activities_Vendor}</div>
                <div className="text-xs text-gray-600 mt-1">{formatCurrencyWithSymbol(trip.Activities_Tours, currency)}</div>
              </div>
            )}
            {trip.Insurance_Vendor && (
              <div className="bg-white rounded-lg border border-purple-200 p-4">
                <div className="text-xs font-semibold text-purple-600 uppercase mb-1">Insurance</div>
                <div className="text-sm font-bold text-gray-900">{trip.Insurance_Vendor}</div>
                <div className="text-xs text-gray-600 mt-1">{formatCurrencyWithSymbol(trip.Insurance_Cost, currency)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Trip Cost</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(trip.Trip_Total_Cost, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">All expenses</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Cost Per Traveler</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">{trip.Total_Travelers} travelers</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Cost Per Day</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrencyWithSymbol(costPerDay, currency)}</div>
          <div className="text-xs text-gray-500 mt-1">{tripDays} days</div>
        </div>

        <div className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
          insights.costEfficiency === 'Excellent' || insights.costEfficiency === 'Good'
            ? 'border-green-300 bg-green-50'
            : insights.costEfficiency === 'Average'
            ? 'border-yellow-300 bg-yellow-50'
            : 'border-orange-300 bg-orange-50'
        }`}>
          <div className="text-sm font-medium text-gray-700 mb-1">Cost Efficiency</div>
          <div className="text-3xl font-bold text-gray-900">{insights.costEfficiency}</div>
          <div className="text-xs text-gray-600 mt-1">vs. portfolio avg</div>
        </div>
      </div>

      {/* Business Intelligence Section - Only for Standard/Premium */}
      {(currentTier === 'standard' || currentTier === 'premium') && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border-2 border-blue-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📊</span>
            <h2 className="text-2xl font-bold text-gray-900">Business Intelligence</h2>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Hotel/Flight Ratio</div>
            <div className="text-2xl font-bold text-gray-900">{insights.hotelToFlightRatio.toFixed(2)}x</div>
            <div className="text-xs text-gray-600 mt-1">
              {insights.hotelToFlightRatio >= 1.0 && insights.hotelToFlightRatio <= 1.5
                ? '✓ Optimal balance'
                : insights.hotelToFlightRatio > 1.5
                ? '⚠️ High accommodation spend'
                : '⚠️ Check hotel quality'
              }
            </div>
          </div>

          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Experience Investment</div>
            <div className="text-2xl font-bold text-gray-900">{insights.experiencePercentage.toFixed(0)}%</div>
            <div className="text-xs text-gray-600 mt-1">
              {formatCurrencyWithSymbol(insights.experienceInvestment, currency)} in activities + dining
            </div>
          </div>

          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Transport Efficiency</div>
            <div className="text-2xl font-bold text-gray-900">{insights.transportEfficiency.toFixed(0)}%</div>
            <div className="text-xs text-gray-600 mt-1">
              of budget
            </div>
          </div>

          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Top Cost Driver</div>
            <div className="text-xl font-bold text-gray-900">{insights.topCostDriver}</div>
            <div className="text-xs text-gray-600 mt-1">Largest category</div>
          </div>

          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Seasonality</div>
            <div className="text-lg font-bold text-gray-900">{insights.seasonality}</div>
            <div className="text-xs text-gray-600 mt-1">Travel timing</div>
          </div>

          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="text-xs font-semibold text-blue-600 uppercase mb-1">Benchmark</div>
            <div className="text-sm font-bold text-gray-900 leading-tight">{insights.benchmarkComparison}</div>
          </div>
        </div>
        </div>
      )}

      {/* Optimization Opportunities - Only for Standard/Premium */}
      {(currentTier === 'standard' || currentTier === 'premium') && opportunities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">💡</span>
            <h2 className="text-xl font-bold text-gray-900">Cost Optimization Opportunities</h2>
          </div>

          <div className="space-y-4">
            {opportunities.map((opp, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded-r-lg ${
                  opp.priority === 'High'
                    ? 'border-red-500 bg-red-50'
                    : opp.priority === 'Medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{opp.icon}</span>
                      <h3 className="text-lg font-bold text-gray-900">{opp.category}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded ${
                        opp.priority === 'High'
                          ? 'bg-red-200 text-red-800'
                          : opp.priority === 'Medium'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {opp.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Issue:</strong> {opp.issue}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Recommendation:</strong> {opp.recommendation}
                    </p>
                    <p className="text-sm font-semibold text-green-700">
                      <strong>Potential Savings:</strong> {opp.potentialSaving}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade CTA - Only show when approaching/at trip limit */}
      {(() => {
        const tierInfo = SUBSCRIPTION_TIERS[currentTier];
        const tripCount = allTrips.length;
        const tripLimit = tierInfo.tripLimit === 'unlimited' ? Infinity : tierInfo.tripLimit;
        const percentUsed = (tripCount / tripLimit) * 100;
        const shouldShowUpgrade = currentTier === 'starter' && percentUsed >= 80;

        if (!shouldShowUpgrade) return null;

        return (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-xl p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-3">⚠️</span>
                  <h2 className="text-xl font-bold">Trip Limit Warning</h2>
                </div>
                <p className="text-orange-100 mb-3">
                  You've used {tripCount} of {tripLimit} trips ({percentUsed.toFixed(0)}% of your {tierInfo.name} plan limit).
                  Upgrade now to avoid interruption.
                </p>
                <Link href="/pricing">
                  <button className="px-6 py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-colors shadow-lg cursor-pointer">
                    Upgrade Now →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cost Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown by Category</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <Pie
                data={categoryBreakdown as any}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={85}
                label={(entry: any) => `${entry.percentage.toFixed(0)}%`}
                labelLine={true}
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrencyWithSymbol(value as number, currency)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Cost Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrencyWithSymbol(value as number, currency)} />
              <Bar dataKey="amount" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Cost Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detailed Cost Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Per Traveler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryBreakdown.map((cat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">{cat.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {formatCurrencyWithSymbol(cat.amount, currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                    {cat.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                    {formatCurrencyWithSymbol(cat.amount / trip.Total_Travelers, currency)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  TOTAL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrencyWithSymbol(trip.Trip_Total_Cost, currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  100%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Trip</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete trip <span className="font-bold">{trip.Trip_ID}</span> for <span className="font-bold">{trip.Client_Name}</span>?
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete Trip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Trip: {trip.Trip_ID}</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <TripEditForm trip={trip} onSave={handleEditSave} onCancel={() => setIsEditing(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Trip Edit Form Component
interface TripEditFormProps {
  trip: Trip;
  onSave: (trip: Trip) => void;
  onCancel: () => void;
}

function TripEditForm({ trip, onSave, onCancel }: TripEditFormProps) {
  const [formData, setFormData] = useState({
    Trip_ID: trip.Trip_ID,
    Client_Name: trip.Client_Name,
    Travel_Agency: trip.Travel_Agency,
    Start_Date: trip.Start_Date,
    End_Date: trip.End_Date,
    Destination_Country: trip.Destination_Country,
    Destination_City: trip.Destination_City,
    Adults: trip.Adults.toString(),
    Children: trip.Children.toString(),
    Flight_Cost: trip.Flight_Cost.toString(),
    Hotel_Cost: trip.Hotel_Cost.toString(),
    Ground_Transport: trip.Ground_Transport.toString(),
    Activities_Tours: trip.Activities_Tours.toString(),
    Meals_Cost: trip.Meals_Cost.toString(),
    Insurance_Cost: trip.Insurance_Cost.toString(),
    Other_Costs: trip.Other_Costs.toString(),
    Commission_Type: (trip.Commission_Type || 'percentage') as 'percentage' | 'flat_fee',
    Commission_Value: (trip.Commission_Value || 15).toString(),
    Notes: trip.Notes || '',
    Flight_Vendor: trip.Flight_Vendor || '',
    Hotel_Vendor: trip.Hotel_Vendor || '',
    Ground_Transport_Vendor: trip.Ground_Transport_Vendor || '',
    Activities_Vendor: trip.Activities_Vendor || '',
    Insurance_Vendor: trip.Insurance_Vendor || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    if (!formData.Client_Name.trim()) newErrors.Client_Name = 'Client name is required';
    if (!formData.Travel_Agency.trim()) newErrors.Travel_Agency = 'Travel agency is required';
    if (!formData.Start_Date) newErrors.Start_Date = 'Start date is required';
    if (!formData.End_Date) newErrors.End_Date = 'End date is required';
    if (!formData.Destination_Country.trim()) newErrors.Destination_Country = 'Country is required';
    if (!formData.Destination_City.trim()) newErrors.Destination_City = 'City is required';

    const adults = parseInt(formData.Adults) || 0;
    const children = parseInt(formData.Children) || 0;

    if (adults < 0) newErrors.Adults = 'Must be 0 or greater';
    if (children < 0) newErrors.Children = 'Must be 0 or greater';
    if (adults + children === 0) newErrors.Adults = 'At least one traveler required';

    if (formData.Start_Date && formData.End_Date) {
      const start = new Date(formData.Start_Date);
      const end = new Date(formData.End_Date);
      if (end < start) {
        newErrors.End_Date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const adults = parseInt(formData.Adults) || 0;
    const children = parseInt(formData.Children) || 0;
    const flightCost = parseFloat(formData.Flight_Cost) || 0;
    const hotelCost = parseFloat(formData.Hotel_Cost) || 0;
    const groundTransport = parseFloat(formData.Ground_Transport) || 0;
    const activitiesTours = parseFloat(formData.Activities_Tours) || 0;
    const mealsCost = parseFloat(formData.Meals_Cost) || 0;
    const insuranceCost = parseFloat(formData.Insurance_Cost) || 0;
    const otherCosts = parseFloat(formData.Other_Costs) || 0;

    const totalTravelers = adults + children;
    const tripTotalCost = flightCost + hotelCost + groundTransport + activitiesTours + mealsCost + insuranceCost + otherCosts;

    const commissionValue = parseFloat(formData.Commission_Value) || 0;
    let agencyRevenue = 0;
    if (formData.Commission_Type === 'percentage') {
      agencyRevenue = (tripTotalCost * commissionValue) / 100;
    } else {
      agencyRevenue = commissionValue;
    }

    const updatedTrip: Trip = {
      Trip_ID: formData.Trip_ID,
      Client_Name: formData.Client_Name,
      Travel_Agency: formData.Travel_Agency,
      Start_Date: formData.Start_Date,
      End_Date: formData.End_Date,
      Destination_Country: formData.Destination_Country,
      Destination_City: formData.Destination_City,
      Adults: adults,
      Children: children,
      Total_Travelers: totalTravelers,
      Flight_Cost: flightCost,
      Hotel_Cost: hotelCost,
      Ground_Transport: groundTransport,
      Activities_Tours: activitiesTours,
      Meals_Cost: mealsCost,
      Insurance_Cost: insuranceCost,
      Other_Costs: otherCosts,
      Trip_Total_Cost: tripTotalCost,
      Cost_Per_Traveler: tripTotalCost / totalTravelers,
      Commission_Type: formData.Commission_Type,
      Commission_Value: commissionValue,
      Agency_Revenue: agencyRevenue,
      Notes: formData.Notes,
      Flight_Vendor: formData.Flight_Vendor || undefined,
      Hotel_Vendor: formData.Hotel_Vendor || undefined,
      Ground_Transport_Vendor: formData.Ground_Transport_Vendor || undefined,
      Activities_Vendor: formData.Activities_Vendor || undefined,
      Insurance_Vendor: formData.Insurance_Vendor || undefined,
    };

    onSave(updatedTrip);
  };

  const totalTravelers = (parseInt(formData.Adults) || 0) + (parseInt(formData.Children) || 0);
  const tripTotal =
    (parseFloat(formData.Flight_Cost) || 0) +
    (parseFloat(formData.Hotel_Cost) || 0) +
    (parseFloat(formData.Ground_Transport) || 0) +
    (parseFloat(formData.Activities_Tours) || 0) +
    (parseFloat(formData.Meals_Cost) || 0) +
    (parseFloat(formData.Insurance_Cost) || 0) +
    (parseFloat(formData.Other_Costs) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Trip_ID"
              value={formData.Trip_ID}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Trip ID cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Client_Name"
              value={formData.Client_Name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.Client_Name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.Client_Name && <p className="text-red-500 text-xs mt-1">{errors.Client_Name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel Agency <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Travel_Agency"
              value={formData.Travel_Agency}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.Travel_Agency ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.Travel_Agency && <p className="text-red-500 text-xs mt-1">{errors.Travel_Agency}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              name="Notes"
              value={formData.Notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Dates & Destination */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Dates & Destination</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="Start_Date"
              value={formData.Start_Date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.Start_Date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.Start_Date && <p className="text-red-500 text-xs mt-1">{errors.Start_Date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="End_Date"
              value={formData.End_Date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.End_Date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.End_Date && <p className="text-red-500 text-xs mt-1">{errors.End_Date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Country <span className="text-red-500">*</span>
            </label>
            <select
              name="Destination_Country"
              value={formData.Destination_Country}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.Destination_Country ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a country...</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.Destination_Country && <p className="text-red-500 text-xs mt-1">{errors.Destination_Country}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Destination_City"
              value={formData.Destination_City}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.Destination_City ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.Destination_City && <p className="text-red-500 text-xs mt-1">{errors.Destination_City}</p>}
          </div>
        </div>
      </div>

      {/* Travelers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Travelers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adults <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="Adults"
              value={formData.Adults}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.Adults ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.Adults && <p className="text-red-500 text-xs mt-1">{errors.Adults}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Children
            </label>
            <input
              type="number"
              name="Children"
              value={formData.Children}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
              <div className="text-xs text-gray-500 mb-1">Total Travelers</div>
              <div className="text-xl font-bold text-gray-900">{totalTravelers}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Costs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flight Cost ($)</label>
            <input
              type="number"
              name="Flight_Cost"
              value={formData.Flight_Cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Cost ($)</label>
            <input
              type="number"
              name="Hotel_Cost"
              value={formData.Hotel_Cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ground Transport ($)</label>
            <input
              type="number"
              name="Ground_Transport"
              value={formData.Ground_Transport}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activities & Tours ($)</label>
            <input
              type="number"
              name="Activities_Tours"
              value={formData.Activities_Tours}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meals Cost ($)</label>
            <input
              type="number"
              name="Meals_Cost"
              value={formData.Meals_Cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Cost ($)</label>
            <input
              type="number"
              name="Insurance_Cost"
              value={formData.Insurance_Cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Costs ($)</label>
            <input
              type="number"
              name="Other_Costs"
              value={formData.Other_Costs}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full px-4 py-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-xs text-blue-700 font-medium mb-1">Total Trip Cost</div>
              <div className="text-2xl font-bold text-blue-900">
                ${tripTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {totalTravelers > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  ${(tripTotal / totalTravelers).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per traveler
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Commission */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Agency Commission</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission Type</label>
            <select
              name="Commission_Type"
              value={formData.Commission_Type}
              onChange={(e) => setFormData(prev => ({ ...prev, Commission_Type: e.target.value as 'percentage' | 'flat_fee' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat_fee">Flat Fee ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.Commission_Type === 'percentage' ? 'Commission Rate (%)' : 'Flat Fee Amount ($)'}
            </label>
            <input
              type="number"
              name="Commission_Value"
              value={formData.Commission_Value}
              onChange={handleChange}
              min="0"
              step={formData.Commission_Type === 'percentage' ? '0.1' : '0.01'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full px-4 py-3 bg-green-600 rounded-lg border-2 border-green-700">
              <div className="text-xs text-green-100 font-medium mb-1">Agency Revenue</div>
              <div className="text-2xl font-bold text-white">
                ${(() => {
                  const commissionValue = parseFloat(formData.Commission_Value) || 0;
                  if (formData.Commission_Type === 'percentage') {
                    return ((tripTotal * commissionValue) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  } else {
                    return commissionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Information */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Vendor & Supplier Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flight Vendor</label>
            <input
              type="text"
              name="Flight_Vendor"
              value={formData.Flight_Vendor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Vendor</label>
            <input
              type="text"
              name="Hotel_Vendor"
              value={formData.Hotel_Vendor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ground Transport Vendor</label>
            <input
              type="text"
              name="Ground_Transport_Vendor"
              value={formData.Ground_Transport_Vendor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activities Vendor</label>
            <input
              type="text"
              name="Activities_Vendor"
              value={formData.Activities_Vendor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Vendor</label>
            <input
              type="text"
              name="Insurance_Vendor"
              value={formData.Insurance_Vendor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
