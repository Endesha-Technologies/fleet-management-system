'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Printer, PlayCircle, StopCircle, MapPin, Route } from 'lucide-react';
import Link from 'next/link';
import { StartTripModal } from './StartTripModal';
import { EndTripModal } from './EndTripModal';
import type { Trip } from '../_types';
import type { TripTableProps } from '../_types';

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
    // In production: API call to update status to "In Progress" and record actual start time
    alert(`Trip ${selectedTrip?.id} started at ${new Date(actualStartTime).toLocaleString()}${reason ? `\nReason: ${reason}` : ''}`);
  };

  const handleEndTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setEndModalOpen(true);
  };

  const handleConfirmEnd = (actualEndTime: string, reason?: string) => {
    console.log('Ending trip:', selectedTrip?.id, { actualEndTime, reason });
    // In production: API call to update status to "Completed" and record actual end time
    alert(`Trip ${selectedTrip?.id} completed at ${new Date(actualEndTime).toLocaleString()}${reason ? `\nReason: ${reason}` : ''}`);
  };

  const handlePrint = (trip: Trip) => {
    setPrintTrip(trip);
    // Small delay to ensure DOM is updated before printing
    setTimeout(() => {
      window.print();
      setPrintTrip(null);
    }, 100);
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p className="text-lg font-medium">No trips found</p>
        <p className="text-sm">Assign a new trip to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-medium text-gray-500">#{trip.id}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${trip.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      trip.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                      trip.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {trip.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{trip.routeName}</h3>
                <p className="text-xs text-gray-500 mt-1">{trip.startLocation} → {trip.endLocation}</p>
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
                  {new Date(trip.scheduledStartTime).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Actual Start</span>
                <span className="font-medium text-gray-900 text-xs">
                  {trip.actualStartTime 
                    ? new Date(trip.actualStartTime).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : <span className="text-gray-400">Not started</span>
                  }
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
              {/* Assign Route Button - Only for Scheduled trips */}
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
              
              {/* Start Trip Button - Only for Scheduled trips */}
              {trip.status === 'Scheduled' && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => handleStartTrip(trip)}
                >
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Start Trip
                </Button>
              )}
              
              {/* End Trip Button - Only for In Progress trips */}
              {trip.status === 'In Progress' && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                  onClick={() => handleEndTrip(trip)}
                >
                  <StopCircle className="h-3 w-3 mr-1" />
                  End Trip
                </Button>
              )}
              
              {/* View Details Button */}
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/trips/${trip.id}`} scroll={false} prefetch={true}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
              
              {/* Edit Button - Only for Scheduled trips */}
              {trip.status === 'Scheduled' && (
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/trips/${trip.id}/edit`} scroll={false} prefetch={true}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Link>
                </Button>
              )}

              {/* Print Button */}
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handlePrint(trip)}
              >
                <Printer className="h-3 w-3 mr-1" />
                Print
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block w-full overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Trip ID</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Scheduled Time</th>
              <th className="px-4 py-3">Actual Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {trips.map((trip) => (
              <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4">
                  <span className="font-mono text-xs font-medium text-gray-900">#{trip.id}</span>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{trip.routeName}</p>
                    <p className="text-xs text-gray-500">{trip.startLocation} → {trip.endLocation}</p>
                    <p className="text-xs text-gray-400">{trip.distance} • {trip.estimatedDuration}</p>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-gray-900">{trip.vehiclePlate}</td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{trip.driverName}</p>
                    {trip.driverPhone && (
                      <p className="text-xs text-gray-500">{trip.driverPhone}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs">
                    <p className="text-gray-900">
                      <span className="text-gray-500">Start:</span> {new Date(trip.scheduledStartTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-gray-900">
                      <span className="text-gray-500">End:</span> {new Date(trip.scheduledEndTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs">
                    {trip.actualStartTime ? (
                      <p className="text-gray-900">
                        <span className="text-gray-500">Start:</span> {new Date(trip.actualStartTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    ) : (
                      <p className="text-gray-400">Not started</p>
                    )}
                    {trip.actualEndTime ? (
                      <p className="text-gray-900">
                        <span className="text-gray-500">End:</span> {new Date(trip.actualEndTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    ) : trip.status === 'In Progress' ? (
                      <p className="text-blue-600 font-medium">Ongoing...</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                    ${trip.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      trip.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                      trip.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {trip.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Assign Route Button - Only for Scheduled trips */}
                    {trip.status === 'Scheduled' && onAssignRoute && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-blue-700 hover:bg-blue-50 cursor-pointer"
                        onClick={() => onAssignRoute(trip)}
                      >
                        <Route className="h-3 w-3 mr-1" />
                        Route
                      </Button>
                    )}
                    
                    {/* Start Trip Button - Only for Scheduled trips */}
                    {trip.status === 'Scheduled' && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-green-700 hover:bg-green-50 cursor-pointer"
                        onClick={() => handleStartTrip(trip)}
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {/* End Trip Button - Only for In Progress trips */}
                    {trip.status === 'In Progress' && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="text-red-700 hover:bg-red-50 cursor-pointer"
                        onClick={() => handleEndTrip(trip)}
                      >
                        <StopCircle className="h-3 w-3 mr-1" />
                        End
                      </Button>
                    )}
                    
                    {/* Print Button */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-600 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePrint(trip)}
                    >
                      <Printer className="h-3 w-3 mr-1" />
                      Print
                    </Button>
                    
                    {/* View Details Button */}
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
                    
                    {/* Edit Button - Only for Scheduled trips */}
                    {trip.status === 'Scheduled' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-600 hover:bg-gray-50 cursor-pointer"
                        asChild
                      >
                        <Link href={`/trips/${trip.id}/edit`} scroll={false} prefetch={true}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

// Print-only component
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

  const statusColors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Scheduled': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };

  return (
    <>
      <style jsx global>{`
        .print-only {
          display: none;
        }
        
        @media print {
          /* Hide everything on the page */
          body * {
            visibility: hidden;
          }
          
          /* Show only the print content */
          .print-only,
          .print-only * {
            visibility: visible;
          }
          
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          
          @page {
            margin: 1cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="print-only max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Details - #{trip.id}</h1>
          <p className="text-gray-600">Fleet Management System</p>
        </div>

        {/* Status */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Status</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[trip.status as keyof typeof statusColors]}`}>
            {trip.status}
          </span>
        </div>

        {/* Route Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Route Information</h2>
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

        {/* Assignment */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Assignment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">Driver</p>
              <p className="text-base text-gray-900">{trip.driverName}</p>
              {trip.driverPhone && <p className="text-sm text-gray-600">{trip.driverPhone}</p>}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Vehicle</p>
              <p className="text-base text-gray-900">{trip.vehiclePlate}</p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Schedule</h2>
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

        {/* Fuel & Odometer */}
        {(trip.fuelStart || trip.fuelEnd || trip.odometerStart || trip.odometerEnd) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Fuel & Odometer</h2>
            <div className="grid grid-cols-2 gap-4">
              {trip.fuelStart && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fuel Start</p>
                  <p className="text-base text-gray-900">{trip.fuelStart}L</p>
                </div>
              )}
              {trip.fuelEnd && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fuel End</p>
                  <p className="text-base text-gray-900">{trip.fuelEnd}L</p>
                </div>
              )}
              {trip.fuelConsumed && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Fuel Consumed</p>
                  <p className="text-base text-gray-900">{trip.fuelConsumed}L</p>
                </div>
              )}
              {trip.odometerStart && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Odometer Start</p>
                  <p className="text-base text-gray-900">{trip.odometerStart.toLocaleString()} km</p>
                </div>
              )}
              {trip.odometerEnd && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Odometer End</p>
                  <p className="text-base text-gray-900">{trip.odometerEnd.toLocaleString()} km</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {(trip.notes || trip.dispatcherNotes) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-gray-200 pb-2">Notes</h2>
            {trip.dispatcherNotes && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-600">Dispatcher Notes</p>
                <p className="text-base text-gray-900">{trip.dispatcherNotes}</p>
              </div>
            )}
            {trip.notes && (
              <div>
                <p className="text-sm font-semibold text-gray-600">Trip Notes</p>
                <p className="text-base text-gray-900">{trip.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Printed on {new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>
      </div>
    </>
  );
}
