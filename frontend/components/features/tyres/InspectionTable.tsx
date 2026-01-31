'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TyreInspection } from '@/types/inspection';
import { INSPECTION_STATUSES } from '@/constants/inspections';
import { Eye, Download, AlertCircle } from 'lucide-react';

interface InspectionTableProps {
  inspections: TyreInspection[];
  onView?: (inspectionId: string) => void;
  onExport?: () => void;
}

export function InspectionTable({ inspections, onView, onExport }: InspectionTableProps) {
  const getStatusBadge = (status: TyreInspection['status']) => {
    const statusConfig = INSPECTION_STATUSES.find((s) => s.value === status);
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
        {statusConfig?.label}
      </span>
    );
  };

  const getFailedTyresCount = (inspection: TyreInspection) => {
    return inspection.tyreInspections.filter((t) => t.result === 'fail').length;
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Inspection History</h2>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Inspection ID</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Inspector</TableHead>
            <TableHead>Odometer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Issues</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                No inspections found
              </TableCell>
            </TableRow>
          ) : (
            inspections.map((inspection) => {
              const failedCount = getFailedTyresCount(inspection);
              return (
                <TableRow key={inspection.id}>
                  <TableCell className="text-sm font-medium text-gray-900">{inspection.id}</TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{inspection.vehicleName}</div>
                      <div className="text-gray-500">{inspection.vehicleRegistration}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {new Date(inspection.inspectionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">{inspection.inspectorName}</TableCell>
                  <TableCell className="text-sm text-gray-900">{inspection.currentOdometer.toLocaleString()} km</TableCell>
                  <TableCell className="text-sm">{getStatusBadge(inspection.status)}</TableCell>
                  <TableCell className="text-sm">
                    {failedCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {failedCount} Failed
                      </span>
                    )}
                    {failedCount === 0 && inspection.status === 'completed' && (
                      <span className="text-green-600">All Pass</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(inspection.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
