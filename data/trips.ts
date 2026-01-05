// TEMPORARY STUB - This file was removed but some pages still reference it
// TODO: Update pages to use proper TypeScript types from database schema

export interface Trip {
  Trip_ID: string;
  Client_Name: string;
  Travel_Agency?: string;
  Start_Date: string;
  End_Date: string;
  Destination_Country: string;
  Destination_City?: string;
  Adults: number;
  Children: number;
  Total_Travelers: number;
  Flight_Cost: number;
  Hotel_Cost: number;
  Ground_Transport: number;
  Activities_Tours: number;
  Meals_Cost: number;
  Insurance_Cost: number;
  Other_Costs: number;
  Trip_Total_Cost: number;
  Currency?: string;
  Commission_Rate?: number;
  Commission_Amount?: number;
}

export const trips: Trip[] = [];
