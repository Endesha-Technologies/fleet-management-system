import { Asset, StockUnit } from '@/types/asset';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface StockUnitsTabProps {
  asset: Asset;
  stockUnits: StockUnit[];
}

export default function StockUnitsTab({ asset, stockUnits }: StockUnitsTabProps) {
  const isSerialTracked = asset.tracking === 'Serial Number';

  if (!isSerialTracked) {
    return (
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Bulk Stock Information</CardTitle>
          <CardDescription>This item is tracked by quantity, not individual serial numbers.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wider">Current Stock</h3>
                    <p className="mt-2 text-4xl font-bold text-blue-900">{asset.inStock}</p>
                    <p className="mt-1 text-sm text-blue-600">units available</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                     <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Assigned / In Use</h3>
                     <p className="mt-2 text-4xl font-bold text-gray-900">{asset.assigned}</p>
                     <p className="mt-1 text-sm text-gray-500">units</p>
                </div>
                 <div className="bg-green-50 p-6 rounded-lg text-center">
                     <h3 className="text-sm font-medium text-green-800 uppercase tracking-wider">Total Inventory</h3>
                     <p className="mt-2 text-4xl font-bold text-green-900">{asset.inStock + asset.assigned}</p>
                     <p className="mt-1 text-sm text-green-600">units</p>
                </div>
           </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>Individual Units</CardTitle>
        <CardDescription>Managing {stockUnits.length} serial-tracked units.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border border-gray-200 rounded-md bg-white">
            <Table>
            <TableHeader>
                <TableRow className="border-gray-200">
                <TableHead>Serial No</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Purchased</TableHead>
                <TableHead className="text-right">Usage (Km)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stockUnits.map((unit) => (
                <TableRow key={unit.id} className="border-gray-200">
                    <TableCell className="font-medium font-mono">{unit.serialNumber}</TableCell>
                     <TableCell>
                        <Badge variant="outline" className={
                             unit.condition === 'New' ? 'bg-green-50 text-green-700 border-green-200' : 
                             unit.condition === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                             'bg-gray-50 text-gray-700'
                        }>
                            {unit.condition}
                        </Badge>
                    </TableCell>
                    <TableCell>
                         <Badge variant={unit.status === 'In Stock' ? 'default' : 'secondary'}>
                            {unit.status}
                         </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{unit.location}</TableCell>
                    <TableCell className="text-sm text-gray-600">{new Date(unit.purchaseDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                        {unit.kmUsed?.toLocaleString() ?? 0} km
                    </TableCell>
                </TableRow>
                ))}
                {stockUnits.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                             No stock units found for this asset.
                        </TableCell>
                     </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
