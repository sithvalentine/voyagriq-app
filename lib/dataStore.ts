"use client";

import { Trip } from '@/data/trips';

const STORAGE_KEY = 'trip_cost_insights_data';

export class DataStore {
  static getTrips(): Trip[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('DataStore.getTrips - Retrieved trips:', parsed.length);
        if (parsed.length > 0) {
          console.log('First trip sample from storage:', {
            Trip_ID: parsed[0].Trip_ID,
            Flight_Cost: parsed[0].Flight_Cost,
            Hotel_Cost: parsed[0].Hotel_Cost,
            Trip_Total_Cost: parsed[0].Trip_Total_Cost,
            Cost_Per_Traveler: parsed[0].Cost_Per_Traveler,
            types: {
              Flight_Cost: typeof parsed[0].Flight_Cost,
              Hotel_Cost: typeof parsed[0].Hotel_Cost,
              Trip_Total_Cost: typeof parsed[0].Trip_Total_Cost
            }
          });
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing stored data:', e);
        return [];
      }
    }
    return [];
  }

  static setTrips(trips: Trip[]): void {
    if (typeof window === 'undefined') return;
    console.log('DataStore.setTrips - Saving trips:', trips.length);
    if (trips.length > 0) {
      console.log('First trip sample:', {
        Trip_ID: trips[0].Trip_ID,
        Flight_Cost: trips[0].Flight_Cost,
        Hotel_Cost: trips[0].Hotel_Cost,
        Trip_Total_Cost: trips[0].Trip_Total_Cost,
        Cost_Per_Traveler: trips[0].Cost_Per_Traveler,
        types: {
          Flight_Cost: typeof trips[0].Flight_Cost,
          Hotel_Cost: typeof trips[0].Hotel_Cost,
          Trip_Total_Cost: typeof trips[0].Trip_Total_Cost
        }
      });
    }
    const serialized = JSON.stringify(trips);
    console.log('Serialized length:', serialized.length, 'chars');
    localStorage.setItem(STORAGE_KEY, serialized);
  }

  static clearTrips(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  static addTrip(trip: Trip): void {
    const trips = this.getTrips();
    trips.push(trip);
    this.setTrips(trips);
  }

  static updateTrip(tripId: string, updatedTrip: Trip): void {
    const trips = this.getTrips();
    const index = trips.findIndex(t => t.Trip_ID === tripId);
    if (index !== -1) {
      trips[index] = updatedTrip;
      this.setTrips(trips);
    }
  }

  static deleteTrip(tripId: string): void {
    const trips = this.getTrips();
    const filtered = trips.filter(t => t.Trip_ID !== tripId);
    this.setTrips(filtered);
  }

  static importFromCSV(csvText: string): { success: boolean; message: string; count?: number } {
    try {
      // Parse each row properly using papaparse (handles quoted fields with commas correctly)
      const Papa = typeof window !== 'undefined' ? require('papaparse') : null;
      if (!Papa) {
        return { success: false, message: 'CSV parser not available' };
      }

      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim().replace(/\s+/g, '_'),
        delimitersToGuess: [',', '\t', '|', ';'],
        trimHeaders: true
      });

      // Only fail on critical errors, ignore warnings about field counts
      const criticalErrors = parsed.errors.filter((e: any) => e.type !== 'FieldMismatch');
      if (criticalErrors && criticalErrors.length > 0) {
        return { success: false, message: `CSV parsing error: ${criticalErrors[0].message}` };
      }

      if (!parsed.data || parsed.data.length === 0) {
        return { success: false, message: 'CSV file is empty or has no data rows' };
      }

      // Check for required headers
      const headers = Object.keys(parsed.data[0]);
      const requiredHeaders = [
        'Trip_ID', 'Client_Name', 'Travel_Agency', 'Start_Date', 'End_Date',
        'Destination_Country', 'Destination_City', 'Adults', 'Children', 'Total_Travelers',
        'Flight_Cost', 'Hotel_Cost', 'Ground_Transport', 'Activities_Tours',
        'Meals_Cost', 'Insurance_Cost', 'Other_Costs'
      ];

      // Optional headers (will be imported if present): Flight_Vendor, Hotel_Vendor,
      // Ground_Transport_Vendor, Activities_Vendor, Insurance_Vendor, Cruise_Cost, Cruise_Operator,
      // Notes, Commission_Type, Commission_Value

      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        return {
          success: false,
          message: `Missing required columns: ${missingHeaders.join(', ')}`
        };
      }

      const existingTrips = this.getTrips();
      const trips: Trip[] = [];
      const duplicateIds: string[] = [];
      const skippedRows: number[] = [];

      parsed.data.forEach((row: any, i: number) => {
        const trip: any = {};

        Object.keys(row).forEach((header) => {
          // Skip empty or undefined headers (from trailing commas)
          if (!header || header.trim() === '') return;

          const value = row[header];
          // Skip empty values
          if (value === null || value === undefined || value === '') {
            if (header.includes('Cost') || header === 'Adults' || header === 'Children' || header === 'Total_Travelers') {
              trip[header] = 0;
            }
            return;
          }

          if (header.includes('Cost') || header === 'Adults' || header === 'Children' || header === 'Total_Travelers') {
            const numValue = parseFloat(String(value).replace(/[$,]/g, ''));
            trip[header] = isNaN(numValue) ? 0 : numValue;
          } else {
            trip[header] = String(value).trim();
          }
        });

        // Ensure all required numeric fields exist with default values
        const numericFields = ['Flight_Cost', 'Hotel_Cost', 'Ground_Transport', 'Activities_Tours',
                               'Meals_Cost', 'Insurance_Cost', 'Cruise_Cost', 'Other_Costs',
                               'Adults', 'Children', 'Total_Travelers'];
        numericFields.forEach(field => {
          if (!(field in trip)) {
            trip[field] = 0;
          }
        });

        // Check for duplicate Trip_ID in existing trips
        if (existingTrips.some(t => t.Trip_ID === trip.Trip_ID)) {
          duplicateIds.push(trip.Trip_ID);
          skippedRows.push(i + 2); // +2 for header row and 1-based indexing
          return;
        }

        // Check for duplicate Trip_ID in current import batch
        if (trips.some(t => t.Trip_ID === trip.Trip_ID)) {
          duplicateIds.push(trip.Trip_ID);
          skippedRows.push(i + 2);
          return;
        }

        // Calculate derived fields - ensure all values are numbers
        const flightCost = Number(trip.Flight_Cost) || 0;
        const hotelCost = Number(trip.Hotel_Cost) || 0;
        const groundTransport = Number(trip.Ground_Transport) || 0;
        const activitiesTours = Number(trip.Activities_Tours) || 0;
        const mealsCost = Number(trip.Meals_Cost) || 0;
        const insuranceCost = Number(trip.Insurance_Cost) || 0;
        const cruiseCost = Number(trip.Cruise_Cost) || 0;
        const otherCosts = Number(trip.Other_Costs) || 0;
        const totalTravelers = Number(trip.Total_Travelers) || 1;

        trip.Trip_Total_Cost = flightCost + hotelCost + groundTransport + activitiesTours +
                               mealsCost + insuranceCost + cruiseCost + otherCosts;
        trip.Cost_Per_Traveler = trip.Trip_Total_Cost / totalTravelers;

        trip.Notes = trip.Notes || '';

        console.log('Parsed trip:', trip.Trip_ID, {
          Flight_Cost: trip.Flight_Cost,
          Hotel_Cost: trip.Hotel_Cost,
          Trip_Total_Cost: trip.Trip_Total_Cost,
          Cost_Per_Traveler: trip.Cost_Per_Traveler
        });

        trips.push(trip as Trip);
      });

      // Merge with existing trips
      const allTrips = [...existingTrips, ...trips];
      this.setTrips(allTrips);

      let message = `Successfully imported ${trips.length} trip(s)`;
      if (duplicateIds.length > 0) {
        message += `. Skipped ${duplicateIds.length} duplicate(s) (Trip IDs: ${duplicateIds.slice(0, 5).join(', ')}${duplicateIds.length > 5 ? '...' : ''})`;
      }

      return { success: true, message, count: trips.length };
    } catch (error) {
      return { success: false, message: `Import failed: ${error}` };
    }
  }

  static exportToCSV(): string {
    const trips = this.getTrips();
    if (trips.length === 0) return '';

    const headers = [
      'Trip_ID', 'Client_Name', 'Travel_Agency', 'Start_Date', 'End_Date',
      'Destination_Country', 'Destination_City', 'Adults', 'Children', 'Total_Travelers',
      'Flight_Cost', 'Hotel_Cost', 'Ground_Transport', 'Activities_Tours',
      'Meals_Cost', 'Insurance_Cost', 'Cruise_Cost', 'Other_Costs', 'Trip_Total_Cost', 'Cost_Per_Traveler', 'Notes',
      'Flight_Vendor', 'Hotel_Vendor', 'Ground_Transport_Vendor', 'Activities_Vendor', 'Insurance_Vendor', 'Cruise_Operator'
    ];

    const rows = trips.map(trip => {
      return headers.map(header => {
        const value = trip[header as keyof Trip];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value || '';
      }).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // Data retention methods
  static applyDataRetention(tier: import('./subscription').SubscriptionTier): void {
    const { applyArchiving } = require('./dataRetention');
    const trips = this.getTrips();
    const updatedTrips = applyArchiving(trips, tier);

    // Only save if there were changes
    const hasChanges = updatedTrips.some((trip: Trip, index: number) => trip.archived !== trips[index]?.archived);
    if (hasChanges) {
      this.setTrips(updatedTrips);
    }
  }

  static restoreArchivedTrips(newTier: import('./subscription').SubscriptionTier): void {
    const { restoreTripsForTier } = require('./dataRetention');
    const trips = this.getTrips();
    const restoredTrips = restoreTripsForTier(trips, newTier);
    this.setTrips(restoredTrips);
  }

  static markTripWarningShown(tripId: string): void {
    const trips = this.getTrips();
    const index = trips.findIndex(t => t.Trip_ID === tripId);
    if (index !== -1) {
      trips[index].archiveWarningShown = true;
      this.setTrips(trips);
    }
  }

  static getActiveTrips(): Trip[] {
    const { getActiveTrips } = require('./dataRetention');
    return getActiveTrips(this.getTrips());
  }

  static getArchivedTrips(): Trip[] {
    const { getArchivedTrips } = require('./dataRetention');
    return getArchivedTrips(this.getTrips());
  }
}
