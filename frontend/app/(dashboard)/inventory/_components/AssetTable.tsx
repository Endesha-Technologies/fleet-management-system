'use client';

// ---------------------------------------------------------------------------
// AssetTable — Server-integrated, paginated asset list
// ---------------------------------------------------------------------------
// Uses API `AssetListItem` type. All filters, search, and pagination are
// controlled from the parent page (server-side). Follows the exact same
// pattern as TruckTable.
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
  Package,
  ChevronRight,
  X,
} from 'lucide-react';
import type {
  AssetListItem,
  AssetType,
  AssetStatus,
  AssetCategory,
} from '@/api/assets/assets.types';

// ---------------------------------------------------------------------------
// Display-label maps (enum → human-readable)
// ---------------------------------------------------------------------------

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  TYRE: 'Tyre',
  SPARE_PART: 'Spare Part',
  CONSUMABLE: 'Consumable',
  TOOL_EQUIPMENT: 'Tool / Equipment',
};

const STATUS_CONFIG: Record<AssetStatus, { label: string; className: string }> = {
  IN_INVENTORY: {
    label: 'In Inventory',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  },
  AVAILABLE: {
    label: 'Available',
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  },
  INSTALLED: {
    label: 'Installed',
    className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  },
  IN_USE: {
    label: 'In Use',
    className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  },
  DISPOSED: {
    label: 'Disposed',
    className: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
  },
  SOLD: {
    label: 'Sold',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  TYRES: 'Tyres',
  ENGINE: 'Engine',
  FLUIDS: 'Fluids',
  BRAKES: 'Brakes',
  ELECTRICAL: 'Electrical',
  BODY: 'Body',
  TRANSMISSION: 'Transmission',
  SUSPENSION: 'Suspension',
};

// ---------------------------------------------------------------------------
// Filter types & constants (aligned with AssetListParams)
// ---------------------------------------------------------------------------

export interface AssetFilterValues {
  assetType: string;
  status: string;
  category: string;
}

export const EMPTY_FILTERS: AssetFilterValues = {
  assetType: 'all',
  status: 'all',
  category: 'all',
};

const ASSET_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'TYRE', label: 'Tyre' },
  { value: 'SPARE_PART', label: 'Spare Part' },
  { value: 'CONSUMABLE', label: 'Consumable' },
  { value: 'TOOL_EQUIPMENT', label: 'Tool / Equipment' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'IN_INVENTORY', label: 'In Inventory' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'INSTALLED', label: 'Installed' },
  { value: 'IN_USE', label: 'In Use' },
  { value: 'DISPOSED', label: 'Disposed' },
  { value: 'SOLD', label: 'Sold' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'TYRES', label: 'Tyres' },
  { value: 'ENGINE', label: 'Engine' },
  { value: 'FLUIDS', label: 'Fluids' },
  { value: 'BRAKES', label: 'Brakes' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'BODY', label: 'Body' },
  { value: 'TRANSMISSION', label: 'Transmission' },
  { value: 'SUSPENSION', label: 'Suspension' },
];

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface AssetTableProps {
  assets: AssetListItem[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  /** Current filter dropdown values (controlled from the page). */
  filters: AssetFilterValues;
  /** Current search text (controlled from the page). */
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: AssetFilterValues) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onView?: (asset: AssetListItem) => void;
  onEdit?: (asset: AssetListItem) => void;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: AssetStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' };
  return <Badge className={config.className}>{config.label}</Badge>;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  onView?: (asset: AssetListItem) => void,
  onEdit?: (asset: AssetListItem) => void,
): ColumnDef<AssetListItem>[] {
  return [
    {
      id: 'name',
      header: 'Asset Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <Link
            href={`/inventory/${row.id}`}
            className="text-blue-600 hover:underline hover:text-blue-800 font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {row.name}
          </Link>
          {(row.serialNumber || row.partNumber) && (
            <span className="text-xs text-gray-500">
              {row.serialNumber ?? row.partNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'assetType',
      header: 'Type',
      accessorKey: 'assetType',
      hideOnMobile: true,
      cell: (row) => (
        <Badge variant="outline" className="text-gray-600 font-normal">
          {ASSET_TYPE_LABELS[row.assetType] ?? row.assetType}
        </Badge>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {CATEGORY_LABELS[row.category] ?? row.category}
        </span>
      ),
    },
    {
      id: 'quantity',
      header: 'Qty',
      accessorKey: 'quantity',
      align: 'center',
      sortable: true,
      cell: (row) => (
        <span
          className={`font-medium ${
            row.quantity === 0
              ? 'text-red-600'
              : row.quantity <= row.minimumStock
              ? 'text-amber-600'
              : 'text-gray-900'
          }`}
        >
          {row.quantity}
        </span>
      ),
    },
    {
      id: 'minimumStock',
      header: 'Min Stock',
      accessorKey: 'minimumStock',
      align: 'center',
      sortable: true,
      hideOnMobile: true,
      cell: (row) => <span className="text-gray-600">{row.minimumStock}</span>,
    },
    {
      id: 'storageLocation',
      header: 'Location',
      accessorKey: 'storageLocation',
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {row.storageLocation ?? '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      searchable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(row);
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
              onEdit?.(row);
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
// Filter toolbar (rendered inside DataTable's toolbar slot)
// ---------------------------------------------------------------------------

function AssetFiltersToolbar({
  filters,
  onFiltersChange,
}: {
  filters: AssetFilterValues;
  onFiltersChange: (filters: AssetFilterValues) => void;
}) {
  const hasActiveFilters =
    filters.assetType !== 'all' ||
    filters.status !== 'all' ||
    filters.category !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <div className="w-full sm:w-40">
        <Select
          value={filters.assetType}
          onChange={(e) =>
            onFiltersChange({ ...filters, assetType: e.target.value })
          }
          options={ASSET_TYPE_OPTIONS}
          className="bg-white border-gray-200"
        />
      </div>

      <div className="w-full sm:w-40">
        <Select
          value={filters.category}
          onChange={(e) =>
            onFiltersChange({ ...filters, category: e.target.value })
          }
          options={CATEGORY_OPTIONS}
          className="bg-white border-gray-200"
        />
      </div>

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

function AssetMobileCard({
  asset,
  onView,
}: {
  asset: AssetListItem;
  onView?: (asset: AssetListItem) => void;
}) {
  const statusConfig = STATUS_CONFIG[asset.status] ?? {
    label: asset.status,
    className: '',
  };

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50 transition-colors"
      onClick={() => onView?.(asset)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView?.(asset);
        }
      }}
    >
      {/* Header: Name + Status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            href={`/inventory/${asset.id}`}
            className="text-base font-bold text-blue-700 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {asset.name}
          </Link>
          {(asset.serialNumber || asset.partNumber) && (
            <p className="text-xs text-gray-500 mt-0.5">
              {asset.serialNumber ?? asset.partNumber}
            </p>
          )}
        </div>
        <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
      </div>

      {/* Body: Type, Category, Stock */}
      <div className="space-y-1.5 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs text-gray-600 font-normal">
            {ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType}
          </Badge>
          <span className="text-xs text-gray-500">
            {CATEGORY_LABELS[asset.category] ?? asset.category}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            Qty:{' '}
            <span
              className={`font-medium ${
                asset.quantity === 0
                  ? 'text-red-600'
                  : asset.quantity <= asset.minimumStock
                  ? 'text-amber-600'
                  : 'text-gray-900'
              }`}
            >
              {asset.quantity}
            </span>
          </span>
          <span className="text-gray-500">
            Min: <span className="text-gray-700">{asset.minimumStock}</span>
          </span>
        </div>
      </div>

      {/* Footer: Location + chevron */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
        <span className="text-sm text-gray-600 truncate mr-2">
          {asset.storageLocation ?? 'No location'}
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AssetTable({
  assets,
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
}: AssetTableProps) {
  const columns = useMemo(
    () => buildColumns(onView, onEdit),
    [onView, onEdit],
  );

  return (
    <DataTable<AssetListItem>
      columns={columns}
      data={assets}
      getRowId={(row) => row.id}
      // Search — controlled from the parent page (debounced → API)
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by asset name, serial number…"
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
        <AssetFiltersToolbar
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      }
      // Mobile card view (replaces table rows on <md)
      mobileCard={(asset) => (
        <AssetMobileCard asset={asset} onView={onView} />
      )}
      emptyState={{
        icon: Package,
        title: 'No assets found',
        description:
          'No assets match your current filters. Try adjusting your search or filter criteria.',
      }}
      onRowClick={onView}
      minRows={5}
    />
  );
}
