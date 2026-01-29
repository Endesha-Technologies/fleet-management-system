'use client';

import { Download, AlertCircle } from 'lucide-react';
import type { RotationRecord } from '@/types/rotation';
import { ROTATION_PATTERNS, ROTATION_STATUSES } from '@/constants/rotation';

interface RotationHistoryTableProps {
  rotations: RotationRecord[];
  onView?: (rotationId: string) => void;
  onEdit?: (rotationId: string) => void;
  onExport?: () => void;
}

export function RotationHistoryTable({
  rotations,
  onView,
  onEdit,
  onExport,
}: RotationHistoryTableProps) {
  const getStatusBadge = (status: RotationRecord['status']) => {
    const statusConfig = ROTATION_STATUSES.find((s) => s.value === status);
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
        {statusConfig?.label}
      </span>
    );
  };

  const getPatternLabel = (pattern: string) => {
    const patternConfig = ROTATION_PATTERNS.find((p) => p.value === pattern);
    return patternConfig?.label || pattern;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTyreMovementSummary = (rotationId: string) => {
    const rotation = rotations.find((r) => r.id === rotationId);
    return rotation?.tyreMovements.length || 0;
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Rotation History</h2>
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
                  Rotation ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Pattern
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tyres Moved
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Performed By
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rotations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No rotation records found</p>
                  </td>
                </tr>
              ) : (
                rotations.map((rotation) => (
                  <tr key={rotation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {rotation.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{rotation.vehicleName}</div>
                      <div className="text-xs text-gray-500">{rotation.vehicleRegistration}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(rotation.rotationDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {getPatternLabel(rotation.rotationPattern)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {rotation.mileage.toLocaleString()} km
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                        {rotation.tyreMovements.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {rotation.performedBy}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(rotation.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {onView && (
                          <button
                            onClick={() => onView(rotation.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View
                          </button>
                        )}
                        {onEdit && rotation.status === 'scheduled' && (
                          <button
                            onClick={() => onEdit(rotation.id)}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {rotations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Rotations</div>
              <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                {rotations.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Completed</div>
              <div className="text-lg md:text-xl font-bold text-green-600 mt-1">
                {rotations.filter((r) => r.status === 'completed').length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Scheduled</div>
              <div className="text-lg md:text-xl font-bold text-blue-600 mt-1">
                {rotations.filter((r) => r.status === 'scheduled').length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Tyres Moved</div>
              <div className="text-lg md:text-xl font-bold text-purple-600 mt-1">
                {rotations.reduce((sum, r) => sum + r.tyreMovements.length, 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
