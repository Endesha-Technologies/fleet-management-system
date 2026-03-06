'use client';

// ---------------------------------------------------------------------------
// RouteTable — Displays a paginated, filterable list of routes from the API
// ---------------------------------------------------------------------------
// Columns are aligned with the UI `Route` type. Filters correspond to the
// server-side `RouteListParams` (status, type). On mobile viewports the
// DataTable's `mobileCard` render prop is used to display a compact card.
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Eye,
  Edit,
  Power,
  PowerOff,
  MapPin,
  Route as RouteIcon,
  Clock,
  Navigation,
  ChevronRight,
  X,
  Truck,
} from 'lucide-react';
import type { Route, RouteStatus, RouteType } from '@/types/route';

// ---------------------------------------------------------------------------
// Status & Type badge configs
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<RouteStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
  },
};

const TYPE_CONFIG: Record<RouteType, { label: string; className: string }> = {
  SHORT_HAUL: {
    label: 'Short Haul',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  LONG_HAUL: {
    label: 'Long Haul',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  REGIONAL: {
    label: 'Regional',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  INTERNATIONAL: {
    label: 'International',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
};

// ---------------------------------------------------------------------------
// Filter types & constants (aligned with RouteListParams)
// ---------------------------------------------------------------------------

export interface RouteFilterValues {
  status: string;
  type: string;
}

export const EMPTY_FILTERS: RouteFilterValues = {
  status: 'all',
  type: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'SHORT_HAUL', label: 'Short Haul' },
  { value: 'LONG_HAUL', label: 'Long Haul' },
  { value: 'REGIONAL', label: 'Regional' },
  { value: 'INTERNATIONAL', label: 'International' },
];

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

interface RouteTableProps {
  routes: Route[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: RouteFilterValues;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: RouteFilterValues) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onViewRoute?: (route: Route) => void;
  onEditRoute?: (route: Route) => void;
  onToggleStatus?: (route: Route) => void;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: RouteStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}

function TypeBadge({ type }: { type: RouteType }) {
  const config = TYPE_CONFIG[type] ?? {
    label: type,
    className: 'bg-gray-100 text-gray-800',
  };
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onViewRoute?: (route: Route) => void,
  onEditRoute?: (route: Route) => void,
  onToggleStatus?: (route: Route) => void,
): ColumnDef<Route>[] {
  return [
    {
      id: 'code',
      header: 'Code',
      accessorKey: 'code',
      sortable: true,
      cell: (route) => (
        <span className="font-mono text-sm text-gray-500">{route.code}</span>
      ),
    },
    {
      id: 'name',
      header: 'Route Name',
      accessorKey: 'name',
      sortable: true,
      cell: (route) => (
        <div>
          <span className="font-medium text-gray-900">{route.name}</span>
          <div className="mt-0.5">
            <TypeBadge type={route.type} />
          </div>
        </div>
      ),
    },
    {
      id: 'origin',
      header: 'Origin',
      accessorFn: (row) => row.origin.name,
      hideOnMobile: true,
      cell: (route) => (
        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
          <MapPin className="h-3.5 w-3.5 text-green-500 shrink-0" />
          <span className="truncate max-w-[150px]">{route.origin.name}</span>
        </div>
      ),
    },
    {
      id: 'destination',
      header: 'Destination',
      accessorFn: (row) => row.destination.name,
      hideOnMobile: true,
      cell: (route) => (
        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <span className="truncate max-w-[150px]">{route.destination.name}</span>
        </div>
      ),
    },
    {
      id: 'distance',
      header: 'Distance',
      accessorKey: 'distance',
      searchable: false,
      hideOnMobile: true,
      align: 'right',
      cell: (route) => (
        <span className="text-gray-600 text-sm">{route.distance}</span>
      ),
    },
    {
      id: 'duration',
      header: 'Duration',
      accessorKey: 'estimatedDuration',
      searchable: false,
      hideOnMobile: true,
      align: 'right',
      cell: (route) => (
        <span className="text-gray-600 text-sm">{route.estimatedDuration}</span>
      ),
    },
    {
      id: 'tripCount',
      header: 'Trips',
      accessorKey: 'tripCount',
      searchable: false,
      hideOnMobile: true,
      align: 'center',
      cell: (route) => (
        <div className="flex items-center justify-center gap-1 text-gray-600 text-sm">
          <Truck className="h-3.5 w-3.5" />
          <span>{route.tripCount}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      searchable: false,
      align: 'center',
      cell: (route) => <StatusBadge status={route.status} />,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      searchable: false,
      cell: (route) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onViewRoute?.(route);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onEditRoute?.(route);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${route.status === 'ACTIVE' 
              ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50' 
              : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus?.(route);
            }}
            title={route.status === 'ACTIVE' ? 'Deactivate route' : 'Reactivate route'}
          >
            {route.status === 'ACTIVE' ? (
              <><PowerOff className="h-4 w-4 mr-1" />Deactivate</>
            ) : (
              <><Power className="h-4 w-4 mr-1" />Activate</>
            )}
          </Button>
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Filter toolbar
// ---------------------------------------------------------------------------

function RouteFiltersToolbar({
  filters,
  onFiltersChange,
}: {
  filters: RouteFilterValues;
  onFiltersChange: (filters: RouteFilterValues) => void;
}) {
  const hasActiveFilters = filters.status !== 'all' || filters.type !== 'all';

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
          value={filters.type}
          onChange={(e) =>
            onFiltersChange({ ...filters, type: e.target.value })
          }
          options={TYPE_OPTIONS}
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

function RouteMobileCard({
  route,
  onViewRoute,
}: {
  route: Route;
  onViewRoute?: (route: Route) => void;
}) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50 transition-colors"
      onClick={() => onViewRoute?.(route)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewRoute?.(route);
        }
      }}
    >
      {/* Header: Code, Name, Type + Status */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-gray-500">{route.code}</span>
            <TypeBadge type={route.type} />
          </div>
          <span className="text-base font-bold text-gray-900">{route.name}</span>
        </div>
        <StatusBadge status={route.status} />
      </div>

      {/* Body: Origin & Destination */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Origin</p>
            <p className="font-medium text-gray-800 truncate">{route.origin.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Destination</p>
            <p className="font-medium text-gray-800 truncate">{route.destination.name}</p>
          </div>
        </div>
      </div>

      {/* Footer: Distance, Duration, Trips + chevron */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Navigation className="h-3.5 w-3.5 text-gray-400" />
            <span>{route.distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>{route.estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-gray-400" />
            <span>{route.tripCount} trips</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RouteTable({
  routes,
  isLoading = false,
  pagination,
  filters,
  searchQuery,
  onSearchChange,
  onFiltersChange,
  onPageChange,
  onPageSizeChange,
  onViewRoute,
  onEditRoute,
  onToggleStatus,
}: RouteTableProps) {
  const columns = useMemo(
    () => buildColumns(onViewRoute, onEditRoute, onToggleStatus),
    [onViewRoute, onEditRoute, onToggleStatus],
  );

  return (
    <DataTable
      columns={columns}
      data={routes}
      getRowId={(row) => row.id}
      // Search — controlled from the parent page (debounced → API)
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by route name, origin, destination…"
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
        <RouteFiltersToolbar
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      }
      // Mobile card view (replaces table rows on <md)
      mobileCard={(route) => (
        <RouteMobileCard route={route} onViewRoute={onViewRoute} />
      )}
      emptyState={{
        icon: RouteIcon,
        title: 'No routes found',
        description:
          'No routes match your current filters. Try adjusting your search or filter criteria.',
      }}
      onRowClick={onViewRoute}
    />
  );
}
