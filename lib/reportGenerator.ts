// @ts-nocheck
import { Trip } from '@/data/trips';

export type SubscriptionTier = 'starter' | 'standard' | 'premium';

// ============================================================================
// DATA ANALYSIS INTERFACES
// ============================================================================

export interface ExecutiveSummary {
  totalTrips: number;
  totalRevenue: number;
  totalCosts: number;
  avgCommissionRate: number;
  avgTripCost: number;
  momGrowth: number;
  topDestination: string;
  topTraveler: string;
  kpis: {
    avgBookingValue: number;
    repeatTravelerRate: number;
    avgTravelersPerTrip: number;
  };
}

export interface DestinationAnalysis {
  topByRevenue: Array<{
    country: string;
    revenue: number;
    tripCount: number;
    avgRevenue: number;
    percentOfTotal: number;
  }>;
  topByCount: Array<{
    country: string;
    tripCount: number;
    totalRevenue: number;
    avgCost: number;
  }>;
  profitability: Array<{
    country: string;
    totalCost: number;
    totalRevenue: number;
    margin: number;
    profitMarginPercent: number;
  }>;
}

export interface CommissionBreakdown {
  byDestination: Array<{
    country: string;
    totalCommission: number;
    avgCommissionRate: number;
    tripCount: number;
    percentOfTotal: number;
  }>;
  byAgency: Array<{
    agency: string;
    totalCommission: number;
    avgRate: number;
    tripCount: number;
    percentOfTotal: number;
  }>;
  rateDistribution: {
    withCommission: number;
    withoutCommission: number;
    avgRate: number;
  };
  trends: Array<{
    month: string;
    totalCommission: number;
    tripCount: number;
  }>;
}

export interface TripCostAnalysis {
  avgByDestination: Array<{
    country: string;
    avgCost: number;
    minCost: number;
    maxCost: number;
    tripCount: number;
  }>;
  distribution: {
    under5000: number;
    between5000and10000: number;
    between10000and15000: number;
    between15000and20000: number;
    over20000: number;
  };
  costBreakdown: {
    flights: number;
    hotels: number;
    transport: number;
    activities: number;
    meals: number;
    insurance: number;
    other: number;
  };
  trends: Array<{
    month: string;
    avgCost: number;
    totalCost: number;
  }>;
}

export interface TravelerInsights {
  topBySpend: Array<{
    traveler: string;
    totalSpent: number;
    tripCount: number;
    avgTripCost: number;
    lastTripDate: string;
  }>;
  topByCount: Array<{
    traveler: string;
    tripCount: number;
    totalSpent: number;
    avgTripCost: number;
  }>;
  repeatVsNew: {
    repeatTravelers: number;
    newTravelers: number;
    repeatRate: number;
    totalUniqueTravelers: number;
  };
  demographics: {
    avgGroupSize: number;
    totalAdults: number;
    totalChildren: number;
    avgAdultsPerTrip: number;
    avgChildrenPerTrip: number;
  };
}

export interface Recommendations {
  keyInsights: string[];
  opportunities: Array<{
    title: string;
    description: string;
    potentialImpact: 'High' | 'Medium' | 'Low';
    effort: 'High' | 'Medium' | 'Low';
  }>;
  risks: Array<{
    title: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    mitigation: string;
  }>;
  actions: string[];
}

// Standard Tier Additional Interfaces
export interface AdvancedAnalytics {
  seasonalTrends: Array<{
    season: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    tripCount: number;
    avgRevenue: number;
    popularDestinations: string[];
  }>;
  bookingPatterns: {
    byMonth: Record<string, number>;
    peakMonths: string[];
    lowMonths: string[];
  };
  leadTimeAnalysis: {
    avgDaysBetweenBookings: number;
    tripsByMonth: Array<{ month: string; count: number }>;
  };
  velocityMetrics: {
    tripsPerMonth: number;
    revenuePerMonth: number;
    growthRate: number;
  };
}

export interface AgencyComparison {
  agencies: Array<{
    name: string;
    rank: number;
    tripCount: number;
    revenue: number;
    avgCommissionRate: number;
    marketShare: number;
    avgTripValue: number;
    performanceScore: number;
  }>;
  benchmarks: {
    avgCommissionRate: number;
    topPerformerRate: number;
    avgTripValue: number;
  };
  recommendations: string[];
}

export interface PredictiveInsights {
  forecast: Array<{
    month: string;
    predictedRevenue: number;
    confidenceLower: number;
    confidenceUpper: number;
    confidence: number;
  }>;
  trends: Array<{
    metric: string;
    direction: 'Up' | 'Down' | 'Stable';
    magnitude: number;
    prediction: string;
  }>;
  opportunities: Array<{
    type: 'Growth' | 'Optimization' | 'Expansion';
    title: string;
    description: string;
    potentialValue: number;
    timeframe: string;
  }>;
}

export interface CustomMetrics {
  standardMetrics: {
    avgRevenuePerTrip: number;
    avgCostPerTraveler: number;
    bookingEfficiency: number;
    destinationDiversity: number;
  };
  performanceIndicators: Array<{
    name: string;
    value: number;
    percentChange: number;
    trend: 'Up' | 'Down' | 'Stable';
  }>;
}

export interface VendorAnalysis {
  topVendorsBySpend: Array<{
    vendor: string;
    category: string;
    totalSpend: number;
    tripCount: number;
    avgCostPerTrip: number;
    percentOfTotal: number;
  }>;
  vendorsByCategory: {
    flights: Array<{ vendor: string; totalSpend: number; tripCount: number }>;
    hotels: Array<{ vendor: string; totalSpend: number; tripCount: number }>;
    groundTransport: Array<{ vendor: string; totalSpend: number; tripCount: number }>;
    activities: Array<{ vendor: string; totalSpend: number; tripCount: number }>;
    insurance: Array<{ vendor: string; totalSpend: number; tripCount: number }>;
  };
  vendorConcentration: {
    topVendorShare: number;
    top3VendorShare: number;
    diversityScore: number;
    totalUniqueVendors: number;
  };
  costByVendor: Array<{
    vendor: string;
    totalCost: number;
    avgCostPerBooking: number;
    bookings: number;
  }>;
}

// ============================================================================
// REPORT GENERATOR CLASS
// ============================================================================

export class ReportGenerator {
  private trips: Trip[];
  private tier: SubscriptionTier;

  constructor(trips: Trip[], tier: SubscriptionTier) {
    this.trips = trips;
    this.tier = tier;
  }

  // Helper method to format destination as "City, Country"
  private formatDestination(trip: Trip): string {
    return `${trip.Destination_City}, ${trip.Destination_Country}`;
  }

  // ============================================================================
  // STARTER TIER ANALYTICS
  // ============================================================================

  generateExecutiveSummary(): ExecutiveSummary {
    const totalTrips = this.trips.length;
    const totalRevenue = this.trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
    const totalCosts = this.trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0);

    // Calculate average commission rate
    const tripsWithCommission = this.trips.filter(t => t.Agency_Revenue && t.Agency_Revenue > 0);
    const avgCommissionRate = tripsWithCommission.length > 0
      ? tripsWithCommission.reduce((sum, t) => {
          const rate = ((t.Agency_Revenue || 0) / t.Trip_Total_Cost) * 100;
          return sum + rate;
        }, 0) / tripsWithCommission.length
      : 0;

    const avgTripCost = totalTrips > 0 ? totalCosts / totalTrips : 0;

    // Month-over-month growth (simplified - comparing first half vs second half)
    const sortedTrips = [...this.trips].sort((a, b) =>
      new Date(a.Start_Date).getTime() - new Date(b.Start_Date).getTime()
    );
    const midPoint = Math.floor(sortedTrips.length / 2);
    const firstHalfRevenue = sortedTrips.slice(0, midPoint).reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
    const secondHalfRevenue = sortedTrips.slice(midPoint).reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
    const momGrowth = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

    // Top destination by trip count (using City, Country format)
    const destinationCounts = new Map<string, number>();
    this.trips.forEach(t => {
      const destination = this.formatDestination(t);
      destinationCounts.set(destination, (destinationCounts.get(destination) || 0) + 1);
    });
    const topDestination = Array.from(destinationCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Top traveler by spend
    const travelerSpend = new Map<string, number>();
    this.trips.forEach(t => {
      travelerSpend.set(t.Client_Name, (travelerSpend.get(t.Client_Name) || 0) + t.Trip_Total_Cost);
    });
    const topTraveler = Array.from(travelerSpend.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // KPIs
    const avgBookingValue = avgTripCost;
    const uniqueTravelers = new Set(this.trips.map(t => t.Client_Name)).size;
    const repeatTravelers = this.trips.length - uniqueTravelers;
    const repeatTravelerRate = uniqueTravelers > 0 ? (repeatTravelers / this.trips.length) * 100 : 0;
    const avgTravelersPerTrip = this.trips.reduce((sum, t) => sum + t.Total_Travelers, 0) / totalTrips;

    return {
      totalTrips,
      totalRevenue,
      totalCosts,
      avgCommissionRate,
      avgTripCost,
      momGrowth,
      topDestination,
      topTraveler,
      kpis: {
        avgBookingValue,
        repeatTravelerRate,
        avgTravelersPerTrip,
      },
    };
  }

  generateDestinationAnalysis(): DestinationAnalysis {
    const destinationMap = new Map<string, Trip[]>();

    this.trips.forEach(trip => {
      const country = this.formatDestination(trip); // Now using "City, Country" format
      if (!destinationMap.has(country)) {
        destinationMap.set(country, []);
      }
      destinationMap.get(country)!.push(trip);
    });

    const totalRevenue = this.trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);

    // Top by revenue
    const topByRevenue = Array.from(destinationMap.entries())
      .map(([country, trips]) => {
        const revenue = trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
        const tripCount = trips.length;
        const avgRevenue = revenue / tripCount;
        const percentOfTotal = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

        return { country, revenue, tripCount, avgRevenue, percentOfTotal };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top by count
    const topByCount = Array.from(destinationMap.entries())
      .map(([country, trips]) => {
        const tripCount = trips.length;
        const totalRevenue = trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
        const avgCost = trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0) / tripCount;

        return { country, tripCount, totalRevenue, avgCost };
      })
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 10);

    // Profitability
    const profitability = Array.from(destinationMap.entries())
      .map(([country, trips]) => {
        const totalCost = trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0);
        const totalRevenue = trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
        const margin = totalRevenue - totalCost;
        const profitMarginPercent = totalCost > 0 ? (totalRevenue / totalCost) * 100 : 0;

        return { country, totalCost, totalRevenue, margin, profitMarginPercent };
      })
      .sort((a, b) => b.profitMarginPercent - a.profitMarginPercent)
      .slice(0, 10);

    return { topByRevenue, topByCount, profitability };
  }

  generateCommissionBreakdown(): CommissionBreakdown {
    const totalCommission = this.trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);

    // By destination
    const destCommission = new Map<string, { total: number; trips: Trip[] }>();
    this.trips.forEach(trip => {
      const country = this.formatDestination(trip); // Now using "City, Country" format
      if (!destCommission.has(country)) {
        destCommission.set(country, { total: 0, trips: [] });
      }
      const data = destCommission.get(country)!;
      data.total += trip.Agency_Revenue || 0;
      data.trips.push(trip);
    });

    const byDestination = Array.from(destCommission.entries())
      .map(([country, data]) => {
        const totalCommission = data.total;
        const tripCount = data.trips.length;
        const avgCommissionRate = data.trips.reduce((sum, t) => {
          if (t.Agency_Revenue && t.Agency_Revenue > 0) {
            return sum + ((t.Agency_Revenue / t.Trip_Total_Cost) * 100);
          }
          return sum;
        }, 0) / tripCount;
        const percentOfTotal = totalCommission > 0 ? (totalCommission / this.trips.reduce((s, t) => s + (t.Agency_Revenue || 0), 0)) * 100 : 0;

        return { country, totalCommission, avgCommissionRate, tripCount, percentOfTotal };
      })
      .sort((a, b) => b.totalCommission - a.totalCommission)
      .slice(0, 10);

    // By agency
    const agencyCommission = new Map<string, { total: number; trips: Trip[] }>();
    this.trips.forEach(trip => {
      const agency = trip.Travel_Agency;
      if (!agencyCommission.has(agency)) {
        agencyCommission.set(agency, { total: 0, trips: [] });
      }
      const data = agencyCommission.get(agency)!;
      data.total += trip.Agency_Revenue || 0;
      data.trips.push(trip);
    });

    const byAgency = Array.from(agencyCommission.entries())
      .map(([agency, data]) => {
        const totalCommission = data.total;
        const tripCount = data.trips.length;
        const avgRate = data.trips.reduce((sum, t) => {
          if (t.Agency_Revenue && t.Agency_Revenue > 0) {
            return sum + ((t.Agency_Revenue / t.Trip_Total_Cost) * 100);
          }
          return sum;
        }, 0) / tripCount;
        const percentOfTotal = totalCommission > 0 ? (totalCommission / this.trips.reduce((s, t) => s + (t.Agency_Revenue || 0), 0)) * 100 : 0;

        return { agency, totalCommission, avgRate, tripCount, percentOfTotal };
      })
      .sort((a, b) => b.totalCommission - a.totalCommission);

    // Rate distribution
    const tripsWithCommission = this.trips.filter(t => t.Agency_Revenue && t.Agency_Revenue > 0);
    const avgRate = tripsWithCommission.length > 0
      ? tripsWithCommission.reduce((sum, t) => sum + ((t.Agency_Revenue! / t.Trip_Total_Cost) * 100), 0) / tripsWithCommission.length
      : 0;

    const rateDistribution = {
      withCommission: tripsWithCommission.length,
      withoutCommission: this.trips.length - tripsWithCommission.length,
      avgRate,
    };

    // Trends by month
    const monthlyData = new Map<string, { commission: number; count: number }>();
    this.trips.forEach(trip => {
      const date = new Date(trip.Start_Date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { commission: 0, count: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      data.commission += trip.Agency_Revenue || 0;
      data.count += 1;
    });

    const trends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        totalCommission: data.commission,
        tripCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { byDestination, byAgency, rateDistribution, trends };
  }

  generateTripCostAnalysis(): TripCostAnalysis {
    // Average by destination
    const destCosts = new Map<string, Trip[]>();
    this.trips.forEach(trip => {
      const country = this.formatDestination(trip); // Now using "City, Country" format
      if (!destCosts.has(country)) {
        destCosts.set(country, []);
      }
      destCosts.get(country)!.push(trip);
    });

    const avgByDestination = Array.from(destCosts.entries())
      .map(([country, trips]) => {
        const costs = trips.map(t => t.Trip_Total_Cost);
        const avgCost = costs.reduce((sum, c) => sum + c, 0) / costs.length;
        const minCost = Math.min(...costs);
        const maxCost = Math.max(...costs);
        const tripCount = trips.length;

        return { country, avgCost, minCost, maxCost, tripCount };
      })
      .sort((a, b) => b.avgCost - a.avgCost)
      .slice(0, 10);

    // Distribution
    const distribution = {
      under5000: this.trips.filter(t => t.Trip_Total_Cost < 5000).length,
      between5000and10000: this.trips.filter(t => t.Trip_Total_Cost >= 5000 && t.Trip_Total_Cost < 10000).length,
      between10000and15000: this.trips.filter(t => t.Trip_Total_Cost >= 10000 && t.Trip_Total_Cost < 15000).length,
      between15000and20000: this.trips.filter(t => t.Trip_Total_Cost >= 15000 && t.Trip_Total_Cost < 20000).length,
      over20000: this.trips.filter(t => t.Trip_Total_Cost >= 20000).length,
    };

    // Cost breakdown
    const totalFlights = this.trips.reduce((sum, t) => sum + t.Flight_Cost, 0);
    const totalHotels = this.trips.reduce((sum, t) => sum + t.Hotel_Cost, 0);
    const totalTransport = this.trips.reduce((sum, t) => sum + t.Ground_Transport, 0);
    const totalActivities = this.trips.reduce((sum, t) => sum + t.Activities_Tours, 0);
    const totalMeals = this.trips.reduce((sum, t) => sum + t.Meals_Cost, 0);
    const totalInsurance = this.trips.reduce((sum, t) => sum + t.Insurance_Cost, 0);
    const totalOther = this.trips.reduce((sum, t) => sum + t.Other_Costs, 0);

    const costBreakdown = {
      flights: totalFlights,
      hotels: totalHotels,
      transport: totalTransport,
      activities: totalActivities,
      meals: totalMeals,
      insurance: totalInsurance,
      other: totalOther,
    };

    // Trends by month
    const monthlyData = new Map<string, { totalCost: number; count: number }>();
    this.trips.forEach(trip => {
      const date = new Date(trip.Start_Date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { totalCost: 0, count: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      data.totalCost += trip.Trip_Total_Cost;
      data.count += 1;
    });

    const trends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        avgCost: data.totalCost / data.count,
        totalCost: data.totalCost,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { avgByDestination, distribution, costBreakdown, trends };
  }

  generateTravelerInsights(): TravelerInsights {
    // Top by spend
    const travelerSpend = new Map<string, { total: number; trips: Trip[] }>();
    this.trips.forEach(trip => {
      const name = trip.Client_Name;
      if (!travelerSpend.has(name)) {
        travelerSpend.set(name, { total: 0, trips: [] });
      }
      const data = travelerSpend.get(name)!;
      data.total += trip.Trip_Total_Cost;
      data.trips.push(trip);
    });

    const topBySpend = Array.from(travelerSpend.entries())
      .map(([traveler, data]) => {
        const totalSpent = data.total;
        const tripCount = data.trips.length;
        const avgTripCost = totalSpent / tripCount;
        const lastTripDate = data.trips.sort((a, b) =>
          new Date(b.Start_Date).getTime() - new Date(a.Start_Date).getTime()
        )[0].Start_Date;

        return { traveler, totalSpent, tripCount, avgTripCost, lastTripDate };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Top by count
    const topByCount = Array.from(travelerSpend.entries())
      .map(([traveler, data]) => {
        const tripCount = data.trips.length;
        const totalSpent = data.total;
        const avgTripCost = totalSpent / tripCount;

        return { traveler, tripCount, totalSpent, avgTripCost };
      })
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 10);

    // Repeat vs new
    const uniqueTravelers = travelerSpend.size;
    const totalTrips = this.trips.length;
    const repeatTrips = totalTrips - uniqueTravelers;
    const repeatTravelers = Array.from(travelerSpend.values()).filter(d => d.trips.length > 1).length;
    const newTravelers = uniqueTravelers - repeatTravelers;
    const repeatRate = uniqueTravelers > 0 ? (repeatTravelers / uniqueTravelers) * 100 : 0;

    const repeatVsNew = {
      repeatTravelers,
      newTravelers,
      repeatRate,
      totalUniqueTravelers: uniqueTravelers,
    };

    // Demographics
    const totalAdults = this.trips.reduce((sum, t) => sum + t.Adults, 0);
    const totalChildren = this.trips.reduce((sum, t) => sum + t.Children, 0);
    const avgGroupSize = this.trips.reduce((sum, t) => sum + t.Total_Travelers, 0) / this.trips.length;
    const avgAdultsPerTrip = totalAdults / this.trips.length;
    const avgChildrenPerTrip = totalChildren / this.trips.length;

    const demographics = {
      avgGroupSize,
      totalAdults,
      totalChildren,
      avgAdultsPerTrip,
      avgChildrenPerTrip,
    };

    return { topBySpend, topByCount, repeatVsNew, demographics };
  }

  generateRecommendations(): Recommendations {
    const summary = this.generateExecutiveSummary();
    const destAnalysis = this.generateDestinationAnalysis();
    const commissionAnalysis = this.generateCommissionBreakdown();
    const travelerInsights = this.generateTravelerInsights();

    const keyInsights: string[] = [];
    const opportunities: Recommendations['opportunities'] = [];
    const risks: Recommendations['risks'] = [];
    const actions: string[] = [];

    // Generate insights based on data
    if (summary.totalTrips > 0) {
      keyInsights.push(`You've managed ${summary.totalTrips} trips with total revenue of $${summary.totalRevenue.toFixed(2)}`);
    }

    if (summary.avgCommissionRate > 0) {
      keyInsights.push(`Your average commission rate is ${summary.avgCommissionRate.toFixed(1)}%`);
    } else {
      keyInsights.push('Commission tracking is not set up for your trips');
      opportunities.push({
        title: 'Set Up Commission Tracking',
        description: 'Start tracking commission rates to better understand your agency revenue',
        potentialImpact: 'High',
        effort: 'Low',
      });
    }

    if (summary.momGrowth > 0) {
      keyInsights.push(`Your business is growing at ${summary.momGrowth.toFixed(1)}% period-over-period`);
    } else if (summary.momGrowth < 0) {
      keyInsights.push(`Business has declined ${Math.abs(summary.momGrowth).toFixed(1)}% period-over-period`);
      risks.push({
        title: 'Declining Revenue Trend',
        description: 'Revenue is decreasing compared to previous period',
        severity: 'High',
        mitigation: 'Focus on customer retention and new client acquisition',
      });
    }

    if (destAnalysis.topByRevenue.length > 0) {
      const topDest = destAnalysis.topByRevenue[0];
      keyInsights.push(`${topDest.country} is your top destination by revenue (${topDest.percentOfTotal.toFixed(1)}%)`);

      if (topDest.percentOfTotal > 50) {
        risks.push({
          title: 'Revenue Concentration Risk',
          description: `${topDest.percentOfTotal.toFixed(0)}% of revenue comes from ${topDest.country}`,
          severity: 'Medium',
          mitigation: 'Diversify destination portfolio to reduce dependency',
        });
        opportunities.push({
          title: 'Diversify Destinations',
          description: 'Expand offerings to additional destinations to reduce concentration risk',
          potentialImpact: 'High',
          effort: 'Medium',
        });
      }
    }

    if (travelerInsights.repeatVsNew.repeatRate < 20) {
      opportunities.push({
        title: 'Improve Customer Retention',
        description: `Only ${travelerInsights.repeatVsNew.repeatRate.toFixed(0)}% of travelers are repeat clients`,
        potentialImpact: 'High',
        effort: 'Medium',
      });
      actions.push('Implement a customer loyalty program');
      actions.push('Follow up with past clients about future travel plans');
    } else if (travelerInsights.repeatVsNew.repeatRate > 50) {
      keyInsights.push(`Strong customer loyalty with ${travelerInsights.repeatVsNew.repeatRate.toFixed(0)}% repeat rate`);
    }

    if (commissionAnalysis.byAgency.length > 1) {
      opportunities.push({
        title: 'Optimize Agency Partnerships',
        description: 'Analyze which agencies provide best value and focus on top performers',
        potentialImpact: 'Medium',
        effort: 'Low',
      });
    }

    // Standard actions
    actions.push('Review and update pricing strategy quarterly');
    actions.push('Track customer satisfaction scores');
    actions.push('Monitor competitive landscape');
    actions.push('Maintain detailed records of all commissions');

    return {
      keyInsights,
      opportunities,
      risks,
      actions,
    };
  }

  // ============================================================================
  // STANDARD TIER ANALYTICS (extends Starter)
  // ============================================================================

  generateAdvancedAnalytics(): AdvancedAnalytics {
    // Seasonal trends (by quarter)
    const quarterMap = new Map<string, Trip[]>();
    this.trips.forEach(trip => {
      const date = new Date(trip.Start_Date);
      const month = date.getMonth();
      const quarter = Math.floor(month / 3) + 1;
      const key = `Q${quarter}` as 'Q1' | 'Q2' | 'Q3' | 'Q4';

      if (!quarterMap.has(key)) {
        quarterMap.set(key, []);
      }
      quarterMap.get(key)!.push(trip);
    });

    const seasonalTrends = Array.from(quarterMap.entries()).map(([season, trips]) => {
      const tripCount = trips.length;
      const avgRevenue = trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0) / tripCount;

      const destCounts = new Map<string, number>();
      trips.forEach(t => {
        const destination = this.formatDestination(t);
        destCounts.set(destination, (destCounts.get(destination) || 0) + 1);
      });
      const popularDestinations = Array.from(destCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([country]) => country);

      return {
        season: season as 'Q1' | 'Q2' | 'Q3' | 'Q4',
        tripCount,
        avgRevenue,
        popularDestinations,
      };
    });

    // Booking patterns by month
    const monthCounts = new Map<string, number>();
    this.trips.forEach(trip => {
      const date = new Date(trip.Start_Date);
      const monthName = date.toLocaleString('default', { month: 'long' });
      monthCounts.set(monthName, (monthCounts.get(monthName) || 0) + 1);
    });

    const byMonth: Record<string, number> = {};
    monthCounts.forEach((count, month) => {
      byMonth[month] = count;
    });

    const sortedMonths = Array.from(monthCounts.entries()).sort((a, b) => b[1] - a[1]);
    const peakMonths = sortedMonths.slice(0, 3).map(([month]) => month);
    const lowMonths = sortedMonths.slice(-3).map(([month]) => month);

    const bookingPatterns = {
      byMonth,
      peakMonths,
      lowMonths,
    };

    // Lead time analysis
    const sortedTrips = [...this.trips].sort((a, b) =>
      new Date(a.Start_Date).getTime() - new Date(b.Start_Date).getTime()
    );

    let totalDaysBetween = 0;
    for (let i = 1; i < sortedTrips.length; i++) {
      const daysBetween = (new Date(sortedTrips[i].Start_Date).getTime() -
                          new Date(sortedTrips[i-1].Start_Date).getTime()) / (1000 * 60 * 60 * 24);
      totalDaysBetween += daysBetween;
    }
    const avgDaysBetweenBookings = sortedTrips.length > 1 ? totalDaysBetween / (sortedTrips.length - 1) : 0;

    const tripsByMonth = Array.from(monthCounts.entries()).map(([month, count]) => ({ month, count }));

    const leadTimeAnalysis = {
      avgDaysBetweenBookings,
      tripsByMonth,
    };

    // Velocity metrics
    const uniqueMonths = new Set(this.trips.map(t => {
      const date = new Date(t.Start_Date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })).size;

    const tripsPerMonth = uniqueMonths > 0 ? this.trips.length / uniqueMonths : 0;
    const totalRevenue = this.trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
    const revenuePerMonth = uniqueMonths > 0 ? totalRevenue / uniqueMonths : 0;

    // Simple growth rate calculation
    const sortedByDate = [...this.trips].sort((a, b) =>
      new Date(a.Start_Date).getTime() - new Date(b.Start_Date).getTime()
    );
    const midPoint = Math.floor(sortedByDate.length / 2);
    const firstHalfCount = midPoint;
    const secondHalfCount = sortedByDate.length - midPoint;
    const growthRate = firstHalfCount > 0 ? ((secondHalfCount - firstHalfCount) / firstHalfCount) * 100 : 0;

    const velocityMetrics = {
      tripsPerMonth,
      revenuePerMonth,
      growthRate,
    };

    return {
      seasonalTrends,
      bookingPatterns,
      leadTimeAnalysis,
      velocityMetrics,
    };
  }

  generateAgencyComparison(): AgencyComparison {
    const agencyMap = new Map<string, Trip[]>();
    this.trips.forEach(trip => {
      const agency = trip.Travel_Agency;
      if (!agencyMap.has(agency)) {
        agencyMap.set(agency, []);
      }
      agencyMap.get(agency)!.push(trip);
    });

    const totalRevenue = this.trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);

    const agencies = Array.from(agencyMap.entries())
      .map(([name, trips]) => {
        const tripCount = trips.length;
        const revenue = trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
        const tripsWithCommission = trips.filter(t => t.Agency_Revenue && t.Agency_Revenue > 0);
        const avgCommissionRate = tripsWithCommission.length > 0
          ? tripsWithCommission.reduce((sum, t) => sum + ((t.Agency_Revenue! / t.Trip_Total_Cost) * 100), 0) / tripsWithCommission.length
          : 0;
        const marketShare = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
        const avgTripValue = trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0) / tripCount;

        // Performance score: combination of revenue, trip count, and commission rate
        const performanceScore = (revenue / 1000) + (tripCount * 10) + (avgCommissionRate * 5);

        return {
          name,
          rank: 0, // Will be set after sorting
          tripCount,
          revenue,
          avgCommissionRate,
          marketShare,
          avgTripValue,
          performanceScore,
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .map((agency, index) => ({ ...agency, rank: index + 1 }));

    const benchmarks = {
      avgCommissionRate: agencies.reduce((sum, a) => sum + a.avgCommissionRate, 0) / agencies.length,
      topPerformerRate: agencies[0]?.avgCommissionRate || 0,
      avgTripValue: agencies.reduce((sum, a) => sum + a.avgTripValue, 0) / agencies.length,
    };

    const recommendations: string[] = [];

    if (agencies.length > 1) {
      const topAgency = agencies[0];
      recommendations.push(`${topAgency.name} is your top performing agency with ${topAgency.tripCount} trips and $${topAgency.revenue.toFixed(2)} revenue`);

      if (topAgency.marketShare > 50) {
        recommendations.push(`Consider diversifying - ${topAgency.name} accounts for ${topAgency.marketShare.toFixed(0)}% of your revenue`);
      }

      const bottomAgency = agencies[agencies.length - 1];
      if (bottomAgency.tripCount < 3) {
        recommendations.push(`${bottomAgency.name} has low booking volume - consider focusing on stronger partnerships`);
      }
    }

    return {
      agencies,
      benchmarks,
      recommendations,
    };
  }

  generatePredictiveInsights(): PredictiveInsights {
    // Simple forecast based on historical trends
    const monthlyRevenue = new Map<string, number>();
    this.trips.forEach(trip => {
      const date = new Date(trip.Start_Date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + (trip.Agency_Revenue || 0));
    });

    const sortedMonths = Array.from(monthlyRevenue.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const avgMonthlyRevenue = sortedMonths.reduce((sum, [, rev]) => sum + rev, 0) / sortedMonths.length;

    // Generate 6-month forecast
    const forecast: PredictiveInsights['forecast'] = [];
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    const lastDate = new Date(lastMonth[0] + '-01');

    for (let i = 1; i <= 6; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const month = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;

      const predictedRevenue = avgMonthlyRevenue * (1 + (i * 0.02)); // Simple 2% growth per month
      const confidence = Math.max(50, 90 - (i * 8)); // Decreasing confidence over time
      const confidenceLower = predictedRevenue * (1 - (0.2 * (i / 6)));
      const confidenceUpper = predictedRevenue * (1 + (0.2 * (i / 6)));

      forecast.push({
        month,
        predictedRevenue,
        confidenceLower,
        confidenceUpper,
        confidence,
      });
    }

    // Trend analysis
    const trends: PredictiveInsights['trends'] = [];

    const revenueGrowth = sortedMonths.length > 1
      ? ((sortedMonths[sortedMonths.length - 1][1] - sortedMonths[0][1]) / sortedMonths[0][1]) * 100
      : 0;

    trends.push({
      metric: 'Revenue',
      direction: revenueGrowth > 5 ? 'Up' : revenueGrowth < -5 ? 'Down' : 'Stable',
      magnitude: Math.abs(revenueGrowth),
      prediction: revenueGrowth > 0 ? 'Revenue expected to continue growing' : 'Revenue may stabilize or decline',
    });

    const avgTripValue = this.trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0) / this.trips.length;
    trends.push({
      metric: 'Avg Trip Value',
      direction: 'Stable',
      magnitude: 0,
      prediction: `Average trip value around $${avgTripValue.toFixed(0)}`,
    });

    // Opportunities
    const opportunities: PredictiveInsights['opportunities'] = [
      {
        type: 'Growth',
        title: 'Expand High-Performing Destinations',
        description: 'Focus marketing on destinations showing strong demand',
        potentialValue: avgMonthlyRevenue * 0.3,
        timeframe: '3-6 months',
      },
      {
        type: 'Optimization',
        title: 'Improve Commission Rates',
        description: 'Negotiate better rates with top agencies',
        potentialValue: avgMonthlyRevenue * 0.15,
        timeframe: '1-3 months',
      },
    ];

    return {
      forecast,
      trends,
      opportunities,
    };
  }

  generateCustomMetrics(): CustomMetrics {
    const totalTrips = this.trips.length;
    const totalRevenue = this.trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
    const totalCosts = this.trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0);
    const totalTravelers = this.trips.reduce((sum, t) => sum + t.Total_Travelers, 0);

    const standardMetrics = {
      avgRevenuePerTrip: totalTrips > 0 ? totalRevenue / totalTrips : 0,
      avgCostPerTraveler: totalTravelers > 0 ? totalCosts / totalTravelers : 0,
      bookingEfficiency: totalCosts > 0 ? (totalRevenue / totalCosts) * 100 : 0,
      destinationDiversity: new Set(this.trips.map(t => this.formatDestination(t))).size,
    };

    // Performance indicators
    const performanceIndicators: CustomMetrics['performanceIndicators'] = [
      {
        name: 'Revenue per Trip',
        value: standardMetrics.avgRevenuePerTrip,
        percentChange: 0, // Would need historical data
        trend: 'Stable',
      },
      {
        name: 'Cost per Traveler',
        value: standardMetrics.avgCostPerTraveler,
        percentChange: 0,
        trend: 'Stable',
      },
      {
        name: 'Booking Efficiency',
        value: standardMetrics.bookingEfficiency,
        percentChange: 0,
        trend: 'Stable',
      },
      {
        name: 'Destination Diversity',
        value: standardMetrics.destinationDiversity,
        percentChange: 0,
        trend: 'Stable',
      },
    ];

    return {
      standardMetrics,
      performanceIndicators,
    };
  }

  generateVendorAnalysis(): VendorAnalysis {
    // Collect all vendors with their spending data
    const vendorData = new Map<string, { category: string; totalSpend: number; tripCount: number }>();

    this.trips.forEach(trip => {
      // Flight vendors
      if (trip.Flight_Vendor && trip.Flight_Cost > 0) {
        const key = `${trip.Flight_Vendor}|flights`;
        const existing = vendorData.get(key) || { category: 'Flight', totalSpend: 0, tripCount: 0 };
        vendorData.set(key, {
          category: 'Flight',
          totalSpend: existing.totalSpend + trip.Flight_Cost,
          tripCount: existing.tripCount + 1,
        });
      }

      // Hotel vendors
      if (trip.Hotel_Vendor && trip.Hotel_Cost > 0) {
        const key = `${trip.Hotel_Vendor}|hotels`;
        const existing = vendorData.get(key) || { category: 'Hotel', totalSpend: 0, tripCount: 0 };
        vendorData.set(key, {
          category: 'Hotel',
          totalSpend: existing.totalSpend + trip.Hotel_Cost,
          tripCount: existing.tripCount + 1,
        });
      }

      // Ground transport vendors
      if (trip.Ground_Transport_Vendor && trip.Ground_Transport > 0) {
        const key = `${trip.Ground_Transport_Vendor}|groundTransport`;
        const existing = vendorData.get(key) || { category: 'Ground Transport', totalSpend: 0, tripCount: 0 };
        vendorData.set(key, {
          category: 'Ground Transport',
          totalSpend: existing.totalSpend + trip.Ground_Transport,
          tripCount: existing.tripCount + 1,
        });
      }

      // Activities vendors
      if (trip.Activities_Vendor && trip.Activities_Tours > 0) {
        const key = `${trip.Activities_Vendor}|activities`;
        const existing = vendorData.get(key) || { category: 'Activities', totalSpend: 0, tripCount: 0 };
        vendorData.set(key, {
          category: 'Activities',
          totalSpend: existing.totalSpend + trip.Activities_Tours,
          tripCount: existing.tripCount + 1,
        });
      }

      // Insurance vendors
      if (trip.Insurance_Vendor && trip.Insurance_Cost > 0) {
        const key = `${trip.Insurance_Vendor}|insurance`;
        const existing = vendorData.get(key) || { category: 'Insurance', totalSpend: 0, tripCount: 0 };
        vendorData.set(key, {
          category: 'Insurance',
          totalSpend: existing.totalSpend + trip.Insurance_Cost,
          tripCount: existing.tripCount + 1,
        });
      }
    });

    const totalSpend = Array.from(vendorData.values()).reduce((sum, v) => sum + v.totalSpend, 0);

    // Top vendors by spend (overall)
    const topVendorsBySpend = Array.from(vendorData.entries())
      .map(([key, data]) => {
        const vendor = key.split('|')[0];
        return {
          vendor,
          category: data.category,
          totalSpend: data.totalSpend,
          tripCount: data.tripCount,
          avgCostPerTrip: data.tripCount > 0 ? data.totalSpend / data.tripCount : 0,
          percentOfTotal: totalSpend > 0 ? (data.totalSpend / totalSpend) * 100 : 0,
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    // Vendors by category
    const flightVendors = Array.from(vendorData.entries())
      .filter(([key]) => key.endsWith('|flights'))
      .map(([key, data]) => ({ vendor: key.split('|')[0], totalSpend: data.totalSpend, tripCount: data.tripCount }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    const hotelVendors = Array.from(vendorData.entries())
      .filter(([key]) => key.endsWith('|hotels'))
      .map(([key, data]) => ({ vendor: key.split('|')[0], totalSpend: data.totalSpend, tripCount: data.tripCount }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    const groundTransportVendors = Array.from(vendorData.entries())
      .filter(([key]) => key.endsWith('|groundTransport'))
      .map(([key, data]) => ({ vendor: key.split('|')[0], totalSpend: data.totalSpend, tripCount: data.tripCount }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    const activitiesVendors = Array.from(vendorData.entries())
      .filter(([key]) => key.endsWith('|activities'))
      .map(([key, data]) => ({ vendor: key.split('|')[0], totalSpend: data.totalSpend, tripCount: data.tripCount }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    const insuranceVendors = Array.from(vendorData.entries())
      .filter(([key]) => key.endsWith('|insurance'))
      .map(([key, data]) => ({ vendor: key.split('|')[0], totalSpend: data.totalSpend, tripCount: data.tripCount }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    // Vendor concentration metrics
    const topVendor = topVendorsBySpend[0];
    const top3Vendors = topVendorsBySpend.slice(0, 3);
    const topVendorShare = topVendor && totalSpend > 0 ? (topVendor.totalSpend / totalSpend) * 100 : 0;
    const top3VendorShare = totalSpend > 0 ? (top3Vendors.reduce((sum, v) => sum + v.totalSpend, 0) / totalSpend * 100) : 0;
    const totalUniqueVendors = vendorData.size;
    const diversityScore = this.trips.length > 0 ? Math.min(100, (totalUniqueVendors / this.trips.length) * 100) : 0;

    // Cost by vendor (aggregated by vendor name across all categories)
    const vendorTotals = new Map<string, { totalCost: number; bookings: number }>();
    Array.from(vendorData.entries()).forEach(([key, data]) => {
      const vendor = key.split('|')[0];
      const existing = vendorTotals.get(vendor) || { totalCost: 0, bookings: 0 };
      vendorTotals.set(vendor, {
        totalCost: existing.totalCost + data.totalSpend,
        bookings: existing.bookings + data.tripCount,
      });
    });

    const costByVendor = Array.from(vendorTotals.entries())
      .map(([vendor, data]) => ({
        vendor,
        totalCost: data.totalCost,
        avgCostPerBooking: data.bookings > 0 ? data.totalCost / data.bookings : 0,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);

    return {
      topVendorsBySpend,
      vendorsByCategory: {
        flights: flightVendors,
        hotels: hotelVendors,
        groundTransport: groundTransportVendors,
        activities: activitiesVendors,
        insurance: insuranceVendors,
      },
      vendorConcentration: {
        topVendorShare,
        top3VendorShare,
        diversityScore,
        totalUniqueVendors,
      },
      costByVendor,
    };
  }

  // ============================================================================
  // REPORT SECTION RETRIEVAL
  // ============================================================================

  getReportSections() {
    const sections: any[] = [];

    // Always include starter sections
    sections.push({ type: 'executive', data: this.generateExecutiveSummary() });
    sections.push({ type: 'destination', data: this.generateDestinationAnalysis() });
    sections.push({ type: 'commission', data: this.generateCommissionBreakdown() });
    sections.push({ type: 'cost', data: this.generateTripCostAnalysis() });
    sections.push({ type: 'traveler', data: this.generateTravelerInsights() });
    sections.push({ type: 'recommendations', data: this.generateRecommendations() });

    // Standard tier additions
    if (this.tier === 'standard' || this.tier === 'premium') {
      sections.push({ type: 'advanced', data: this.generateAdvancedAnalytics() });
      sections.push({ type: 'agency', data: this.generateAgencyComparison() });
      sections.push({ type: 'predictive', data: this.generatePredictiveInsights() });
      sections.push({ type: 'custom', data: this.generateCustomMetrics() });
    }

    // Premium tier additions (placeholder for now)
    if (this.tier === 'premium') {
      // Future: Add executive dashboard, advanced BI, automated insights
    }

    return sections;
  }
}
