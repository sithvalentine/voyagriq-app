import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiAuth';
import { Trip } from '@/data/trips';
import { getServiceRoleClient } from '@/lib/supabase';
import { corsPreflightHandler, addCorsHeaders } from '@/lib/cors';

// SECURITY: All authentication, rate limiting, and premium tier checks handled by withAuth middleware

/**
 * OPTIONS /api/trips
 * Handle CORS preflight requests
 */
export const OPTIONS = corsPreflightHandler;

/**
 * GET /api/trips
 * List all trips with optional filtering and pagination
 * @requires Premium plan (enforced by withAuth)
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, { apiKey }) => {
    try {
      const supabase = getServiceRoleClient();

      // Parse query parameters
      const searchParams = req.nextUrl.searchParams;
      const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000); // Cap at 1000
      const offset = parseInt(searchParams.get('offset') || '0');
      const agency = searchParams.get('agency');
      const country = searchParams.get('country');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const minCost = searchParams.get('minCost'); // in dollars
      const maxCost = searchParams.get('maxCost'); // in dollars

      // Start building query - filter by user_id from API key
      let query = supabase
        .from('trips')
        .select('*', { count: 'exact' })
        .eq('user_id', apiKey.user_id);

      // Apply filters using Supabase query builder
      if (agency) {
        query = query.ilike('travel_agency', `%${agency}%`);
      }

      if (country) {
        query = query.ilike('destination_country', `%${country}%`);
      }

      if (startDate) {
        query = query.gte('start_date', startDate);
      }

      if (endDate) {
        query = query.lte('end_date', endDate);
      }

      // Cost filters - convert dollars to cents for comparison
      if (minCost) {
        const minCostCents = Math.round(parseFloat(minCost) * 100);
        query = query.gte('trip_total_cost', minCostCents);
      }

      if (maxCost) {
        const maxCostCents = Math.round(parseFloat(maxCost) * 100);
        query = query.lte('trip_total_cost', maxCostCents);
      }

      // Apply pagination and ordering
      query = query
        .order('start_date', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: dbTrips, error, count } = await query;

      if (error) {
        console.error('[trips-api] Error fetching trips:', error);
        return NextResponse.json(
          { error: 'Failed to fetch trips' },
          { status: 500 }
        );
      }

      // Convert database format (snake_case, cents) to API format (PascalCase, dollars)
      const trips: Trip[] = (dbTrips || []).map(dbTrip => {
        const totalCostDollars = dbTrip.trip_total_cost / 100;
        const costPerTraveler = dbTrip.total_travelers > 0
          ? totalCostDollars / dbTrip.total_travelers
          : 0;

        // Calculate agency revenue from commission
        let agencyRevenue = 0;
        if (dbTrip.commission_rate) {
          agencyRevenue = (totalCostDollars * dbTrip.commission_rate) / 100;
        } else if (dbTrip.commission_amount) {
          agencyRevenue = dbTrip.commission_amount / 100;
        }

        return {
          Trip_ID: dbTrip.trip_id,
          Client_Name: dbTrip.client_name,
          Travel_Agency: dbTrip.travel_agency || '',
          Start_Date: dbTrip.start_date,
          End_Date: dbTrip.end_date,
          Destination_Country: dbTrip.destination_country,
          Destination_City: dbTrip.destination_city || '',
          Adults: dbTrip.adults,
          Children: dbTrip.children,
          Total_Travelers: dbTrip.total_travelers,
          Flight_Cost: dbTrip.flight_cost / 100,
          Hotel_Cost: dbTrip.hotel_cost / 100,
          Ground_Transport: dbTrip.ground_transport / 100,
          Activities_Tours: dbTrip.activities_tours / 100,
          Meals_Cost: dbTrip.meals_cost / 100,
          Insurance_Cost: dbTrip.insurance_cost / 100,
          Other_Costs: dbTrip.other_costs / 100,
          Trip_Total_Cost: totalCostDollars,
          Cost_Per_Traveler: costPerTraveler,
          Commission_Type: dbTrip.commission_rate ? 'percentage' : 'flat_fee',
          Commission_Value: dbTrip.commission_rate || (dbTrip.commission_amount ? dbTrip.commission_amount / 100 : undefined),
          Agency_Revenue: agencyRevenue,
          Notes: dbTrip.custom_fields?.notes || '',
          // Vendor fields from custom_fields JSONB
          Flight_Vendor: dbTrip.custom_fields?.flight_vendor,
          Hotel_Vendor: dbTrip.custom_fields?.hotel_vendor,
          Ground_Transport_Vendor: dbTrip.custom_fields?.ground_transport_vendor,
          Activities_Vendor: dbTrip.custom_fields?.activities_vendor,
          Insurance_Vendor: dbTrip.custom_fields?.insurance_vendor,
          // Premium features
          Client_ID: dbTrip.client_id,
          Tags: dbTrip.tags,
          Client_Type: dbTrip.client_type as 'individual' | 'corporate' | 'group' | undefined,
          Custom_Fields: dbTrip.custom_fields,
        };
      });

      const response = NextResponse.json({
        trips,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: offset + limit < (count || 0),
        },
      });

      return addCorsHeaders(response, request.headers.get('origin'));
    } catch (error) {
      console.error('[trips-api] Error in GET handler:', error);
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      return addCorsHeaders(errorResponse, request.headers.get('origin'));
    }
  })(request);
}

/**
 * POST /api/trips
 * Create a new trip
 * @requires Premium plan (enforced by withAuth)
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req, { apiKey }) => {
    try {
      const supabase = getServiceRoleClient();
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

      // Check if Trip_ID already exists for this user
      const { data: existingTrip } = await supabase
        .from('trips')
        .select('id')
        .eq('user_id', apiKey.user_id)
        .eq('trip_id', body.Trip_ID)
        .single();

      if (existingTrip) {
        return NextResponse.json(
          { error: `Trip with ID ${body.Trip_ID} already exists` },
          { status: 409 }
        );
      }

      // Calculate totals and commission
      const adults = body.Adults || 0;
      const children = body.Children || 0;
      const totalTravelers = adults + children;

      // Convert costs from dollars to cents
      const flightCostCents = Math.round((body.Flight_Cost || 0) * 100);
      const hotelCostCents = Math.round((body.Hotel_Cost || 0) * 100);
      const groundTransportCents = Math.round((body.Ground_Transport || 0) * 100);
      const activitiesCents = Math.round((body.Activities_Tours || 0) * 100);
      const mealsCostCents = Math.round((body.Meals_Cost || 0) * 100);
      const insuranceCostCents = Math.round((body.Insurance_Cost || 0) * 100);
      const otherCostsCents = Math.round((body.Other_Costs || 0) * 100);

      // trip_total_cost is auto-calculated by database
      const totalCostCents = flightCostCents + hotelCostCents + groundTransportCents +
                           activitiesCents + mealsCostCents + insuranceCostCents + otherCostsCents;

      // Calculate commission
      let commissionRate = null;
      let commissionAmount = null;

      if (body.Commission_Type === 'percentage') {
        commissionRate = body.Commission_Value || 15;
        // Commission amount will be calculated from rate when needed
      } else {
        // Flat fee - store in cents
        commissionAmount = Math.round((body.Commission_Value || 0) * 100);
      }

      // Build custom_fields JSONB with vendor info and notes
      const customFields: any = {};
      if (body.Notes) customFields.notes = body.Notes;
      if (body.Flight_Vendor) customFields.flight_vendor = body.Flight_Vendor;
      if (body.Hotel_Vendor) customFields.hotel_vendor = body.Hotel_Vendor;
      if (body.Ground_Transport_Vendor) customFields.ground_transport_vendor = body.Ground_Transport_Vendor;
      if (body.Activities_Vendor) customFields.activities_vendor = body.Activities_Vendor;
      if (body.Insurance_Vendor) customFields.insurance_vendor = body.Insurance_Vendor;

      // Insert into database
      const { data: dbTrip, error } = await supabase
        .from('trips')
        .insert({
          user_id: apiKey.user_id,
          trip_id: body.Trip_ID,
          client_name: body.Client_Name,
          travel_agency: body.Travel_Agency,
          start_date: body.Start_Date,
          end_date: body.End_Date,
          destination_country: body.Destination_Country,
          destination_city: body.Destination_City,
          adults,
          children,
          total_travelers: totalTravelers,
          flight_cost: flightCostCents,
          hotel_cost: hotelCostCents,
          ground_transport: groundTransportCents,
          activities_tours: activitiesCents,
          meals_cost: mealsCostCents,
          insurance_cost: insuranceCostCents,
          other_costs: otherCostsCents,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          client_id: body.Client_ID,
          client_type: body.Client_Type,
          tags: body.Tags,
          custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
        })
        .select()
        .single();

      if (error) {
        console.error('[trips-api] Error creating trip:', error);
        return NextResponse.json(
          { error: 'Failed to create trip' },
          { status: 500 }
        );
      }

      // Convert back to API format for response
      const totalCostDollars = dbTrip.trip_total_cost / 100;
      const costPerTraveler = totalTravelers > 0 ? totalCostDollars / totalTravelers : 0;

      let agencyRevenue = 0;
      if (dbTrip.commission_rate) {
        agencyRevenue = (totalCostDollars * dbTrip.commission_rate) / 100;
      } else if (dbTrip.commission_amount) {
        agencyRevenue = dbTrip.commission_amount / 100;
      }

      const newTrip: Trip = {
        Trip_ID: dbTrip.trip_id,
        Client_Name: dbTrip.client_name,
        Travel_Agency: dbTrip.travel_agency,
        Start_Date: dbTrip.start_date,
        End_Date: dbTrip.end_date,
        Destination_Country: dbTrip.destination_country,
        Destination_City: dbTrip.destination_city || '',
        Adults: dbTrip.adults,
        Children: dbTrip.children,
        Total_Travelers: dbTrip.total_travelers,
        Flight_Cost: dbTrip.flight_cost / 100,
        Hotel_Cost: dbTrip.hotel_cost / 100,
        Ground_Transport: dbTrip.ground_transport / 100,
        Activities_Tours: dbTrip.activities_tours / 100,
        Meals_Cost: dbTrip.meals_cost / 100,
        Insurance_Cost: dbTrip.insurance_cost / 100,
        Other_Costs: dbTrip.other_costs / 100,
        Trip_Total_Cost: totalCostDollars,
        Cost_Per_Traveler: costPerTraveler,
        Commission_Type: dbTrip.commission_rate ? 'percentage' : 'flat_fee',
        Commission_Value: dbTrip.commission_rate || (dbTrip.commission_amount ? dbTrip.commission_amount / 100 : 15),
        Agency_Revenue: agencyRevenue,
        Notes: dbTrip.custom_fields?.notes || '',
        Flight_Vendor: dbTrip.custom_fields?.flight_vendor,
        Hotel_Vendor: dbTrip.custom_fields?.hotel_vendor,
        Ground_Transport_Vendor: dbTrip.custom_fields?.ground_transport_vendor,
        Activities_Vendor: dbTrip.custom_fields?.activities_vendor,
        Insurance_Vendor: dbTrip.custom_fields?.insurance_vendor,
        Client_ID: dbTrip.client_id,
        Tags: dbTrip.tags,
        Client_Type: dbTrip.client_type as 'individual' | 'corporate' | 'group' | undefined,
        Custom_Fields: dbTrip.custom_fields,
      };

      const response = NextResponse.json(
        { success: true, trip: newTrip },
        { status: 201 }
      );
      return addCorsHeaders(response, request.headers.get('origin'));
    } catch (error) {
      console.error('[trips-api] Error in POST handler:', error);
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      return addCorsHeaders(errorResponse, request.headers.get('origin'));
    }
  })(request);
}
