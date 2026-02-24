import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  AlertTriangle,
  Layers,
  MapPin,
  Building2,
  Calendar,
  Package,
  WarehouseIcon,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import type { OverviewTabProps } from '../../_types';

export default function OverviewTab({ asset, disposedCount = 0 }: OverviewTabProps) {
  const totalUnits = asset.inStock + asset.assigned;
  const isLowStock = asset.inStock <= asset.reorderLevel;

  return (
    <div className="space-y-6">
      {/* ── Summary Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Units</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalUnits}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border shadow-sm overflow-hidden ${isLowStock ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Stock</p>
                <p className={`text-2xl font-bold mt-1 ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                  {asset.inStock}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isLowStock ? 'bg-red-100' : 'bg-green-100'}`}>
                <WarehouseIcon className={`h-5 w-5 ${isLowStock ? 'text-red-500' : 'text-green-600'}`} />
              </div>
            </div>
            {isLowStock && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                Below reorder level ({asset.reorderLevel})
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{asset.assigned}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disposed</p>
                <p className="text-2xl font-bold text-gray-400 mt-1">{disposedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Detail Cards ───────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Info */}
        <Card className="col-span-2 border-gray-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5 text-gray-500" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Asset Name</h4>
              <p className="mt-1 text-base font-medium text-gray-900">{asset.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Category / Type</h4>
              <div className="mt-1 flex items-center gap-2">
                 <Badge variant="outline">{asset.type}</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">SKU / Part Number</h4>
              <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 inline-block px-2 py-1 rounded">
                {asset.sku}
              </p>
            </div>
             <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-700">{asset.description || 'No description provided.'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Logic */}
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-500" />
              Inventory Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Tracking Method</h4>
              <p className="mt-1 font-medium">{asset.tracking}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Reorder Level</h4>
              <div className="mt-1 flex items-center gap-2">
                 <span className="font-bold text-gray-900">{asset.reorderLevel}</span>
                 <span className="text-xs text-gray-500">units</span>
              </div>
            </div>
            <div>
               <h4 className="text-sm font-medium text-gray-500">Stock Status</h4>
               <div className="mt-1">
                   <Badge variant={asset.inStock > asset.reorderLevel ? "outline" : "destructive"}>
                       {asset.stockStatus}
                   </Badge>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Info */}
         <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-gray-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-500" />
              Supplier Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Primary Supplier</h4>
              <p className="mt-1 font-medium text-blue-600 cursor-pointer hover:underline">
                  {asset.supplier || 'N/A'}
              </p>
            </div>
            <div>
               <h4 className="text-sm font-medium text-gray-500">Last Restocked</h4>
               <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {asset.lastRestocked ? new Date(asset.lastRestocked).toLocaleDateString() : 'Never'}
               </div>
            </div>
             <div>
              <h4 className="text-sm font-medium text-gray-500">Location</h4>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {asset.location}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
         <Card className="col-span-2 border-gray-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
              System Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-gray-600 italic">
                  Auto-created on {new Date(asset.createdAt).toLocaleDateString()}.
              </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
