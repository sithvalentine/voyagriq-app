'use client';

import { useState, useEffect } from 'react';
import { Trip } from '@/data/trips';
import { COUNTRIES } from '@/lib/countries';
import { useInlineAutocomplete } from '@/hooks/useInlineAutocomplete';

interface QuickAddTripFormProps {
  onAdd: (trip: Trip) => void;
  onCancel: () => void;
}

export default function QuickAddTripForm({ onAdd, onCancel }: QuickAddTripFormProps) {
  const [formData, setFormData] = useState({
    tripId: '',
    clientName: '',
    agency: '',
    startDate: '',
    endDate: '',
    country: '',
    city: '',
    adults: '2',
    children: '0',
    flightCost: '',
    hotelCost: '',
    groundTransport: '',
    activitiesTours: '',
    mealsCost: '',
    insuranceCost: '',
    otherCosts: '',
  });

  const [error, setError] = useState('');
  const [autocompleteData, setAutocompleteData] = useState<{
    clientNames: string[];
    agencies: string[];
    cities: string[];
  }>({ clientNames: [], agencies: [], cities: [] });

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

  // Setup inline autocomplete for each field
  const clientNameAutocomplete = useInlineAutocomplete({
    value: formData.clientName,
    suggestions: autocompleteData.clientNames,
    onChange: (value) => setFormData({ ...formData, clientName: value }),
  });

  const agencyAutocomplete = useInlineAutocomplete({
    value: formData.agency,
    suggestions: autocompleteData.agencies,
    onChange: (value) => setFormData({ ...formData, agency: value }),
  });

  const cityAutocomplete = useInlineAutocomplete({
    value: formData.city,
    suggestions: autocompleteData.cities,
    onChange: (value) => setFormData({ ...formData, city: value }),
  });

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    setFormData({ ...formData, startDate });

    // If end date is empty or in a different year, set it to the same year
    if (!formData.endDate || new Date(formData.endDate).getFullYear() !== new Date(startDate).getFullYear()) {
      const startYear = new Date(startDate).getFullYear();
      const startMonth = new Date(startDate).getMonth();
      const startDay = new Date(startDate).getDate();

      // Set end date to same date as start date initially
      const suggestedEndDate = new Date(startYear, startMonth, startDay);
      setFormData(prev => ({
        ...prev,
        startDate,
        endDate: suggestedEndDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.tripId || !formData.clientName || !formData.agency || !formData.startDate || !formData.endDate || !formData.country || !formData.city) {
      setError('Please fill in all required fields');
      return;
    }

    const adults = parseInt(formData.adults) || 0;
    const children = parseInt(formData.children) || 0;
    const flightCost = parseFloat(formData.flightCost) || 0;
    const hotelCost = parseFloat(formData.hotelCost) || 0;
    const groundTransport = parseFloat(formData.groundTransport) || 0;
    const activitiesTours = parseFloat(formData.activitiesTours) || 0;
    const mealsCost = parseFloat(formData.mealsCost) || 0;
    const insuranceCost = parseFloat(formData.insuranceCost) || 0;
    const otherCosts = parseFloat(formData.otherCosts) || 0;

    const tripTotalCost = flightCost + hotelCost + groundTransport + activitiesTours + mealsCost + insuranceCost + otherCosts;
    const totalTravelers = adults + children;

    const newTrip: Trip = {
      Trip_ID: formData.tripId,
      Client_Name: formData.clientName,
      Travel_Agency: formData.agency || '',
      Start_Date: formData.startDate,
      End_Date: formData.endDate,
      Destination_Country: formData.country,
      Destination_City: formData.city || '',
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
      Cost_Per_Traveler: totalTravelers > 0 ? tripTotalCost / totalTravelers : 0,
      Notes: '',
    };

    // Save to Supabase
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Please log in to add trips');
        return;
      }

      const { error: insertError } = await supabase
        .from('trips')
        .insert([{
          user_id: user.id,
          trip_id: newTrip.Trip_ID,
          client_name: newTrip.Client_Name,
          travel_agency: newTrip.Travel_Agency || null,
          start_date: newTrip.Start_Date,
          end_date: newTrip.End_Date,
          destination_country: newTrip.Destination_Country,
          destination_city: newTrip.Destination_City || null,
          adults: newTrip.Adults,
          children: newTrip.Children,
          total_travelers: newTrip.Total_Travelers,
          flight_cost: Math.round(newTrip.Flight_Cost * 100), // Convert to cents
          hotel_cost: Math.round(newTrip.Hotel_Cost * 100),
          ground_transport: Math.round(newTrip.Ground_Transport * 100),
          activities_tours: Math.round(newTrip.Activities_Tours * 100),
          meals_cost: Math.round(newTrip.Meals_Cost * 100),
          insurance_cost: Math.round(newTrip.Insurance_Cost * 100),
          other_costs: Math.round(newTrip.Other_Costs * 100),
          currency: 'USD',
        }]);

      if (insertError) {
        setError(`Failed to add trip: ${insertError.message}`);
        return;
      }

      onAdd(newTrip);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">✨ Quick Add Trip</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Required Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.tripId}
              onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="T001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={clientNameAutocomplete.inputRef}
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                onKeyDown={clientNameAutocomplete.handleKeyDown}
                className="relative w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="John Smith"
                autoComplete="off"
                required
              />
              {clientNameAutocomplete.suggestion && (
                <div className="absolute inset-0 px-3 py-2 pointer-events-none overflow-hidden flex items-center">
                  <span className="text-transparent">{formData.clientName}</span>
                  <span className="text-gray-400">{clientNameAutocomplete.suggestion.slice(formData.clientName.length)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel Agency <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={agencyAutocomplete.inputRef}
                type="text"
                name="agency"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                onKeyDown={agencyAutocomplete.handleKeyDown}
                className="relative w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Your Agency"
                autoComplete="off"
                required
              />
              {agencyAutocomplete.suggestion && (
                <div className="absolute inset-0 px-3 py-2 pointer-events-none overflow-hidden flex items-center">
                  <span className="text-transparent">{formData.agency}</span>
                  <span className="text-gray-400">{agencyAutocomplete.suggestion.slice(formData.agency.length)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={handleStartDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a country...</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={cityAutocomplete.inputRef}
                type="text"
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                onKeyDown={cityAutocomplete.handleKeyDown}
                className="relative w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Rome"
                autoComplete="off"
                required
              />
              {cityAutocomplete.suggestion && (
                <div className="absolute inset-0 px-3 py-2 pointer-events-none overflow-hidden flex items-center">
                  <span className="text-transparent">{formData.city}</span>
                  <span className="text-gray-400">{cityAutocomplete.suggestion.slice(formData.city.length)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
            <input
              type="number"
              min="0"
              value={formData.adults}
              onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
            <input
              type="number"
              min="0"
              value={formData.children}
              onChange={(e) => setFormData({ ...formData, children: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flight Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.flightCost}
              onChange={(e) => setFormData({ ...formData, flightCost: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Cost</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.hotelCost}
              onChange={(e) => setFormData({ ...formData, hotelCost: e.target.value })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <details className="bg-white rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            + More Cost Categories (Optional)
          </summary>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ground Transport</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.groundTransport}
                onChange={(e) => setFormData({ ...formData, groundTransport: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Activities/Tours</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.activitiesTours}
                onChange={(e) => setFormData({ ...formData, activitiesTours: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meals</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.mealsCost}
                onChange={(e) => setFormData({ ...formData, mealsCost: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Insurance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.insuranceCost}
                onChange={(e) => setFormData({ ...formData, insuranceCost: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Other Costs</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.otherCosts}
                onChange={(e) => setFormData({ ...formData, otherCosts: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </details>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Add Trip
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
