import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { withAuth } from '@/lib/apiAuth';
import { Trip } from '@/data/trips';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/trips/[id]
 * Get a specific trip by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return withAuth(async (req, { apiKey }) => {
    try {
      const tripId = params.id;
      const trips = DataStore.getTrips();
      const trip = trips.find(t => t.Trip_ID === tripId);

      if (!trip) {
        return NextResponse.json(
          { error: `Trip with ID ${tripId} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({ trip });
    } catch (error) {
      console.error('Error fetching trip:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

/**
 * PUT /api/trips/[id]
 * Update an existing trip
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return withAuth(async (req, { apiKey }) => {
    try {
      const tripId = params.id;
      const body = await req.json();

      // Check if trip exists
      const trips = DataStore.getTrips();
      const existingTrip = trips.find(t => t.Trip_ID === tripId);

      if (!existingTrip) {
        return NextResponse.json(
          { error: `Trip with ID ${tripId} not found` },
          { status: 404 }
        );
      }

      // Update trip object (merge with existing)
      const updatedTrip: Trip = {
        ...existingTrip,
        ...body,
        Trip_ID: tripId, // Ensure ID doesn't change
        Total_Travelers: (body.Adults !== undefined ? body.Adults : existingTrip.Adults) +
          (body.Children !== undefined ? body.Children : existingTrip.Children),
      };

      // Recalculate trip total cost if any cost fields changed
      updatedTrip.Trip_Total_Cost =
        (updatedTrip.Flight_Cost || 0) +
        (updatedTrip.Hotel_Cost || 0) +
        (updatedTrip.Ground_Transport || 0) +
        (updatedTrip.Activities_Tours || 0) +
        (updatedTrip.Meals_Cost || 0) +
        (updatedTrip.Insurance_Cost || 0) +
        (updatedTrip.Other_Costs || 0);

      // Recalculate cost per traveler
      updatedTrip.Cost_Per_Traveler = updatedTrip.Trip_Total_Cost / updatedTrip.Total_Travelers;

      // Recalculate agency revenue
      if (updatedTrip.Commission_Type === 'percentage') {
        updatedTrip.Agency_Revenue = (updatedTrip.Trip_Total_Cost * (updatedTrip.Commission_Value || 0)) / 100;
      } else {
        updatedTrip.Agency_Revenue = updatedTrip.Commission_Value || 0;
      }

      // Update in DataStore
      DataStore.updateTrip(tripId, updatedTrip);

      return NextResponse.json({ success: true, trip: updatedTrip });
    } catch (error) {
      console.error('Error updating trip:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

/**
 * DELETE /api/trips/[id]
 * Delete a trip
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return withAuth(async (req, { apiKey }) => {
    try {
      const tripId = params.id;

      // Check if trip exists
      const trips = DataStore.getTrips();
      const trip = trips.find(t => t.Trip_ID === tripId);

      if (!trip) {
        return NextResponse.json(
          { error: `Trip with ID ${tripId} not found` },
          { status: 404 }
        );
      }

      // Delete from DataStore
      DataStore.deleteTrip(tripId);

      return NextResponse.json({
        success: true,
        message: `Trip ${tripId} deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
