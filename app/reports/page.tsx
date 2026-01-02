"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTier } from '@/contexts/TierContext';

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'weekly' | 'monthly';
  reportType: 'all-trips' | 'agency-comparison' | 'revenue-summary';
  recipients: string[];
  nextRun: string;
  enabled: boolean;
}

const REPORT_STORAGE_KEY = 'voyagriq-scheduled-reports';

export default function ScheduledReports() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdvancedExportsModal, setShowAdvancedExportsModal] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    frequency: 'weekly' as 'weekly' | 'monthly',
    reportType: 'all-trips' as 'all-trips' | 'agency-comparison' | 'revenue-summary',
    recipients: '',
  });
  const { currentTier } = useTier();
  const hasAccess = currentTier === 'standard' || currentTier === 'premium';
  const isPremium = currentTier === 'premium';

  useEffect(() => {
    if (hasAccess) {
      const stored = localStorage.getItem(REPORT_STORAGE_KEY);
      if (stored) {
        setReports(JSON.parse(stored));
      }
    }
  }, [hasAccess]);

  const saveReports = (updatedReports: ScheduledReport[]) => {
    setReports(updatedReports);
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(updatedReports));
  };

  const handleAddReport = () => {
    if (!newReport.name || !newReport.recipients) {
      alert('Please fill in all fields');
      return;
    }

    const emailList = newReport.recipients.split(',').map(e => e.trim()).filter(e => e);

    const nextRun = new Date();
    if (newReport.frequency === 'weekly') {
      nextRun.setDate(nextRun.getDate() + 7);
    } else {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    const report: ScheduledReport = {
      id: Date.now().toString(),
      name: newReport.name,
      frequency: newReport.frequency,
      reportType: newReport.reportType,
      recipients: emailList,
      nextRun: nextRun.toISOString(),
      enabled: true,
    };

    saveReports([...reports, report]);
    setShowAddModal(false);
    setNewReport({
      name: '',
      frequency: 'weekly',
      reportType: 'all-trips',
      recipients: '',
    });
  };

  const toggleReportStatus = (id: string) => {
    const updated = reports.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    saveReports(updated);
  };

  const deleteReport = (id: string) => {
    if (confirm('Are you sure you want to delete this scheduled report?')) {
      saveReports(reports.filter(r => r.id !== id));
    }
  };

  const runReportNow = (report: ScheduledReport) => {
    // Simulate sending the report immediately
    const reportDetails = `
Report Name: ${report.name}
Report Type: ${getReportTypeLabel(report.reportType)}
Frequency: ${report.frequency}
Recipients: ${report.recipients.join(', ')}

This report would normally be sent via email. In this demo, the report has been "sent" to the recipients above.
    `.trim();

    alert(`✅ Report Sent Successfully!\n\n${reportDetails}\n\nIn production, this would:\n• Generate the ${getReportTypeLabel(report.reportType)} PDF\n• Email it to all recipients\n• Log the delivery status`);

    // Update the next run date
    const nextRun = new Date();
    if (report.frequency === 'weekly') {
      nextRun.setDate(nextRun.getDate() + 7);
    } else {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    const updated = reports.map(r =>
      r.id === report.id ? { ...r, nextRun: nextRun.toISOString() } : r
    );
    saveReports(updated);
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'all-trips': return 'All Trips Summary';
      case 'agency-comparison': return 'Agency Performance Comparison';
      case 'revenue-summary': return 'Revenue Summary';
      default: return type;
    }
  };

  // If no access, show upgrade screen
  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">📅</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scheduled Reports
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Automatically send reports to your team on a weekly or monthly basis.
            Available on Standard and Premium plans.
          </p>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Unlock This Feature:</h3>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Weekly or monthly delivery</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Multiple report types</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Send to multiple recipients</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">PDF format reports</span>
              </li>
            </ul>
            <Link href="/pricing">
              <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors">
                Upgrade to Standard
              </button>
            </Link>
          </div>
          <Link href="/trips" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to All Trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Scheduled Reports
              </h1>
              {isPremium ? (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-pink-100 text-amber-800 text-xs font-bold rounded-full">
                  ⭐ PREMIUM
                </span>
              ) : (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  STANDARD
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-600">
              Automatically send reports to your team
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Schedule New Report
          </button>
        </div>
      </div>

      {/* Premium Features Banner */}
      {isPremium && (
        <div className="bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⭐</span>
                <h3 className="text-xl font-bold text-gray-900">Premium Reports Enabled</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Your scheduled reports can include white-label branding, custom formats, and advanced analytics.
              </p>
              <div className="flex gap-3">
                <Link href="/settings/white-label">
                  <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                    🎨 Configure White-Label
                  </button>
                </Link>
                <button
                  onClick={() => setShowAdvancedExportsModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  📤 Advanced Exports
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Scheduled Reports Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first scheduled report to automatically send updates to your team
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Schedule Your First Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{report.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {report.enabled ? 'Active' : 'Paused'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {report.frequency === 'weekly' ? 'Weekly' : 'Monthly'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {getReportTypeLabel(report.reportType)}
                  </p>
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Recipients:</span> {report.recipients.join(', ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Next Run:</span> {new Date(report.nextRun).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runReportNow(report)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    title="Send this report immediately (demo mode)"
                  >
                    ▶️ Run Now
                  </button>
                  <button
                    onClick={() => toggleReportStatus(report.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      report.enabled
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {report.enabled ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule New Report</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  placeholder="e.g., Weekly Agency Performance"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={newReport.reportType}
                  onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all-trips">All Trips Summary</option>
                  <option value="agency-comparison">Agency Performance Comparison</option>
                  <option value="revenue-summary">Revenue Summary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={newReport.frequency}
                  onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients (comma-separated emails)
                </label>
                <textarea
                  value={newReport.recipients}
                  onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                  placeholder="email1@example.com, email2@example.com"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddReport}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Schedule Report
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewReport({
                    name: '',
                    frequency: 'weekly',
                    reportType: 'all-trips',
                    recipients: '',
                  });
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> This is a demo feature. In production, reports would be automatically generated and emailed to recipients. Currently, report schedules are saved locally.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Exports Modal */}
      {showAdvancedExportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📤</span>
              <h2 className="text-2xl font-bold text-gray-900">Advanced Export Formats</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Premium users get access to advanced export formats for maximum integration flexibility with your existing systems.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-bold text-gray-900">Google Sheets</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Direct export to Google Sheets with automatic formatting and formulas
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔗</span>
                  <h3 className="font-bold text-gray-900">JSON API</h3>
                </div>
                <p className="text-sm text-gray-600">
                  RESTful API access for custom integrations (available now via <Link href="/api-docs" className="text-blue-600 hover:underline">API</Link>)
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📄</span>
                  <h3 className="font-bold text-gray-900">XML Export</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Standard XML format for legacy system compatibility
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💾</span>
                  <h3 className="font-bold text-gray-900">CSV Bulk Export</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Export all data with custom field selection and filtering
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>💡 Pro Tip:</strong> The JSON API is fully functional now! Generate an API key from{' '}
                <Link href="/settings/api-keys" className="text-blue-600 hover:underline font-semibold">API Keys</Link>
                {' '}and check out the{' '}
                <Link href="/api-docs" className="text-blue-600 hover:underline font-semibold">API Documentation</Link>
                {' '}to start integrating programmatically.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Google Sheets, XML, and advanced CSV export features are planned for future releases. For now, you can use the REST API to build custom export solutions, or use the standard PDF and Excel exports available throughout the app.
              </p>
            </div>

            <button
              onClick={() => setShowAdvancedExportsModal(false)}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
