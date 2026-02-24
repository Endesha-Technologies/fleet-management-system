'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye, Download, AlertCircle, ClipboardCheck } from 'lucide-react';
import type { TyreInspection } from '../_types';
import { INSPECTION_STATUSES } from '@/constants/inspections';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InspectionTableProps {
  inspections: TyreInspection[];
  onView?: (inspectionId: string) => void;
  onExport?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFailedTyresCount(inspection: TyreInspection) {
  return inspection.tyreInspections.filter((t) => t.result === 'fail').length;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onView?: (inspectionId: string) => void,
): ColumnDef<TyreInspection>[] {
  return [
    {
      id: 'inspectionId',
      header: 'Inspection ID',
      accessorKey: 'id',
      cell: (row) => (
        <div className="text-sm font-medium text-gray-900">{row.id}</div>
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
      accessorKey: 'inspectionDate',
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-gray-900">
          {formatDate(row.inspectionDate)}
        </span>
      ),
    },
    {
      id: 'inspector',
      header: 'Inspector',
      accessorKey: 'inspectorName',
      cell: (row) => (
        <span className="text-sm text-gray-900">{row.inspectorName}</span>
      ),
    },
    {
      id: 'odometer',
      header: 'Odometer',
      accessorKey: 'currentOdometer',
      align: 'right',
      searchable: false,
      sortable: true,
      cell: (row) => (
        <span className="text-sm font-medium text-gray-900">
          {row.currentOdometer.toLocaleString()} km
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      align: 'center',
      searchable: false,
      cell: (row) => {
        const statusConfig = INSPECTION_STATUSES.find(
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
      id: 'issues',
      header: 'Issues',
      align: 'center',
      searchable: false,
      accessorFn: (row) => getFailedTyresCount(row),
      cell: (row) => {
        const failedCount = getFailedTyresCount(row);
        if (failedCount > 0) {
          return (
            <span className="inline-flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {failedCount} Failed
            </span>
          );
        }
        if (row.status === 'completed') {
          return <span className="text-sm text-green-600">All Pass</span>;
        }
        return null;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'center',
      searchable: false,
      cell: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView?.(row.id);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

function InspectionSummary({
  inspections,
}: {
  inspections: TyreInspection[];
}) {
  if (inspections.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Total Inspections
          </div>
          <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
            {inspections.length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Completed
          </div>
          <div className="text-lg md:text-xl font-bold text-green-600 mt-1">
            {inspections.filter((i) => i.status === 'completed').length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            In Progress
          </div>
          <div className="text-lg md:text-xl font-bold text-yellow-600 mt-1">
            {inspections.filter((i) => i.status === 'in-progress').length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Failed Tyres
          </div>
          <div className="text-lg md:text-xl font-bold text-red-600 mt-1">
            {inspections.reduce(
              (sum, i) => sum + getFailedTyresCount(i),
              0,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InspectionTable({
  inspections,
  onView,
  onExport,
}: InspectionTableProps) {
  const columns = useMemo(() => buildColumns(onView), [onView]);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={inspections}
        getRowId={(row) => row.id}
        searchable={false}
        toolbar={
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Inspection History
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
          icon: ClipboardCheck,
          title: 'No inspections found',
        }}
      />

      <InspectionSummary inspections={inspections} />
    </div>
  );
}
