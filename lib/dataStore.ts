"use client";

import { Trip } from '@/data/trips';

const STORAGE_KEY = 'trip_cost_insights_data';

export class DataStore {
  static getTrips(): Trip[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored data:', e);
        return [];
      }
    }
    return [];
  }

  static setTrips(trips: Trip[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
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
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        return { success: false, message: 'CSV file is empty or has no data rows' };
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = [
        'Trip_ID', 'Client_Name', 'Travel_Agency', 'Start_Date', 'End_Date',
        'Destination_Country', 'Destination_City', 'Adults', 'Children', 'Total_Travelers',
        'Flight_Cost', 'Hotel_Cost', 'Ground_Transport', 'Activities_Tours',
        'Meals_Cost', 'Insurance_Cost', 'Other_Costs'
      ];

      // Optional headers (will be imported if present): Flight_Vendor, Hotel_Vendor,
      // Ground_Transport_Vendor, Activities_Vendor, Insurance_Vendor, Notes, Commission_Type, Commission_Value

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

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        const trip: any = {};

        headers.forEach((header, index) => {
          const value = values[index];
          if (header.includes('Cost') || header === 'Adults' || header === 'Children' || header === 'Total_Travelers') {
            trip[header] = parseFloat(value) || 0;
          } else {
            trip[header] = value;
          }
        });

        // Check for duplicate Trip_ID in existing trips
        if (existingTrips.some(t => t.Trip_ID === trip.Trip_ID)) {
          duplicateIds.push(trip.Trip_ID);
          skippedRows.push(i + 1);
          continue;
        }

        // Check for duplicate Trip_ID in current import batch
        if (trips.some(t => t.Trip_ID === trip.Trip_ID)) {
          duplicateIds.push(trip.Trip_ID);
          skippedRows.push(i + 1);
          continue;
        }

        // Calculate derived fields
        trip.Trip_Total_Cost =
          trip.Flight_Cost + trip.Hotel_Cost + trip.Ground_Transport +
          trip.Activities_Tours + trip.Meals_Cost + trip.Insurance_Cost + trip.Other_Costs;

        trip.Cost_Per_Traveler = trip.Trip_Total_Cost / (trip.Total_Travelers || 1);

        trip.Notes = trip.Notes || '';

        trips.push(trip as Trip);
      }

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
      'Meals_Cost', 'Insurance_Cost', 'Other_Costs', 'Trip_Total_Cost', 'Cost_Per_Traveler', 'Notes',
      'Flight_Vendor', 'Hotel_Vendor', 'Ground_Transport_Vendor', 'Activities_Vendor', 'Insurance_Vendor'
    ];

    const rows = trips.map(trip => {
      return headers.map(header => {
        const value = trip[header as keyof Trip];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value || '';
      }).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
