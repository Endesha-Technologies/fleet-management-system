'use client';

import { ArrowLeft, Play, Square, AlertTriangle, FileText, Printer, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TripHeaderProps, DetailedTripStatus } from '../_types';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<DetailedTripStatus, { label: string; color: string; dotColor: string }> = {
  SCHEDULED: { label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dotColor: 'bg-yellow-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200', dotColor: 'bg-blue-500' },
  DELAYED: { label: 'Delayed', color: 'bg-red-100 text-red-800 border-red-200', dotColor: 'bg-red-500' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', dotColor: 'bg-green-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200', dotColor: 'bg-gray-500' },
};

export function TripHeader({ trip, onBack, onAction }: TripHeaderProps) {
  const { label, color, dotColor } = STATUS_CONFIG[trip.status];
  const shortId = `#TRP-${trip.id.slice(0, 8)}`;

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      {/* Row 1 – Back + ID + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Trips</span>
          </button>

          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm md:text-base truncate">{shortId}</span>
            <Badge className={`${color} border text-xs shrink-0`}>
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor} mr-1.5 inline-block`} />
              {label}
            </Badge>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {trip.status === 'SCHEDULED' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onAction('edit')}>
                ✏️ Edit
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onAction('start')}>
                <Play className="h-3.5 w-3.5 mr-1" /> Start
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onAction('cancel')}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
            </>
          )}
          {trip.status === 'IN_PROGRESS' && (
            <>
              <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-200 hover:bg-yellow-50" onClick={() => onAction('delay')}>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Delay
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction('report-incident')}>
                ⚠️ Report Incident
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onAction('complete')}>
                <Square className="h-3.5 w-3.5 mr-1" /> Complete
              </Button>
            </>
          )}
          {trip.status === 'DELAYED' && (
            <>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onAction('resume')}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Resume
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction('report-incident')}>
                ⚠️ Report Incident
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onAction('complete')}>
                <Square className="h-3.5 w-3.5 mr-1" /> Complete
              </Button>
            </>
          )}
          {trip.status === 'COMPLETED' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onAction('export')}>
                <FileText className="h-3.5 w-3.5 mr-1" /> Export
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction('print')}>
                <Printer className="h-3.5 w-3.5 mr-1" /> Print
              </Button>
            </>
          )}
          {trip.status === 'CANCELLED' && (
            <Button size="sm" variant="outline" onClick={() => onAction('view-reason')}>
              📄 View Reason
            </Button>
          )}
        </div>
      </div>

      {/* Row 2 – Truck / Driver / Turn Boy */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
        <span>
          🚛 <span className="font-medium text-gray-800">{trip.truckPlate}</span>
          {trip.truckModel && <span className="text-gray-400 ml-1">({trip.truckModel})</span>}
        </span>
        <span className="hidden sm:inline text-gray-300">•</span>
        <span>
          👤 <span className="font-medium text-gray-800">{trip.driverName}</span>
        </span>
        {trip.turnBoyName && (
          <>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span>
              👥 <span className="font-medium text-gray-800">{trip.turnBoyName}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
