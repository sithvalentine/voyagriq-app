import { Trip } from '@/data/trips';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from './subscription';

// Parse retention period string to months
export function parseRetentionPeriod(retention: string): number | null {
  if (retention === 'unlimited') return null;

  const match = retention.match(/(\d+)\s*(month|year)s?/i);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === 'month') return value;
  if (unit === 'year') return value * 12;

  return null;
}

// Get retention period in months for a tier
export function getRetentionMonths(tier: SubscriptionTier): number | null {
  const tierInfo = SUBSCRIPTION_TIERS[tier];
  return parseRetentionPeriod(tierInfo.dataRetention);
}

// Calculate if a trip should be archived based on tier and trip date
export function shouldArchiveTrip(trip: Trip, tier: SubscriptionTier): boolean {
  // Already archived
  if (trip.archived) return true;

  // Get retention period for tier
  const retentionMonths = getRetentionMonths(tier);

  // Unlimited retention (enterprise) or no retention defined
  if (retentionMonths === null) return false;

  // Use End_Date for determining age
  const tripEndDate = new Date(trip.End_Date);
  const now = new Date();

  // Calculate months difference
  const monthsDiff = (now.getFullYear() - tripEndDate.getFullYear()) * 12 +
                     (now.getMonth() - tripEndDate.getMonth());

  // Archive if older than retention period
  return monthsDiff > retentionMonths;
}

// Calculate days until a trip will be archived
export function daysUntilArchive(trip: Trip, tier: SubscriptionTier): number | null {
  if (trip.archived) return 0;

  const retentionMonths = getRetentionMonths(tier);
  if (retentionMonths === null) return null; // Unlimited retention

  const tripEndDate = new Date(trip.End_Date);
  const archiveDate = new Date(tripEndDate);
  archiveDate.setMonth(archiveDate.getMonth() + retentionMonths);

  const now = new Date();
  const daysRemaining = Math.ceil((archiveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return Math.max(0, daysRemaining);
}

// Get trips that need archiving warning (30 days before archive)
export function getTripsNeedingWarning(trips: Trip[], tier: SubscriptionTier): Trip[] {
  return trips.filter(trip => {
    if (trip.archived || trip.archiveWarningShown) return false;

    const days = daysUntilArchive(trip, tier);
    if (days === null) return false; // Unlimited retention

    return days <= 30 && days > 0;
  });
}

// Get trips that should be archived now
export function getTripsToArchive(trips: Trip[], tier: SubscriptionTier): Trip[] {
  return trips.filter(trip => {
    if (trip.archived) return false;
    return shouldArchiveTrip(trip, tier);
  });
}

// Archive a trip (mark as archived, don't delete)
export function archiveTrip(trip: Trip): Trip {
  return {
    ...trip,
    archived: true,
    archivedAt: new Date().toISOString(),
  };
}

// Restore archived trips based on new tier (when user upgrades)
export function restoreTripsForTier(trips: Trip[], newTier: SubscriptionTier): Trip[] {
  const retentionMonths = getRetentionMonths(newTier);

  // If unlimited retention, restore all archived trips
  if (retentionMonths === null) {
    return trips.map(trip => {
      if (trip.archived) {
        const { archived, archivedAt, ...restoredTrip } = trip;
        return restoredTrip;
      }
      return trip;
    });
  }

  // Otherwise, restore trips within the new retention period
  return trips.map(trip => {
    if (trip.archived && !shouldArchiveTrip(trip, newTier)) {
      const { archived, archivedAt, ...restoredTrip } = trip;
      return restoredTrip;
    }
    return trip;
  });
}

// Mark trip as warning shown
export function markWarningShown(trip: Trip): Trip {
  return {
    ...trip,
    archiveWarningShown: true,
  };
}

// Get archived trips count
export function getArchivedCount(trips: Trip[]): number {
  return trips.filter(trip => trip.archived).length;
}

// Get active (non-archived) trips
export function getActiveTrips(trips: Trip[]): Trip[] {
  return trips.filter(trip => !trip.archived);
}

// Get archived trips
export function getArchivedTrips(trips: Trip[]): Trip[] {
  return trips.filter(trip => trip.archived);
}

// Apply archiving to trip list based on tier
export function applyArchiving(trips: Trip[], tier: SubscriptionTier): Trip[] {
  return trips.map(trip => {
    if (!trip.archived && shouldArchiveTrip(trip, tier)) {
      return archiveTrip(trip);
    }
    return trip;
  });
}

// Get summary of data retention status
export interface RetentionSummary {
  totalTrips: number;
  activeTrips: number;
  archivedTrips: number;
  tripsNeedingWarning: number;
  oldestTripDate: string | null;
  retentionPeriod: string;
}

export function getRetentionSummary(trips: Trip[], tier: SubscriptionTier): RetentionSummary {
  const active = getActiveTrips(trips);
  const archived = getArchivedTrips(trips);
  const needingWarning = getTripsNeedingWarning(trips, tier);

  // Find oldest active trip
  const oldestTrip = active.length > 0
    ? active.reduce((oldest, trip) => {
        const tripDate = new Date(trip.End_Date);
        const oldestDate = new Date(oldest.End_Date);
        return tripDate < oldestDate ? trip : oldest;
      })
    : null;

  return {
    totalTrips: trips.length,
    activeTrips: active.length,
    archivedTrips: archived.length,
    tripsNeedingWarning: needingWarning.length,
    oldestTripDate: oldestTrip?.End_Date || null,
    retentionPeriod: SUBSCRIPTION_TIERS[tier].dataRetention,
  };
}
