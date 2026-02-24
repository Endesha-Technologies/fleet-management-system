'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Printer, PlayCircle, StopCircle, MapPin, Route } from 'lucide-react';
import Link from 'next/link';
import { StartTripModal } from './StartTripModal';
import { EndTripModal } from './EndTripModal';
import type { Trip, TripTableProps } from '../_types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CLASSES: Record<string, string> = {
  Completed: 'bg-green-100 text-green-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Scheduled: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Mobile card
// ---------------------------------------------------------------------------

function TripMobileCard({
  trip,
  onAssignRoute,
  onStartTrip,
  onEndTrip,
  onPrint,
}: {
  trip: Trip;
  onAssignRoute?: (trip: Trip) => void;
  onStartTrip: (trip: Trip) => void;
  onEndTrip: (trip: Trip) => void;
  onPrint: (trip: Trip) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-medium text-gray-500">
              #{trip.id}
            </span>
            <Badge className={STATUS_CLASSES[trip.status] ?? 'bg-gray-100 text-gray-800'}>
              {trip.status}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900">{trip.routeName}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {trip.startLocation} → {trip.endLocation}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-3">
        <div>
          <span className="text-gray-500 block text-xs">Vehicle</span>
          <span className="font-medium text-gray-900">{trip.vehiclePlate}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Driver</span>
          <span className="font-medium text-gray-900">{trip.driverName}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Scheduled Start</span>
          <span className="font-medium text-gray-900 text-xs">
            {formatShortDate(trip.scheduledStartTime)}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Actual Start</span>
          <span className="font-medium text-gray-900 text-xs">
            {trip.actualStartTime ? (
              formatShortDate(trip.actualStartTime)
            ) : (
              <span className="text-gray-400">Not started</span>
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
        {trip.status === 'Scheduled' && onAssignRoute && (
          <Button
            variant="outline"
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={() => onAssignRoute(trip)}
          >
            <Route className="h-3 w-3 mr-1" />
            Assign Route
          </Button>
        )}

        {trip.status === 'Scheduled' && (
          <Button
            variant="outline"
            size="sm"
            className="text-green-700 border-green-300 hover:bg-green-50"
            onClick={() => onStartTrip(trip)}
          >
            <PlayCircle className="h-3 w-3 mr-1" />
            Start Trip
          </Button>
        )}

        {trip.status === 'In Progress' && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-700 border-red-300 hover:bg-red-50"
            onClick={() => onEndTrip(trip)}
          >
            <StopCircle className="h-3 w-3 mr-1" />
            End Trip
          </Button>
        )}

        <Button variant="outline" size="sm" asChild>
          <Link href={`/trips/${trip.id}`} scroll={false} prefetch={true}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Link>
        </Button>

        {trip.status === 'Scheduled' && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/trips/${trip.id}/edit`} scroll={false} prefetch={true}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Link>
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => onPrint(trip)}>
          <Printer className="h-3 w-3 mr-1" />
          Print
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Print-only component
// ---------------------------------------------------------------------------

function PrintableTrip({ trip }: { trip: Trip }) {
  const scheduledStart = new Date(trip.scheduledStartTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const scheduledEnd = new Date(trip.scheduledEndTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const actualStart = trip.actualStartTime
    ? new Date(trip.actualStartTime).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Not started';
  const actualEnd = trip.actualEndTime
    ? new Date(trip.actualEndTime).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : trip.status === 'In Progress'
      ? 'Ongoing'
      : 'Not completed';

  return (
    <>
      <style jsx global>{`
        .print-only { display: none; }
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
          @page { margin: 1cm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="print-only max-w-4xl mx-auto p-8 bg-white">
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trip Details - #{trip.id}
          </h1>
          <p className="text-gray-600">Fleet Management System</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">
            Status
          </h2>
          <Badge className={STATUS_CLASSES[trip.status] ?? 'bg-gray-100 text-gray-800'}>
            {trip.status}
          </Badge>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">
            Route Information
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-600">Route</p>
              <p className="text-base text-gray-900">{trip.routeName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">From</p>
              <p className="text-base text-gray-900">{trip.startLocation}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">To</p>
              <p className="text-base text-gray-900">{trip.endLocation}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Distance</p>
              <p className="text-base text-gray-900">{trip.distance}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">
            Assignment
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Driver</p>
              <p className="text-base text-gray-900">{trip.driverName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Vehicle</p>
              <p className="text-base text-gray-900">{trip.vehiclePlate}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">
            Schedule
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Scheduled Start</p>
              <p className="text-base text-gray-900">{scheduledStart}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Scheduled End</p>
              <p className="text-base text-gray-900">{scheduledEnd}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Actual Start</p>
              <p className="text-base text-gray-900">{actualStart}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Actual End</p>
              <p className="text-base text-gray-900">{actualEnd}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TripTable({ trips, onAssignRoute }: TripTableProps) {
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [printTrip, setPrintTrip] = useState<Trip | null>(null);

  const handleStartTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setStartModalOpen(true);
  };

  const handleConfirmStart = (actualStartTime: string, reason?: string) => {
    console.log('Starting trip:', selectedTrip?.id, { actualStartTime, reason });
    alert(
      `Trip ${selectedTrip?.id} started at ${new Date(actualStartTime).toLocaleString()}${reason ? `\nReason: ${reason}` : ''}`,
    );
  };

  const handleEndTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setEndModalOpen(true);
  };

  const handleConfirmEnd = (actualEndTime: string, reason?: string) => {
    console.log('Ending trip:', selectedTrip?.id, { actualEndTime, reason });
    alert(
      `Trip ${selectedTrip?.id} completed at ${new Date(actualEndTime).toLocaleString()}${reason ? `\nReason: ${reason}` : ''}`,
    );
  };

  const handlePrint = (trip: Trip) => {
    setPrintTrip(trip);
    setTimeout(() => {
      window.print();
      setPrintTrip(null);
    }, 100);
  };

  const columns: ColumnDef<Trip>[] = useMemo(
    () => [
      {
        id: 'tripId',
        header: 'Trip ID',
        accessorKey: 'id',
        cell: (trip) => (
          <span className="font-mono text-xs font-medium text-gray-900">
            #{trip.id}
          </span>
        ),
      },
      {
        id: 'route',
        header: 'Route',
        accessorKey: 'routeName',
        sortable: true,
        cell: (trip) => (
          <div>
            <p className="font-medium text-gray-900">{trip.routeName}</p>
            <p className="text-xs text-gray-500">
              {trip.startLocation} → {trip.endLocation}
            </p>
            <p className="text-xs text-gray-400">
              {trip.distance} • {trip.estimatedDuration}
            </p>
          </div>
        ),
      },
      {
        id: 'vehicle',
        header: 'Vehicle',
        accessorKey: 'vehiclePlate',
        cell: (trip) => (
          <span className="font-medium text-gray-900">{trip.vehiclePlate}</span>
        ),
      },
      {
        id: 'driver',
        header: 'Driver',
        accessorKey: 'driverName',
        cell: (trip) => (
          <div>
            <p className="font-medium text-gray-900">{trip.driverName}</p>
            {trip.driverPhone && (
              <p className="text-xs text-gray-500">{trip.driverPhone}</p>
            )}
          </div>
        ),
      },
      {
        id: 'scheduledTime',
        header: 'Scheduled Time',
        accessorKey: 'scheduledStartTime',
        sortable: true,
        searchable: false,
        cell: (trip) => (
          <div className="text-xs">
            <p className="text-gray-900">
              <span className="text-gray-500">Start:</span>{' '}
              {formatShortDate(trip.scheduledStartTime)}
            </p>
            <p className="text-gray-900">
              <span className="text-gray-500">End:</span>{' '}
              {formatShortDate(trip.scheduledEndTime)}
            </p>
          </div>
        ),
      },
      {
        id: 'actualTime',
        header: 'Actual Time',
        accessorFn: (row) => row.actualStartTime ?? '',
        searchable: false,
        cell: (trip) => (
          <div className="text-xs">
            {trip.actualStartTime ? (
              <p className="text-gray-900">
                <span className="text-gray-500">Start:</span>{' '}
                {formatShortDate(trip.actualStartTime)}
              </p>
            ) : (
              <p className="text-gray-400">Not started</p>
            )}
            {trip.actualEndTime ? (
              <p className="text-gray-900">
                <span className="text-gray-500">End:</span>{' '}
                {formatShortDate(trip.actualEndTime)}
              </p>
            ) : trip.status === 'In Progress' ? (
              <p className="text-blue-600 font-medium">Ongoing...</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        searchable: false,
        cell: (trip) => (
          <Badge
            className={STATUS_CLASSES[trip.status] ?? 'bg-gray-100 text-gray-800'}
          >
            {trip.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        align: 'right',
        searchable: false,
        cell: (trip) => (
          <div className="flex items-center justify-end gap-1">
            {trip.status === 'Scheduled' && onAssignRoute && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-700 hover:bg-blue-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignRoute(trip);
                }}
              >
                <Route className="h-3 w-3 mr-1" />
                Route
              </Button>
            )}

            {trip.status === 'Scheduled' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:bg-green-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTrip(trip);
                }}
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}

            {trip.status === 'In Progress' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-700 hover:bg-red-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEndTrip(trip);
                }}
              >
                <StopCircle className="h-3 w-3 mr-1" />
                End
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-50 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrint(trip);
              }}
            >
              <Printer className="h-3 w-3 mr-1" />
              Print
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-50 cursor-pointer"
              asChild
            >
              <Link href={`/trips/${trip.id}`} scroll={false} prefetch={true}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Link>
            </Button>

            {trip.status === 'Scheduled' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-50 cursor-pointer"
                asChild
              >
                <Link
                  href={`/trips/${trip.id}/edit`}
                  scroll={false}
                  prefetch={true}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onAssignRoute],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={trips}
        getRowId={(row) => row.id}
        searchable={false}
        mobileCard={(trip) => (
          <TripMobileCard
            trip={trip}
            onAssignRoute={onAssignRoute}
            onStartTrip={handleStartTrip}
            onEndTrip={handleEndTrip}
            onPrint={handlePrint}
          />
        )}
        emptyState={{
          icon: MapPin,
          title: 'No trips found',
          description: 'Assign a new trip to get started.',
        }}
      />

      {/* Modals */}
      {selectedTrip && (
        <>
          <StartTripModal
            trip={selectedTrip}
            isOpen={startModalOpen}
            onClose={() => setStartModalOpen(false)}
            onConfirm={handleConfirmStart}
          />
          <EndTripModal
            trip={selectedTrip}
            isOpen={endModalOpen}
            onClose={() => setEndModalOpen(false)}
            onConfirm={handleConfirmEnd}
          />
        </>
      )}

      {/* Print-only content */}
      {printTrip && <PrintableTrip trip={printTrip} />}
    </>
  );
}
