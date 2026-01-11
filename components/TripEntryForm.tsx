"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';
import { Trip } from '@/data/trips';
import { canPerformAction, SUBSCRIPTION_TIERS } from '@/lib/subscription';
import { useTier } from '@/contexts/TierContext';
import { COUNTRIES } from '@/lib/countries';
import { useInlineAutocomplete } from '@/hooks/useInlineAutocomplete';

interface TripEntryFormProps {
  onSuccess: () => void;
}

export default function TripEntryForm({ onSuccess }: TripEntryFormProps) {
  const { currentTier } = useTier();
  const [existingTrips, setExistingTrips] = useState<Trip[]>([]);
  const tripLimitCheck = canPerformAction(currentTier, 'add_trip', existingTrips.length);

  // Get unique vendor lists from existing trips
  const getUniqueVendors = (field: keyof Trip) => {
    return Array.from(new Set(
      existingTrips
        .map(trip => trip[field])
        .filter((vendor): vendor is string => typeof vendor === 'string' && vendor.trim() !== '')
    )).sort();
  };

  const flightVendors = getUniqueVendors('Flight_Vendor');
  const hotelVendors = getUniqueVendors('Hotel_Vendor');
  const groundTransportVendors = getUniqueVendors('Ground_Transport_Vendor');
  const activitiesVendors = getUniqueVendors('Activities_Vendor');
  const cruiseOperators = getUniqueVendors('Cruise_Operator');
  const insuranceVendors = getUniqueVendors('Insurance_Vendor');

  // Load available tags for Premium users
  const [availableTags, setAvailableTags] = useState<Array<{id: string; name: string; color: string}>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [autocompleteData, setAutocompleteData] = useState<{
    clientNames: string[];
    agencies: string[];
    cities: string[];
  }>({ clientNames: [], agencies: [], cities: [] });

  // Load existing trips from localStorage after mount (client-side only)
  useEffect(() => {
    setExistingTrips(DataStore.getTrips());
  }, []);

  useEffect(() => {
    if (currentTier === 'premium') {
      const stored = localStorage.getItem('voyagriq-tags');
      if (stored) {
        try {
          setAvailableTags(JSON.parse(stored));
        } catch (e) {
          console.error('Error loading tags:', e);
        }
      }
    }
  }, [currentTier]);

  // Load autocomplete data from Supabase
  useEffect(() => {
    const loadAutocompleteData = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from('trips')
          .select('client_name, travel_agency, destination_city')
          .eq('user_id', user.id);

        if (!error && data) {
          const clientNames = Array.from(new Set(data.map((t: any) => t.client_name).filter(Boolean))) as string[];
          const agencies = Array.from(new Set(data.map((t: any) => t.travel_agency).filter(Boolean))) as string[];
          const cities = Array.from(new Set(data.map((t: any) => t.destination_city).filter(Boolean))) as string[];

          setAutocompleteData({
            clientNames: clientNames.sort(),
            agencies: agencies.sort(),
            cities: cities.sort(),
          });
        }
      } catch (err) {
        console.error('Failed to load autocomplete data:', err);
      }
    };

    loadAutocompleteData();
  }, []);

  const [formData, setFormData] = useState({
    Trip_ID: '',
    Client_Name: '',
    Travel_Agency: '',
    Start_Date: '',
    End_Date: '',
    Destination_Country: '',
    Destination_City: '',
    Adults: '',
    Children: '',
    Flight_Cost: '',
    Hotel_Cost: '',
    Ground_Transport: '',
    Activities_Tours: '',
    Meals_Cost: '',
    Insurance_Cost: '',
    Cruise_Cost: '',
    Other_Costs: '',
    Commission_Type: 'percentage' as 'percentage' | 'flat_fee',
    Commission_Value: '15',
    Notes: '',
    Flight_Vendor: '',
    Hotel_Vendor: '',
    Ground_Transport_Vendor: '',
    Activities_Vendor: '',
    Cruise_Operator: '',
    Insurance_Vendor: '',
    Client_ID: '',
    Client_Type: 'individual' as 'individual' | 'corporate' | 'group',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Setup inline autocomplete for each field
  const clientNameAutocomplete = useInlineAutocomplete({
    value: formData.Client_Name,
    suggestions: autocompleteData.clientNames,
    onChange: (value) => setFormData(prev => ({ ...prev, Client_Name: value })),
  });

  const agencyAutocomplete = useInlineAutocomplete({
    value: formData.Travel_Agency,
    suggestions: autocompleteData.agencies,
    onChange: (value) => setFormData(prev => ({ ...prev, Travel_Agency: value })),
  });

  const cityAutocomplete = useInlineAutocomplete({
    value: formData.Destination_City,
    suggestions: autocompleteData.cities,
    onChange: (value) => setFormData(prev => ({ ...prev, Destination_City: value })),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // For number inputs, keep as string to allow empty state (no leading zeros)
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;

    // Update start date
    setFormData(prev => ({ ...prev, Start_Date: startDate }));

    // If end date is empty or in a different year, set it to the same year
    if (!formData.End_Date || new Date(formData.End_Date).getFullYear() !== new Date(startDate).getFullYear()) {
      const startYear = new Date(startDate).getFullYear();
      const startMonth = new Date(startDate).getMonth();
      const startDay = new Date(startDate).getDate();

      // Set end date to same date as start date initially
      const suggestedEndDate = new Date(startYear, startMonth, startDay);
      setFormData(prev => ({
        ...prev,
        Start_Date: startDate,
        End_Date: suggestedEndDate.toISOString().split('T')[0]
      }));
    }

    // Clear error when user starts typing
    if (errors.Start_Date) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.Start_Date;
        return newErrors;
      });
    }
  };

  // Prevent mouse wheel from changing number inputs (too easy to accidentally change)
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur(); // Remove focus to prevent value change
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.Trip_ID.trim()) newErrors.Trip_ID = 'Trip ID is required';
    if (!formData.Client_Name.trim()) newErrors.Client_Name = 'Client name is required';
    if (!formData.Travel_Agency.trim()) newErrors.Travel_Agency = 'Travel agency is required';
    if (!formData.Start_Date) newErrors.Start_Date = 'Start date is required';
    if (!formData.End_Date) newErrors.End_Date = 'End date is required';
    if (!formData.Destination_Country.trim()) newErrors.Destination_Country = 'Country is required';
    if (!formData.Destination_City.trim()) newErrors.Destination_City = 'City is required';

    const adults = parseInt(formData.Adults as string) || 0;
    const children = parseInt(formData.Children as string) || 0;

    if (adults < 0) newErrors.Adults = 'Must be 0 or greater';
    if (children < 0) newErrors.Children = 'Must be 0 or greater';
    if (adults + children === 0) {
      newErrors.Adults = 'At least one traveler required';
    }

    // Check if Trip_ID already exists
    const existingTrips = DataStore.getTrips();
    if (existingTrips.some(t => t.Trip_ID === formData.Trip_ID)) {
      newErrors.Trip_ID = 'Trip ID already exists. Please use a unique Trip ID.';
    }

    // Check for potential duplicate trips (same client, dates, and destination)
    const potentialDuplicate = existingTrips.find(t =>
      t.Client_Name.toLowerCase() === formData.Client_Name.trim().toLowerCase() &&
      t.Start_Date === formData.Start_Date &&
      t.End_Date === formData.End_Date &&
      t.Destination_Country.toLowerCase() === formData.Destination_Country.trim().toLowerCase() &&
      t.Destination_City.toLowerCase() === formData.Destination_City.trim().toLowerCase()
    );

    if (potentialDuplicate) {
      newErrors.Client_Name = `Possible duplicate: Trip ${potentialDuplicate.Trip_ID} has the same client, dates, and destination.`;
    }

    // Validate dates
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

    if (!validateForm()) {
      return;
    }

    // Parse string values to numbers
    const adults = parseInt(formData.Adults as string) || 0;
    const children = parseInt(formData.Children as string) || 0;
    const flightCost = parseFloat(formData.Flight_Cost as string) || 0;
    const hotelCost = parseFloat(formData.Hotel_Cost as string) || 0;
    const groundTransport = parseFloat(formData.Ground_Transport as string) || 0;
    const activitiesTours = parseFloat(formData.Activities_Tours as string) || 0;
    const mealsCost = parseFloat(formData.Meals_Cost as string) || 0;
    const insuranceCost = parseFloat(formData.Insurance_Cost as string) || 0;
    const cruiseCost = parseFloat(formData.Cruise_Cost as string) || 0;
    const otherCosts = parseFloat(formData.Other_Costs as string) || 0;

    const totalTravelers = adults + children;
    const tripTotalCost =
      flightCost +
      hotelCost +
      groundTransport +
      activitiesTours +
      mealsCost +
      insuranceCost +
      cruiseCost +
      otherCosts;

    // Calculate agency revenue based on commission type
    const commissionValue = parseFloat(formData.Commission_Value as string) || 0;
    let agencyRevenue = 0;
    if (formData.Commission_Type === 'percentage') {
      agencyRevenue = (tripTotalCost * commissionValue) / 100;
    } else {
      agencyRevenue = commissionValue;
    }

    const newTrip: Trip = {
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
      Cruise_Cost: cruiseCost,
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
      Cruise_Operator: formData.Cruise_Operator || undefined,
      Insurance_Vendor: formData.Insurance_Vendor || undefined,
      Client_ID: formData.Client_ID || undefined,
      Tags: selectedTags.length > 0 ? selectedTags : undefined,
      Client_Type: formData.Client_Type || undefined,
    };

    DataStore.addTrip(newTrip);

    // Reset form - use empty strings instead of 0 to avoid leading zeros
    setFormData({
      Trip_ID: '',
      Client_Name: '',
      Travel_Agency: '',
      Start_Date: '',
      End_Date: '',
      Destination_Country: '',
      Destination_City: '',
      Adults: '',
      Children: '',
      Flight_Cost: '',
      Hotel_Cost: '',
      Ground_Transport: '',
      Activities_Tours: '',
      Meals_Cost: '',
      Insurance_Cost: '',
      Cruise_Cost: '',
      Other_Costs: '',
      Commission_Type: 'percentage',
      Commission_Value: '15',
      Notes: '',
      Flight_Vendor: '',
      Hotel_Vendor: '',
      Ground_Transport_Vendor: '',
      Activities_Vendor: '',
      Cruise_Operator: '',
      Insurance_Vendor: '',
      Client_ID: '',
      Client_Type: 'individual',
    });
    setSelectedTags([]);

    onSuccess();
  };

  // Calculate real-time totals from string values
  const totalTravelers = (parseInt(formData.Adults as string) || 0) + (parseInt(formData.Children as string) || 0);
  const tripTotal =
    (parseFloat(formData.Flight_Cost as string) || 0) +
    (parseFloat(formData.Hotel_Cost as string) || 0) +
    (parseFloat(formData.Ground_Transport as string) || 0) +
    (parseFloat(formData.Activities_Tours as string) || 0) +
    (parseFloat(formData.Meals_Cost as string) || 0) +
    (parseFloat(formData.Insurance_Cost as string) || 0) +
    (parseFloat(formData.Cruise_Cost as string) || 0) +
    (parseFloat(formData.Other_Costs as string) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subscription Limit Warning */}
      {!tripLimitCheck.allowed && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🚫</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-2">Trip Limit Reached</h3>
              <p className="text-red-700 mb-4">{tripLimitCheck.reason}</p>
              <Link href="/pricing">
                <button
                  type="button"
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Upgrade Your Plan
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trip Count Display */}
      <div className={`rounded-lg p-4 ${
        tripLimitCheck.allowed ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100 border border-gray-300'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600">Current Plan: <span className="font-bold text-gray-900">{SUBSCRIPTION_TIERS[currentTier].name}</span></div>
            <div className="text-sm text-gray-600 mt-1">
              Trips Used: <span className="font-bold text-gray-900">{existingTrips.length}</span> /
              <span className="font-bold text-gray-900"> {
                SUBSCRIPTION_TIERS[currentTier].tripLimit === 'unlimited'
                  ? 'Unlimited'
                  : SUBSCRIPTION_TIERS[currentTier].tripLimit
              }</span>
            </div>
          </div>
          <Link href="/pricing" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View Plans →
          </Link>
        </div>
      </div>

      {/* Trip Identification */}
      <fieldset disabled={!tripLimitCheck.allowed} className={!tripLimitCheck.allowed ? 'opacity-50 pointer-events-none' : ''}>
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
              onChange={handleChange}
              placeholder="e.g., T001"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.Trip_ID ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.Trip_ID && <p className="text-red-500 text-xs mt-1">{errors.Trip_ID}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={clientNameAutocomplete.inputRef}
                type="text"
                name="Client_Name"
                value={formData.Client_Name}
                onChange={handleChange}
                onKeyDown={clientNameAutocomplete.handleKeyDown}
                placeholder="e.g., Smith Family"
                className={`relative w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white ${
                  errors.Client_Name ? 'border-red-500' : 'border-gray-300'
                }`}
                autoComplete="off"
              />
              {clientNameAutocomplete.suggestion && (
                <div className="absolute inset-0 px-3 py-2 pointer-events-none overflow-hidden flex items-center">
                  <span className="text-transparent">{formData.Client_Name}</span>
                  <span className="text-gray-400">{clientNameAutocomplete.suggestion.slice(formData.Client_Name.length)}</span>
                </div>
              )}
            </div>
            {errors.Client_Name && <p className="text-red-500 text-xs mt-1">{errors.Client_Name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel Agency <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={agencyAutocomplete.inputRef}
                type="text"
                name="Travel_Agency"
                value={formData.Travel_Agency}
                onChange={handleChange}
                onKeyDown={agencyAutocomplete.handleKeyDown}
                placeholder="e.g., Wanderlust Travel"
                className={`relative w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white ${
                  errors.Travel_Agency ? 'border-red-500' : 'border-gray-300'
                }`}
                autoComplete="off"
              />
              {agencyAutocomplete.suggestion && (
                <div className="absolute inset-0 px-3 py-2 pointer-events-none overflow-hidden flex items-center">
                  <span className="text-transparent">{formData.Travel_Agency}</span>
                  <span className="text-gray-400">{agencyAutocomplete.suggestion.slice(formData.Travel_Agency.length)}</span>
                </div>
              )}
            </div>
            {errors.Travel_Agency && <p className="text-red-500 text-xs mt-1">{errors.Travel_Agency}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              name="Notes"
              value={formData.Notes}
              onChange={handleChange}
              placeholder="e.g., 8-day cultural trip"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              onChange={handleStartDateChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base cursor-pointer ${
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base cursor-pointer ${
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
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
            <div className="relative">
              <input
                ref={cityAutocomplete.inputRef}
                type="text"
                name="Destination_City"
                value={formData.Destination_City}
                onChange={handleChange}
                onKeyDown={cityAutocomplete.handleKeyDown}
                placeholder="e.g., Rome"
                className={`relative w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white ${
                  errors.Destination_City ? 'border-red-500' : 'border-gray-300'
                }`}
                autoComplete="off"
              />
              {cityAutocomplete.suggestion && (
                <div className="absolute inset-0 px-3 py-2 pointer-events-none overflow-hidden flex items-center">
                  <span className="text-transparent">{formData.Destination_City}</span>
                  <span className="text-gray-400">{cityAutocomplete.suggestion.slice(formData.Destination_City.length)}</span>
                </div>
              )}
            </div>
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

      {/* Commission / Revenue */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Agency Commission</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Type <span className="text-red-500">*</span>
            </label>
            <select
              name="Commission_Type"
              value={formData.Commission_Type}
              onChange={(e) => setFormData(prev => ({ ...prev, Commission_Type: e.target.value as 'percentage' | 'flat_fee' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              placeholder={formData.Commission_Type === 'percentage' ? 'e.g., 15' : 'e.g., 608.98'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full px-4 py-3 bg-green-600 rounded-lg border-2 border-green-700">
              <div className="text-xs text-green-100 font-medium mb-1">Estimated Agency Revenue</div>
              <div className="text-2xl font-bold text-white">
                ${(() => {
                  const commissionValue = parseFloat(formData.Commission_Value as string) || 0;
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

      {/* Costs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Cost ($)
            </label>
            <input
              type="number"
              name="Flight_Cost"
              value={formData.Flight_Cost}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Cost ($)
            </label>
            <input
              type="number"
              name="Hotel_Cost"
              value={formData.Hotel_Cost}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ground Transport ($)
            </label>
            <input
              type="number"
              name="Ground_Transport"
              value={formData.Ground_Transport}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activities & Tours ($)
            </label>
            <input
              type="number"
              name="Activities_Tours"
              value={formData.Activities_Tours}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meals Cost ($)
            </label>
            <input
              type="number"
              name="Meals_Cost"
              value={formData.Meals_Cost}
              onChange={handleChange}
              onWheel={handleWheel}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Cost ($)
            </label>
            <input
              type="number"
              name="Insurance_Cost"
              value={formData.Insurance_Cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cruise Cost ($)
            </label>
            <input
              type="number"
              name="Cruise_Cost"
              value={formData.Cruise_Cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Costs ($)
            </label>
            <input
              type="number"
              name="Other_Costs"
              value={formData.Other_Costs}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-end">
            <div className="w-full px-4 py-3 bg-primary-50 rounded-lg border-2 border-primary-200">
              <div className="text-xs text-primary-700 font-medium mb-1">Total Trip Cost</div>
              <div className="text-2xl font-bold text-primary-900">
                ${tripTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {totalTravelers > 0 && (
                <div className="text-xs text-primary-600 mt-1">
                  ${(tripTotal / totalTravelers).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per traveler
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor / Supplier Tracking */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Vendor & Supplier Tracking</h3>
        <p className="text-sm text-gray-600 mb-4">
          Track which vendors you used for each service category. This helps with vendor analytics and reporting.
          {(flightVendors.length > 0 || hotelVendors.length > 0 || groundTransportVendors.length > 0 || activitiesVendors.length > 0 || insuranceVendors.length > 0) && (
            <span className="block mt-1 text-purple-700 font-medium">Start typing to see suggestions from previous trips.</span>
          )}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Vendor
            </label>
            <input
              type="text"
              name="Flight_Vendor"
              list="flight-vendor-list"
              value={formData.Flight_Vendor}
              onChange={handleChange}
              placeholder="e.g., Delta Airlines, United Airlines"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <datalist id="flight-vendor-list">
              {flightVendors.map(vendor => (
                <option key={vendor} value={vendor} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Vendor
            </label>
            <input
              type="text"
              name="Hotel_Vendor"
              list="hotel-vendor-list"
              value={formData.Hotel_Vendor}
              onChange={handleChange}
              placeholder="e.g., Marriott, Hilton, Rome Cavalieri"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <datalist id="hotel-vendor-list">
              {hotelVendors.map(vendor => (
                <option key={vendor} value={vendor} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ground Transport Vendor
            </label>
            <input
              type="text"
              name="Ground_Transport_Vendor"
              list="ground-transport-vendor-list"
              value={formData.Ground_Transport_Vendor}
              onChange={handleChange}
              placeholder="e.g., Local Taxi Service, Car Rental Co"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <datalist id="ground-transport-vendor-list">
              {groundTransportVendors.map(vendor => (
                <option key={vendor} value={vendor} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activities Vendor
            </label>
            <input
              type="text"
              name="Activities_Vendor"
              list="activities-vendor-list"
              value={formData.Activities_Vendor}
              onChange={handleChange}
              placeholder="e.g., City Tours Inc, Museum Guides"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <datalist id="activities-vendor-list">
              {activitiesVendors.map(vendor => (
                <option key={vendor} value={vendor} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cruise Operator
            </label>
            <input
              type="text"
              name="Cruise_Operator"
              list="cruise-operator-list"
              value={formData.Cruise_Operator}
              onChange={handleChange}
              placeholder="e.g., Royal Caribbean, Carnival, Norwegian"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <datalist id="cruise-operator-list">
              {cruiseOperators.map(vendor => (
                <option key={vendor} value={vendor} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Vendor
            </label>
            <input
              type="text"
              name="Insurance_Vendor"
              list="insurance-vendor-list"
              value={formData.Insurance_Vendor}
              onChange={handleChange}
              placeholder="e.g., Travel Guard, Allianz Travel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <datalist id="insurance-vendor-list">
              {insuranceVendors.map(vendor => (
                <option key={vendor} value={vendor} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Premium: Client Organization */}
      {currentTier === 'premium' && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <h3 className="text-xl font-bold text-purple-900">Client Organization (Premium)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID (Optional)
              </label>
              <input
                type="text"
                name="Client_ID"
                value={formData.Client_ID}
                onChange={handleChange}
                placeholder="e.g., CL-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Client Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Type
              </label>
              <select
                name="Client_Type"
                value={formData.Client_Type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
                <option value="group">Group</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              {availableTags.length === 0 && (
                <Link href="/settings/tags" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                  Create tags →
                </Link>
              )}
            </div>

            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTags(selectedTags.filter(t => t !== tag.name));
                        } else {
                          setSelectedTags([...selectedTags, tag.name]);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-purple-500'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: tag.color,
                        color: 'white',
                        opacity: isSelected ? 1 : 0.7,
                      }}
                    >
                      {tag.name}
                      {isSelected && ' ✓'}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No tags available. Create tags in Settings to organize your trips.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button - MADE SUPER VISIBLE FOR DEBUGGING */}
      <div className="flex justify-center gap-3 mt-8 mb-8 py-8 bg-green-100 border-4 border-green-600 rounded-lg">
        <button
          type="submit"
          className="px-12 py-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-2xl shadow-lg cursor-pointer"
        >
          ✅ ADD TRIP NOW ✅
        </button>
      </div>
      </fieldset>
    </form>
  );
}
