import { Asset } from '@/types/asset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, AlertTriangle, Layers, MapPin, Building2, Calendar } from 'lucide-react';
import type { OverviewTabProps } from '../../_types';

export default function OverviewTab({ asset }: OverviewTabProps) {
  return (
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
  );
}
