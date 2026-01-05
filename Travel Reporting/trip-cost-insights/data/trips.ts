export interface Trip {
  Trip_ID: string;
  Client_Name: string;
  Travel_Agency: string;
  Start_Date: string;
  End_Date: string;
  Destination_Country: string;
  Destination_City: string;
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
  Cost_Per_Traveler: number;
  Commission_Type?: 'percentage' | 'flat_fee'; // How agency charges
  Commission_Value?: number; // Percentage (e.g., 15 for 15%) or flat dollar amount
  Agency_Revenue?: number; // Calculated commission earned
  Notes: string;
  // Vendor/Supplier tracking fields
  Flight_Vendor?: string;
  Hotel_Vendor?: string;
  Ground_Transport_Vendor?: string;
  Activities_Vendor?: string;
  Insurance_Vendor?: string;
  // Client Organization fields (Premium feature)
  Client_ID?: string; // Unique identifier for the client
  Tags?: string[]; // Custom tags for organizing trips
  Client_Type?: 'individual' | 'corporate' | 'group'; // Type of client
  Custom_Fields?: Record<string, any>; // Flexible custom data
}

export interface Service {
  Trip_ID: string;
  Service_Type: string;
  Service_Name_Vendor: string;
  Quantity: number;
  Unit_Cost: number;
  Total_Cost: number;
  Category: string;
}

export const trips: Trip[] = [
  {
    Trip_ID: "T001",
    Client_Name: "Smith Family",
    Travel_Agency: "Wanderlust Travel",
    Start_Date: "2025-01-15",
    End_Date: "2025-01-22",
    Destination_Country: "Italy",
    Destination_City: "Rome",
    Adults: 3,
    Children: 1,
    Total_Travelers: 4,
    Flight_Cost: 7000,
    Hotel_Cost: 5400,
    Ground_Transport: 1200,
    Activities_Tours: 3400,
    Meals_Cost: 900,
    Insurance_Cost: 400,
    Other_Costs: 200,
    Trip_Total_Cost: 18500,
    Cost_Per_Traveler: 4625,
    Commission_Type: 'percentage',
    Commission_Value: 12,
    Agency_Revenue: 2220,
    Notes: "8-day cultural immersion trip",
    Flight_Vendor: "Delta Airlines",
    Hotel_Vendor: "Rome Cavalieri",
    Ground_Transport_Vendor: "Rome Transport Services",
    Activities_Vendor: "Colosseum Tours Inc",
    Insurance_Vendor: "Travel Guard"
  },
  {
    Trip_ID: "T002",
    Client_Name: "Johnson & Co.",
    Travel_Agency: "Dream Escapes",
    Start_Date: "2025-02-10",
    End_Date: "2025-02-17",
    Destination_Country: "France",
    Destination_City: "Paris",
    Adults: 2,
    Children: 0,
    Total_Travelers: 2,
    Flight_Cost: 4500,
    Hotel_Cost: 4800,
    Ground_Transport: 600,
    Activities_Tours: 1800,
    Meals_Cost: 1200,
    Insurance_Cost: 300,
    Other_Costs: 100,
    Trip_Total_Cost: 13300,
    Cost_Per_Traveler: 6650,
    Commission_Type: 'percentage',
    Commission_Value: 15,
    Agency_Revenue: 1995,
    Notes: "Romantic getaway with museum passes",
    Flight_Vendor: "Air France",
    Hotel_Vendor: "Hotel Le Meurice",
    Ground_Transport_Vendor: "Paris Transfers",
    Activities_Vendor: "Paris Museum Tours",
    Insurance_Vendor: "Allianz Travel"
  },
  {
    Trip_ID: "T003",
    Client_Name: "Martinez Group",
    Travel_Agency: "Global Getaways",
    Start_Date: "2025-03-05",
    End_Date: "2025-03-15",
    Destination_Country: "Japan",
    Destination_City: "Tokyo",
    Adults: 2,
    Children: 0,
    Total_Travelers: 2,
    Flight_Cost: 6800,
    Hotel_Cost: 5200,
    Ground_Transport: 1400,
    Activities_Tours: 2800,
    Meals_Cost: 1500,
    Insurance_Cost: 450,
    Other_Costs: 250,
    Trip_Total_Cost: 18400,
    Cost_Per_Traveler: 9200,
    Commission_Type: 'percentage',
    Commission_Value: 10,
    Agency_Revenue: 1840,
    Notes: "10-day exploration with rail pass",
    Flight_Vendor: "Japan Airlines",
    Hotel_Vendor: "Park Hyatt Tokyo",
    Ground_Transport_Vendor: "JR Rail Pass",
    Activities_Vendor: "Tokyo Cultural Tours",
    Insurance_Vendor: "Travel Guard"
  },
  {
    Trip_ID: "T004",
    Client_Name: "Brown Family",
    Travel_Agency: "Wanderlust Travel",
    Start_Date: "2025-01-20",
    End_Date: "2025-01-28",
    Destination_Country: "Spain",
    Destination_City: "Barcelona",
    Adults: 2,
    Children: 2,
    Total_Travelers: 4,
    Flight_Cost: 5600,
    Hotel_Cost: 4200,
    Ground_Transport: 800,
    Activities_Tours: 2400,
    Meals_Cost: 1100,
    Insurance_Cost: 350,
    Other_Costs: 150,
    Trip_Total_Cost: 14600,
    Cost_Per_Traveler: 3650,
    Commission_Type: 'percentage',
    Commission_Value: 12,
    Agency_Revenue: 1752,
    Notes: "Family beach and culture trip",
    Flight_Vendor: "Iberia Airlines",
    Hotel_Vendor: "W Barcelona",
    Ground_Transport_Vendor: "Barcelona Taxi & Tours",
    Activities_Vendor: "Sagrada Familia Tours",
    Insurance_Vendor: "Allianz Travel"
  },
  {
    Trip_ID: "T005",
    Client_Name: "Davis & Associates",
    Travel_Agency: "Dream Escapes",
    Start_Date: "2025-02-15",
    End_Date: "2025-02-22",
    Destination_Country: "Greece",
    Destination_City: "Athens",
    Adults: 2,
    Children: 0,
    Total_Travelers: 2,
    Flight_Cost: 5200,
    Hotel_Cost: 3800,
    Ground_Transport: 700,
    Activities_Tours: 2200,
    Meals_Cost: 950,
    Insurance_Cost: 320,
    Other_Costs: 130,
    Trip_Total_Cost: 13300,
    Cost_Per_Traveler: 6650,
    Commission_Type: 'percentage',
    Commission_Value: 15,
    Agency_Revenue: 1995,
    Notes: "Ancient history and island hopping",
    Flight_Vendor: "Aegean Airlines",
    Hotel_Vendor: "Hotel Grande Bretagne",
    Ground_Transport_Vendor: "Athens Transfer Services",
    Activities_Vendor: "Greek Island Tours",
    Insurance_Vendor: "Travel Guard"
  },
  {
    Trip_ID: "T006",
    Client_Name: "Wilson Party",
    Travel_Agency: "Wanderlust Travel",
    Start_Date: "2025-03-10",
    End_Date: "2025-03-18",
    Destination_Country: "Italy",
    Destination_City: "Venice",
    Adults: 4,
    Children: 0,
    Total_Travelers: 4,
    Flight_Cost: 8400,
    Hotel_Cost: 6200,
    Ground_Transport: 900,
    Activities_Tours: 3800,
    Meals_Cost: 1600,
    Insurance_Cost: 480,
    Other_Costs: 220,
    Trip_Total_Cost: 21600,
    Cost_Per_Traveler: 5400,
    Commission_Type: 'percentage',
    Commission_Value: 12,
    Agency_Revenue: 2592,
    Notes: "Group tour with gondola experiences",
    Flight_Vendor: "Delta Airlines",
    Hotel_Vendor: "Gritti Palace",
    Ground_Transport_Vendor: "Venice Water Taxis",
    Activities_Vendor: "Gondola Tours Venice",
    Insurance_Vendor: "Allianz Travel"
  },
  {
    Trip_ID: "T007",
    Client_Name: "Thompson Family",
    Travel_Agency: "Global Getaways",
    Start_Date: "2025-04-01",
    End_Date: "2025-04-12",
    Destination_Country: "Costa Rica",
    Destination_City: "San Jose",
    Adults: 2,
    Children: 1,
    Total_Travelers: 3,
    Flight_Cost: 4200,
    Hotel_Cost: 3600,
    Ground_Transport: 1100,
    Activities_Tours: 3200,
    Meals_Cost: 800,
    Insurance_Cost: 380,
    Other_Costs: 320,
    Trip_Total_Cost: 13600,
    Cost_Per_Traveler: 4533,
    Commission_Type: 'percentage',
    Commission_Value: 10,
    Agency_Revenue: 1360,
    Notes: "Eco-tourism and adventure activities",
    Flight_Vendor: "United Airlines",
    Hotel_Vendor: "Four Seasons Costa Rica",
    Ground_Transport_Vendor: "CR Adventure Transport",
    Activities_Vendor: "Eco Adventures CR",
    Insurance_Vendor: "Travel Guard"
  },
  {
    Trip_ID: "T008",
    Client_Name: "Lee & Partners",
    Travel_Agency: "Dream Escapes",
    Start_Date: "2025-03-20",
    End_Date: "2025-03-27",
    Destination_Country: "Portugal",
    Destination_City: "Lisbon",
    Adults: 2,
    Children: 0,
    Total_Travelers: 2,
    Flight_Cost: 4800,
    Hotel_Cost: 3400,
    Ground_Transport: 550,
    Activities_Tours: 1600,
    Meals_Cost: 900,
    Insurance_Cost: 280,
    Other_Costs: 120,
    Trip_Total_Cost: 11650,
    Cost_Per_Traveler: 5825,
    Commission_Type: 'percentage',
    Commission_Value: 15,
    Agency_Revenue: 1747.5,
    Notes: "Wine tasting and coastal exploration",
    Flight_Vendor: "TAP Air Portugal",
    Hotel_Vendor: "Four Seasons Ritz Lisbon",
    Ground_Transport_Vendor: "Lisbon Private Tours",
    Activities_Vendor: "Portuguese Wine Tours",
    Insurance_Vendor: "Allianz Travel"
  }
];

export const services: Service[] = [
  // T001 Services
  { Trip_ID: "T001", Service_Type: "Flight", Service_Name_Vendor: "Delta Airlines", Quantity: 4, Unit_Cost: 1750, Total_Cost: 7000, Category: "Flight" },
  { Trip_ID: "T001", Service_Type: "Hotel", Service_Name_Vendor: "Rome Cavalieri", Quantity: 7, Unit_Cost: 771, Total_Cost: 5400, Category: "Hotel" },
  { Trip_ID: "T001", Service_Type: "Ground", Service_Name_Vendor: "Airport Transfer & Tours", Quantity: 1, Unit_Cost: 1200, Total_Cost: 1200, Category: "Ground Transport" },
  { Trip_ID: "T001", Service_Type: "Activities", Service_Name_Vendor: "Colosseum & Vatican Tours", Quantity: 1, Unit_Cost: 3400, Total_Cost: 3400, Category: "Activities" },
  { Trip_ID: "T001", Service_Type: "Meals", Service_Name_Vendor: "Various Restaurants", Quantity: 1, Unit_Cost: 900, Total_Cost: 900, Category: "Meals" },

  // T002 Services
  { Trip_ID: "T002", Service_Type: "Flight", Service_Name_Vendor: "Air France", Quantity: 2, Unit_Cost: 2250, Total_Cost: 4500, Category: "Flight" },
  { Trip_ID: "T002", Service_Type: "Hotel", Service_Name_Vendor: "Hotel Le Meurice", Quantity: 7, Unit_Cost: 686, Total_Cost: 4800, Category: "Hotel" },
  { Trip_ID: "T002", Service_Type: "Activities", Service_Name_Vendor: "Louvre & Eiffel Tower", Quantity: 1, Unit_Cost: 1800, Total_Cost: 1800, Category: "Activities" },

  // T003 Services
  { Trip_ID: "T003", Service_Type: "Flight", Service_Name_Vendor: "Japan Airlines", Quantity: 2, Unit_Cost: 3400, Total_Cost: 6800, Category: "Flight" },
  { Trip_ID: "T003", Service_Type: "Hotel", Service_Name_Vendor: "Park Hyatt Tokyo", Quantity: 10, Unit_Cost: 520, Total_Cost: 5200, Category: "Hotel" },
  { Trip_ID: "T003", Service_Type: "Activities", Service_Name_Vendor: "Cultural Tours & Tea Ceremony", Quantity: 1, Unit_Cost: 2800, Total_Cost: 2800, Category: "Activities" },
];
