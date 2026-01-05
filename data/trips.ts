// Trip interface matching Supabase database schema and legacy localStorage format
// This interface is used throughout the application for trip data

export interface Trip {
  // Core Trip Information
  Trip_ID: string;
  Client_Name: string;
  Travel_Agency?: string;
  Start_Date: string;
  End_Date: string;

  // Destination
  Destination_Country: string;
  Destination_City?: string;

  // Travelers
  Adults: number;
  Children: number;
  Total_Travelers: number;

  // Costs (in dollars, not cents - converted from database)
  Flight_Cost: number;
  Hotel_Cost: number;
  Ground_Transport: number;
  Activities_Tours: number;
  Meals_Cost: number;
  Insurance_Cost: number;
  Other_Costs: number;
  Trip_Total_Cost: number;
  Cost_Per_Traveler: number;

  // Currency
  Currency?: string;

  // Commission
  Commission_Type?: 'percentage' | 'flat_fee';
  Commission_Value?: number;
  Commission_Rate?: number; // Legacy - same as Commission_Value
  Commission_Amount?: number; // Legacy - same as Agency_Revenue
  Agency_Revenue?: number;

  // Premium Features (Standard/Premium tiers)
  Client_ID?: string;
  Client_Type?: 'individual' | 'corporate' | 'group';
  Notes?: string;

  // Vendor/Supplier Tracking (Premium tier)
  Flight_Vendor?: string;
  Hotel_Vendor?: string;
  Ground_Transport_Vendor?: string;
  Activities_Vendor?: string;
  Insurance_Vendor?: string;
}

export const trips: Trip[] = [];
