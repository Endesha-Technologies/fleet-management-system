'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { InventoryItem } from '@/types/inventory';
import type { InventoryTableProps } from '../_types';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Package, Filter, X, Search, Eye, ArrowRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusColor(status: string) {
  switch (status) {
    case 'In Storage':
      return 'bg-blue-100 text-blue-800';
    case 'Sold':
      return 'bg-green-100 text-green-800';
    case 'Disposed':
      return 'bg-red-100 text-red-800';
    case 'Used in Maintenance':
      return 'bg-purple-100 text-purple-800';
    case 'Installed in Truck':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getConditionColor(condition: string) {
  switch (condition) {
    case 'New':
      return 'text-green-600';
    case 'Good':
      return 'text-blue-600';
    case 'Fair':
      return 'text-yellow-600';
    case 'Poor':
      return 'text-orange-600';
    case 'Damaged':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function formatCurrency(amount: number) {
  return `UGX ${amount.toLocaleString()}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Filter toolbar (rendered outside DataTable)
// ---------------------------------------------------------------------------

interface InventoryFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  conditionFilter: string;
  onConditionFilterChange: (value: string) => void;
  statuses: string[];
  categories: string[];
  conditions: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

function InventoryFiltersToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  conditionFilter,
  onConditionFilterChange,
  statuses,
  categories,
  conditions,
  hasActiveFilters,
  onClearFilters,
  totalCount,
  filteredCount,
}: InventoryFiltersToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by part name, number, or vehicle..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center"
        >
          <Filter className="w-4 h-4" />
          Filters {hasActiveFilters && '(Active)'}
        </button>

        {/* Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:flex md:flex-wrap md:items-center gap-3`}>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => onConditionFilterChange(e.target.value)}
            className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Conditions</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
          Showing {filteredCount} of {totalCount} items
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile card
// ---------------------------------------------------------------------------

function InventoryMobileCard({ item }: { item: InventoryItem }) {
  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.partName}</h3>
          <p className="text-xs text-gray-500">{item.partNumber}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500 text-xs">Category</span>
          <p className="font-medium">{item.category}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Condition</span>
          <p className={`font-medium ${getConditionColor(item.condition)}`}>{item.condition}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Quantity</span>
          <p className="font-medium">{item.quantity}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Value</span>
          <p className="font-medium">{formatCurrency(item.totalValue)}</p>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-600">
          From: <span className="font-medium text-gray-900">{item.removedFromVehicle}</span>
        </p>
        <p className="text-xs text-gray-500">
          {formatDate(item.removalDate)} • {item.storageLocation}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/inventory/${item.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Link>
        {item.status === 'In Storage' && (
          <Link
            href={`/inventory/${item.id}/move`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Move Part
          </Link>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

function InventorySummaryStats({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total Items</div>
          <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total Value</div>
          <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
            {formatCurrency(items.reduce((sum, item) => sum + item.totalValue, 0))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">In Storage</div>
          <div className="text-lg md:text-xl font-bold text-blue-600 mt-1">
            {items.filter((item) => item.status === 'In Storage').length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Categories</div>
          <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
            {Array.from(new Set(items.map((item) => item.category))).length}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: ColumnDef<InventoryItem>[] = [
  {
    id: 'partDetails',
    header: 'Part Details',
    accessorKey: 'partName',
    cell: (row) => (
      <Link href={`/inventory/${row.id}`} className="hover:text-blue-600">
        <div className="font-medium text-gray-900">{row.partName}</div>
        <div className="text-xs text-gray-500">{row.partNumber}</div>
      </Link>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    accessorKey: 'category',
    hideOnMobile: true,
    cell: (row) => <span className="text-sm text-gray-900">{row.category}</span>,
  },
  {
    id: 'condition',
    header: 'Condition',
    accessorKey: 'condition',
    align: 'center',
    hideOnMobile: true,
    cell: (row) => (
      <span className={`text-sm font-medium ${getConditionColor(row.condition)}`}>
        {row.condition}
      </span>
    ),
  },
  {
    id: 'quantity',
    header: 'Qty',
    accessorKey: 'quantity',
    align: 'center',
    sortable: true,
    hideOnMobile: true,
    cell: (row) => <span className="text-sm font-medium text-gray-900">{row.quantity}</span>,
  },
  {
    id: 'totalValue',
    header: 'Value',
    accessorKey: 'totalValue',
    align: 'right',
    sortable: true,
    hideOnMobile: true,
    cell: (row) => <span className="text-sm font-medium text-gray-900">{formatCurrency(row.totalValue)}</span>,
  },
  {
    id: 'fromVehicle',
    header: 'From Vehicle',
    accessorKey: 'removedFromVehicle',
    hideOnMobile: true,
    cell: (row) => (
      <div>
        <div className="text-sm text-gray-900">{row.removedFromVehicle}</div>
        <div className="text-xs text-gray-500">{formatDate(row.removalDate)}</div>
      </div>
    ),
  },
  {
    id: 'storage',
    header: 'Storage',
    accessorKey: 'storageLocation',
    hideOnMobile: true,
    cell: (row) => <span className="text-sm text-gray-900">{row.storageLocation}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    align: 'center',
    hideOnMobile: true,
    cell: (row) => (
      <span className={`inline-flex text-xs px-2 py-1 rounded-full ${getStatusColor(row.status)}`}>
        {row.status}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    align: 'center',
    hideOnMobile: true,
    cell: (row) => (
      <div className="flex items-center justify-center gap-2">
        <Link
          href={`/inventory/${row.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Link>
        {row.status === 'In Storage' && (
          <Link
            href={`/inventory/${row.id}/move`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Move
          </Link>
        )}
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function InventoryTable({ items }: InventoryTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Derive unique filter values
  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category))).sort();
  }, [items]);

  const conditions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.condition))).sort();
  }, [items]);

  const statuses = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.status))).sort();
  }, [items]);

  // Pre-filter data
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;
      const matchesSearch =
        searchQuery === '' ||
        item.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.removedFromVehicle.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCategory && matchesCondition && matchesSearch;
    });
  }, [items, statusFilter, categoryFilter, conditionFilter, searchQuery]);

  const hasActiveFilters =
    statusFilter !== 'all' || categoryFilter !== 'all' || conditionFilter !== 'all' || searchQuery !== '';

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setConditionFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* External filters */}
      <InventoryFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        conditionFilter={conditionFilter}
        onConditionFilterChange={setConditionFilter}
        statuses={statuses}
        categories={categories}
        conditions={conditions}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        totalCount={items.length}
        filteredCount={filteredItems.length}
      />

      {/* DataTable with pre-filtered data */}
      <DataTable<InventoryItem>
        columns={columns}
        data={filteredItems}
        getRowId={(row) => row.id}
        searchable={false}
        emptyState={{
          icon: Package,
          title: 'No inventory items found',
          description: hasActiveFilters
            ? 'Try adjusting your filters or search query.'
            : 'No inventory items have been added yet.',
          action: hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : undefined,
        }}
        mobileCard={(item) => <InventoryMobileCard item={item} />}
      />

      {/* Summary stats */}
      <InventorySummaryStats items={filteredItems} />
    </div>
  );
}
