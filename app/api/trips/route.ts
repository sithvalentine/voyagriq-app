import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { withAuth } from '@/lib/apiAuth';
import { Trip } from '@/data/trips';

/**
 * GET /api/trips
 * List all trips with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, { apiKey }) => {
    try {
      // Get all trips from DataStore
      let trips = DataStore.getTrips();

      // Parse query parameters
      const searchParams = req.nextUrl.searchParams;
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');
      const agency = searchParams.get('agency');
      const country = searchParams.get('country');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const minCost = searchParams.get('minCost');
      const maxCost = searchParams.get('maxCost');

      // Apply filters
      if (agency) {
        trips = trips.filter(t =>
          t.Travel_Agency.toLowerCase().includes(agency.toLowerCase())
        );
      }

      if (country) {
        trips = trips.filter(t =>
          t.Destination_Country.toLowerCase().includes(country.toLowerCase())
        );
      }

      if (startDate) {
        trips = trips.filter(t => new Date(t.Start_Date) >= new Date(startDate));
      }

      if (endDate) {
        trips = trips.filter(t => new Date(t.End_Date) <= new Date(endDate));
      }

      if (minCost) {
        trips = trips.filter(t => t.Trip_Total_Cost >= parseFloat(minCost));
      }

      if (maxCost) {
        trips = trips.filter(t => t.Trip_Total_Cost <= parseFloat(maxCost));
      }

      const total = trips.length;

      // Apply pagination
      const paginatedTrips = trips.slice(offset, offset + limit);

      return NextResponse.json({
        trips: paginatedTrips,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      });
    } catch (error) {
      console.error('Error fetching trips:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

/**
 * POST /api/trips
 * Create a new trip
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req, { apiKey }) => {
    try {
      const body = await req.json();

      // Validate required fields
      const requiredFields = [
        'Trip_ID',
        'Client_Name',
        'Travel_Agency',
        'Start_Date',
        'End_Date',
        'Destination_Country',
        'Destination_City',
        'Adults',
      ];

      for (const field of requiredFields) {
        if (!body[field] && body[field] !== 0) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      // Check if Trip_ID already exists
      const existingTrips = DataStore.getTrips();
      if (existingTrips.some(t => t.Trip_ID === body.Trip_ID)) {
        return NextResponse.json(
          { error: `Trip with ID ${body.Trip_ID} already exists` },
          { status: 409 }
        );
      }

      // Create trip object
      const newTrip: Trip = {
        Trip_ID: body.Trip_ID,
        Client_Name: body.Client_Name,
        Travel_Agency: body.Travel_Agency,
        Start_Date: body.Start_Date,
        End_Date: body.End_Date,
        Destination_Country: body.Destination_Country,
        Destination_City: body.Destination_City,
        Adults: body.Adults || 0,
        Children: body.Children || 0,
        Total_Travelers: (body.Adults || 0) + (body.Children || 0),
        Flight_Cost: body.Flight_Cost || 0,
        Hotel_Cost: body.Hotel_Cost || 0,
        Ground_Transport: body.Ground_Transport || 0,
        Activities_Tours: body.Activities_Tours || 0,
        Meals_Cost: body.Meals_Cost || 0,
        Insurance_Cost: body.Insurance_Cost || 0,
        Other_Costs: body.Other_Costs || 0,
        Trip_Total_Cost:
          (body.Flight_Cost || 0) +
          (body.Hotel_Cost || 0) +
          (body.Ground_Transport || 0) +
          (body.Activities_Tours || 0) +
          (body.Meals_Cost || 0) +
          (body.Insurance_Cost || 0) +
          (body.Other_Costs || 0),
        Cost_Per_Traveler: 0, // Will be calculated below
        Commission_Type: body.Commission_Type || 'percentage',
        Commission_Value: body.Commission_Value || 15,
        Agency_Revenue: 0, // Will be calculated below
        Notes: body.Notes || '',
        Flight_Vendor: body.Flight_Vendor,
        Hotel_Vendor: body.Hotel_Vendor,
        Ground_Transport_Vendor: body.Ground_Transport_Vendor,
        Activities_Vendor: body.Activities_Vendor,
        Insurance_Vendor: body.Insurance_Vendor,
      };

      // Calculate derived fields
      newTrip.Cost_Per_Traveler = newTrip.Trip_Total_Cost / newTrip.Total_Travelers;

      if (newTrip.Commission_Type === 'percentage') {
        newTrip.Agency_Revenue = (newTrip.Trip_Total_Cost * (newTrip.Commission_Value || 0)) / 100;
      } else {
        newTrip.Agency_Revenue = newTrip.Commission_Value || 0;
      }

      // Add to DataStore
      DataStore.addTrip(newTrip);

      return NextResponse.json(
        { success: true, trip: newTrip },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating trip:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
