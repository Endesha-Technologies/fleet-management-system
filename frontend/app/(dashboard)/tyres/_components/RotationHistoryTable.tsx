'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import type { RotationRecord } from '../_types';
import { ROTATION_PATTERNS, ROTATION_STATUSES } from '@/constants/rotation';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RotationHistoryTableProps {
  rotations: RotationRecord[];
  onView?: (rotationId: string) => void;
  onEdit?: (rotationId: string) => void;
  onExport?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getPatternLabel(pattern: string) {
  const patternConfig = ROTATION_PATTERNS.find((p) => p.value === pattern);
  return patternConfig?.label || pattern;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onView?: (rotationId: string) => void,
  onEdit?: (rotationId: string) => void,
): ColumnDef<RotationRecord>[] {
  return [
    {
      id: 'rotationId',
      header: 'Rotation ID',
      accessorKey: 'id',
      cell: (row) => (
        <div className="text-sm font-medium text-gray-900 font-mono">
          {row.id.substring(0, 8)}...
        </div>
      ),
    },
    {
      id: 'vehicle',
      header: 'Vehicle',
      accessorKey: 'vehicleName',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.vehicleName}</div>
          <div className="text-xs text-gray-500">{row.vehicleRegistration}</div>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'rotationDate',
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-gray-900">
          {formatDate(row.rotationDate)}
        </span>
      ),
    },
    {
      id: 'pattern',
      header: 'Pattern',
      accessorKey: 'rotationPattern',
      searchable: false,
      cell: (row) => (
        <span className="text-sm text-gray-900">
          {getPatternLabel(row.rotationPattern)}
        </span>
      ),
    },
    {
      id: 'mileage',
      header: 'Mileage',
      accessorKey: 'mileage',
      align: 'right',
      searchable: false,
      sortable: true,
      cell: (row) => (
        <span className="text-sm font-medium text-gray-900">
          {row.mileage.toLocaleString()} km
        </span>
      ),
    },
    {
      id: 'tyresMoved',
      header: 'Tyres Moved',
      align: 'center',
      searchable: false,
      accessorFn: (row) => row.tyreMovements.length,
      cell: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          {row.tyreMovements.length}
        </span>
      ),
    },
    {
      id: 'performedBy',
      header: 'Performed By',
      accessorKey: 'performedBy',
      cell: (row) => (
        <span className="text-sm text-gray-900">{row.performedBy}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      align: 'center',
      searchable: false,
      cell: (row) => {
        const statusConfig = ROTATION_STATUSES.find(
          (s) => s.value === row.status,
        );
        return (
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}
          >
            {statusConfig?.label}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'center',
      searchable: false,
      cell: (row) => (
        <div className="flex gap-2 justify-center">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(row.id);
              }}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              View
            </button>
          )}
          {onEdit && row.status === 'scheduled' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.id);
              }}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

function RotationSummary({ rotations }: { rotations: RotationRecord[] }) {
  if (rotations.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Total Rotations
          </div>
          <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
            {rotations.length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Completed
          </div>
          <div className="text-lg md:text-xl font-bold text-green-600 mt-1">
            {rotations.filter((r) => r.status === 'completed').length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Scheduled
          </div>
          <div className="text-lg md:text-xl font-bold text-blue-600 mt-1">
            {rotations.filter((r) => r.status === 'scheduled').length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Total Tyres Moved
          </div>
          <div className="text-lg md:text-xl font-bold text-purple-600 mt-1">
            {rotations.reduce((sum, r) => sum + r.tyreMovements.length, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RotationHistoryTable({
  rotations,
  onView,
  onEdit,
  onExport,
}: RotationHistoryTableProps) {
  const columns = useMemo(
    () => buildColumns(onView, onEdit),
    [onView, onEdit],
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={rotations}
        getRowId={(row) => row.id}
        searchable={false}
        toolbar={
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Rotation History
            </h2>
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="ml-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        }
        emptyState={{
          icon: RefreshCw,
          title: 'No rotation records found',
        }}
      />

      <RotationSummary rotations={rotations} />
    </div>
  );
}
