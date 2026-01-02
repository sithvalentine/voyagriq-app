import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trip } from '@/data/trips';
import { ReportGenerator, SubscriptionTier } from './reportGenerator';
import { Currency, formatCurrencyWithSymbol } from './currency';

export interface WhiteLabelConfig {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [37, 99, 235]; // Default blue
}

export class EnhancedReportGenerator {
  private trips: Trip[];
  private tier: SubscriptionTier;
  private whiteLabelConfig?: WhiteLabelConfig;
  private reportGen: ReportGenerator;
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private primaryColor: [number, number, number];
  private secondaryColor: [number, number, number];
  private accentColor: [number, number, number];
  private currency: Currency;

  constructor(trips: Trip[], tier: SubscriptionTier, whiteLabelConfig?: WhiteLabelConfig, currency: Currency = 'USD') {
    this.trips = trips;
    this.tier = tier;
    this.whiteLabelConfig = whiteLabelConfig;
    this.currency = currency;
    this.reportGen = new ReportGenerator(trips, tier);
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 14;
    this.currentY = this.margin;

    // Set colors from white-label config or defaults
    this.primaryColor = whiteLabelConfig
      ? hexToRgb(whiteLabelConfig.primaryColor)
      : [37, 99, 235]; // Blue
    this.secondaryColor = whiteLabelConfig
      ? hexToRgb(whiteLabelConfig.secondaryColor)
      : [124, 58, 237]; // Purple
    this.accentColor = whiteLabelConfig
      ? hexToRgb(whiteLabelConfig.accentColor)
      : [236, 72, 153]; // Pink
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private addNewPage() {
    this.doc.addPage();
    this.currentY = this.margin;
    this.addPageFooter();
  }

  private addPageFooter() {
    // jsPDF's internal.pages is 1-indexed with first element being empty
    const pageNumber = (this.doc as any).internal.getCurrentPageInfo().pageNumber;
    this.doc.setFontSize(8);
    this.doc.setTextColor(128, 128, 128);
    this.doc.text(
      `Page ${pageNumber}`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );

    if (this.whiteLabelConfig) {
      this.doc.text(
        this.whiteLabelConfig.companyName,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      );
    } else {
      this.doc.text(
        'VoyagrIQ',
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  private checkPageSpace(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.addNewPage();
    }
  }

  private formatCurrency(value: number): string {
    return formatCurrencyWithSymbol(value, this.currency);
  }

  private formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  private addSectionTitle(title: string) {
    this.checkPageSpace(20);
    this.doc.setFillColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    // jsPDF doesn't handle emojis well, so titles are text-only
    this.doc.text(title, this.margin + 3, this.currentY + 7);
    this.currentY += 15;
  }

  private addSubsectionTitle(title: string) {
    this.checkPageSpace(15);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addText(text: string, fontSize: number = 10, isBold: boolean = false) {
    this.checkPageSpace(10);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    this.doc.setTextColor(60, 60, 60);

    // Better margin calculation for text wrapping - increased safety margin
    const maxWidth = this.pageWidth - (2 * this.margin) - 15; // Extra 15 for safety
    const lines = this.doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      this.checkPageSpace(6);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
  }

  private addKeyValuePair(key: string, value: string, isHighlight: boolean = false) {
    this.checkPageSpace(8);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(60, 60, 60);
    this.doc.text(key + ':', this.margin, this.currentY);

    if (isHighlight) {
      this.doc.setTextColor(...this.primaryColor);
    } else {
      this.doc.setTextColor(0, 0, 0);
    }
    this.doc.setFont('helvetica', 'normal');

    // Wrap long values to prevent overflow
    const maxWidth = this.pageWidth - this.margin - 70 - 15; // Account for key width and margins
    const lines = this.doc.splitTextToSize(value, maxWidth);
    lines.forEach((line: string, index: number) => {
      if (index > 0) {
        this.checkPageSpace(7);
      }
      this.doc.text(line, this.margin + 70, this.currentY);
      if (index < lines.length - 1) {
        this.currentY += 7;
      }
    });
    this.currentY += 7;
  }

  private addSimpleBarChart(
    data: Array<{ label: string; value: number }>,
    title: string,
    maxValue?: number,
    formatAsCount: boolean = false
  ) {
    this.checkPageSpace(60);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;

    const chartHeight = 40;
    // Reserve more space for values by limiting chart width further
    const valueSpace = 35; // Space reserved for value text
    const chartWidth = this.pageWidth - 2 * this.margin - 60 - valueSpace;
    const barHeight = 5;
    const spacing = 2;
    const maxVal = maxValue || Math.max(...data.map(d => d.value));

    data.slice(0, 5).forEach((item, index) => {
      this.checkPageSpace(barHeight + spacing + 2);

      // Label
      this.doc.setFontSize(8);
      this.doc.setTextColor(60, 60, 60);
      const labelText = item.label.length > 20 ? item.label.substring(0, 17) + '...' : item.label;
      this.doc.text(labelText, this.margin, this.currentY + 4);

      // Bar - scale to fit within reserved space
      const barWidth = (item.value / maxVal) * chartWidth;
      const colors = [this.primaryColor, this.secondaryColor, this.accentColor];
      const color = colors[index % colors.length];
      this.doc.setFillColor(...color);
      this.doc.rect(this.margin + 40, this.currentY, barWidth, barHeight, 'F');

      // Value - always position in the reserved space to the right of bars
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'bold');
      // Format as count (plain number) or currency based on parameter
      const valueText = formatAsCount ? item.value.toString() : this.formatCurrency(item.value);
      // Position value in the reserved space, 3 units after the bar
      const valueX = this.margin + 40 + barWidth + 3;
      this.doc.text(valueText, valueX, this.currentY + 4);

      this.currentY += barHeight + spacing + 2;
    });

    this.currentY += 5;
  }

  private addDistributionChart(data: Record<string, number>, title: string) {
    this.checkPageSpace(50);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;

    const entries = Object.entries(data);
    const total = entries.reduce((sum, [, val]) => sum + val, 0);
    const chartWidth = this.pageWidth - 2 * this.margin - 10; // Added extra margin

    let startX = this.margin;
    entries.forEach(([, value], index) => {
      if (value === 0) return;

      const width = (value / total) * chartWidth;
      const colors: Array<[number, number, number]> = [this.primaryColor, this.secondaryColor, this.accentColor, [34, 197, 94], [249, 115, 22]];
      const color = colors[index % colors.length];

      this.doc.setFillColor(color[0], color[1], color[2]);
      this.doc.rect(startX, this.currentY, width, 8, 'F');

      startX += width;
    });

    this.currentY += 12;

    // Legend
    this.doc.setFontSize(8);
    entries.forEach(([key, value], index) => {
      if (value === 0) return;

      const colors: Array<[number, number, number]> = [this.primaryColor, this.secondaryColor, this.accentColor, [34, 197, 94], [249, 115, 22]];
      const color = colors[index % colors.length];

      this.checkPageSpace(6);
      this.doc.setFillColor(color[0], color[1], color[2]);
      this.doc.rect(this.margin, this.currentY - 2, 3, 3, 'F');

      this.doc.setTextColor(60, 60, 60);
      const label = `${key}: ${value} (${this.formatPercent((value / total) * 100)})`;
      // Wrap legend text if too long
      const maxWidth = this.pageWidth - this.margin - 10;
      const lines = this.doc.splitTextToSize(label, maxWidth);
      lines.forEach((line: string, idx: number) => {
        if (idx > 0) this.checkPageSpace(5);
        this.doc.text(line, this.margin + 5, this.currentY);
        if (idx < lines.length - 1) this.currentY += 5;
      });
      this.currentY += 5;
    });

    this.currentY += 5;
  }

  // ============================================================================
  // COVER PAGE
  // ============================================================================

  private generateCoverPage() {
    // Gradient background simulation
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight / 2, 'F');

    this.doc.setFillColor(
      Math.min(255, this.secondaryColor[0] + 30),
      Math.min(255, this.secondaryColor[1] + 30),
      Math.min(255, this.secondaryColor[2] + 30)
    );
    this.doc.rect(0, this.pageHeight / 2, this.pageWidth, this.pageHeight / 2, 'F');

    // Company logo or name
    if (this.whiteLabelConfig?.logoUrl) {
      try {
        // For square logos (like 500x500px), use these dimensions
        // This will display nicely on the cover page
        const logoSize = 35; // Square logo size in PDF units

        // Add logo image (centered, square aspect ratio)
        this.doc.addImage(
          this.whiteLabelConfig.logoUrl,
          'PNG',
          this.pageWidth / 2 - logoSize / 2, // Center horizontally
          40, // Y position
          logoSize, // Width
          logoSize, // Height (same as width for square logos)
          undefined,
          'FAST'
        );
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Fallback to company name if logo fails
        this.doc.setFontSize(28);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(255, 255, 255);
        const companyName = this.whiteLabelConfig?.companyName || 'VoyagrIQ';
        this.doc.text(companyName, this.pageWidth / 2, 60, { align: 'center' });
      }
    } else {
      // No logo - show company name
      this.doc.setFontSize(28);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      const companyName = this.whiteLabelConfig?.companyName || 'VoyagrIQ';
      this.doc.text(companyName, this.pageWidth / 2, 60, { align: 'center' });
    }

    // Report title
    this.doc.setFontSize(36);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Travel Analytics Report', this.pageWidth / 2, 90, { align: 'center' });

    // Tier badge
    const tierName = this.tier === 'starter' ? 'Starter' : this.tier === 'standard' ? 'Standard' : 'Premium';
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${tierName} Edition`, this.pageWidth / 2, 105, { align: 'center' });

    // Date and trip count
    this.doc.setFontSize(12);
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.doc.text(`Generated: ${today}`, this.pageWidth / 2, 150, { align: 'center' });
    this.doc.text(`Total Trips Analyzed: ${this.trips.length}`, this.pageWidth / 2, 165, { align: 'center' });

    // Bottom description
    this.doc.setFontSize(10);
    this.doc.setTextColor(240, 240, 240);
    this.doc.text('Comprehensive travel business insights and analytics', this.pageWidth / 2, 260, { align: 'center' });

    this.addPageFooter();
    this.addNewPage();
  }

  // ============================================================================
  // REPORT SECTIONS
  // ============================================================================

  private generateTableOfContents() {
    this.addSectionTitle('Table of Contents');

    const sections: Array<{ title: string; page: number }> = [
      { title: 'Executive Summary', page: 3 },
      { title: 'Destination Analysis', page: 4 },
      { title: 'Commission Breakdown', page: 6 },
      { title: 'Trip Cost Analysis', page: 8 },
      { title: 'Traveler Insights', page: 10 },
      { title: 'Vendor & Supplier Analysis', page: 12 },
      { title: 'Recommendations & Action Items', page: 14 },
    ];

    if (this.tier === 'standard' || this.tier === 'premium') {
      sections.push(
        { title: 'Advanced Analytics', page: 16 },
        { title: 'Agency Performance Comparison', page: 18 },
        { title: 'Predictive Insights & Forecasting', page: 20 },
        { title: 'Custom Metrics & KPIs', page: 22 }
      );
    }

    if (this.tier === 'premium') {
      sections.push(
        { title: 'Executive Dashboard', page: 24 },
        { title: 'Business Intelligence Deep Dive', page: 27 },
        { title: 'Competitive Analysis', page: 30 },
        { title: 'Strategic Recommendations', page: 32 }
      );
    }

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(60, 60, 60);

    sections.forEach(section => {
      this.checkPageSpace(8);
      this.doc.text(section.title, this.margin + 5, this.currentY);
      this.doc.text(`Page ${section.page}`, this.pageWidth - this.margin - 20, this.currentY);
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin + 5, this.currentY + 1, this.pageWidth - this.margin - 20, this.currentY + 1);
      this.currentY += 8;
    });

    this.addNewPage();
  }

  private generateExecutiveSummary() {
    const summary = this.reportGen.generateExecutiveSummary();

    this.addSectionTitle('Executive Summary');

    this.addText(
      'This report provides a comprehensive analysis of your travel business performance, including revenue trends, destination insights, and strategic recommendations.',
      10
    );
    this.currentY += 5;

    // Key metrics in a grid
    this.addSubsectionTitle('Key Performance Indicators');

    const metrics = [
      ['Total Trips', summary.totalTrips.toString()],
      ['Total Revenue', this.formatCurrency(summary.totalRevenue)],
      ['Total Costs', this.formatCurrency(summary.totalCosts)],
      ['Avg Commission Rate', this.formatPercent(summary.avgCommissionRate)],
      ['Avg Trip Cost', this.formatCurrency(summary.avgTripCost)],
      ['Growth Rate', this.formatPercent(summary.momGrowth)],
    ];

    metrics.forEach(([key, value]) => {
      this.addKeyValuePair(key, value, true);
    });

    this.currentY += 5;
    this.addSubsectionTitle('Business Highlights');
    this.addKeyValuePair('Top Destination', summary.topDestination);
    this.addKeyValuePair('Top Traveler', summary.topTraveler);
    this.addKeyValuePair('Avg Booking Value', this.formatCurrency(summary.kpis.avgBookingValue));
    this.addKeyValuePair('Repeat Traveler Rate', this.formatPercent(summary.kpis.repeatTravelerRate));
    this.addKeyValuePair('Avg Travelers/Trip', summary.kpis.avgTravelersPerTrip.toFixed(1));

    this.addNewPage();
  }

  private generateDestinationAnalysis() {
    const analysis = this.reportGen.generateDestinationAnalysis();

    this.addSectionTitle('Destination Analysis');

    this.addSubsectionTitle('Top Destinations by Revenue');
    this.addSimpleBarChart(
      analysis.topByRevenue.map(d => ({ label: d.country, value: d.revenue })),
      'Revenue by Destination'
    );

    this.currentY += 5;
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Country', 'Revenue', 'Trips', 'Avg Revenue', '% of Total']],
      body: analysis.topByRevenue.slice(0, 10).map(d => [
        d.country,
        this.formatCurrency(d.revenue),
        d.tripCount.toString(),
        this.formatCurrency(d.avgRevenue),
        this.formatPercent(d.percentOfTotal),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    this.checkPageSpace(40);
    this.addSubsectionTitle('Top Destinations by Trip Count');
    this.addSimpleBarChart(
      analysis.topByCount.map(d => ({ label: d.country, value: d.tripCount })),
      'Trip Volume by Destination',
      Math.max(...analysis.topByCount.map(d => d.tripCount)),
      true // Format as count, not currency
    );

    this.addNewPage();

    this.addSectionTitle('Destination Profitability');
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Country', 'Total Cost', 'Total Revenue', 'Margin', 'Profit %']],
      body: analysis.profitability.slice(0, 10).map(d => [
        d.country,
        this.formatCurrency(d.totalCost),
        this.formatCurrency(d.totalRevenue),
        this.formatCurrency(d.margin),
        this.formatPercent(d.profitMarginPercent),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.secondaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.addNewPage();
  }

  private generateCommissionBreakdown() {
    const commission = this.reportGen.generateCommissionBreakdown();

    this.addSectionTitle('Commission Breakdown');

    this.addSubsectionTitle('Commission by Destination');
    this.addSimpleBarChart(
      commission.byDestination.map(d => ({ label: d.country, value: d.totalCommission })),
      'Total Commission by Destination'
    );

    this.currentY += 5;
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Country', 'Commission', 'Avg Rate', 'Trips', '% of Total']],
      body: commission.byDestination.slice(0, 10).map(d => [
        d.country,
        this.formatCurrency(d.totalCommission),
        this.formatPercent(d.avgCommissionRate),
        d.tripCount.toString(),
        this.formatPercent(d.percentOfTotal),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.addNewPage();

    this.addSectionTitle('Commission by Agency');
    this.addSimpleBarChart(
      commission.byAgency.map(d => ({ label: d.agency, value: d.totalCommission })),
      'Total Commission by Agency'
    );

    this.currentY += 5;
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Agency', 'Commission', 'Avg Rate', 'Trips', '% of Total']],
      body: commission.byAgency.map(d => [
        d.agency,
        this.formatCurrency(d.totalCommission),
        this.formatPercent(d.avgRate),
        d.tripCount.toString(),
        this.formatPercent(d.percentOfTotal),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.secondaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    this.checkPageSpace(30);
    this.addSubsectionTitle('Commission Rate Distribution');
    this.addKeyValuePair('Trips with Commission', commission.rateDistribution.withCommission.toString());
    this.addKeyValuePair('Trips without Commission', commission.rateDistribution.withoutCommission.toString());
    this.addKeyValuePair('Average Rate', this.formatPercent(commission.rateDistribution.avgRate));

    this.addNewPage();
  }

  private generateTripCostAnalysis() {
    const costAnalysis = this.reportGen.generateTripCostAnalysis();

    this.addSectionTitle('Trip Cost Analysis');

    this.addSubsectionTitle('Average Costs by Destination');
    this.addSimpleBarChart(
      costAnalysis.avgByDestination.map(d => ({ label: d.country, value: d.avgCost })),
      'Average Trip Cost by Destination'
    );

    this.currentY += 5;
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Country', 'Avg Cost', 'Min Cost', 'Max Cost', 'Trips']],
      body: costAnalysis.avgByDestination.map(d => [
        d.country,
        this.formatCurrency(d.avgCost),
        this.formatCurrency(d.minCost),
        this.formatCurrency(d.maxCost),
        d.tripCount.toString(),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.addNewPage();

    this.addSectionTitle('Cost Distribution & Breakdown');

    this.addSubsectionTitle('Trip Cost Distribution');
    this.addDistributionChart(
      {
        'Under $5K': costAnalysis.distribution.under5000,
        '$5K-$10K': costAnalysis.distribution.between5000and10000,
        '$10K-$15K': costAnalysis.distribution.between10000and15000,
        '$15K-$20K': costAnalysis.distribution.between15000and20000,
        'Over $20K': costAnalysis.distribution.over20000,
      },
      'Distribution of Trip Costs'
    );

    this.currentY += 5;
    this.addSubsectionTitle('Cost Breakdown by Category');
    const totalCosts = Object.values(costAnalysis.costBreakdown).reduce((a, b) => a + b, 0);

    [
      ['Flights', costAnalysis.costBreakdown.flights],
      ['Hotels', costAnalysis.costBreakdown.hotels],
      ['Ground Transport', costAnalysis.costBreakdown.transport],
      ['Activities & Tours', costAnalysis.costBreakdown.activities],
      ['Meals', costAnalysis.costBreakdown.meals],
      ['Insurance', costAnalysis.costBreakdown.insurance],
      ['Other', costAnalysis.costBreakdown.other],
    ].forEach(([category, amount]) => {
      const percent = totalCosts > 0 ? ((amount as number / totalCosts) * 100) : 0;
      this.addKeyValuePair(
        category as string,
        `${this.formatCurrency(amount as number)} (${this.formatPercent(percent)})`
      );
    });

    this.addNewPage();
  }

  private generateTravelerInsights() {
    const insights = this.reportGen.generateTravelerInsights();

    this.addSectionTitle('Traveler Insights');

    this.addSubsectionTitle('Top Travelers by Spend');
    this.addSimpleBarChart(
      insights.topBySpend.map(d => ({ label: d.traveler, value: d.totalSpent })),
      'Top 5 Travelers by Total Spend'
    );

    this.currentY += 5;
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Traveler', 'Total Spent', 'Trips', 'Avg Trip Cost', 'Last Trip']],
      body: insights.topBySpend.map(d => [
        d.traveler,
        this.formatCurrency(d.totalSpent),
        d.tripCount.toString(),
        this.formatCurrency(d.avgTripCost),
        new Date(d.lastTripDate).toLocaleDateString(),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.addNewPage();

    this.addSectionTitle('Customer Loyalty Analysis');

    this.addSubsectionTitle('Repeat vs New Travelers');
    this.addKeyValuePair('Total Unique Travelers', insights.repeatVsNew.totalUniqueTravelers.toString());
    this.addKeyValuePair('Repeat Travelers', insights.repeatVsNew.repeatTravelers.toString());
    this.addKeyValuePair('New Travelers', insights.repeatVsNew.newTravelers.toString());
    this.addKeyValuePair('Repeat Rate', this.formatPercent(insights.repeatVsNew.repeatRate), true);

    this.currentY += 10;
    this.addSubsectionTitle('Travel Group Demographics');
    this.addKeyValuePair('Average Group Size', insights.demographics.avgGroupSize.toFixed(1));
    this.addKeyValuePair('Total Adults', insights.demographics.totalAdults.toString());
    this.addKeyValuePair('Total Children', insights.demographics.totalChildren.toString());
    this.addKeyValuePair('Avg Adults per Trip', insights.demographics.avgAdultsPerTrip.toFixed(1));
    this.addKeyValuePair('Avg Children per Trip', insights.demographics.avgChildrenPerTrip.toFixed(1));

    this.addNewPage();
  }

  private generateVendorAnalysis() {
    const vendors = this.reportGen.generateVendorAnalysis();

    this.addSectionTitle('Vendor & Supplier Analysis');

    this.addSubsectionTitle('Top Vendors by Total Spend');

    // Show top 10 vendors in a bar chart
    if (vendors.topVendorsBySpend.length > 0) {
      this.addSimpleBarChart(
        vendors.topVendorsBySpend.slice(0, 10).map(v => ({
          label: v.vendor,
          value: v.totalSpend
        })),
        'Top 10 Vendors by Spend'
      );
    }

    this.currentY += 5;
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Vendor', 'Category', 'Total Spend', 'Trips', 'Avg/Trip', '% of Total']],
      body: vendors.topVendorsBySpend.slice(0, 10).map(v => [
        v.vendor,
        v.category,
        this.formatCurrency(v.totalSpend),
        v.tripCount.toString(),
        this.formatCurrency(v.avgCostPerTrip),
        this.formatPercent(v.percentOfTotal),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;

    // Vendor Concentration Metrics
    this.addSubsectionTitle('Vendor Concentration & Diversity');
    this.addKeyValuePair('Total Unique Vendors', vendors.vendorConcentration.totalUniqueVendors.toString());
    this.addKeyValuePair('Top Vendor Market Share', this.formatPercent(vendors.vendorConcentration.topVendorShare));
    this.addKeyValuePair('Top 3 Vendors Market Share', this.formatPercent(vendors.vendorConcentration.top3VendorShare));
    this.addKeyValuePair('Diversity Score', vendors.vendorConcentration.diversityScore.toFixed(2), true);

    this.addNewPage();

    // Vendors by Category
    this.addSectionTitle('Vendors by Category');

    // Flight Vendors
    if (vendors.vendorsByCategory.flights.length > 0) {
      this.addSubsectionTitle('Flight Vendors');
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Vendor', 'Total Spend', 'Bookings', 'Avg per Booking']],
        body: vendors.vendorsByCategory.flights.slice(0, 5).map(v => [
          v.vendor,
          this.formatCurrency(v.totalSpend),
          v.tripCount.toString(),
          this.formatCurrency(v.totalSpend / v.tripCount),
        ]),
        theme: 'grid',
        headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: this.margin, right: this.margin },
      });
      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    // Hotel Vendors
    if (vendors.vendorsByCategory.hotels.length > 0) {
      this.checkPageSpace(60);
      this.addSubsectionTitle('Hotel Vendors');
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Vendor', 'Total Spend', 'Bookings', 'Avg per Booking']],
        body: vendors.vendorsByCategory.hotels.slice(0, 5).map(v => [
          v.vendor,
          this.formatCurrency(v.totalSpend),
          v.tripCount.toString(),
          this.formatCurrency(v.totalSpend / v.tripCount),
        ]),
        theme: 'grid',
        headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: this.margin, right: this.margin },
      });
      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    // Ground Transport Vendors
    if (vendors.vendorsByCategory.groundTransport.length > 0) {
      this.checkPageSpace(60);
      this.addSubsectionTitle('Ground Transport Vendors');
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Vendor', 'Total Spend', 'Bookings', 'Avg per Booking']],
        body: vendors.vendorsByCategory.groundTransport.slice(0, 5).map(v => [
          v.vendor,
          this.formatCurrency(v.totalSpend),
          v.tripCount.toString(),
          this.formatCurrency(v.totalSpend / v.tripCount),
        ]),
        theme: 'grid',
        headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: this.margin, right: this.margin },
      });
      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    // Activities Vendors
    if (vendors.vendorsByCategory.activities.length > 0) {
      this.checkPageSpace(60);
      this.addSubsectionTitle('Activities & Tours Vendors');
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Vendor', 'Total Spend', 'Bookings', 'Avg per Booking']],
        body: vendors.vendorsByCategory.activities.slice(0, 5).map(v => [
          v.vendor,
          this.formatCurrency(v.totalSpend),
          v.tripCount.toString(),
          this.formatCurrency(v.totalSpend / v.tripCount),
        ]),
        theme: 'grid',
        headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: this.margin, right: this.margin },
      });
      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    // Insurance Vendors
    if (vendors.vendorsByCategory.insurance.length > 0) {
      this.checkPageSpace(60);
      this.addSubsectionTitle('Insurance Vendors');
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Vendor', 'Total Spend', 'Bookings', 'Avg per Booking']],
        body: vendors.vendorsByCategory.insurance.slice(0, 5).map(v => [
          v.vendor,
          this.formatCurrency(v.totalSpend),
          v.tripCount.toString(),
          this.formatCurrency(v.totalSpend / v.tripCount),
        ]),
        theme: 'grid',
        headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: this.margin, right: this.margin },
      });
      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    }

    this.addNewPage();
  }

  private generateRecommendations() {
    const recs = this.reportGen.generateRecommendations();

    this.addSectionTitle('Recommendations & Action Items');

    this.addSubsectionTitle('Key Insights');
    recs.keyInsights.forEach((insight, index) => {
      this.addText(`${index + 1}. ${insight}`, 10);
    });

    this.currentY += 10;
    this.addSubsectionTitle('Growth Opportunities');
    recs.opportunities.forEach(opp => {
      this.checkPageSpace(25);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.accentColor);
      this.doc.text(`• ${opp.title}`, this.margin, this.currentY);
      this.currentY += 6;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      this.doc.setFontSize(9);
      const maxWidth = this.pageWidth - (2 * this.margin) - 20; // Extra margin for indented text
      const lines = this.doc.splitTextToSize(opp.description, maxWidth);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += 5;
      });

      this.doc.setFontSize(8);
      // Wrap the Impact/Effort text to prevent overflow
      const impactText = `Impact: ${opp.potentialImpact} | Effort: ${opp.effort}`;
      const impactLines = this.doc.splitTextToSize(impactText, maxWidth);
      impactLines.forEach((line: string) => {
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += 4;
      });
      this.currentY += 6;
    });

    if (recs.risks.length > 0) {
      this.checkPageSpace(20);
      this.currentY += 5;
      this.addSubsectionTitle('Risk Areas to Address');
      recs.risks.forEach(risk => {
        this.checkPageSpace(25);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(220, 38, 38);
        this.doc.text(risk.title, this.margin, this.currentY);
        this.currentY += 6;

        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(60, 60, 60);
        this.doc.setFontSize(9);
        const maxWidth = this.pageWidth - (2 * this.margin) - 20; // Extra margin for indented text
        const lines = this.doc.splitTextToSize(risk.description, maxWidth);
        lines.forEach((line: string) => {
          this.doc.text(line, this.margin + 5, this.currentY);
          this.currentY += 5;
        });

        this.doc.setFontSize(8);
        // Wrap severity text to prevent overflow
        const severityText = `Severity: ${risk.severity}`;
        const severityLines = this.doc.splitTextToSize(severityText, maxWidth);
        severityLines.forEach((line: string) => {
          this.doc.text(line, this.margin + 5, this.currentY);
          this.currentY += 4;
        });
        // Wrap mitigation text to prevent overflow
        const mitigationText = `Mitigation: ${risk.mitigation}`;
        const mitigationLines = this.doc.splitTextToSize(mitigationText, maxWidth);
        mitigationLines.forEach((line: string) => {
          this.doc.text(line, this.margin + 5, this.currentY);
          this.currentY += 4;
        });
        this.currentY += 6;
      });
    }

    this.checkPageSpace(20);
    this.currentY += 5;
    this.addSubsectionTitle('Recommended Actions');
    recs.actions.forEach((action, index) => {
      this.addText(`${index + 1}. ${action}`, 9);
    });

    this.addNewPage();
  }

  // ============================================================================
  // STANDARD & PREMIUM TIER SECTIONS
  // ============================================================================

  private generateAdvancedAnalytics() {
    const advanced = this.reportGen.generateAdvancedAnalytics();

    this.addSectionTitle('Advanced Analytics');

    this.addSubsectionTitle('Seasonal Trends');
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Quarter', 'Trip Count', 'Avg Revenue', 'Top Destinations']],
      body: advanced.seasonalTrends.map(s => [
        s.season,
        s.tripCount.toString(),
        this.formatCurrency(s.avgRevenue),
        s.popularDestinations.join(', '),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    this.addSubsectionTitle('Booking Patterns');
    this.addKeyValuePair('Peak Months', advanced.bookingPatterns.peakMonths.join(', '));
    this.addKeyValuePair('Low Months', advanced.bookingPatterns.lowMonths.join(', '));

    this.currentY += 10;
    this.addSubsectionTitle('Business Velocity Metrics');
    this.addKeyValuePair('Trips per Month', advanced.velocityMetrics.tripsPerMonth.toFixed(1));
    this.addKeyValuePair('Revenue per Month', this.formatCurrency(advanced.velocityMetrics.revenuePerMonth));
    this.addKeyValuePair('Growth Rate', this.formatPercent(advanced.velocityMetrics.growthRate), true);

    this.addNewPage();
  }

  private generateAgencyComparison() {
    const comparison = this.reportGen.generateAgencyComparison();

    this.addSectionTitle('Agency Performance Comparison');

    this.addSimpleBarChart(
      comparison.agencies.map(a => ({ label: a.name, value: a.revenue })),
      'Agency Revenue Comparison'
    );

    this.currentY += 5;
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Rank', 'Agency', 'Revenue', 'Trips', 'Avg Rate', 'Market Share', 'Score']],
      body: comparison.agencies.map(a => [
        `#${a.rank}`,
        a.name,
        this.formatCurrency(a.revenue),
        a.tripCount.toString(),
        this.formatPercent(a.avgCommissionRate),
        this.formatPercent(a.marketShare),
        a.performanceScore.toFixed(0),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.secondaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    this.addSubsectionTitle('Benchmarks');
    this.addKeyValuePair('Average Commission Rate', this.formatPercent(comparison.benchmarks.avgCommissionRate));
    this.addKeyValuePair('Top Performer Rate', this.formatPercent(comparison.benchmarks.topPerformerRate));
    this.addKeyValuePair('Average Trip Value', this.formatCurrency(comparison.benchmarks.avgTripValue));

    if (comparison.recommendations.length > 0) {
      this.currentY += 10;
      this.addSubsectionTitle('Agency Insights');
      comparison.recommendations.forEach(rec => {
        this.addText(`• ${rec}`, 9);
      });
    }

    this.addNewPage();
  }

  private generatePredictiveInsights() {
    const predictive = this.reportGen.generatePredictiveInsights();

    this.addSectionTitle('Predictive Insights & Forecasting');

    this.addSubsectionTitle('6-Month Revenue Forecast');
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Month', 'Predicted Revenue', 'Confidence Range', 'Confidence']],
      body: predictive.forecast.map(f => [
        f.month,
        this.formatCurrency(f.predictedRevenue),
        `${this.formatCurrency(f.confidenceLower)} - ${this.formatCurrency(f.confidenceUpper)}`,
        this.formatPercent(f.confidence),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    this.addSubsectionTitle('Trend Analysis');
    predictive.trends.forEach(trend => {
      this.checkPageSpace(15);
      const arrow = trend.direction === 'Up' ? 'UP' : trend.direction === 'Down' ? 'DOWN' : 'STABLE';
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`[${arrow}] ${trend.metric}`, this.margin, this.currentY);
      this.currentY += 6;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.setTextColor(60, 60, 60);
      this.doc.text(trend.prediction, this.margin + 5, this.currentY);
      this.currentY += 10;
    });

    this.addNewPage();

    this.addSectionTitle('Strategic Opportunities');
    predictive.opportunities.forEach(opp => {
      this.checkPageSpace(25);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.accentColor);
      this.doc.text(`${opp.type}: ${opp.title}`, this.margin, this.currentY);
      this.currentY += 7;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.setTextColor(60, 60, 60);
      const maxWidth = this.pageWidth - (2 * this.margin) - 15; // Extra safety margin
      const lines = this.doc.splitTextToSize(opp.description, maxWidth);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += 5;
      });

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Potential Value: ${this.formatCurrency(opp.potentialValue)}`, this.margin, this.currentY);
      this.currentY += 5;
      this.doc.text(`Timeframe: ${opp.timeframe}`, this.margin, this.currentY);
      this.currentY += 12;
    });

    this.addNewPage();
  }

  private generateCustomMetrics() {
    const custom = this.reportGen.generateCustomMetrics();

    this.addSectionTitle('Custom Metrics & KPIs');

    this.addSubsectionTitle('Standard Business Metrics');
    this.addKeyValuePair('Avg Revenue per Trip', this.formatCurrency(custom.standardMetrics.avgRevenuePerTrip));
    this.addKeyValuePair('Avg Cost per Traveler', this.formatCurrency(custom.standardMetrics.avgCostPerTraveler));
    this.addKeyValuePair('Booking Efficiency', this.formatPercent(custom.standardMetrics.bookingEfficiency));
    this.addKeyValuePair('Destination Diversity', custom.standardMetrics.destinationDiversity.toString() + ' countries');

    this.currentY += 10;
    this.addSubsectionTitle('Performance Indicators');
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Metric', 'Value', 'Trend', '% Change']],
      body: custom.performanceIndicators.map(p => [
        p.name,
        typeof p.value === 'number' && p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('cost')
          ? this.formatCurrency(p.value)
          : p.value.toFixed(2),
        p.trend,
        this.formatPercent(p.percentChange),
      ]),
      theme: 'grid',
      headStyles: { fillColor: this.secondaryColor, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.addNewPage();
  }

  // ============================================================================
  // PREMIUM TIER EXCLUSIVE SECTIONS
  // ============================================================================

  private generateExecutiveDashboard() {
    this.addSectionTitle('Executive Dashboard');

    const summary = this.reportGen.generateExecutiveSummary();
    const advanced = this.reportGen.generateAdvancedAnalytics();

    this.addText(
      'This executive dashboard provides a high-level overview of your travel business performance with actionable insights for strategic decision-making.',
      10
    );
    this.currentY += 10;

    // Critical Success Factors
    this.addSubsectionTitle('Critical Success Factors');
    const csfData = [
      ['Revenue Growth', this.formatPercent(summary.momGrowth), summary.momGrowth > 0 ? 'Positive' : 'Needs Attention'],
      ['Commission Rate', this.formatPercent(summary.avgCommissionRate), summary.avgCommissionRate > 10 ? 'Strong' : 'Opportunity'],
      ['Customer Loyalty', this.formatPercent(summary.kpis.repeatTravelerRate), summary.kpis.repeatTravelerRate > 30 ? 'Excellent' : 'Focus Area'],
      ['Business Velocity', `${advanced.velocityMetrics.tripsPerMonth.toFixed(1)} trips/mo`, advanced.velocityMetrics.tripsPerMonth > 5 ? 'Strong' : 'Growing'],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Metric', 'Current Value', 'Status']],
      body: csfData,
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;

    this.addSubsectionTitle('Strategic Focus Areas');
    this.addText('1. Maximize revenue from top-performing destinations', 9);
    this.addText('2. Improve customer retention and repeat booking rates', 9);
    this.addText('3. Optimize agency partnerships for better commission rates', 9);
    this.addText('4. Expand into high-margin destination markets', 9);
    this.addText('5. Leverage seasonal trends for promotional campaigns', 9);

    this.addNewPage();
  }

  private generateBusinessIntelligence() {
    this.addSectionTitle('Business Intelligence Deep Dive');

    const summary = this.reportGen.generateExecutiveSummary();
    const destAnalysis = this.reportGen.generateDestinationAnalysis();
    const commission = this.reportGen.generateCommissionBreakdown();

    this.addSubsectionTitle('Market Position Analysis');
    this.addText(
      `Your travel business has processed ${summary.totalTrips} trips with a total revenue of ${this.formatCurrency(summary.totalRevenue)}. ` +
      `Your top destination, ${summary.topDestination}, represents a significant portion of your business. ` +
      `With an average commission rate of ${this.formatPercent(summary.avgCommissionRate)}, there are opportunities ` +
      `to optimize partnership agreements and increase profitability.`,
      9
    );

    this.currentY += 10;
    this.addSubsectionTitle('Revenue Concentration Risk');
    const topDestRevenue = destAnalysis.topByRevenue[0];
    if (topDestRevenue.percentOfTotal > 40) {
      this.addText(
        `HIGH RISK: ${topDestRevenue.country} accounts for ${this.formatPercent(topDestRevenue.percentOfTotal)} of your total revenue. ` +
        `Consider diversifying your destination portfolio to reduce dependency on a single market.`,
        9
      );
    } else if (topDestRevenue.percentOfTotal > 25) {
      this.addText(
        `MODERATE RISK: ${topDestRevenue.country} accounts for ${this.formatPercent(topDestRevenue.percentOfTotal)} of your total revenue. ` +
        `Monitor this concentration and explore expansion into additional markets.`,
        9
      );
    } else {
      this.addText(
        `LOW RISK: Your revenue is well-diversified across destinations, with ${topDestRevenue.country} accounting for ${this.formatPercent(topDestRevenue.percentOfTotal)} of total revenue.`,
        9
      );
    }

    this.currentY += 10;
    this.addSubsectionTitle('Commission Optimization Potential');
    const avgCommission = commission.byAgency.reduce((sum, a) => sum + a.avgRate, 0) / commission.byAgency.length;
    const topAgency = commission.byAgency[0];
    const improvementPotential = ((topAgency.avgRate - avgCommission) / avgCommission) * 100;

    if (improvementPotential > 20) {
      this.addText(
        `OPPORTUNITY: Your top-performing agency (${topAgency.agency}) achieves ${this.formatPercent(topAgency.avgRate)} commission rate, ` +
        `which is ${this.formatPercent(improvementPotential)} higher than your average. Consider renegotiating terms with lower-performing agencies.`,
        9
      );
    }

    this.addNewPage();

    this.addSubsectionTitle('Customer Lifetime Value Analysis');
    const insights = this.reportGen.generateTravelerInsights();
    const topTraveler = insights.topBySpend[0];
    this.addText(
      `Your top traveler, ${topTraveler.traveler}, has spent ${this.formatCurrency(topTraveler.totalSpent)} across ${topTraveler.tripCount} trips, ` +
      `with an average trip value of ${this.formatCurrency(topTraveler.avgTripCost)}. Focus on maintaining relationships with high-value clients ` +
      `through personalized service and exclusive offerings.`,
      9
    );

    this.currentY += 10;
    this.addSubsectionTitle('Profitability Drivers');
    const costAnalysis = this.reportGen.generateTripCostAnalysis();
    const totalCosts = Object.values(costAnalysis.costBreakdown).reduce((a, b) => a + b, 0);

    this.addText('Cost structure breakdown reveals key profitability drivers:', 9);
    this.currentY += 5;

    Object.entries(costAnalysis.costBreakdown).forEach(([category, amount]) => {
      const percent = (amount / totalCosts) * 100;
      this.addKeyValuePair(
        category.charAt(0).toUpperCase() + category.slice(1),
        `${this.formatPercent(percent)} of total costs`
      );
    });

    this.addNewPage();
  }

  private generateCompetitiveAnalysis() {
    this.addSectionTitle('Competitive Analysis & Market Position');

    const comparison = this.reportGen.generateAgencyComparison();

    this.addSubsectionTitle('Industry Benchmarking');
    this.addText(
      'Based on industry standards and your current performance metrics, here is how your business compares:',
      9
    );
    this.currentY += 5;

    const benchmarks = [
      ['Average Commission Rate', this.formatPercent(comparison.benchmarks.avgCommissionRate), '10-15% (Industry)', comparison.benchmarks.avgCommissionRate >= 10 ? 'On Par' : 'Below'],
      ['Avg Trip Value', this.formatCurrency(comparison.benchmarks.avgTripValue), '$8,000-$12,000 (Industry)', comparison.benchmarks.avgTripValue >= 8000 ? 'Strong' : 'Growing'],
      ['Top Performer Rate', this.formatPercent(comparison.benchmarks.topPerformerRate), '12-18% (Best)', comparison.benchmarks.topPerformerRate >= 12 ? 'Competitive' : 'Opportunity'],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Metric', 'Your Business', 'Industry Standard', 'Assessment']],
      body: benchmarks,
      theme: 'grid',
      headStyles: { fillColor: this.primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;

    this.addSubsectionTitle('Competitive Advantages');
    this.addText('• Strong portfolio diversity across multiple destinations', 9);
    this.addText('• Established relationships with key travel agencies', 9);
    this.addText('• Growing repeat customer base', 9);
    this.addText('• Comprehensive data-driven decision making', 9);

    this.currentY += 10;
    this.addSubsectionTitle('Areas for Improvement');
    this.addText('• Enhance digital marketing to attract new customers', 9);
    this.addText('• Develop loyalty programs to increase repeat bookings', 9);
    this.addText('• Negotiate improved commission structures', 9);
    this.addText('• Expand into emerging high-growth destinations', 9);

    this.addNewPage();
  }

  private generateStrategicRecommendations() {
    this.addSectionTitle('Strategic Recommendations');

    const predictive = this.reportGen.generatePredictiveInsights();

    this.addSubsectionTitle('90-Day Action Plan');

    const actions = [
      {
        priority: 'High',
        action: 'Implement Customer Retention Program',
        description: 'Launch a loyalty program targeting repeat travelers with exclusive benefits and personalized offers.',
        timeline: '30 days',
        resources: 'Marketing team, CRM system',
        expectedImpact: 'Increase repeat rate by 15-20%',
      },
      {
        priority: 'High',
        action: 'Renegotiate Agency Partnerships',
        description: 'Review commission structures with underperforming agencies and renegotiate terms based on volume and performance.',
        timeline: '45 days',
        resources: 'Business development team',
        expectedImpact: 'Improve commission rates by 2-3%',
      },
      {
        priority: 'Medium',
        action: 'Expand Destination Portfolio',
        description: 'Identify and develop offerings for 2-3 new high-margin destinations based on market trends.',
        timeline: '60 days',
        resources: 'Product team, partnerships',
        expectedImpact: 'Reduce concentration risk, increase revenue by 10%',
      },
      {
        priority: 'Medium',
        action: 'Optimize Seasonal Campaigns',
        description: 'Develop targeted marketing campaigns aligned with peak booking seasons identified in analytics.',
        timeline: '90 days',
        resources: 'Marketing team, analytics',
        expectedImpact: 'Increase bookings during peak periods by 25%',
      },
    ];

    actions.forEach(action => {
      this.checkPageSpace(40);
      this.doc.setFillColor(...(action.priority === 'High' ? this.accentColor : this.secondaryColor));
      this.doc.rect(this.margin, this.currentY, 3, 8, 'F');

      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`${action.priority} Priority: ${action.action}`, this.margin + 5, this.currentY + 6);
      this.currentY += 10;

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(60, 60, 60);
      const maxWidth = this.pageWidth - (2 * this.margin) - 20; // Extra margin for indented text
      const lines = this.doc.splitTextToSize(action.description, maxWidth);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += 5;
      });

      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Timeline: ${action.timeline}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.text(`Resources: ${action.resources}`, this.margin + 5, this.currentY);
      this.currentY += 4;
      this.doc.setTextColor(...this.primaryColor);
      this.doc.text(`Expected Impact: ${action.expectedImpact}`, this.margin + 5, this.currentY);
      this.currentY += 12;
    });

    this.addNewPage();

    this.addSubsectionTitle('Long-Term Strategic Vision');
    this.addText(
      'Based on predictive analytics and current market trends, your business is positioned for sustained growth. ' +
      'Focus on diversification, customer retention, and operational efficiency to achieve long-term success.',
      9
    );
    this.currentY += 10;

    this.addText('Key Success Factors for Next 12 Months:', 10, true);
    this.currentY += 5;
    this.addText('1. Maintain commission rate above 10% across all partnerships', 9);
    this.addText('2. Achieve 40%+ repeat customer rate through loyalty initiatives', 9);
    this.addText('3. Expand destination portfolio to include 5+ new high-margin markets', 9);
    this.addText('4. Increase average trip value by 15% through upselling strategies', 9);
    this.addText('5. Implement predictive analytics for proactive opportunity identification', 9);

    this.currentY += 15;

    // Final CTA
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    const companyName = this.whiteLabelConfig?.companyName || 'VoyagrIQ';
    this.doc.text(
      `Partner with ${companyName} for continued success`,
      this.pageWidth / 2,
      this.currentY + 10,
      { align: 'center' }
    );
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      'Data-driven insights for smarter travel business decisions',
      this.pageWidth / 2,
      this.currentY + 18,
      { align: 'center' }
    );
  }

  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================

  generate(): jsPDF {
    // Cover page
    this.generateCoverPage();

    // Table of contents
    this.generateTableOfContents();

    // Starter tier sections (all tiers get these)
    this.generateExecutiveSummary();
    this.generateDestinationAnalysis();
    this.generateCommissionBreakdown();
    this.generateTripCostAnalysis();
    this.generateTravelerInsights();
    this.generateVendorAnalysis();
    this.generateRecommendations();

    // Standard tier additions
    if (this.tier === 'standard' || this.tier === 'premium') {
      this.generateAdvancedAnalytics();
      this.generateAgencyComparison();
      this.generatePredictiveInsights();
      this.generateCustomMetrics();
    }

    // Premium tier additions
    if (this.tier === 'premium') {
      this.generateExecutiveDashboard();
      this.generateBusinessIntelligence();
      this.generateCompetitiveAnalysis();
      this.generateStrategicRecommendations();
    }

    return this.doc;
  }

  save(filename?: string) {
    const defaultFilename = `travel-report-${this.tier}-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename || defaultFilename);
  }
}
