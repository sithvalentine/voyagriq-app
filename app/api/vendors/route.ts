import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { withAuth } from '@/lib/apiAuth';
import { addCacheHeaders, handleConditionalRequest, CACHE_DURATIONS } from '@/lib/apiCache';

interface VendorData {
  name: string;
  category: string;
  totalSpent: number;
  tripCount: number;
  avgSpend: number;
}

/**
 * GET /api/vendors
 * Get vendor analytics
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, { apiKey }) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const category = searchParams.get('category'); // flight, hotel, groundTransport, activities, insurance

      // Get all trips
      const trips = DataStore.getTrips();

      // Aggregate vendor data
      const vendorData: Record<string, VendorData> = {};

      trips.forEach(trip => {
        // Flight vendors
        if (trip.Flight_Vendor && (!category || category === 'flight')) {
          const key = `flight_${trip.Flight_Vendor}`;
          if (!vendorData[key]) {
            vendorData[key] = {
              name: trip.Flight_Vendor,
              category: 'Flight',
              totalSpent: 0,
              tripCount: 0,
              avgSpend: 0,
            };
          }
          vendorData[key].totalSpent += trip.Flight_Cost;
          vendorData[key].tripCount++;
        }

        // Hotel vendors
        if (trip.Hotel_Vendor && (!category || category === 'hotel')) {
          const key = `hotel_${trip.Hotel_Vendor}`;
          if (!vendorData[key]) {
            vendorData[key] = {
              name: trip.Hotel_Vendor,
              category: 'Hotel',
              totalSpent: 0,
              tripCount: 0,
              avgSpend: 0,
            };
          }
          vendorData[key].totalSpent += trip.Hotel_Cost;
          vendorData[key].tripCount++;
        }

        // Ground transport vendors
        if (trip.Ground_Transport_Vendor && (!category || category === 'groundTransport')) {
          const key = `transport_${trip.Ground_Transport_Vendor}`;
          if (!vendorData[key]) {
            vendorData[key] = {
              name: trip.Ground_Transport_Vendor,
              category: 'Ground Transport',
              totalSpent: 0,
              tripCount: 0,
              avgSpend: 0,
            };
          }
          vendorData[key].totalSpent += trip.Ground_Transport;
          vendorData[key].tripCount++;
        }

        // Activities vendors
        if (trip.Activities_Vendor && (!category || category === 'activities')) {
          const key = `activities_${trip.Activities_Vendor}`;
          if (!vendorData[key]) {
            vendorData[key] = {
              name: trip.Activities_Vendor,
              category: 'Activities & Tours',
              totalSpent: 0,
              tripCount: 0,
              avgSpend: 0,
            };
          }
          vendorData[key].totalSpent += trip.Activities_Tours;
          vendorData[key].tripCount++;
        }

        // Insurance vendors
        if (trip.Insurance_Vendor && (!category || category === 'insurance')) {
          const key = `insurance_${trip.Insurance_Vendor}`;
          if (!vendorData[key]) {
            vendorData[key] = {
              name: trip.Insurance_Vendor,
              category: 'Insurance',
              totalSpent: 0,
              tripCount: 0,
              avgSpend: 0,
            };
          }
          vendorData[key].totalSpent += trip.Insurance_Cost;
          vendorData[key].tripCount++;
        }
      });

      // Calculate average spend and convert to array
      const vendors = Object.values(vendorData).map(vendor => ({
        ...vendor,
        avgSpend: vendor.totalSpent / vendor.tripCount,
      }));

      // Sort by total spent (descending)
      vendors.sort((a, b) => b.totalSpent - a.totalSpent);

      // Calculate category totals
      const categoryTotals = vendors.reduce((acc, vendor) => {
        if (!acc[vendor.category]) {
          acc[vendor.category] = {
            category: vendor.category,
            totalSpent: 0,
            vendorCount: 0,
            tripCount: 0,
          };
        }
        acc[vendor.category].totalSpent += vendor.totalSpent;
        acc[vendor.category].vendorCount++;
        acc[vendor.category].tripCount += vendor.tripCount;
        return acc;
      }, {} as Record<string, { category: string; totalSpent: number; vendorCount: number; tripCount: number }>);

      const responseData = {
        vendors,
        summary: {
          totalVendors: vendors.length,
          totalSpent: vendors.reduce((sum, v) => sum + v.totalSpent, 0),
          categoryTotals: Object.values(categoryTotals),
        },
        filters: {
          category,
        },
      };

      // Check if client has valid cached version (304 Not Modified)
      const conditionalResponse = handleConditionalRequest(req, responseData);
      if (conditionalResponse) {
        return conditionalResponse;
      }

      // Create response with cache headers (5 minutes for vendor stats)
      const response = NextResponse.json(responseData);
      addCacheHeaders(response, 'private', CACHE_DURATIONS.VENDORS, responseData);

      return response;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}
