'use client';

import React from 'react';
import { Trip } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Printer, MapPin, Truck, User, Calendar, Clock, AlertCircle, Fuel, Gauge, FileText, Navigation } from 'lucide-react';

interface TripDetailsProps {
  trip: Trip;
}

export function TripDetails({ trip }: TripDetailsProps) {
  const handlePrint = () => {
    window.print();
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return 'N/A';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const actualDuration = calculateDuration(trip.actualStartTime, trip.actualEndTime);
  const isDelayed = trip.actualStartTime && new Date(trip.actualStartTime) > new Date(trip.scheduledStartTime);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Trip Dispatch Sheet</h2>
          <p className="text-sm text-gray-500">Trip ID: #{trip.id}</p>
        </div>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Schedule
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
          ${trip.status === 'Completed' ? 'bg-green-100 text-green-800' : 
            trip.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
            trip.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'}`}>
          {trip.status}
        </span>
        {isDelayed && (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-800">
            Delayed Start
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Route Information */}
          <div className="bg-gray-50 p-5 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              Route Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Route Name:</span>
                <span className="font-medium text-gray-900">{trip.routeName}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block mb-1">Start Location:</span>
                  <span className="font-medium text-gray-900">{trip.startLocation}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">End Location:</span>
                  <span className="font-medium text-gray-900">{trip.endLocation}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <span className="text-gray-500 block mb-1">Distance:</span>
                  <span className="font-semibold text-blue-600">{trip.distance}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Est. Duration:</span>
                  <span className="font-semibold text-blue-600">{trip.estimatedDuration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          <div className="bg-gray-50 p-5 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
              <Truck className="h-5 w-5 text-blue-600" />
              Assignment Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block mb-1">Vehicle:</span>
                  <span className="font-medium text-gray-900">{trip.vehiclePlate}</span>
                  <span className="text-xs text-gray-400 block">ID: {trip.vehicleId}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Driver:</span>
                  <span className="font-medium text-gray-900">{trip.driverName}</span>
                  {trip.driverPhone && (
                    <span className="text-xs text-gray-600 block">{trip.driverPhone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fuel & Odometer */}
          {(trip.fuelStart || trip.odometerStart) && (
            <div className="bg-gray-50 p-5 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                <Fuel className="h-5 w-5 text-blue-600" />
                Fuel & Odometer
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 block mb-1">Fuel Start:</span>
                    <span className="font-medium text-gray-900">{trip.fuelStart ? `${trip.fuelStart}L` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Fuel End:</span>
                    <span className="font-medium text-gray-900">{trip.fuelEnd ? `${trip.fuelEnd}L` : 'N/A'}</span>
                  </div>
                </div>
                {trip.fuelConsumed && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-500 block mb-1">Fuel Consumed:</span>
                    <span className="font-semibold text-red-600">{trip.fuelConsumed}L</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-gray-500 block mb-1">Odometer Start:</span>
                    <span className="font-medium text-gray-900">{trip.odometerStart ? `${trip.odometerStart} km` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Odometer End:</span>
                    <span className="font-medium text-gray-900">{trip.odometerEnd ? `${trip.odometerEnd} km` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Timing & Status */}
          <div className="bg-gray-50 p-5 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              Timing & Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="pb-3 border-b border-gray-200">
                <span className="text-gray-500 block mb-2 font-medium">Scheduled Times</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Start:</span>
                    <span className="font-medium text-gray-900">{new Date(trip.scheduledStartTime).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">End:</span>
                    <span className="font-medium text-gray-900">{new Date(trip.scheduledEndTime).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                </div>
              </div>
              
              <div className="pb-3 border-b border-gray-200">
                <span className="text-gray-500 block mb-2 font-medium">Actual Times</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Start:</span>
                    {trip.actualStartTime ? (
                      <span className="font-medium text-gray-900">{new Date(trip.actualStartTime).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    ) : (
                      <span className="text-gray-400 italic">Not started</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">End:</span>
                    {trip.actualEndTime ? (
                      <span className="font-medium text-gray-900">{new Date(trip.actualEndTime).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    ) : (
                      <span className="text-gray-400 italic">{trip.status === 'In Progress' ? 'Ongoing' : 'Not completed'}</span>
                    )}
                  </div>
                </div>
              </div>

              {trip.actualStartTime && trip.actualEndTime && (
                <div>
                  <span className="text-gray-500 block mb-1">Actual Duration:</span>
                  <span className="font-semibold text-blue-600">{actualDuration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dispatcher Notes */}
          {trip.dispatcherNotes && (
            <div className="bg-blue-50 p-5 rounded-lg space-y-3 border-2 border-blue-200">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dispatcher Instructions
              </h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{trip.dispatcherNotes}</p>
            </div>
          )}

          {/* Issues & Notes */}
          {(trip.notes || trip.maintenanceIssues || trip.routeDeviations) && (
            <div className="bg-orange-50 p-5 rounded-lg space-y-4 border-2 border-orange-200">
              <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Issues & Notes
              </h3>
              <div className="space-y-3 text-sm">
                {trip.maintenanceIssues && (
                  <div>
                    <span className="text-orange-700 font-medium block mb-1">Maintenance Issues:</span>
                    <p className="text-orange-800 whitespace-pre-wrap">{trip.maintenanceIssues}</p>
                  </div>
                )}
                {trip.routeDeviations && (
                  <div>
                    <span className="text-orange-700 font-medium block mb-1">Route Deviations:</span>
                    <p className="text-orange-800 whitespace-pre-wrap">{trip.routeDeviations}</p>
                  </div>
                )}
                {trip.notes && (
                  <div>
                    <span className="text-orange-700 font-medium block mb-1">General Notes:</span>
                    <p className="text-orange-800 whitespace-pre-wrap">{trip.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
