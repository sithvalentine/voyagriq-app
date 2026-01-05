import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { withAuth } from '@/lib/apiAuth';

/**
 * GET /api/analytics
 * Get analytics data with optional date range filtering
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, { apiKey }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const agency = searchParams.get('agency');

      // Get all trips
      let trips = DataStore.getTrips();

      // Apply date filters
      if (startDate) {
        trips = trips.filter(t => new Date(t.Start_Date) >= new Date(startDate));
      }

      if (endDate) {
        trips = trips.filter(t => new Date(t.End_Date) <= new Date(endDate));
      }

      // Apply agency filter
      if (agency) {
        trips = trips.filter(t =>
          t.Travel_Agency.toLowerCase().includes(agency.toLowerCase())
        );
      }

      // Calculate analytics
      const totalTrips = trips.length;
      const totalRevenue = trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0);
      const totalCommission = trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
      const totalTravelers = trips.reduce((sum, t) => sum + t.Total_Travelers, 0);

      const avgTripValue = totalTrips > 0 ? totalRevenue / totalTrips : 0;
      const avgCommission = totalTrips > 0 ? totalCommission / totalTrips : 0;
      const avgTravelers = totalTrips > 0 ? totalTravelers / totalTrips : 0;
      const avgCostPerTraveler = totalTravelers > 0 ? totalRevenue / totalTravelers : 0;

      // Calculate cost breakdown
      const totalFlightCost = trips.reduce((sum, t) => sum + t.Flight_Cost, 0);
      const totalHotelCost = trips.reduce((sum, t) => sum + t.Hotel_Cost, 0);
      const totalGroundTransport = trips.reduce((sum, t) => sum + t.Ground_Transport, 0);
      const totalActivitiesTours = trips.reduce((sum, t) => sum + t.Activities_Tours, 0);
      const totalMealsCost = trips.reduce((sum, t) => sum + t.Meals_Cost, 0);
      const totalInsuranceCost = trips.reduce((sum, t) => sum + t.Insurance_Cost, 0);
      const totalOtherCosts = trips.reduce((sum, t) => sum + t.Other_Costs, 0);

      // Top agencies by revenue
      const agencyStats = trips.reduce((acc, trip) => {
        if (!acc[trip.Travel_Agency]) {
          acc[trip.Travel_Agency] = {
            name: trip.Travel_Agency,
            tripCount: 0,
            totalRevenue: 0,
            totalCommission: 0,
          };
        }
        acc[trip.Travel_Agency].tripCount++;
        acc[trip.Travel_Agency].totalRevenue += trip.Trip_Total_Cost;
        acc[trip.Travel_Agency].totalCommission += trip.Agency_Revenue || 0;
        return acc;
      }, {} as Record<string, { name: string; tripCount: number; totalRevenue: number; totalCommission: number }>);

      const topAgencies = Object.values(agencyStats)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);

      // Top destinations by trip count
      const destinationStats = trips.reduce((acc, trip) => {
        const destination = `${trip.Destination_City}, ${trip.Destination_Country}`;
        if (!acc[destination]) {
          acc[destination] = {
            destination,
            tripCount: 0,
            totalRevenue: 0,
          };
        }
        acc[destination].tripCount++;
        acc[destination].totalRevenue += trip.Trip_Total_Cost;
        return acc;
      }, {} as Record<string, { destination: string; tripCount: number; totalRevenue: number }>);

      const topDestinations = Object.values(destinationStats)
        .sort((a, b) => b.tripCount - a.tripCount)
        .slice(0, 10);

      // Monthly trends (if date range provided)
      let monthlyTrends: Array<{
        month: string;
        tripCount: number;
        revenue: number;
        commission: number;
      }> = [];

      if (startDate && endDate) {
        const monthlyData: Record<string, { tripCount: number; revenue: number; commission: number }> = {};

        trips.forEach(trip => {
          const date = new Date(trip.Start_Date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { tripCount: 0, revenue: 0, commission: 0 };
          }

          monthlyData[monthKey].tripCount++;
          monthlyData[monthKey].revenue += trip.Trip_Total_Cost;
          monthlyData[monthKey].commission += trip.Agency_Revenue || 0;
        });

        monthlyTrends = Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));
      }

      return NextResponse.json({
        summary: {
          totalTrips,
          totalRevenue,
          totalCommission,
          totalTravelers,
          avgTripValue,
          avgCommission,
          avgTravelers,
          avgCostPerTraveler,
        },
        costBreakdown: {
          flight: totalFlightCost,
          hotel: totalHotelCost,
          groundTransport: totalGroundTransport,
          activitiesTours: totalActivitiesTours,
          meals: totalMealsCost,
          insurance: totalInsuranceCost,
          other: totalOtherCosts,
        },
        topAgencies,
        topDestinations,
        monthlyTrends: monthlyTrends.length > 0 ? monthlyTrends : undefined,
        filters: {
          startDate,
          endDate,
          agency,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
