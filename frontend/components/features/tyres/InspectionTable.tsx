'use client';

import type { TyreInspection } from '@/types/inspection';
import { INSPECTION_STATUSES } from '@/constants/inspections';
import { Eye, Download, AlertCircle } from 'lucide-react';

interface InspectionTableProps {
  inspections: TyreInspection[];
  onView?: (inspectionId: string) => void;
  onExport?: () => void;
}

export function InspectionTable({ inspections, onView, onExport }: InspectionTableProps) {
  const getStatusBadge = (status: TyreInspection['status']) => {
    const statusConfig = INSPECTION_STATUSES.find((s) => s.value === status);
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
        {statusConfig?.label}
      </span>
    );
  };

  const getFailedTyresCount = (inspection: TyreInspection) => {
    return inspection.tyreInspections.filter((t) => t.result === 'fail').length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Inspection History</h2>
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Inspection ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Odometer
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Issues
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inspections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No inspections found</p>
                  </td>
                </tr>
              ) : (
                inspections.map((inspection) => {
                  const failedCount = getFailedTyresCount(inspection);
                  return (
                    <tr key={inspection.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{inspection.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{inspection.vehicleName}</div>
                        <div className="text-xs text-gray-500">{inspection.vehicleRegistration}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(inspection.inspectionDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {inspection.inspectorName}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {inspection.currentOdometer.toLocaleString()} km
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(inspection.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {failedCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {failedCount} Failed
                          </span>
                        )}
                        {failedCount === 0 && inspection.status === 'completed' && (
                          <span className="text-sm text-green-600">All Pass</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onView?.(inspection.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {inspections.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Inspections</div>
              <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                {inspections.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Completed</div>
              <div className="text-lg md:text-xl font-bold text-green-600 mt-1">
                {inspections.filter(i => i.status === 'completed').length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Pending</div>
              <div className="text-lg md:text-xl font-bold text-yellow-600 mt-1">
                {inspections.filter(i => i.status === 'pending').length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Failed Tyres</div>
              <div className="text-lg md:text-xl font-bold text-red-600 mt-1">
                {inspections.reduce((sum, i) => sum + getFailedTyresCount(i), 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
