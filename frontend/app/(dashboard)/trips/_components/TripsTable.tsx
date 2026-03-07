'use client';

// ---------------------------------------------------------------------------
// TripsTable — Displays a paginated, filterable list of trips
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Eye,
  PlayCircle,
  StopCircle,
  Route,
  MapPin,
  Truck,
  User,
  Clock,
  Calendar,
  ChevronRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type { Trip, TripStatus } from '@/types/trip';

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<TripStatus, { label: string; className: string }> = {
  'In Progress': {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  Scheduled: {
    label: 'Scheduled',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

// ---------------------------------------------------------------------------
// Filter types & constants
// ---------------------------------------------------------------------------

export interface TripFilterValues {
  status: string;
}

export const EMPTY_FILTERS: TripFilterValues = {
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

interface TripsTableProps {
  trips: Trip[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: TripFilterValues;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: TripFilterValues) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onViewTrip?: (trip: Trip) => void;
  onStartTrip?: (trip: Trip) => void;
  onEndTrip?: (trip: Trip) => void;
  onAssignRoute?: (trip: Trip) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: TripStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onViewTrip?: (trip: Trip) => void,
  onStartTrip?: (trip: Trip) => void,
  onEndTrip?: (trip: Trip) => void,
  onAssignRoute?: (trip: Trip) => void,
): ColumnDef<Trip>[] {
  return [
    {
      id: 'id',
      header: 'Trip ID',
      accessorKey: 'id',
      cell: (trip) => (
        <span className="font-mono text-sm text-gray-600">#{trip.id}</span>
      ),
    },
    {
      id: 'route',
      header: 'Route',
      accessorKey: 'routeName',
      cell: (trip) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-gray-900 truncate">{trip.routeName}</p>
          <p className="text-xs text-gray-500 truncate">
            {trip.startLocation} → {trip.endLocation}
          </p>
        </div>
      ),
    },
    {
      id: 'vehicle',
      header: 'Vehicle',
      accessorKey: 'vehiclePlate',
      cell: (trip) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">{trip.vehiclePlate}</span>
        </div>
      ),
    },
    {
      id: 'driver',
      header: 'Driver',
      accessorKey: 'driverName',
      cell: (trip) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900">{trip.driverName}</span>
        </div>
      ),
    },
    {
      id: 'schedule',
      header: 'Schedule',
      accessorKey: 'scheduledStartTime',
      cell: (trip) => (
        <div className="min-w-[140px]">
          <p className="text-sm text-gray-900">{formatDateTime(trip.scheduledStartTime)}</p>
          <p className="text-xs text-gray-500">{trip.estimatedDuration}</p>
        </div>
      ),
    },
    {
      id: 'distance',
      header: 'Distance',
      accessorKey: 'distance',
      cell: (trip) => (
        <span className="text-gray-600">{trip.distance}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (trip) => <StatusBadge status={trip.status} />,
    },
    {
      id: 'actions',
      header: '',
      cell: (trip) => {
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              asChild
            >
              <Link href={`/trips/${trip.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
            
            {trip.status === 'Scheduled' && (
              <>
                {!trip.tripRoute && onAssignRoute && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignRoute(trip);
                    }}
                  >
                    <Route className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartTrip?.(trip);
                  }}
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Start
                </Button>
              </>
            )}

            {trip.status === 'In Progress' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onEndTrip?.(trip);
                }}
              >
                <StopCircle className="h-4 w-4 mr-1" />
                End
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Filter toolbar
// ---------------------------------------------------------------------------

function TripFiltersToolbar({
  filters,
  onFiltersChange,
}: {
  filters: TripFilterValues;
  onFiltersChange: (filters: TripFilterValues) => void;
}) {
  const hasActiveFilters = filters.status !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <div className="w-full sm:w-44">
        <Select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value })
          }
          options={STATUS_OPTIONS}
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

function TripMobileCard({
  trip,
  onViewTrip,
}: {
  trip: Trip;
  onViewTrip?: (trip: Trip) => void;
}) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewTrip?.(trip)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-500">#{trip.id}</span>
            <StatusBadge status={trip.status} />
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{trip.routeName}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{trip.startLocation} → {trip.endLocation}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">{trip.vehiclePlate}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 truncate">{trip.driverName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 text-xs">{formatDate(trip.scheduledStartTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{trip.estimatedDuration}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
        <span className="text-sm text-gray-600">{trip.distance}</span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TripsTable({
  trips,
  isLoading = false,
  pagination,
  filters,
  searchQuery,
  onSearchChange,
  onFiltersChange,
  onPageChange,
  onPageSizeChange,
  onViewTrip,
  onStartTrip,
  onEndTrip,
  onAssignRoute,
}: TripsTableProps) {
  const columns = useMemo(
    () => buildColumns(onViewTrip, onStartTrip, onEndTrip, onAssignRoute),
    [onViewTrip, onStartTrip, onEndTrip, onAssignRoute],
  );

  return (
    <DataTable
      columns={columns}
      data={trips}
      getRowId={(row) => row.id}
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by route, vehicle, driver…"
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
      toolbar={
        <TripFiltersToolbar
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      }
      mobileCard={(trip) => (
        <TripMobileCard trip={trip} onViewTrip={onViewTrip} />
      )}
      emptyState={{
        icon: Route,
        title: 'No trips found',
        description:
          'No trips match your current filters. Try adjusting your search or filter criteria.',
      }}
      onRowClick={onViewTrip}
    />
  );
}
