'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select } from '@/components/ui/select';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Truck as TruckIcon,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import type { Truck } from '@/types/truck';
import type { TruckTableProps } from '../_types';

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

function getStatusBadge(status: string) {
  switch (status) {
    case 'Active':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
          Active
        </Badge>
      );
    case 'Maintenance':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">
          Maintenance
        </Badge>
      );
    case 'Inactive':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
          Inactive
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
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
      id: 'plateNumber',
      header: 'Plate Number',
      accessorKey: 'plateNumber',
      sortable: true,
      cell: (truck) => (
        <div className="flex flex-col">
          <Link
            href={`/trucks/${truck.id}`}
            className="text-blue-600 hover:underline hover:text-blue-800 font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {truck.plateNumber}
          </Link>
          <span className="text-xs text-gray-500">{truck.axleConfig}</span>
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
      id: 'driver',
      header: 'Driver',
      accessorFn: (row) => row.driver?.name ?? '',
      cell: (truck) =>
        truck.driver ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
              {truck.driver.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-700">{truck.driver.name}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm italic">Unassigned</span>
        ),
    },
    {
      id: 'odometer',
      header: 'Odometer',
      accessorKey: 'currentOdometer',
      align: 'center',
      searchable: false,
      sortable: true,
      cell: (truck) => (
        <span className="font-mono text-sm text-gray-600">
          {truck.currentOdometer.toLocaleString()} km
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      align: 'center',
      searchable: false,
      cell: (truck) => getStatusBadge(truck.status),
    },
    {
      id: 'alerts',
      header: 'Alerts',
      accessorKey: 'alerts',
      align: 'center',
      searchable: false,
      cell: (truck) =>
        truck.alerts > 0 ? (
          <Badge
            variant="outline"
            className="text-red-600 bg-red-50 border-red-200 gap-1 pl-1.5"
          >
            <AlertCircle className="w-3 h-3" />
            {truck.alerts}
          </Badge>
        ) : (
          <span className="text-gray-300">-</span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      searchable: false,
      cell: (truck) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onView?.(truck)}
            >
              <Eye className="mr-2 h-4 w-4 text-blue-600" />
              <span>View Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit?.(truck)}
            >
              <Edit className="mr-2 h-4 w-4 text-gray-600" />
              <span>Edit Truck</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4 text-orange-600" />
              <span>Rotate Tyres</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Filter toolbar
// ---------------------------------------------------------------------------

function TruckFiltersToolbar({
  trucks,
  statusFilter,
  setStatusFilter,
  makeFilter,
  setMakeFilter,
  hasActiveFilters,
  clearFilters,
}: {
  trucks: Truck[];
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  makeFilter: string;
  setMakeFilter: (v: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) {
  const uniqueMakes = useMemo(() => {
    const makes = new Set(trucks.map((t) => t.make));
    return Array.from(makes).sort();
  }, [trucks]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      <div className="w-full sm:w-48">
        <Select
          value={makeFilter}
          onChange={(e) => setMakeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Makes' },
            ...uniqueMakes.map((make) => ({ value: make, label: make })),
          ]}
          className="bg-white border-gray-200"
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Maintenance', label: 'Maintenance' },
            { value: 'Inactive', label: 'Inactive' },
          ]}
          className="bg-white border-gray-200"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TruckTable({ trucks, onView, onEdit }: TruckTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [makeFilter, setMakeFilter] = useState('all');

  const columns = useMemo(() => buildColumns(onView, onEdit), [onView, onEdit]);

  // Pre-filter by status and make — DataTable handles search
  const filteredTrucks = useMemo(() => {
    let list = trucks;
    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (makeFilter !== 'all') {
      list = list.filter((t) => t.make === makeFilter);
    }
    return list;
  }, [trucks, statusFilter, makeFilter]);

  const hasActiveFilters =
    statusFilter !== 'all' || makeFilter !== 'all' || searchQuery !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMakeFilter('all');
  };

  return (
    <DataTable
      columns={columns}
      data={filteredTrucks}
      getRowId={(row) => row.id}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search trucks, drivers, plates..."
      toolbar={
        <TruckFiltersToolbar
          trucks={trucks}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          makeFilter={makeFilter}
          setMakeFilter={setMakeFilter}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />
      }
      emptyState={{
        icon: TruckIcon,
        title: 'No trucks found',
        description: 'No trucks found matching your filters.',
      }}
    />
  );
}
