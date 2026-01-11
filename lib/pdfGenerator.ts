import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trip } from '@/data/trips';
import { analyzeTripInsights, findOptimizationOpportunities } from './utils';
import { SubscriptionTier } from './subscription';
import { Currency, formatCurrencyWithSymbol, CURRENCY_SYMBOLS } from './currency';

interface PDFOptions {
  includeBusinessIntelligence?: boolean;
  includeLogo?: boolean;
  agencyName?: string;
  currency?: Currency;
}

export function generateTripReportPDF(
  trip: Trip,
  allTrips: Trip[],
  tier: SubscriptionTier,
  options: PDFOptions = {}
) {
  const currency = options.currency || 'USD';

  // Single trip report - focused BI for this specific trip
  // All tiers use this generator with varying levels of BI detail
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Cost Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  if (options.agencyName) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(options.agencyName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  } else {
    yPosition += 10;
  }

  // Trip Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Information', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const tripInfo = [
    ['Trip ID:', trip.Trip_ID],
    ['Client:', trip.Client_Name],
    ['Agency:', trip.Travel_Agency],
    ['Destination:', `${trip.Destination_City}, ${trip.Destination_Country}`],
    ['Dates:', `${new Date(trip.Start_Date).toLocaleDateString()} - ${new Date(trip.End_Date).toLocaleDateString()}`],
    ['Travelers:', `${trip.Total_Travelers} (${trip.Adults} adults, ${trip.Children} children)`],
  ];

  tripInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // Cost Breakdown Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost Breakdown', 14, yPosition);
  yPosition += 5;

  const costData = [
    ['Flight', formatCurrencyWithSymbol(trip.Flight_Cost, currency), `${((trip.Flight_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
    ['Hotel', formatCurrencyWithSymbol(trip.Hotel_Cost, currency), `${((trip.Hotel_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
    ['Ground Transport', formatCurrencyWithSymbol(trip.Ground_Transport, currency), `${((trip.Ground_Transport / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
    ['Activities & Tours', formatCurrencyWithSymbol(trip.Activities_Tours, currency), `${((trip.Activities_Tours / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
    ['Meals', formatCurrencyWithSymbol(trip.Meals_Cost, currency), `${((trip.Meals_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
    ['Insurance', formatCurrencyWithSymbol(trip.Insurance_Cost, currency), `${((trip.Insurance_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
    ['Cruise', formatCurrencyWithSymbol(trip.Cruise_Cost, currency), `${((trip.Cruise_Cost / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
    ['Other', formatCurrencyWithSymbol(trip.Other_Costs, currency), `${((trip.Other_Costs / trip.Trip_Total_Cost) * 100).toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Amount', '% of Total']],
    body: costData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Total Cost Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const totalY = yPosition;
  doc.text('Total Trip Cost:', 14, totalY);
  doc.text(formatCurrencyWithSymbol(trip.Trip_Total_Cost, currency), pageWidth - 14, totalY, { align: 'right' });
  yPosition += 6;

  doc.text('Cost Per Traveler:', 14, yPosition);
  doc.text(formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency), pageWidth - 14, yPosition, { align: 'right' });
  yPosition += 10;

  // Commission Information
  if (trip.Commission_Type && trip.Agency_Revenue) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // green
    doc.text('Agency Revenue', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    const commissionLabel = trip.Commission_Type === 'percentage'
      ? `Commission (${trip.Commission_Value}%):`
      : 'Flat Fee Commission:';

    doc.text(commissionLabel, 14, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text(formatCurrencyWithSymbol(trip.Agency_Revenue, currency), pageWidth - 14, yPosition, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPosition += 15;
  }

  // Basic Analytics with Visualizations (Available for ALL tiers)
  if (true) { // Show analytics and charts for all tiers
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Trip Analytics', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Calculate trip days
    const startDate = new Date(trip.Start_Date);
    const endDate = new Date(trip.End_Date);
    const tripDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const costPerDay = trip.Trip_Total_Cost / tripDays;

    // Trip Duration & Daily Cost
    doc.setFont('helvetica', 'bold');
    doc.text('Trip Duration:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${tripDays} days`, 70, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Cost Per Day:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrencyWithSymbol(costPerDay, currency), 70, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Cost Per Traveler:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrencyWithSymbol(trip.Cost_Per_Traveler, currency), 70, yPosition);
    yPosition += 10;

    // Top Spending Categories - filter out zero values for proper pie chart rendering
    const categories = [
      { name: 'Hotel', amount: trip.Hotel_Cost },
      { name: 'Flight', amount: trip.Flight_Cost },
      { name: 'Meals', amount: trip.Meals_Cost },
      { name: 'Activities', amount: trip.Activities_Tours },
      { name: 'Ground Transport', amount: trip.Ground_Transport },
      { name: 'Insurance', amount: trip.Insurance_Cost },
      { name: 'Cruise', amount: trip.Cruise_Cost },
      { name: 'Other', amount: trip.Other_Costs },
    ].filter(cat => cat.amount > 0) // Only include categories with actual costs
    .sort((a, b) => b.amount - a.amount);

    doc.setFont('helvetica', 'bold');
    doc.text('Top 3 Spending Categories:', 14, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    categories.slice(0, 3).forEach((cat, idx) => {
      const percent = ((cat.amount / trip.Trip_Total_Cost) * 100).toFixed(1);
      doc.text(`${idx + 1}. ${cat.name}`, 18, yPosition);
      doc.text(`${formatCurrencyWithSymbol(cat.amount, currency)} (${percent}%)`, pageWidth - 14, yPosition, { align: 'right' });
      yPosition += 5;
    });

    yPosition += 10;

    // PIE CHART - Primary Visualization for Cost Breakdown
    if (yPosition > pageHeight - 110) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Cost Breakdown Visualization:', 14, yPosition);
    yPosition += 8;

    // Pie chart settings
    const pieChartX = pageWidth / 2;
    const pieChartY = yPosition + 40;
    const pieRadius = 35;

    // Define colors for each category - vibrant, contrasting colors
    const pieColors: [number, number, number][] = [
      [59, 130, 246],   // blue - Hotel
      [34, 197, 94],    // green - Flight
      [249, 115, 22],   // orange - Meals
      [168, 85, 247],   // purple - Activities
      [236, 72, 153],   // pink - Ground Transport
      [234, 179, 8],    // yellow - Insurance
      [107, 114, 128]   // gray - Other
    ];

    // Draw pie chart
    let startAngle = -90; // Start from top
    categories.forEach((cat, idx) => {
      const percent = (cat.amount / trip.Trip_Total_Cost) * 100;
      const sliceAngle = (percent / 100) * 360;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      doc.setFillColor(...pieColors[idx]);

      // Calculate slice path
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Draw the slice as a filled triangle + arc
      doc.setDrawColor(255, 255, 255); // White border
      doc.setLineWidth(1);

      // Create path for slice
      const x1 = pieChartX + pieRadius * Math.cos(startRad);
      const y1 = pieChartY + pieRadius * Math.sin(startRad);
      const x2 = pieChartX + pieRadius * Math.cos(endRad);
      const y2 = pieChartY + pieRadius * Math.sin(endRad);

      // Draw filled arc slice
      const steps = Math.max(10, Math.ceil(sliceAngle / 5));
      doc.moveTo(pieChartX, pieChartY);
      for (let i = 0; i <= steps; i++) {
        const angle = startRad + (endRad - startRad) * (i / steps);
        const x = pieChartX + pieRadius * Math.cos(angle);
        const y = pieChartY + pieRadius * Math.sin(angle);
        doc.lineTo(x, y);
      }
      doc.lineTo(pieChartX, pieChartY);
      doc.fill();

      startAngle = endAngle;
    });

    // Draw legend
    yPosition = pieChartY + pieRadius + 15;
    doc.setFontSize(9);

    categories.forEach((cat, idx) => {
      const percent = ((cat.amount / trip.Trip_Total_Cost) * 100).toFixed(1);

      // Draw color box
      doc.setFillColor(...pieColors[idx]);
      doc.rect(14, yPosition - 3, 4, 4, 'F');

      // Draw label
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${cat.name}`, 20, yPosition);

      // Draw value and percentage
      doc.setFont('helvetica', 'bold');
      doc.text(`${formatCurrencyWithSymbol(cat.amount, currency)} (${percent}%)`, pageWidth - 14, yPosition, { align: 'right' });

      yPosition += 6;
    });

    yPosition += 5;
  }

  // Business Intelligence (Standard and Premium tiers only)
  if (options.includeBusinessIntelligence && tier !== 'starter') {
    const insights = analyzeTripInsights(trip, allTrips);
    const opportunities = findOptimizationOpportunities(trip, allTrips);

    // Start new page for BI section
    doc.addPage();
    yPosition = 20;

    // Header with background
    doc.setFillColor(59, 130, 246); // blue
    doc.rect(0, yPosition - 5, pageWidth, 15, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('BUSINESS INTELLIGENCE INSIGHTS', pageWidth / 2, yPosition + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPosition += 20;

    // Executive Summary Box
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(14, yPosition, pageWidth - 28, 35, 3, 3, 'F');
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 18, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tripDays = Math.ceil((new Date(trip.End_Date).getTime() - new Date(trip.Start_Date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const costPerDay = trip.Trip_Total_Cost / tripDays;
    const commissionRate = trip.Agency_Revenue ? ((trip.Agency_Revenue / trip.Trip_Total_Cost) * 100).toFixed(1) : '0';

    doc.text(`This ${tripDays}-day trip to ${trip.Destination_City}, ${trip.Destination_Country} generated ${formatCurrencyWithSymbol(trip.Agency_Revenue || 0, currency)} `, 18, yPosition);
    yPosition += 5;
    doc.text(`in commission (${commissionRate}% of total trip cost). Daily cost: ${formatCurrencyWithSymbol(costPerDay, currency)}. Cost efficiency: ${insights.costEfficiency}.`, 18, yPosition);
    yPosition += 12;

    // Key Metrics Grid
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 14, yPosition);
    yPosition += 8;

    // Draw KPI boxes
    const kpiStartY = yPosition;
    const boxWidth = (pageWidth - 28 - 10) / 3;
    const boxHeight = 25;

    // KPI 1: Cost Efficiency
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(14, kpiStartY, boxWidth, boxHeight, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Cost Efficiency', 17, kpiStartY + 5);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const ratingColor: [number, number, number] = insights.costEfficiency === 'Excellent' || insights.costEfficiency === 'Good'
      ? [34, 197, 94] : insights.costEfficiency === 'High' || insights.costEfficiency === 'Very High'
      ? [239, 68, 68] : [234, 179, 8];
    doc.setTextColor(...ratingColor);
    doc.text(insights.costEfficiency, 17, kpiStartY + 14);
    doc.setTextColor(0, 0, 0);

    // KPI 2: Hotel/Flight Ratio
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(14 + boxWidth + 5, kpiStartY, boxWidth, boxHeight, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Hotel/Flight Ratio', 17 + boxWidth + 5, kpiStartY + 5);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(`${insights.hotelToFlightRatio.toFixed(2)}x`, 17 + boxWidth + 5, kpiStartY + 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const ratioStatus = insights.hotelToFlightRatio > 2 ? 'High' : insights.hotelToFlightRatio < 0.5 ? 'Low' : 'Optimal';
    doc.text(ratioStatus, 17 + boxWidth + 5, kpiStartY + 20);

    // KPI 3: Experience Investment
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(14 + (boxWidth + 5) * 2, kpiStartY, boxWidth, boxHeight, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Activities Investment', 17 + (boxWidth + 5) * 2, kpiStartY + 5);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 92, 246);
    doc.text(formatCurrencyWithSymbol(insights.experienceInvestment, currency), 17 + (boxWidth + 5) * 2, kpiStartY + 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const expPct = ((insights.experienceInvestment / trip.Trip_Total_Cost) * 100).toFixed(0);
    doc.text(`${expPct}% of total`, 17 + (boxWidth + 5) * 2, kpiStartY + 20);
    doc.setTextColor(0, 0, 0);

    yPosition = kpiStartY + boxHeight + 12;

    // Optimization Opportunities
    if (opportunities.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Cost Optimization Opportunities', 14, yPosition);
      yPosition += 8;

      opportunities.slice(0, 3).forEach((opp, idx) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        // Priority badge color
        const priorityColor: [number, number, number] = opp.priority === 'High' ? [239, 68, 68]
          : opp.priority === 'Medium' ? [234, 179, 8] : [107, 114, 128];

        // Draw opportunity box
        doc.setDrawColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.setLineWidth(2);
        doc.line(14, yPosition, 14, yPosition + 22);
        doc.setLineWidth(0.1);

        // Category header
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const categoryText = `${idx + 1}. ${opp.category}`;
        doc.text(categoryText, 18, yPosition);

        // Calculate category text width at correct font size (11pt bold)
        const categoryWidth = doc.getTextWidth(categoryText);

        // Priority badge - positioned after category text with proper spacing
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        const priorityText = opp.priority;
        const badgeTextWidth = doc.getTextWidth(priorityText);
        const badgeWidth = badgeTextWidth + 4; // Add padding
        const badgeX = 18 + categoryWidth + 3;

        doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.roundedRect(badgeX, yPosition - 3, badgeWidth, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(priorityText, badgeX + 2, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;

        // Recommendation
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(opp.recommendation, pageWidth - 32);
        doc.text(lines, 18, yPosition);
        yPosition += (lines.length * 4) + 2;

        // Potential savings
        if (opp.potentialSaving) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(34, 197, 94); // green
          doc.text(`Potential Savings: ${opp.potentialSaving}`, 18, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 6;
        }

        yPosition += 6;
      });

      // Additional opportunities note
      if (opportunities.length > 3) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text(`+ ${opportunities.length - 3} additional opportunities available in dashboard`, 14, yPosition);
        doc.setTextColor(0, 0, 0);
      }
    } else {
      // No opportunities - positive message
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 197, 94);
      doc.text('[OK] No major optimization opportunities found. This trip is well-optimized!', 14, yPosition);
      doc.setTextColor(0, 0, 0);
    }
  }

  // Footer with tier badge
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated by VoyagrIQ | ${new Date().toLocaleDateString()}`, 14, footerY);

  const tierLabels: Record<SubscriptionTier, string> = {
    starter: 'Starter Plan',
    standard: 'Standard Plan',
    premium: 'Premium Plan'
  };
  doc.text(tierLabels[tier], pageWidth - 14, footerY, { align: 'right' });

  // Save PDF
  const fileName = `Trip_Report_${trip.Trip_ID}_${trip.Client_Name.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

// Generate multi-trip summary report
export function generateMultiTripReportPDF(
  trips: Trip[],
  tier: SubscriptionTier,
  options: PDFOptions = {}
) {
  const currency = options.currency || 'USD';
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Summary Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  if (options.agencyName) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(options.agencyName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  } else {
    yPosition += 10;
  }

  // Summary Statistics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 14, yPosition);
  yPosition += 8;

  const totalRevenue = trips.reduce((sum, t) => sum + t.Trip_Total_Cost, 0);
  const totalCommission = trips.reduce((sum, t) => sum + (t.Agency_Revenue || 0), 0);
  const totalTravelers = trips.reduce((sum, t) => sum + t.Total_Travelers, 0);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryStats = [
    ['Total Trips:', trips.length.toString()],
    ['Total Travelers:', totalTravelers.toString()],
    ['Total Trip Value:', formatCurrencyWithSymbol(totalRevenue, currency)],
    ['Total Commission Earned:', formatCurrencyWithSymbol(totalCommission, currency)],
    ['Average Trip Value:', formatCurrencyWithSymbol(totalRevenue / trips.length, currency)],
  ];

  summaryStats.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Trips Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Details', 14, yPosition);
  yPosition += 5;

  const tripsData = trips.map(trip => [
    trip.Trip_ID,
    trip.Client_Name,
    `${trip.Destination_City}, ${trip.Destination_Country}`,
    formatCurrencyWithSymbol(trip.Trip_Total_Cost, currency),
    formatCurrencyWithSymbol(trip.Agency_Revenue || 0, currency)
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Trip ID', 'Client', 'Destination', 'Total Cost', 'Revenue']],
    body: tripsData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' }
    }
  });

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated by VoyagrIQ | ${new Date().toLocaleDateString()}`, 14, footerY);

  const tierLabels: Record<SubscriptionTier, string> = {
    starter: 'Starter Plan',
    standard: 'Standard Plan',
    premium: 'Premium Plan'
  };
  doc.text(tierLabels[tier], pageWidth - 14, footerY, { align: 'right' });

  // Save PDF
  const fileName = `Trip_Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
