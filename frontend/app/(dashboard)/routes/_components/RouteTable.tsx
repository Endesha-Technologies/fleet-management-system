'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, Eye, Route as RouteIcon } from 'lucide-react';
import type { Route } from '@/types/route';
import type { RouteTableProps } from '../_types';

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

const STATUS_CLASSES: Record<string, string> = {
  Completed: 'bg-green-100 text-green-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Scheduled: 'bg-yellow-100 text-yellow-800',
};

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onViewRoute?: (route: Route) => void,
  onEditRoute?: (route: Route) => void,
  onDeleteRoute?: (route: Route) => void,
): ColumnDef<Route>[] {
  return [
    {
      id: 'name',
      header: 'Route Name',
      accessorKey: 'name',
      sortable: true,
      cell: (route) => (
        <span className="font-medium text-gray-900">{route.name}</span>
      ),
    },
    {
      id: 'origin',
      header: 'Origin',
      accessorFn: (row) => row.origin.name,
      cell: (route) => (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="h-3 w-3 text-green-500" />
          {route.origin.name}
        </div>
      ),
    },
    {
      id: 'destination',
      header: 'Destination',
      accessorFn: (row) => row.destination.name,
      cell: (route) => (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="h-3 w-3 text-red-500" />
          {route.destination.name}
        </div>
      ),
    },
    {
      id: 'distance',
      header: 'Distance',
      accessorKey: 'distance',
      searchable: false,
      cell: (route) => <span className="text-gray-600">{route.distance}</span>,
    },
    {
      id: 'duration',
      header: 'Duration',
      accessorKey: 'estimatedDuration',
      searchable: false,
      cell: (route) => (
        <span className="text-gray-600">{route.estimatedDuration}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      searchable: false,
      cell: (route) => (
        <Badge
          className={
            STATUS_CLASSES[route.status] ?? 'bg-gray-100 text-gray-800'
          }
        >
          {route.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      searchable: false,
      cell: (route) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onViewRoute?.(route);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onEditRoute?.(route);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRoute?.(route);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RouteTable({
  routes,
  onViewRoute,
  onEditRoute,
  onDeleteRoute,
}: RouteTableProps) {
  const columns = useMemo(
    () => buildColumns(onViewRoute, onEditRoute, onDeleteRoute),
    [onViewRoute, onEditRoute, onDeleteRoute],
  );

  return (
    <div className="hidden md:block">
      <DataTable
        columns={columns}
        data={routes}
        getRowId={(row) => row.id}
        searchable={false}
        emptyState={{
          icon: RouteIcon,
          title: 'No routes found',
          description: 'Get started by creating a new route.',
        }}
      />
    </div>
  );
}
