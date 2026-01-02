"use client";

import { useState, useEffect } from 'react';
import { DataStore } from '@/lib/dataStore';
import { Trip } from '@/data/trips';
import TripEntryForm from '@/components/TripEntryForm';

export default function DataManagement() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    setTrips(DataStore.getTrips());
  };

  const handleFormSuccess = () => {
    loadTrips();
    setImportStatus({ type: 'success', message: '✅ Trip added successfully!' });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = DataStore.importFromCSV(text);

      if (result.success) {
        setImportStatus({ type: 'success', message: `✅ ${result.message}! Imported ${result.count} trips.` });
        loadTrips();
      } else {
        setImportStatus({ type: 'error', message: `❌ ${result.message}` });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setImportStatus({ type: 'error', message: '❌ Please upload a CSV file' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = DataStore.importFromCSV(text);

      if (result.success) {
        setImportStatus({ type: 'success', message: `✅ ${result.message}! Imported ${result.count} trips.` });
        loadTrips();
      } else {
        setImportStatus({ type: 'error', message: `❌ ${result.message}` });
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleExport = () => {
    const csv = DataStore.exportToCSV();
    if (!csv) {
      setImportStatus({ type: 'error', message: '❌ No data to export' });
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setImportStatus({ type: 'success', message: '✅ Data exported successfully!' });
  };

  const handleDownloadTemplate = () => {
    const template = `Trip_ID,Client_Name,Travel_Agency,Start_Date,End_Date,Destination_Country,Destination_City,Adults,Children,Total_Travelers,Flight_Cost,Hotel_Cost,Ground_Transport,Activities_Tours,Meals_Cost,Insurance_Cost,Other_Costs,Notes,Flight_Vendor,Hotel_Vendor,Ground_Transport_Vendor,Activities_Vendor,Insurance_Vendor
T001,Smith Family,Wanderlust Travel,2025-01-15,2025-01-22,Italy,Rome,3,1,4,7000,5400,1200,3400,900,400,200,8-day cultural immersion trip,Delta Airlines,Rome Cavalieri,Rome Transport Services,Colosseum Tours Inc,Travel Guard`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trip-data-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('⚠️ Are you sure you want to clear all trip data? This cannot be undone.')) {
      DataStore.clearTrips();
      setTrips([]);
      setImportStatus({ type: 'success', message: '✅ All data cleared' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
        <p className="mt-2 text-gray-600">
          Add trips manually or import from CSV
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'manual'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ✏️ Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'csv'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 CSV Import
          </button>
        </nav>
      </div>

      {/* Status Message */}
      {importStatus.type && (
        <div className={`mb-6 p-4 rounded-lg ${
          importStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={importStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {importStatus.message}
          </p>
        </div>
      )}

      {/* Current Data Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Current Data</h2>
            <p className="text-sm text-gray-600">
              {trips.length === 0 ? (
                <span className="text-amber-600 font-medium">⚠️ No trip data loaded. Import data to get started.</span>
              ) : (
                <span className="text-green-600 font-medium">✅ {trips.length} trip{trips.length !== 1 ? 's' : ''} loaded</span>
              )}
            </p>
          </div>
          {trips.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Export Data
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear All Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Form */}
      {activeTab === 'manual' && (
        <div>
          <TripEntryForm onSuccess={handleFormSuccess} />
        </div>
      )}

      {/* CSV Import Section */}
      {activeTab === 'csv' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Import Data</h2>

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Drag & drop your CSV file here
            </p>
            <p className="text-sm text-gray-600 mb-4">or</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer font-medium inline-block">
                Choose File
              </span>
            </label>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Required CSV Format:</h3>
            <div className="bg-gray-50 rounded p-3 text-xs font-mono overflow-x-auto">
              <div className="text-gray-700 mb-1">Trip_ID, Client_Name, Travel_Agency, Start_Date, End_Date,</div>
              <div className="text-gray-700 mb-1">Destination_Country, Destination_City, Adults, Children,</div>
              <div className="text-gray-700 mb-1">Total_Travelers, Flight_Cost, Hotel_Cost, Ground_Transport,</div>
              <div className="text-gray-700 mb-1">Activities_Tours, Meals_Cost, Insurance_Cost, Other_Costs, Notes,</div>
              <div className="text-gray-700">Flight_Vendor, Hotel_Vendor, Ground_Transport_Vendor,</div>
              <div className="text-gray-700">Activities_Vendor, Insurance_Vendor</div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Download CSV Template →
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use</h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Download the Template</h3>
                <p className="text-sm text-gray-700">
                  Click "Download CSV Template" to get a pre-formatted CSV file with the correct column headers.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fill in Your Data</h3>
                <p className="text-sm text-gray-700">
                  Open the template in Excel or Google Sheets and add your trip data. Make sure all required columns are filled.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Import Your Data</h3>
                <p className="text-sm text-gray-700">
                  Save as CSV and drag it into the upload zone or click "Choose File". Your data will be automatically calculated and displayed.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">View Your Reports</h3>
                <p className="text-sm text-gray-700">
                  Navigate to the Trips page to see your data with all metrics calculated automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">💡</span> Pro Tip
            </h3>
            <p className="text-sm text-gray-700">
              Trip_Total_Cost and Cost_Per_Traveler are calculated automatically from your cost categories.
              You don't need to include them in your CSV (but you can if you want).
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Data Preview */}
      {trips.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Data Preview</h2>
            <div className="flex gap-6 text-sm">
              <div className="text-gray-600">
                Total Trip Cost: <span className="font-bold text-primary-600">${trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-gray-600">
                Total Agency Revenue: <span className="font-bold text-green-600">${trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Trip ID</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Agency</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase">Travelers</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Flight</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Hotel</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Ground</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Activities</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Meals</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Insurance</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Other</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Total Cost</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Cost/Traveler</th>
                  <th className="px-2 py-2 text-right font-medium text-green-600 uppercase">Agency Revenue</th>
                  <th className="px-2 py-2 text-center font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map(trip => {
                  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
                  const getCategoryPercent = (amount: number) => ((amount / trip.Trip_Total_Cost) * 100).toFixed(0);

                  return (
                    <tr key={trip.Trip_ID} className="hover:bg-gray-50">
                      <td className="px-2 py-2 font-medium text-gray-900">{trip.Trip_ID}</td>
                      <td className="px-2 py-2 text-gray-600">{trip.Client_Name}</td>
                      <td className="px-2 py-2 text-gray-600">{trip.Travel_Agency}</td>
                      <td className="px-2 py-2 text-gray-600 whitespace-nowrap">
                        {formatDate(trip.Start_Date)} - {formatDate(trip.End_Date)}
                      </td>
                      <td className="px-2 py-2 text-gray-600">{trip.Destination_City}, {trip.Destination_Country}</td>
                      <td className="px-2 py-2 text-center font-medium text-gray-900">{trip.Total_Travelers}</td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        ${trip.Flight_Cost.toLocaleString()}
                        <div className="text-blue-600 font-medium">{getCategoryPercent(trip.Flight_Cost)}%</div>
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        ${trip.Hotel_Cost.toLocaleString()}
                        <div className="text-purple-600 font-medium">{getCategoryPercent(trip.Hotel_Cost)}%</div>
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        ${trip.Ground_Transport.toLocaleString()}
                        <div className="text-orange-600 font-medium">{getCategoryPercent(trip.Ground_Transport)}%</div>
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        ${trip.Activities_Tours.toLocaleString()}
                        <div className="text-green-600 font-medium">{getCategoryPercent(trip.Activities_Tours)}%</div>
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        ${trip.Meals_Cost.toLocaleString()}
                        <div className="text-red-600 font-medium">{getCategoryPercent(trip.Meals_Cost)}%</div>
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        ${trip.Insurance_Cost.toLocaleString()}
                        <div className="text-indigo-600 font-medium">{getCategoryPercent(trip.Insurance_Cost)}%</div>
                      </td>
                      <td className="px-2 py-2 text-right text-gray-700">
                        ${trip.Other_Costs.toLocaleString()}
                        <div className="text-gray-600 font-medium">{getCategoryPercent(trip.Other_Costs)}%</div>
                      </td>
                      <td className="px-2 py-2 text-right font-bold text-gray-900">
                        ${trip.Trip_Total_Cost.toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-primary-600">
                        ${trip.Cost_Per_Traveler.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="font-bold text-green-700">
                          ${(trip.Agency_Revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {trip.Commission_Type && (
                          <div className="text-green-600 font-medium text-[10px]">
                            {trip.Commission_Type === 'percentage'
                              ? `${trip.Commission_Value}%`
                              : 'Flat Fee'}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <a
                          href={`/trips/${trip.Trip_ID}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing all {trips.length} trip{trips.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
