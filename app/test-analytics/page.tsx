"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '@/lib/dataStore';
import { ReportGenerator } from '@/lib/reportGenerator';
import { Trip } from '@/data/trips';

export default function TestAnalytics() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'standard' | 'premium'>('starter');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const loadedTrips = DataStore.getTrips();
    setTrips(loadedTrips);
    setLoading(false);
  }, []);

  const generateAnalytics = () => {
    if (trips.length === 0) return;

    const generator = new ReportGenerator(trips, selectedTier);
    const sections = generator.getReportSections();

    setAnalytics({
      executive: generator.generateExecutiveSummary(),
      destination: generator.generateDestinationAnalysis(),
      commission: generator.generateCommissionBreakdown(),
      cost: generator.generateTripCostAnalysis(),
      traveler: generator.generateTravelerInsights(),
      vendor: generator.generateVendorAnalysis(),
      recommendations: generator.generateRecommendations(),
      ...(selectedTier === 'standard' || selectedTier === 'premium' ? {
        advanced: generator.generateAdvancedAnalytics(),
        agency: generator.generateAgencyComparison(),
        predictive: generator.generatePredictiveInsights(),
        custom: generator.generateCustomMetrics(),
      } : {}),
      sections,
    });
  };

  useEffect(() => {
    if (trips.length > 0) {
      generateAnalytics();
    }
  }, [trips, selectedTier]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Analytics Test Page</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <p className="text-yellow-800 mb-4">
            <strong>No trips found.</strong> You need to load some sample data first to test the analytics engine.
          </p>
          <Link href="/load-sample-data">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              → Load Sample Data
            </button>
          </Link>
        </div>
        <div className="text-gray-600">
          <p className="mb-2">The Analytics Test Page allows you to:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Preview analytics across different subscription tiers</li>
            <li>Test the ReportGenerator with real data</li>
            <li>See how reports differ between Starter, Standard, and Premium tiers</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Analytics Test & Preview</h1>
        <p className="text-gray-600 mb-4">
          Testing the new ReportGenerator with {trips.length} trips
        </p>

        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedTier('starter')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedTier === 'starter'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Starter Tier
          </button>
          <button
            onClick={() => setSelectedTier('standard')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedTier === 'standard'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Standard Tier
          </button>
          <button
            onClick={() => setSelectedTier('premium')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedTier === 'premium'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Premium Tier
          </button>

          <div className="ml-auto">
            <Link href="/data">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                📄 Generate PDF Preview
              </button>
            </Link>
          </div>
        </div>
      </div>

      {analytics && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📊 Executive Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Trips</div>
                <div className="text-2xl font-bold">{analytics.executive.totalTrips}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold">${analytics.executive.totalRevenue.toFixed(2)}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Avg Commission</div>
                <div className="text-2xl font-bold">{analytics.executive.avgCommissionRate.toFixed(1)}%</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Growth Rate</div>
                <div className="text-2xl font-bold">{analytics.executive.momGrowth.toFixed(1)}%</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Top Destination</div>
                <div className="text-lg font-semibold">{analytics.executive.topDestination}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Top Traveler</div>
                <div className="text-lg font-semibold">{analytics.executive.topTraveler}</div>
              </div>
            </div>
          </div>

          {/* Destination Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🌍 Top Destinations</h2>
            <div className="space-y-2">
              {analytics.destination.topByRevenue.slice(0, 5).map((dest: any) => (
                <div key={dest.country} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold">{dest.country}</div>
                    <div className="text-sm text-gray-600">{dest.tripCount} trips</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${dest.revenue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{dest.percentOfTotal.toFixed(1)}% of total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commission Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">💰 Commission by Agency</h2>
            <div className="space-y-2">
              {analytics.commission.byAgency.map((agency: any) => (
                <div key={agency.agency} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold">{agency.agency}</div>
                    <div className="text-sm text-gray-600">{agency.tripCount} trips • {agency.avgRate.toFixed(1)}% avg rate</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${agency.totalCommission.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{agency.percentOfTotal.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🏢 Vendor & Supplier Analysis</h2>

            {analytics.vendor && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Top Vendors by Spend</h3>
                  {analytics.vendor.topVendorsBySpend.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Spend</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Trips</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.vendor.topVendorsBySpend.slice(0, 10).map((vendor: any, i: number) => (
                            <tr key={i} className="border-t">
                              <td className="px-4 py-2 font-medium">{vendor.vendor}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{vendor.category}</td>
                              <td className="px-4 py-2 text-right">${vendor.totalSpend.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right">{vendor.tripCount}</td>
                              <td className="px-4 py-2 text-right">{vendor.percentOfTotal.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No vendor data available</p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Vendors</div>
                    <div className="text-2xl font-bold">{analytics.vendor.vendorConcentration.totalUniqueVendors}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Top Vendor Share</div>
                    <div className="text-2xl font-bold">{analytics.vendor.vendorConcentration.topVendorShare.toFixed(1)}%</div>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Top 3 Share</div>
                    <div className="text-2xl font-bold">
                      {isNaN(analytics.vendor.vendorConcentration.top3VendorShare)
                        ? '0.0'
                        : analytics.vendor.vendorConcentration.top3VendorShare.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Diversity Score</div>
                    <div className="text-2xl font-bold">{analytics.vendor.vendorConcentration.diversityScore.toFixed(1)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.vendor.vendorsByCategory.flights.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">✈️ Flight Vendors</h4>
                      <ul className="text-sm space-y-1">
                        {analytics.vendor.vendorsByCategory.flights.map((v: any, i: number) => (
                          <li key={i}>{v.vendor} - ${v.totalSpend.toFixed(0)} ({v.tripCount} trips)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analytics.vendor.vendorsByCategory.hotels.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">🏨 Hotel Vendors</h4>
                      <ul className="text-sm space-y-1">
                        {analytics.vendor.vendorsByCategory.hotels.map((v: any, i: number) => (
                          <li key={i}>{v.vendor} - ${v.totalSpend.toFixed(0)} ({v.tripCount} trips)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analytics.vendor.vendorsByCategory.groundTransport.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">🚗 Ground Transport</h4>
                      <ul className="text-sm space-y-1">
                        {analytics.vendor.vendorsByCategory.groundTransport.map((v: any, i: number) => (
                          <li key={i}>{v.vendor} - ${v.totalSpend.toFixed(0)} ({v.tripCount} trips)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analytics.vendor.vendorsByCategory.activities.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">🎭 Activities & Tours</h4>
                      <ul className="text-sm space-y-1">
                        {analytics.vendor.vendorsByCategory.activities.map((v: any, i: number) => (
                          <li key={i}>{v.vendor} - ${v.totalSpend.toFixed(0)} ({v.tripCount} trips)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analytics.vendor.vendorsByCategory.insurance.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">🛡️ Insurance</h4>
                      <ul className="text-sm space-y-1">
                        {analytics.vendor.vendorsByCategory.insurance.map((v: any, i: number) => (
                          <li key={i}>{v.vendor} - ${v.totalSpend.toFixed(0)} ({v.tripCount} trips)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">💡 Key Insights & Recommendations</h2>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Key Insights:</h3>
              <ul className="space-y-1">
                {analytics.recommendations.keyInsights.map((insight: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {analytics.recommendations.opportunities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Opportunities:</h3>
                <div className="space-y-2">
                  {analytics.recommendations.opportunities.map((opp: any, i: number) => (
                    <div key={i} className="bg-green-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold">{opp.title}</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          opp.potentialImpact === 'High' ? 'bg-green-200 text-green-800' :
                          opp.potentialImpact === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {opp.potentialImpact} Impact
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{opp.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.recommendations.risks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Risks:</h3>
                <div className="space-y-2">
                  {analytics.recommendations.risks.map((risk: any, i: number) => (
                    <div key={i} className="bg-red-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold">{risk.title}</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          risk.severity === 'High' ? 'bg-red-200 text-red-800' :
                          risk.severity === 'Medium' ? 'bg-orange-200 text-orange-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{risk.description}</div>
                      <div className="text-xs text-gray-600">Mitigation: {risk.mitigation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Standard Tier Features */}
          {(selectedTier === 'standard' || selectedTier === 'premium') && analytics.advanced && (
            <>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">
                  📈 Advanced Analytics
                  <span className="ml-2 text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded">Standard+</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Trips/Month</div>
                    <div className="text-2xl font-bold">{analytics.advanced?.velocityMetrics?.tripsPerMonth?.toFixed(1) || '0'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Revenue/Month</div>
                    <div className="text-2xl font-bold">${analytics.advanced?.velocityMetrics?.revenuePerMonth?.toFixed(0) || '0'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Growth Rate</div>
                    <div className="text-2xl font-bold">{analytics.advanced?.velocityMetrics?.growthRate?.toFixed(1) || '0'}%</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Avg Days Between</div>
                    <div className="text-2xl font-bold">{analytics.advanced?.leadTimeAnalysis?.avgDaysBetweenBookings?.toFixed(0) || '0'}</div>
                  </div>
                </div>
              </div>

              {analytics.predictive && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    🔮 6-Month Forecast
                    <span className="ml-2 text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded">Standard+</span>
                  </h2>
                  <div className="space-y-2">
                    {analytics.predictive?.forecast?.slice(0, 3).map((forecast: any) => (
                      <div key={forecast.month} className="flex justify-between items-center p-3 bg-white rounded">
                        <div className="font-semibold">{forecast.month}</div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">${forecast.predictedRevenue?.toFixed(2) || '0'}</div>
                          <div className="text-xs text-gray-600">{forecast.confidence || 0}% confidence</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Premium Tier Exclusive Features */}
          {selectedTier === 'premium' && (
            <>
              <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-lg shadow-lg p-6 border-2 border-purple-300">
                <h2 className="text-2xl font-bold mb-4">
                  ⭐ Premium Features
                  <span className="ml-2 text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded">Premium Only</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🎨</span>
                      <div className="font-semibold">White-Label Reports</div>
                    </div>
                    <div className="text-sm text-gray-600">Custom branding, logo, and colors in PDF exports</div>
                    <div className="mt-2 text-xs text-purple-600 font-semibold">Coming Soon</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🔌</span>
                      <div className="font-semibold">API Access</div>
                    </div>
                    <div className="text-sm text-gray-600">RESTful API for automation and integrations</div>
                    <div className="mt-2 text-xs text-pink-600 font-semibold">Coming Soon</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🤖</span>
                      <div className="font-semibold">AI-Powered Insights</div>
                    </div>
                    <div className="text-sm text-gray-600">Automated anomaly detection and smart recommendations</div>
                    <div className="mt-2 text-xs text-indigo-600 font-semibold">Coming Soon</div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">👔</span>
                      <div className="font-semibold">Dedicated Account Manager</div>
                    </div>
                    <div className="text-sm text-gray-600">Personal support and strategic guidance</div>
                    <div className="mt-2 text-xs text-purple-600 font-semibold">Coming Soon</div>
                  </div>
                </div>

                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                  <div className="font-semibold text-purple-900 mb-2">🚀 What's Coming in Premium:</div>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Custom client tags and fields</li>
                    <li>• Advanced export options (Google Sheets, JSON, XML)</li>
                    <li>• Third-party integrations (QuickBooks, Xero, Salesforce)</li>
                    <li>• Executive dashboard with C-suite insights</li>
                    <li>• Priority support and feature requests</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Section Count Summary */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">📄 Report Sections Generated</h2>
            <p className="text-gray-700">
              Total sections: <strong>{analytics.sections.length}</strong>
            </p>
            <div className="mt-2 text-sm text-gray-600">
              {analytics.sections.map((section: any) => section.type).join(', ')}
            </div>
          </div>

          {/* Raw Data (collapsible) */}
          <details className="bg-gray-50 rounded-lg p-6">
            <summary className="cursor-pointer font-bold text-lg mb-2">🔍 Raw Analytics Data (Click to expand)</summary>
            <pre className="text-xs overflow-auto bg-white p-4 rounded border">
              {JSON.stringify(analytics, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
