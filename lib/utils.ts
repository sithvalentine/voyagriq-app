import { Trip } from '@/data/trips';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const year = end.getFullYear();

  const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${startFormatted}–${endFormatted}, ${year}`;
}

export function calculateTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Inclusive
}

export function calculateCostPerDay(trip: Trip): number {
  const days = calculateTripDays(trip.Start_Date, trip.End_Date);
  return trip.Trip_Total_Cost / days;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export function getCategoryBreakdown(trip: Trip): CategoryBreakdown[] {
  const categories = [
    { category: 'Flight', amount: trip.Flight_Cost, color: '#0ea5e9' },
    { category: 'Hotel', amount: trip.Hotel_Cost, color: '#8b5cf6' },
    { category: 'Ground Transport', amount: trip.Ground_Transport, color: '#f59e0b' },
    { category: 'Activities & Tours', amount: trip.Activities_Tours, color: '#10b981' },
    { category: 'Meals', amount: trip.Meals_Cost, color: '#ef4444' },
    { category: 'Insurance', amount: trip.Insurance_Cost, color: '#6366f1' },
    { category: 'Other', amount: trip.Other_Costs, color: '#64748b' },
  ];

  return categories
    .map(cat => ({
      ...cat,
      percentage: (cat.amount / trip.Trip_Total_Cost) * 100,
    }))
    .filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export interface AgencyStats {
  agency: string;
  totalRevenue: number;
  tripCount: number;
  avgTripValue: number;
  topDestination: string;
}

export function getAgencyStats(trips: Trip[]): AgencyStats[] {
  const agencyMap = new Map<string, { revenue: number; trips: Trip[] }>();

  trips.forEach(trip => {
    const existing = agencyMap.get(trip.Travel_Agency) || { revenue: 0, trips: [] };
    agencyMap.set(trip.Travel_Agency, {
      revenue: existing.revenue + trip.Trip_Total_Cost,
      trips: [...existing.trips, trip],
    });
  });

  return Array.from(agencyMap.entries()).map(([agency, data]) => {
    // Find most common destination
    const destinationCounts = new Map<string, number>();
    data.trips.forEach(trip => {
      const dest = trip.Destination_Country;
      destinationCounts.set(dest, (destinationCounts.get(dest) || 0) + 1);
    });
    const topDestination = Array.from(destinationCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      agency,
      totalRevenue: data.revenue,
      tripCount: data.trips.length,
      avgTripValue: data.revenue / data.trips.length,
      topDestination,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function filterTrips(
  trips: Trip[],
  filters: {
    dateRange?: { start: string; end: string };
    agencies?: string[];
    countries?: string[];
    cities?: string[];
  }
): Trip[] {
  return trips.filter(trip => {
    if (filters.dateRange) {
      const tripStart = new Date(trip.Start_Date);
      const filterStart = new Date(filters.dateRange.start);
      const filterEnd = new Date(filters.dateRange.end);
      if (tripStart < filterStart || tripStart > filterEnd) return false;
    }
    if (filters.agencies && filters.agencies.length > 0) {
      if (!filters.agencies.includes(trip.Travel_Agency)) return false;
    }
    if (filters.countries && filters.countries.length > 0) {
      if (!filters.countries.includes(trip.Destination_Country)) return false;
    }
    if (filters.cities && filters.cities.length > 0) {
      if (!filters.cities.includes(trip.Destination_City)) return false;
    }
    return true;
  });
}

// BUSINESS INTELLIGENCE FUNCTIONS

export interface TripInsights {
  costEfficiency: 'Excellent' | 'Good' | 'Average' | 'High' | 'Very High';
  costPerDayRating: string;
  hotelToFlightRatio: number;
  experienceInvestment: number;
  experiencePercentage: number;
  transportEfficiency: number;
  topCostDriver: string;
  potentialSavings: string;
  benchmarkComparison: string;
  seasonality: string;
}

export function analyzeTripInsights(trip: Trip, allTrips: Trip[]): TripInsights {
  const days = calculateTripDays(trip.Start_Date, trip.End_Date);
  const costPerDay = trip.Trip_Total_Cost / days;
  const costPerTraveler = trip.Cost_Per_Traveler;

  // Calculate cost efficiency rating
  const avgCostPerDay = allTrips.reduce((sum, t) => sum + (t.Trip_Total_Cost / calculateTripDays(t.Start_Date, t.End_Date)), 0) / allTrips.length;
  const efficiency = costPerDay / avgCostPerDay;

  let costEfficiency: TripInsights['costEfficiency'];
  if (efficiency < 0.8) costEfficiency = 'Excellent';
  else if (efficiency < 1.0) costEfficiency = 'Good';
  else if (efficiency < 1.2) costEfficiency = 'Average';
  else if (efficiency < 1.4) costEfficiency = 'High';
  else costEfficiency = 'Very High';

  // Hotel to flight ratio (ideal is 1.0-1.5x)
  const hotelToFlightRatio = trip.Flight_Cost > 0 ? trip.Hotel_Cost / trip.Flight_Cost : 0;

  // Experience investment (activities + meals)
  const experienceInvestment = trip.Activities_Tours + trip.Meals_Cost;
  const experiencePercentage = (experienceInvestment / trip.Trip_Total_Cost) * 100;

  // Transport efficiency (total transport costs)
  const totalTransport = trip.Flight_Cost + trip.Ground_Transport;
  const transportEfficiency = (totalTransport / trip.Trip_Total_Cost) * 100;

  // Find top cost driver
  const breakdown = getCategoryBreakdown(trip);
  const topCostDriver = breakdown[0]?.category || 'Unknown';

  // Potential savings analysis
  let potentialSavings = 'None identified';
  if (hotelToFlightRatio > 1.8) {
    potentialSavings = `Hotel costs are ${hotelToFlightRatio.toFixed(1)}x flight costs - consider alternative accommodations`;
  } else if (trip.Flight_Cost > trip.Trip_Total_Cost * 0.45) {
    potentialSavings = `Flights represent ${((trip.Flight_Cost / trip.Trip_Total_Cost) * 100).toFixed(0)}% of total - book further in advance`;
  } else if (experiencePercentage < 15) {
    potentialSavings = `Low experience budget (${experiencePercentage.toFixed(0)}%) - opportunity to add value`;
  }

  // Benchmark comparison
  const similarTrips = allTrips.filter(t =>
    t.Destination_Country === trip.Destination_Country &&
    t.Trip_ID !== trip.Trip_ID
  );

  let benchmarkComparison = 'No comparable trips';
  if (similarTrips.length > 0) {
    const avgSimilar = similarTrips.reduce((sum, t) => sum + t.Cost_Per_Traveler, 0) / similarTrips.length;
    const diff = ((costPerTraveler - avgSimilar) / avgSimilar) * 100;

    if (Math.abs(diff) < 10) {
      benchmarkComparison = `On par with ${similarTrips.length} similar ${trip.Destination_Country} trips`;
    } else if (diff > 0) {
      benchmarkComparison = `${diff.toFixed(0)}% above avg for ${trip.Destination_Country} trips (${formatCurrency(avgSimilar)}/person)`;
    } else {
      benchmarkComparison = `${Math.abs(diff).toFixed(0)}% below avg - excellent value for ${trip.Destination_Country}`;
    }
  }

  // Seasonality analysis
  const month = new Date(trip.Start_Date).getMonth();
  let seasonality = 'Peak Season';
  if ([3, 4, 9, 10].includes(month)) seasonality = 'Shoulder Season - Good Value';
  if ([11, 0, 1, 2].includes(month)) seasonality = 'Off-Season - Best Prices';

  return {
    costEfficiency,
    costPerDayRating: `${formatCurrency(costPerDay)}/day`,
    hotelToFlightRatio,
    experienceInvestment,
    experiencePercentage,
    transportEfficiency,
    topCostDriver,
    potentialSavings,
    benchmarkComparison,
    seasonality,
  };
}

export interface OptimizationOpportunity {
  category: string;
  issue: string;
  recommendation: string;
  potentialSaving: string;
  priority: 'High' | 'Medium' | 'Low';
  icon: string;
}

export function findOptimizationOpportunities(trip: Trip, allTrips: Trip[]): OptimizationOpportunity[] {
  const opportunities: OptimizationOpportunity[] = [];
  const breakdown = getCategoryBreakdown(trip);
  const insights = analyzeTripInsights(trip, allTrips);

  // Flight optimization
  if (trip.Flight_Cost > trip.Trip_Total_Cost * 0.40) {
    opportunities.push({
      category: 'Flight Costs',
      issue: `Flights are ${((trip.Flight_Cost / trip.Trip_Total_Cost) * 100).toFixed(0)}% of total trip cost`,
      recommendation: 'Book 6-8 weeks in advance, use flight comparison tools, consider nearby airports',
      potentialSaving: `$${Math.round(trip.Flight_Cost * 0.15)}-$${Math.round(trip.Flight_Cost * 0.25)}`,
      priority: 'High',
      icon: '✈️'
    });
  }

  // Hotel optimization
  if (insights.hotelToFlightRatio > 1.6) {
    opportunities.push({
      category: 'Accommodation',
      issue: `Hotel costs are ${insights.hotelToFlightRatio.toFixed(1)}x higher than flights`,
      recommendation: 'Consider vacation rentals, boutique hotels, or negotiate longer-stay discounts',
      potentialSaving: `$${Math.round(trip.Hotel_Cost * 0.20)}-$${Math.round(trip.Hotel_Cost * 0.30)}`,
      priority: 'High',
      icon: '🏨'
    });
  }

  // Experience investment
  if (insights.experiencePercentage < 15) {
    opportunities.push({
      category: 'Activities & Experiences',
      issue: `Only ${insights.experiencePercentage.toFixed(0)}% allocated to activities and dining`,
      recommendation: 'Add curated experiences to increase trip value and client satisfaction',
      potentialSaving: 'Revenue opportunity: Upsell $300-$800',
      priority: 'Medium',
      icon: '🎭'
    });
  }

  // Ground transport optimization
  if (trip.Ground_Transport > trip.Trip_Total_Cost * 0.12) {
    opportunities.push({
      category: 'Ground Transportation',
      issue: `${((trip.Ground_Transport / trip.Trip_Total_Cost) * 100).toFixed(0)}% spent on local transport`,
      recommendation: 'Bundle airport transfers, use public transit where safe, negotiate driver rates',
      potentialSaving: `$${Math.round(trip.Ground_Transport * 0.25)}-$${Math.round(trip.Ground_Transport * 0.35)}`,
      priority: 'Medium',
      icon: '🚗'
    });
  }

  // Insurance check
  if (trip.Insurance_Cost < trip.Trip_Total_Cost * 0.04) {
    opportunities.push({
      category: 'Travel Insurance',
      issue: 'Insurance seems low or missing for trip value',
      recommendation: 'Ensure comprehensive coverage (4-6% of trip cost is standard)',
      potentialSaving: 'Risk mitigation: Protect $' + Math.round(trip.Trip_Total_Cost).toLocaleString(),
      priority: 'High',
      icon: '🛡️'
    });
  }

  // Meal costs
  if (trip.Meals_Cost > trip.Trip_Total_Cost * 0.18) {
    opportunities.push({
      category: 'Dining',
      issue: `Meals represent ${((trip.Meals_Cost / trip.Trip_Total_Cost) * 100).toFixed(0)}% of budget`,
      recommendation: 'Mix high-end dining with local eateries, include breakfast in hotel package',
      potentialSaving: `$${Math.round(trip.Meals_Cost * 0.15)}-$${Math.round(trip.Meals_Cost * 0.20)}`,
      priority: 'Low',
      icon: '🍽️'
    });
  }

  return opportunities.sort((a, b) => {
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
