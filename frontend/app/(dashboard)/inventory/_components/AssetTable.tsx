'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Asset, AssetCondition } from '@/types/asset';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function AssetTable({ assets }: AssetTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

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

  const getStockStatusBadge = (status: string) => {
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Available</Badge>;
      case 'Assigned':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Assigned</Badge>;
      case 'In Use':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">In Use</Badge>;
      case 'Reserved':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Reserved</Badge>;
      case 'Discontinued':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionColor = (condition: AssetCondition) => {
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
  };

  const formatConditionMix = (conditionMix: Asset['conditionMix']) => {
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
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by asset name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              onChange={(e) => setTypeFilter(e.target.value)}
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
              onChange={(e) => setStockStatusFilter(e.target.value)}
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
              onChange={(e) => setConditionFilter(e.target.value)}
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
                onClick={clearFilters}
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
          Showing <span className="font-medium">{filteredAssets.length}</span> of{' '}
          <span className="font-medium">{assets.length}</span> assets
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-gray-200">
              <TableHead className="w-[200px]">Asset Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead className="text-center">In Stock</TableHead>
              <TableHead className="text-center">Assigned</TableHead>
              <TableHead>Condition Mix</TableHead>
              <TableHead className="text-center">Reorder Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search className="h-8 w-8 mb-2 text-gray-400" />
                    <p>No assets found</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-gray-50 border-gray-200">
                  <TableCell>
                    <Link
                      href={`/inventory/${asset.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {asset.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{asset.sku}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700">{asset.type}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{asset.tracking}</span>
                  </TableCell>
                  <TableCell className="text-center">
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
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700">{asset.assigned}</span>
                  </TableCell>
                  <TableCell>{formatConditionMix(asset.conditionMix)}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-600">{asset.reorderLevel}</span>
                  </TableCell>
                  <TableCell>{getStockStatusBadge(asset.stockStatus)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handlePurchaseClick(asset)}>
                          <ShoppingCart className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Purchase Stock</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleAssignClick(asset)}>
                          <Truck className="mr-2 h-4 w-4 text-purple-600" />
                          <span>Assign to Truck</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleRemoveClick(asset)}>
                          <MinusCircle className="mr-2 h-4 w-4 text-orange-600" />
                          <span>Record Removal</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleSellClick(asset)}>
                          <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                          <span>Sell Asset</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleDisposeClick(asset)}>
                          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                          <span>Dispose Asset</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(asset)}>
                          <Edit className="mr-2 h-4 w-4 text-gray-600" />
                          <span>Edit Asset</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
