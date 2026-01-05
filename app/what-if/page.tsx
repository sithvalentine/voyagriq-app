"use client";

import { useState, useMemo, useEffect } from 'react';
import { DataStore } from '@/lib/dataStore';
import { Trip } from '@/data/trips';
import { formatCurrency, calculateTripDays, getCategoryBreakdown } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function WhatIfSimulator() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [adjustments, setAdjustments] = useState({
    Flight_Cost: 0,
    Hotel_Cost: 0,
    Ground_Transport: 0,
    Activities_Tours: 0,
    Meals_Cost: 0,
    Insurance_Cost: 0,
    Other_Costs: 0,
  });
  const [adjustedTravelers, setAdjustedTravelers] = useState<number | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  useEffect(() => {
    const loadedTrips = DataStore.getTrips();
    setTrips(loadedTrips);
    if (loadedTrips.length > 0 && !selectedTripId) {
      setSelectedTripId(loadedTrips[0].Trip_ID);
    }
  }, [selectedTripId]);

  const selectedTrip = trips.find(t => t.Trip_ID === selectedTripId);

  if (!selectedTrip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">What-If Savings Simulator</h1>
          <p className="mt-2 text-gray-600">
            Test different cost scenarios and see the impact on trip economics
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🧮</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trip Data Available</h2>
          <p className="text-gray-600 mb-6">
            Import trip data to start running cost simulations and what-if scenarios.
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
  const tripDays = calculateTripDays(selectedTrip.Start_Date, selectedTrip.End_Date);
  const travelers = adjustedTravelers !== null ? adjustedTravelers : selectedTrip.Total_Travelers;

  // Calculate adjusted costs
  const adjustedCosts = useMemo(() => {
    return {
      Flight_Cost: selectedTrip.Flight_Cost * (1 + adjustments.Flight_Cost / 100),
      Hotel_Cost: selectedTrip.Hotel_Cost * (1 + adjustments.Hotel_Cost / 100),
      Ground_Transport: selectedTrip.Ground_Transport * (1 + adjustments.Ground_Transport / 100),
      Activities_Tours: selectedTrip.Activities_Tours * (1 + adjustments.Activities_Tours / 100),
      Meals_Cost: selectedTrip.Meals_Cost * (1 + adjustments.Meals_Cost / 100),
      Insurance_Cost: selectedTrip.Insurance_Cost * (1 + adjustments.Insurance_Cost / 100),
      Other_Costs: selectedTrip.Other_Costs * (1 + adjustments.Other_Costs / 100),
    };
  }, [selectedTrip, adjustments]);

  const newTotal = Object.values(adjustedCosts).reduce((sum, cost) => sum + cost, 0);
  const newCostPerTraveler = newTotal / travelers;
  const newCostPerDay = newTotal / tripDays;

  const totalSavings = selectedTrip.Trip_Total_Cost - newTotal;
  const savingsPercentage = (totalSavings / selectedTrip.Trip_Total_Cost) * 100;

  // Prepare chart data
  const originalChartData = getCategoryBreakdown(selectedTrip);
  const adjustedChartData = [
    { category: 'Flight', amount: adjustedCosts.Flight_Cost, color: '#0ea5e9' },
    { category: 'Hotel', amount: adjustedCosts.Hotel_Cost, color: '#8b5cf6' },
    { category: 'Ground Transport', amount: adjustedCosts.Ground_Transport, color: '#f59e0b' },
    { category: 'Activities & Tours', amount: adjustedCosts.Activities_Tours, color: '#10b981' },
    { category: 'Meals', amount: adjustedCosts.Meals_Cost, color: '#ef4444' },
    { category: 'Insurance', amount: adjustedCosts.Insurance_Cost, color: '#6366f1' },
    { category: 'Other', amount: adjustedCosts.Other_Costs, color: '#64748b' },
  ].filter(cat => cat.amount > 0);

  const handleAdjustmentChange = (category: keyof typeof adjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [category]: value }));
  };

  const resetAll = () => {
    setAdjustments({
      Flight_Cost: 0,
      Hotel_Cost: 0,
      Ground_Transport: 0,
      Activities_Tours: 0,
      Meals_Cost: 0,
      Insurance_Cost: 0,
      Other_Costs: 0,
    });
    setAdjustedTravelers(null);
    setShowAIAnalysis(false);
  };

  // AI analysis (simulated)
  const changedCategories = Object.entries(adjustments)
    .filter(([_, value]) => value !== 0)
    .map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace('Cost', '').trim(),
      change: value
    }));

  const aiAnalysis = changedCategories.length > 0
    ? `You've adjusted ${changedCategories.map(c => c.name).join(', ')}. ${
        totalSavings > 0
          ? `These changes would save your client ${formatCurrency(Math.abs(totalSavings))} (${Math.abs(savingsPercentage).toFixed(1)}%). `
          : `These changes would increase costs by ${formatCurrency(Math.abs(totalSavings))} (${Math.abs(savingsPercentage).toFixed(1)}%). `
      }${
        adjustments.Flight_Cost < 0
          ? 'Booking flights earlier or choosing alternative airports could achieve these flight savings. '
          : ''
      }${
        adjustments.Hotel_Cost < 0
          ? 'Lower hotel costs might mean a different neighborhood or star rating—discuss location priorities with your client. '
          : ''
      }${
        adjustedTravelers !== null && adjustedTravelers !== selectedTrip.Total_Travelers
          ? `Changing from ${selectedTrip.Total_Travelers} to ${adjustedTravelers} travelers affects per-person costs significantly. `
          : ''
      }`
    : 'Adjust the sliders or traveler count to see how changes affect the trip cost. The AI will analyze the trade-offs for you.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">What-If Scenarios</h1>
        <p className="mt-2 text-gray-600">
          Adjust cost categories to see how changes affect total trip price and per-traveler cost
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Trip Selector */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a Trip
            </label>
            <select
              value={selectedTripId}
              onChange={(e) => {
                setSelectedTripId(e.target.value);
                resetAll();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {trips.map(trip => (
                <option key={trip.Trip_ID} value={trip.Trip_ID}>
                  {trip.Trip_ID} - {trip.Client_Name}
                </option>
              ))}
            </select>
          </div>

          {/* Base Trip Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Base Trip Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Trip Cost:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(selectedTrip.Trip_Total_Cost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost Per Traveler:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(selectedTrip.Cost_Per_Traveler)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost Per Day:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(selectedTrip.Trip_Total_Cost / tripDays)}
                </span>
              </div>
            </div>
          </div>

          {/* Traveler Adjustment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjust Travelers
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={travelers}
              onChange={(e) => setAdjustedTravelers(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              Original: {selectedTrip.Total_Travelers} travelers
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetAll}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Reset All
          </button>
        </div>

        {/* Middle Panel: Sliders */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adjust Cost Categories</h3>
            <div className="space-y-6">
              {Object.entries(adjustments).map(([key, value]) => {
                const categoryName = key.replace(/_/g, ' ').replace(' Cost', '');
                const baseAmount = selectedTrip[key as keyof typeof adjustments];
                const newAmount = adjustedCosts[key as keyof typeof adjustedCosts];

                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {categoryName}
                      </label>
                      <span className="text-sm font-semibold text-primary-600">
                        {value > 0 ? '+' : ''}{value}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="5"
                      value={value}
                      onChange={(e) => handleAdjustmentChange(
                        key as keyof typeof adjustments,
                        parseInt(e.target.value)
                      )}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(baseAmount)} → {formatCurrency(newAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-1 space-y-6">
          {/* Updated Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Updated Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">New Total Trip Cost</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(newTotal)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">New Cost Per Traveler</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(newCostPerTraveler)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">New Cost Per Day</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(newCostPerDay)}</div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Savings</div>
                <div className={`text-2xl font-bold ${totalSavings > 0 ? 'text-green-600' : totalSavings < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {totalSavings > 0 ? '+' : ''}{formatCurrency(totalSavings)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {savingsPercentage > 0 ? '+' : ''}{savingsPercentage.toFixed(1)}% change
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-sm border border-amber-200 p-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🤖</span>
              <h3 className="text-lg font-bold text-gray-900">Explain Changes</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Get AI analysis of what these cost changes mean
            </p>
            <button
              onClick={() => setShowAIAnalysis(!showAIAnalysis)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              {showAIAnalysis ? 'Hide Analysis' : 'Analyze Changes'}
            </button>
            {showAIAnalysis && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
                <p className="text-sm text-gray-700 leading-relaxed">{aiAnalysis}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Original Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={originalChartData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.category}: ${entry.percentage.toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {originalChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(selectedTrip.Trip_Total_Cost)}
            </div>
          </div>
        </div>

        {/* Adjusted Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Adjusted Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={adjustedChartData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.category}: ${((entry.amount / newTotal) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {adjustedChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className={`text-xl font-bold ${totalSavings > 0 ? 'text-green-600' : totalSavings < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(newTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
