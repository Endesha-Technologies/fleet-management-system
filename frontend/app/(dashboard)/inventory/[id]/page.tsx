'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Truck, 
  DollarSign, 
  Trash2, 
  MinusCircle,
  Package,
  History
} from 'lucide-react';
import Link from 'next/link';

// Mock Data
import { MOCK_ASSETS } from '@/constants/assets';
import { 
  MOCK_STOCK_UNITS, 
  MOCK_MOVEMENTS, 
  MOCK_ASSIGNMENTS 
} from '@/constants/asset_details';

// Components
import OverviewTab from '@/components/features/assets/tabs/OverviewTab';
import StockUnitsTab from '@/components/features/assets/tabs/StockUnitsTab';
import MovementsTab from '@/components/features/assets/tabs/MovementsTab';
import AssignmentsTab from '@/components/features/assets/tabs/AssignmentsTab';

// Drawers
import PurchaseStockDrawer from '@/components/features/assets/PurchaseStockDrawer';
import AssignAssetDrawer from '@/components/features/assets/AssignAssetDrawer';
import RemoveAssetDrawer from '@/components/features/assets/RemoveAssetDrawer';
import SellAssetDrawer from '@/components/features/assets/SellAssetDrawer';
import DisposeAssetDrawer from '@/components/features/assets/DisposeAssetDrawer';

export default function AssetDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  // Find Asset
  const asset = MOCK_ASSETS.find((a) => a.id === id);

  // Filter Details for this Asset
  const stockUnits = MOCK_STOCK_UNITS.filter((u) => u.assetId === id);
  const movements = MOCK_MOVEMENTS; // In real app, filter by assetId
  const assignments = MOCK_ASSIGNMENTS.filter((a) => a.assetId === id);

  // Drawer States
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-semibold text-gray-900">Asset Not Found</h2>
        <p className="text-gray-500 mt-2">The asset you are looking for does not exist.</p>
        <Link href="/inventory">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Link href="/inventory" className="text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
             </Link>
             <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
          </div>
          <div className="flex items-center gap-2 ml-7">
             <Badge variant="outline" className="text-xs">{asset.sku}</Badge>
             <Badge className={
                 asset.inStock > asset.reorderLevel 
                 ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" 
                 : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
             }>
                 {asset.stockStatus}
             </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
           <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => setIsPurchaseOpen(true)}
           >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Purchase Stock
           </Button>
           <Button 
                variant="outline" 
                className="text-blue-600 border-gray-200 hover:bg-blue-50"
                onClick={() => setIsAssignOpen(true)}
           >
              <Truck className="w-4 h-4 mr-2" />
              Assign to Truck
           </Button>
           <Button 
                variant="outline" 
                className="text-gray-700 hover:bg-gray-50"
                onClick={() => setIsRemoveOpen(true)}
           >
               <MinusCircle className="w-4 h-4 mr-2" />
               Remove from Truck
           </Button>
           <Button 
                variant="outline" 
                className="text-gray-700 border-gray-200 hover:bg-gray-50"
                onClick={() => setIsSellOpen(true)}
           >
               <DollarSign className="w-4 h-4 mr-2" />
               Sell
           </Button>
           <Button 
               variant="outline" 
               className="text-gray-500 border-gray-200 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
               onClick={() => setIsDisposeOpen(true)}
           >
               <Trash2 className="w-4 h-4 mr-2" />
               Dispose
           </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Units</p>
             <p className="text-2xl font-bold text-gray-900 mt-1">{asset.inStock + asset.assigned}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Stock</p>
             <p className={`text-2xl font-bold mt-1 ${asset.inStock <= asset.reorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
                 {asset.inStock}
             </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</p>
             <p className="text-2xl font-bold text-blue-600 mt-1">{asset.assigned}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disposed</p>
             <p className="text-2xl font-bold text-gray-400 mt-1">2</p> {/* Mock value */}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="units" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Stock Units</TabsTrigger>
          <TabsTrigger value="movements" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Movements</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Assignments</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
            <TabsContent value="overview">
                <OverviewTab asset={asset} />
            </TabsContent>
            
            <TabsContent value="units">
                <StockUnitsTab asset={asset} stockUnits={stockUnits} />
            </TabsContent>
            
            <TabsContent value="movements">
                <MovementsTab movements={movements} />
            </TabsContent>
            
            <TabsContent value="assignments">
                <AssignmentsTab assignments={assignments} />
            </TabsContent>
        </div>
      </Tabs>

      {/* Drawers */}
      <PurchaseStockDrawer 
        open={isPurchaseOpen} 
        onOpenChange={setIsPurchaseOpen} 
        initialAssetId={asset.id} 
      />
      
      <AssignAssetDrawer
         open={isAssignOpen}
         onOpenChange={setIsAssignOpen}
         asset={asset}
      />
      
      <RemoveAssetDrawer
         open={isRemoveOpen}
         onOpenChange={setIsRemoveOpen}
         asset={asset}
      />

      <SellAssetDrawer
        isOpen={isSellOpen}
        onClose={() => setIsSellOpen(false)}
        asset={asset}
        stockUnits={stockUnits}
      />

      <DisposeAssetDrawer
        isOpen={isDisposeOpen}
        onClose={() => setIsDisposeOpen(false)}
        asset={asset}
        stockUnits={stockUnits}
      />

    </div>
  );
}
