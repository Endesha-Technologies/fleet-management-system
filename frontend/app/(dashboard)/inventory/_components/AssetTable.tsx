'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Asset, AssetCondition } from '@/types/asset';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  MoreHorizontal,
  ShoppingCart,
  Truck,
  MinusCircle,
  DollarSign,
  Trash2,
  Edit,
  X,
  Package,
} from 'lucide-react';
import {
  ASSET_TYPE_OPTIONS,
  STOCK_STATUS_OPTIONS,
  CONDITION_OPTIONS,
} from '@/constants/assets';
import SellAssetDrawer from './SellAssetDrawer';
import DisposeAssetDrawer from './DisposeAssetDrawer';
import PurchaseStockDrawer from './PurchaseStockDrawer';
import AssignAssetDrawer from './AssignAssetDrawer';
import RemoveAssetDrawer from './RemoveAssetDrawer';
import AddAssetDrawer from './AddAssetDrawer';
import { MOCK_STOCK_UNITS } from '@/constants/asset_details';
import type { AssetTableProps } from '../_types';

// ---------------------------------------------------------------------------
// Helper renderers
// ---------------------------------------------------------------------------

function getStockStatusBadge(status: string) {
  switch (status) {
    case 'In Stock':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">In Stock</Badge>;
    case 'Low Stock':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Low Stock</Badge>;
    case 'Out of Stock':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Out of Stock</Badge>;
    case 'Overstocked':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Overstocked</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getConditionColor(condition: AssetCondition) {
  switch (condition) {
    case 'New':
      return 'text-green-600';
    case 'Good':
      return 'text-blue-600';
    case 'Fair':
      return 'text-amber-600';
    case 'Poor':
      return 'text-orange-600';
    case 'Damaged':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function formatConditionMix(conditionMix: Asset['conditionMix']) {
  if (!conditionMix || conditionMix.length === 0) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {conditionMix.map((cm, index) => (
        <span
          key={index}
          className={`text-xs font-medium ${getConditionColor(cm.condition)}`}
        >
          {cm.condition}: {cm.count}
          {index < conditionMix.length - 1 && <span className="text-gray-400 ml-1">,</span>}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter toolbar (rendered outside DataTable)
// ---------------------------------------------------------------------------

interface AssetFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  stockStatusFilter: string;
  onStockStatusFilterChange: (value: string) => void;
  conditionFilter: string;
  onConditionFilterChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

function AssetFiltersToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  stockStatusFilter,
  onStockStatusFilterChange,
  conditionFilter,
  onConditionFilterChange,
  hasActiveFilters,
  onClearFilters,
  totalCount,
  filteredCount,
}: AssetFiltersToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by asset name or SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div
            className={`${showFilters ? 'block' : 'hidden'} w-full md:w-auto md:flex md:flex-wrap md:items-center gap-3`}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">Filters:</span>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {ASSET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockStatusFilter}
              onChange={(e) => onStockStatusFilterChange(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {STOCK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={conditionFilter}
              onChange={(e) => onConditionFilterChange(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredCount}</span> of{' '}
          <span className="font-medium">{totalCount}</span> assets
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile card
// ---------------------------------------------------------------------------

interface AssetMobileCardProps {
  asset: Asset;
  onPurchase: (asset: Asset) => void;
  onAssign: (asset: Asset) => void;
  onRemove: (asset: Asset) => void;
  onSell: (asset: Asset) => void;
  onDispose: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
}

function AssetMobileCard({
  asset,
  onPurchase,
  onAssign,
  onRemove,
  onSell,
  onDispose,
  onEdit,
}: AssetMobileCardProps) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/inventory/${asset.id}`}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {asset.name}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">{asset.sku}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer" onClick={() => onPurchase(asset)}>
              <ShoppingCart className="mr-2 h-4 w-4 text-blue-600" />
              <span>Purchase Stock</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onAssign(asset)}>
              <Truck className="mr-2 h-4 w-4 text-purple-600" />
              <span>Assign to Truck</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onRemove(asset)}>
              <MinusCircle className="mr-2 h-4 w-4 text-orange-600" />
              <span>Record Removal</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => onSell(asset)}>
              <DollarSign className="mr-2 h-4 w-4 text-green-600" />
              <span>Sell Asset</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onDispose(asset)}>
              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
              <span>Dispose Asset</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(asset)}>
              <Edit className="mr-2 h-4 w-4 text-gray-600" />
              <span>Edit Asset</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Type:</span>{' '}
          <span className="text-gray-700">{asset.type}</span>
        </div>
        <div>
          <span className="text-gray-500">Tracking:</span>{' '}
          <span className="text-gray-600">{asset.tracking}</span>
        </div>
        <div>
          <span className="text-gray-500">In Stock:</span>{' '}
          <span
            className={`font-medium ${
              asset.inStock === 0
                ? 'text-red-600'
                : asset.inStock <= asset.reorderLevel
                ? 'text-amber-600'
                : 'text-gray-900'
            }`}
          >
            {asset.inStock}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Assigned:</span>{' '}
          <span className="text-gray-700">{asset.assigned}</span>
        </div>
        <div>
          <span className="text-gray-500">Reorder Level:</span>{' '}
          <span className="text-gray-600">{asset.reorderLevel}</span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>{' '}
          {getStockStatusBadge(asset.stockStatus)}
        </div>
      </div>

      {asset.conditionMix && asset.conditionMix.length > 0 && (
        <div className="text-sm">
          <span className="text-gray-500">Condition:</span>{' '}
          {formatConditionMix(asset.conditionMix)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function buildColumns(handlers: {
  onPurchase: (asset: Asset) => void;
  onAssign: (asset: Asset) => void;
  onRemove: (asset: Asset) => void;
  onSell: (asset: Asset) => void;
  onDispose: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
}): ColumnDef<Asset>[] {
  return [
    {
      id: 'name',
      header: 'Asset Name',
      accessorKey: 'name',
      minWidth: '200px',
      cell: (row) => (
        <div>
          <Link
            href={`/inventory/${row.id}`}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.name}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">{row.sku}</p>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      hideOnMobile: true,
      cell: (row) => <span className="text-sm text-gray-700">{row.type}</span>,
    },
    {
      id: 'tracking',
      header: 'Tracking',
      accessorKey: 'tracking',
      hideOnMobile: true,
      cell: (row) => <span className="text-sm text-gray-600">{row.tracking}</span>,
    },
    {
      id: 'inStock',
      header: 'In Stock',
      accessorKey: 'inStock',
      align: 'center' as const,
      sortable: true,
      hideOnMobile: true,
      cell: (row) => (
        <span
          className={`font-medium ${
            row.inStock === 0
              ? 'text-red-600'
              : row.inStock <= row.reorderLevel
              ? 'text-amber-600'
              : 'text-gray-900'
          }`}
        >
          {row.inStock}
        </span>
      ),
    },
    {
      id: 'assigned',
      header: 'Assigned',
      accessorKey: 'assigned',
      align: 'center' as const,
      sortable: true,
      hideOnMobile: true,
      cell: (row) => <span className="text-gray-700">{row.assigned}</span>,
    },
    {
      id: 'conditionMix',
      header: 'Condition Mix',
      accessorFn: (row) => row.conditionMix,
      hideOnMobile: true,
      cell: (row) => formatConditionMix(row.conditionMix),
    },
    {
      id: 'reorderLevel',
      header: 'Reorder Level',
      accessorKey: 'reorderLevel',
      align: 'center' as const,
      sortable: true,
      hideOnMobile: true,
      cell: (row) => <span className="text-gray-600">{row.reorderLevel}</span>,
    },
    {
      id: 'stockStatus',
      header: 'Status',
      accessorKey: 'stockStatus',
      hideOnMobile: true,
      cell: (row) => getStockStatusBadge(row.stockStatus),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right' as const,
      maxWidth: '80px',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer" onClick={() => handlers.onPurchase(row)}>
              <ShoppingCart className="mr-2 h-4 w-4 text-blue-600" />
              <span>Purchase Stock</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handlers.onAssign(row)}>
              <Truck className="mr-2 h-4 w-4 text-purple-600" />
              <span>Assign to Truck</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handlers.onRemove(row)}>
              <MinusCircle className="mr-2 h-4 w-4 text-orange-600" />
              <span>Record Removal</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => handlers.onSell(row)}>
              <DollarSign className="mr-2 h-4 w-4 text-green-600" />
              <span>Sell Asset</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handlers.onDispose(row)}>
              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
              <span>Dispose Asset</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => handlers.onEdit(row)}>
              <Edit className="mr-2 h-4 w-4 text-gray-600" />
              <span>Edit Asset</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AssetTable({ assets }: AssetTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  // Sell Drawer State
  const [isSellDrawerOpen, setIsSellDrawerOpen] = useState(false);
  const [selectedAssetForSale, setSelectedAssetForSale] = useState<Asset | null>(null);

  // Dispose Drawer State
  const [isDisposeDrawerOpen, setIsDisposeDrawerOpen] = useState(false);
  const [selectedAssetForDisposal, setSelectedAssetForDisposal] = useState<Asset | null>(null);

  // Purchase Drawer State
  const [isPurchaseDrawerOpen, setIsPurchaseDrawerOpen] = useState(false);
  const [selectedAssetForPurchase, setSelectedAssetForPurchase] = useState<Asset | null>(null);

  // Assign Drawer State
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<Asset | null>(null);

  // Remove Drawer State
  const [isRemoveDrawerOpen, setIsRemoveDrawerOpen] = useState(false);
  const [selectedAssetForRemove, setSelectedAssetForRemove] = useState<Asset | null>(null);

  // Edit Drawer State
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<Asset | null>(null);

  // Handlers
  const handleSellClick = (asset: Asset) => {
    setSelectedAssetForSale(asset);
    setIsSellDrawerOpen(true);
  };

  const handleDisposeClick = (asset: Asset) => {
    setSelectedAssetForDisposal(asset);
    setIsDisposeDrawerOpen(true);
  };

  const handlePurchaseClick = (asset: Asset) => {
    setSelectedAssetForPurchase(asset);
    setIsPurchaseDrawerOpen(true);
  };

  const handleAssignClick = (asset: Asset) => {
    setSelectedAssetForAssign(asset);
    setIsAssignDrawerOpen(true);
  };

  const handleRemoveClick = (asset: Asset) => {
    setSelectedAssetForRemove(asset);
    setIsRemoveDrawerOpen(true);
  };

  const handleEditClick = (asset: Asset) => {
    setSelectedAssetForEdit(asset);
    setIsEditDrawerOpen(true);
  };

  // Pre-filter data (search + dropdown filters handled externally)
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        searchQuery === '' ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || asset.type === typeFilter;

      const matchesStockStatus =
        stockStatusFilter === 'all' || asset.stockStatus === stockStatusFilter;

      const matchesCondition =
        conditionFilter === 'all' ||
        asset.conditionMix.some((cm) => cm.condition === conditionFilter);

      return matchesSearch && matchesType && matchesStockStatus && matchesCondition;
    });
  }, [assets, searchQuery, typeFilter, stockStatusFilter, conditionFilter]);

  const hasActiveFilters =
    typeFilter !== 'all' ||
    stockStatusFilter !== 'all' ||
    conditionFilter !== 'all' ||
    searchQuery !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStockStatusFilter('all');
    setConditionFilter('all');
  };

  // Memoize columns with handlers
  const columns = useMemo(
    () =>
      buildColumns({
        onPurchase: handlePurchaseClick,
        onAssign: handleAssignClick,
        onRemove: handleRemoveClick,
        onSell: handleSellClick,
        onDispose: handleDisposeClick,
        onEdit: handleEditClick,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-4">
      {/* External filters */}
      <AssetFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        stockStatusFilter={stockStatusFilter}
        onStockStatusFilterChange={setStockStatusFilter}
        conditionFilter={conditionFilter}
        onConditionFilterChange={setConditionFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        totalCount={assets.length}
        filteredCount={filteredAssets.length}
      />

      {/* DataTable with pre-filtered data */}
      <DataTable<Asset>
        columns={columns}
        data={filteredAssets}
        getRowId={(row) => row.id}
        searchable={false}
        emptyState={{
          icon: Package,
          title: 'No assets found',
          description: hasActiveFilters
            ? 'Try adjusting your filters or search query.'
            : 'No assets have been added yet.',
          action: hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : undefined,
        }}
        mobileCard={(asset) => (
          <AssetMobileCard
            asset={asset}
            onPurchase={handlePurchaseClick}
            onAssign={handleAssignClick}
            onRemove={handleRemoveClick}
            onSell={handleSellClick}
            onDispose={handleDisposeClick}
            onEdit={handleEditClick}
          />
        )}
      />

      {/* Drawers */}
      {selectedAssetForSale && (
        <SellAssetDrawer
          isOpen={isSellDrawerOpen}
          onClose={() => setIsSellDrawerOpen(false)}
          asset={selectedAssetForSale}
          stockUnits={MOCK_STOCK_UNITS.filter(u => u.assetId === selectedAssetForSale.id)}
        />
      )}

      {selectedAssetForDisposal && (
        <DisposeAssetDrawer
          isOpen={isDisposeDrawerOpen}
          onClose={() => setIsDisposeDrawerOpen(false)}
          asset={selectedAssetForDisposal}
          stockUnits={MOCK_STOCK_UNITS.filter(u => u.assetId === selectedAssetForDisposal.id)}
        />
      )}

      {selectedAssetForPurchase && (
        <PurchaseStockDrawer
          open={isPurchaseDrawerOpen}
          onOpenChange={setIsPurchaseDrawerOpen}
          initialAssetId={selectedAssetForPurchase.id}
        />
      )}

      {selectedAssetForAssign && (
        <AssignAssetDrawer
          open={isAssignDrawerOpen}
          onOpenChange={setIsAssignDrawerOpen}
          asset={selectedAssetForAssign}
        />
      )}

      {selectedAssetForRemove && (
        <RemoveAssetDrawer
          open={isRemoveDrawerOpen}
          onOpenChange={setIsRemoveDrawerOpen}
          asset={selectedAssetForRemove}
        />
      )}

      {selectedAssetForEdit && (
        <AddAssetDrawer
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
          asset={selectedAssetForEdit}
        />
      )}
    </div>
  );
}
