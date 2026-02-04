'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  ShoppingCart,
  DollarSign,
  Trash2,
  Download,
} from 'lucide-react';
import AssetTable from '@/components/features/assets/AssetTable';
import LowStockBanner from '@/components/features/assets/LowStockBanner';
import AddAssetDrawer from '@/components/features/assets/AddAssetDrawer';
import PurchaseStockDrawer from '@/components/features/assets/PurchaseStockDrawer';
import SellAssetDrawer from '@/components/features/assets/SellAssetDrawer';
import DisposeAssetDrawer from '@/components/features/assets/DisposeAssetDrawer';
import { MOCK_ASSETS, MOCK_LOW_STOCK_ALERTS } from '@/constants/assets';
import { MOCK_STOCK_UNITS } from '@/constants/asset_details';

export default function AssetInventoryPage() {
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isPurchaseStockOpen, setIsPurchaseStockOpen] = useState(false);
  const [isSellAssetOpen, setIsSellAssetOpen] = useState(false);
  const [isDisposeAssetOpen, setIsDisposeAssetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className=" px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Asset Inventory
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track all your fleet assets, spare parts, and equipment
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsAddAssetOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
            <Button 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setIsPurchaseStockOpen(true)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Purchase Stock</span>
              <span className="sm:hidden">Purchase</span>
            </Button>
            <Button 
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => setIsSellAssetOpen(true)}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Sell
            </Button>
            <Button 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => setIsDisposeAssetOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Dispose
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        {/* Low Stock Alert Banner */}
        <LowStockBanner alerts={MOCK_LOW_STOCK_ALERTS} />

        {/* Asset Table */}
        <AssetTable assets={MOCK_ASSETS} />

      {/* Purchase Stock Drawer */}
      <PurchaseStockDrawer open={isPurchaseStockOpen} onOpenChange={setIsPurchaseStockOpen} />

      {/* Global Sell Asset Drawer */}
      <SellAssetDrawer 
        isOpen={isSellAssetOpen} 
        onClose={() => setIsSellAssetOpen(false)}
        allAssets={MOCK_ASSETS}
        allStockUnits={MOCK_STOCK_UNITS}
      />

      {/* Global Dispose Asset Drawer */}
      <DisposeAssetDrawer 
        isOpen={isDisposeAssetOpen} 
        onClose={() => setIsDisposeAssetOpen(false)}
        allAssets={MOCK_ASSETS}
        allStockUnits={MOCK_STOCK_UNITS}
      />
      
      </div>

      {/* Add Asset Drawer */}
      <AddAssetDrawer open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen} />
    </div>
  );
}
