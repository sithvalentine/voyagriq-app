'use client';

import { useState, useEffect } from 'react';
import { Trip } from '@/data/trips';
import { useTier } from '@/contexts/TierContext';
import { getTripsNeedingWarning, daysUntilArchive, getRetentionSummary } from '@/lib/dataRetention';
import { DataStore } from '@/lib/dataStore';
import Link from 'next/link';

export function DataRetentionWarning({ trips }: { trips: Trip[] }) {
  const { currentTier } = useTier();
  const [tripsAtRisk, setTripsAtRisk] = useState<Trip[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const needingWarning = getTripsNeedingWarning(trips, currentTier);
    setTripsAtRisk(needingWarning);
  }, [trips, currentTier]);

  if (tripsAtRisk.length === 0 || dismissed) return null;

  const handleDismiss = () => {
    // Mark all trips as warning shown
    tripsAtRisk.forEach(trip => {
      DataStore.markTripWarningShown(trip.Trip_ID);
    });
    setDismissed(true);
  };

  const handleExport = () => {
    const csvData = DataStore.exportToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips-backup-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const oldestTrip = tripsAtRisk[0];
  const daysRemaining = daysUntilArchive(oldestTrip, currentTier);

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Data Archiving Notice
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              You have <strong>{tripsAtRisk.length}</strong> trip{tripsAtRisk.length > 1 ? 's' : ''} that will be archived in{' '}
              <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong> based on your{' '}
              <strong>{currentTier}</strong> plan's data retention policy.
            </p>
            <p className="mt-2">
              Archived data is not deleted, but will be hidden from your dashboard. You can:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Download your data now to keep a permanent copy</li>
              <li>Upgrade your plan to extend data retention and restore archived trips</li>
            </ul>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Data
            </button>
            <Link
              href="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Upgrade Plan
            </Link>
            <button
              onClick={handleDismiss}
              className="text-sm text-amber-600 hover:text-amber-500 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DataRetentionSummary({ trips }: { trips: Trip[] }) {
  const { currentTier } = useTier();
  const summary = getRetentionSummary(trips, currentTier);

  if (summary.archivedTrips === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path
              fillRule="evenodd"
              d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Archived Data
          </h3>
          <div className="mt-1 text-sm text-blue-700">
            <p>
              You have <strong>{summary.archivedTrips}</strong> archived trip{summary.archivedTrips > 1 ? 's' : ''} (older than{' '}
              <strong>{summary.retentionPeriod}</strong>).
            </p>
            <p className="mt-1">
              <Link href="/pricing" className="font-medium underline hover:text-blue-600">
                Upgrade your plan
              </Link>{' '}
              to extend data retention and restore access to archived trips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
