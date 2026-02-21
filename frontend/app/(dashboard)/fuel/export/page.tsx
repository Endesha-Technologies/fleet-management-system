'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormCheckbox, FormSection } from '@/components/ui/form';
import { MOCK_FUEL_LOGS, getFuelSummary } from '@/constants/fuel';

export default function ExportFuelDataPage() {
  const router = useRouter();
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('30days');
  const [includeFields, setIncludeFields] = useState({
    date: true,
    vehicle: true,
    driver: true,
    station: true,
    liters: true,
    price: true,
    cost: true,
    odometer: true,
    payment: true,
    receipt: true,
    notes: true,
  });

  const summary = getFuelSummary(MOCK_FUEL_LOGS);

  const handleExport = () => {
    // In production: Generate and download actual file
    const selectedFields = Object.entries(includeFields)
      .filter(([_, selected]) => selected)
      .map(([field]) => field);
    
    console.log('Exporting data:', {
      format: exportFormat,
      dateRange,
      fields: selectedFields,
      recordCount: MOCK_FUEL_LOGS.length,
    });

    alert(`Exporting ${MOCK_FUEL_LOGS.length} records as ${exportFormat.toUpperCase()}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/fuel')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Export Fuel Data</h1>
              <p className="text-gray-600 mt-1">Download fuel logs and reports for external analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Export Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Export Format */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export Format
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {['csv', 'excel', 'pdf'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        exportFormat === format
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900 uppercase">{format}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format === 'csv' && 'Spreadsheet compatible'}
                        {format === 'excel' && 'Microsoft Excel'}
                        {format === 'pdf' && 'Printable report'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date Range
                </h2>
                <div className="space-y-3">
                  {[
                    { value: '7days', label: 'Last 7 Days' },
                    { value: '30days', label: 'Last 30 Days' },
                    { value: '90days', label: 'Last 90 Days' },
                    { value: 'year', label: 'This Year' },
                    { value: 'all', label: 'All Time' },
                  ].map((range) => (
                    <label
                      key={range.value}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="dateRange"
                        value={range.value}
                        checked={dateRange === range.value}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-gray-900">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fields to Include */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <FormSection
                  title="Fields to Include"
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(includeFields).map(([field, checked]) => (
                      <FormCheckbox
                        key={field}
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        checked={checked}
                        onCheckedChange={(val) =>
                          setIncludeFields((prev) => ({
                            ...prev,
                            [field]: val,
                          }))
                        }
                      />
                    ))}
                  </div>
                </FormSection>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Export Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Summary</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Format</p>
                    <p className="text-lg font-semibold text-gray-900 uppercase">{exportFormat}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Records</p>
                    <p className="text-lg font-semibold text-gray-900">{MOCK_FUEL_LOGS.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-lg font-semibold text-gray-900">
                      UGX {summary.totalCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Fuel</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {summary.totalLiters.toLocaleString()} L
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fields Selected</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Object.values(includeFields).filter(Boolean).length} / {Object.keys(includeFields).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button
                  onClick={() => router.push('/fuel')}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Cancel
                </Button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Export Tips</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• CSV format is best for spreadsheet apps</li>
                  <li>• Excel includes formatting and formulas</li>
                  <li>• PDF is ideal for archiving and printing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
