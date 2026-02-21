import { AssetMovement } from '@/types/asset';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Download, Upload, Trash2, ShoppingCart, RefreshCcw } from 'lucide-react';
import type { MovementsTabProps } from '../../_types';

const DollarSign = ({ className }: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

export default function MovementsTab({ movements }: MovementsTabProps) {
  const getIcon = (type: string) => {
    switch (type) {
        case 'Purchase': return <Download className="h-4 w-4 text-green-600" />;
        case 'Assignment': return <Upload className="h-4 w-4 text-blue-600" />;
        case 'Sale': return <DollarSign className="h-4 w-4 text-purple-600" />;
        case 'Disposal': return <Trash2 className="h-4 w-4 text-red-600" />;
        default: return <RefreshCcw className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>Movement History</CardTitle>
        <CardDescription>All stock transactions including purchases, assignments, and adjustments.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="border border-gray-200 rounded-md bg-white">
            <Table>
            <TableHeader>
                <TableRow className="border-gray-200">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Qty / Serial</TableHead>
                <TableHead>From / To</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Notes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {movements.map((move) => (
                <TableRow key={move.id} className="border-gray-200">
                    <TableCell className="text-sm font-medium text-gray-900">
                         {new Date(move.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                             {getIcon(move.type)}
                             <span>{move.type}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        {move.serialNumber ? (
                             <Badge variant="outline" className="font-mono text-xs">{move.serialNumber}</Badge>
                        ) : (
                             <span className="font-medium">{move.quantity} units</span>
                        )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <span>{move.from}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="font-medium text-gray-900">{move.to}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{move.performedBy}</TableCell>
                    <TableCell className="text-sm text-gray-500 italic truncate max-w-[150px]" title={move.notes}>
                        {move.notes}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
