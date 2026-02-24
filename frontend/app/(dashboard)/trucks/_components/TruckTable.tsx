'use client';

// ---------------------------------------------------------------------------
// TruckTable — Displays a paginated, filterable list of trucks from the API
// ---------------------------------------------------------------------------
// Columns are aligned with the API `Truck` type. Filters correspond to the
// server-side `TruckListParams` (status, bodyType, ownershipType). On mobile
// viewports the DataTable's `mobileCard` render prop is used to display a
// compact card instead of table rows.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Eye,
  Pencil,
  Truck as TruckIcon,
  Gauge,
  ChevronRight,
  X,
} from 'lucide-react';
import type {
  Truck,
  TruckStatus,
  BodyType,
} from '@/api/trucks/trucks.types';

// ---------------------------------------------------------------------------
// Display-label maps (enum → human-readable)
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  TruckStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: 'Active',
    className:
      'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  },
  INACTIVE: {
    label: 'Inactive',
    className:
      'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
  },
  IN_MAINTENANCE: {
    label: 'In Maintenance',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  },
  DECOMMISSIONED: {
    label: 'Decommissioned',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  },
};

const BODY_TYPE_LABELS: Record<BodyType, string> = {
  RIGID: 'Rigid',
  TRACTOR: 'Tractor',
  TRAILER: 'Trailer',
  TANKER: 'Tanker',
  FLATBED: 'Flatbed',
  TIPPER: 'Tipper',
  REFRIGERATED: 'Refrigerated',
  CURTAIN_SIDE: 'Curtain Side',
  BOX_BODY: 'Box Body',
  LOW_LOADER: 'Low Loader',
};

const FUEL_TYPE_LABELS: Record<string, string> = {
  DIESEL: 'Diesel',
  PETROL: 'Petrol',
  CNG: 'CNG',
  LNG: 'LNG',
};

function formatOdometer(km: number): string {
  return km.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// Filter types & constants (aligned with TruckListParams)
// ---------------------------------------------------------------------------

export interface TruckFilterValues {
  status: string;
  bodyType: string;
  ownershipType: string;
}

export const EMPTY_FILTERS: TruckFilterValues = {
  status: 'all',
  bodyType: 'all',
  ownershipType: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
  { value: 'DECOMMISSIONED', label: 'Decommissioned' },
];

const BODY_TYPE_OPTIONS = [
  { value: 'all', label: 'All Body Types' },
  { value: 'RIGID', label: 'Rigid' },
  { value: 'TRACTOR', label: 'Tractor' },
  { value: 'TRAILER', label: 'Trailer' },
  { value: 'TANKER', label: 'Tanker' },
  { value: 'FLATBED', label: 'Flatbed' },
  { value: 'TIPPER', label: 'Tipper' },
  { value: 'REFRIGERATED', label: 'Refrigerated' },
  { value: 'CURTAIN_SIDE', label: 'Curtain Side' },
  { value: 'BOX_BODY', label: 'Box Body' },
  { value: 'LOW_LOADER', label: 'Low Loader' },
];

const OWNERSHIP_OPTIONS = [
  { value: 'all', label: 'All Ownership' },
  { value: 'OWNED', label: 'Owned' },
  { value: 'LEASED', label: 'Leased' },
  { value: 'RENTED', label: 'Rented' },
];

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

interface TruckTableProps {
  trucks: Truck[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  /** Current filter dropdown values. */
  filters: TruckFilterValues;
  /** Current search text (controlled from the page). */
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: TruckFilterValues) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onView?: (truck: Truck) => void;
  onEdit?: (truck: Truck) => void;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: TruckStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: '',
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onView?: (truck: Truck) => void,
  onEdit?: (truck: Truck) => void,
): ColumnDef<Truck>[] {
  return [
    {
      id: 'registrationNumber',
      header: 'Registration',
      accessorKey: 'registrationNumber',
      sortable: true,
      cell: (truck) => (
        <div className="flex flex-col">
          <Link
            href={`/trucks/${truck.id}`}
            className="text-blue-600 hover:underline hover:text-blue-800 font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {truck.registrationNumber}
          </Link>
          {truck.fleetNumber && (
            <span className="text-xs text-gray-500">
              {truck.fleetNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'makeModel',
      header: 'Make / Model',
      accessorFn: (row) => `${row.make} ${row.model}`,
      sortable: true,
      cell: (truck) => (
        <div>
          <span className="text-gray-700 font-medium">{truck.make}</span>
          <span className="text-gray-500 ml-1">{truck.model}</span>
          <div className="text-xs text-gray-400">{truck.year}</div>
        </div>
      ),
    },
    {
      id: 'bodyType',
      header: 'Body Type',
      accessorKey: 'bodyType',
      hideOnMobile: true,
      cell: (truck) => (
        <Badge variant="outline" className="text-gray-600 font-normal">
          {BODY_TYPE_LABELS[truck.bodyType] ?? truck.bodyType}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      align: 'center',
      searchable: false,
      cell: (truck) => <StatusBadge status={truck.status} />,
    },
    {
      id: 'odometer',
      header: 'Odometer',
      accessorKey: 'currentOdometer',
      align: 'right',
      searchable: false,
      sortable: true,
      hideOnMobile: true,
      cell: (truck) => (
        <span className="font-mono text-sm text-gray-600">
          {formatOdometer(truck.currentOdometer)} km
        </span>
      ),
    },
    {
      id: 'fuelType',
      header: 'Fuel',
      accessorKey: 'fuelType',
      hideOnMobile: true,
      searchable: false,
      cell: (truck) => (
        <span className="text-sm text-gray-600">
          {FUEL_TYPE_LABELS[truck.fuelType] ?? truck.fuelType}
        </span>
      ),
    },
    {
      id: 'axles',
      header: 'Axles',
      accessorFn: (row) => row.truckAxles?.length ?? 0,
      align: 'center',
      searchable: false,
      hideOnMobile: true,
      cell: (truck) => {
        const count = truck.truckAxles?.length ?? 0;
        const totalPositions =
          truck.truckAxles?.reduce(
            (sum, a) => sum + a.positionsPerSide * 2,
            0,
          ) ?? 0;
        return (
          <span
            className="text-sm text-gray-600"
            title={`${totalPositions} tyre positions`}
          >
            {count}{' '}
            <span className="text-gray-400 text-xs">
              ({totalPositions}T)
            </span>
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      searchable: false,
      cell: (truck) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(truck);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(truck);
            }}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Filter toolbar
// ---------------------------------------------------------------------------

function TruckFiltersToolbar({
  filters,
  onFiltersChange,
}: {
  filters: TruckFilterValues;
  onFiltersChange: (filters: TruckFilterValues) => void;
}) {
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.bodyType !== 'all' ||
    filters.ownershipType !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <div className="w-full sm:w-40">
        <Select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value })
          }
          options={STATUS_OPTIONS}
          className="bg-white border-gray-200"
        />
      </div>

      <div className="w-full sm:w-40">
        <Select
          value={filters.bodyType}
          onChange={(e) =>
            onFiltersChange({ ...filters, bodyType: e.target.value })
          }
          options={BODY_TYPE_OPTIONS}
          className="bg-white border-gray-200"
        />
      </div>

      <div className="w-full sm:w-40">
        <Select
          value={filters.ownershipType}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              ownershipType: e.target.value,
            })
          }
          options={OWNERSHIP_OPTIONS}
          className="bg-white border-gray-200"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange(EMPTY_FILTERS)}
          className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile card
// ---------------------------------------------------------------------------

function TruckMobileCard({
  truck,
  onView,
}: {
  truck: Truck;
  onView?: (truck: Truck) => void;
}) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50 transition-colors"
      onClick={() => onView?.(truck)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView?.(truck);
        }
      }}
    >
      {/* Header: Registration + Status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            href={`/trucks/${truck.id}`}
            className="text-base font-bold text-blue-700 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {truck.registrationNumber}
          </Link>
          {truck.fleetNumber && (
            <p className="text-xs text-gray-500 mt-0.5">
              {truck.fleetNumber}
            </p>
          )}
        </div>
        <StatusBadge status={truck.status} />
      </div>

      {/* Body: Make, Model, Type */}
      <div className="space-y-1.5 mb-3">
        <p className="text-sm text-gray-800">
          <span className="font-medium">{truck.make}</span>{' '}
          <span className="text-gray-600">{truck.model}</span>
          <span className="text-gray-400 ml-1">• {truck.year}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs text-gray-600 font-normal"
          >
            {BODY_TYPE_LABELS[truck.bodyType] ?? truck.bodyType}
          </Badge>
          <span className="text-xs text-gray-500">
            {FUEL_TYPE_LABELS[truck.fuelType] ?? truck.fuelType}
          </span>
          {truck.ownershipType && (
            <span className="text-xs text-gray-400">
              • {truck.ownershipType.charAt(0) +
                truck.ownershipType.slice(1).toLowerCase()}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Odometer + chevron */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Gauge className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-mono">
            {formatOdometer(truck.currentOdometer)} km
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TruckTable({
  trucks,
  isLoading = false,
  pagination,
  filters,
  searchQuery,
  onSearchChange,
  onFiltersChange,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
}: TruckTableProps) {
  const columns = useMemo(
    () => buildColumns(onView, onEdit),
    [onView, onEdit],
  );

  return (
    <DataTable
      columns={columns}
      data={trucks}
      getRowId={(row) => row.id}
      // Search — controlled from the parent page (debounced → API)
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by registration, make, model…"
      // Server-side pagination
      pagination={
        pagination
          ? {
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
            }
          : undefined
      }
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isLoading={isLoading}
      // Filters
      toolbar={
        <TruckFiltersToolbar
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      }
      // Mobile card view (replaces table rows on <md)
      mobileCard={(truck) => (
        <TruckMobileCard truck={truck} onView={onView} />
      )}
      emptyState={{
        icon: TruckIcon,
        title: 'No trucks found',
        description:
          'No trucks match your current filters. Try adjusting your search or filter criteria.',
      }}
      onRowClick={onView}
    />
  );
}
