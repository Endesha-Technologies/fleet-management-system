'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trip } from '@/types/trip';
import { MOCK_ROUTES } from '@/constants/routes';
import { MOCK_DRIVERS } from '@/constants/drivers';
import { MOCK_VEHICLES } from '@/constants/vehicles';

interface TripFormProps {
  initialData?: Trip;
  isEditing?: boolean;
}

export function TripForm({ initialData, isEditing = false }: TripFormProps) {
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState(initialData?.routeId || '');
  const [selectedDriver, setSelectedDriver] = useState(initialData?.driverId || '');
  const [selectedVehicle, setSelectedVehicle] = useState(initialData?.vehicleId || '');

  const route = MOCK_ROUTES.find(r => r.id === selectedRoute);
  const driver = MOCK_DRIVERS.find(d => d.id === selectedDriver);
  const vehicle = MOCK_VEHICLES.find(v => v.id === selectedVehicle);

  // Filter active drivers and vehicles
  const activeDrivers = MOCK_DRIVERS.filter(d => d.status === 'Active');
  const activeVehicles = MOCK_VEHICLES.filter(v => v.status === 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    console.log('Trip form submitted', isEditing ? 'Update' : 'Create', Object.fromEntries(formData));
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
      <div className="flex flex-col gap-4 pb-4 border-b border-gray-100 shrink-0">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{isEditing ? 'Update Trip' : 'Assign New Trip'}</h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update trip details and status.' : 'Assign a route, vehicle, and driver to create a new trip dispatch.'}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {isEditing ? 'Update Trip' : 'Assign Trip'}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-6">
        {/* Route Selection */}
        <div className="space-y-4 pb-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Route Details</h3>
          <div className="space-y-2">
            <Label htmlFor="route">Select Route *</Label>
            <select 
              id="route" 
              name="routeId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              required
            >
              <option value="">-- Select a route --</option>
              {MOCK_ROUTES.map(route => (
                <option key={route.id} value={route.id}>
                  {route.name} ({route.startLocation} → {route.endLocation})
                </option>
              ))}
            </select>
          </div>

          {route && (
            <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2 border border-blue-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-blue-700 font-medium">Distance:</span>
                  <span className="ml-2 text-blue-900">{route.distance}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Duration:</span>
                  <span className="ml-2 text-blue-900">{route.estimatedDuration}</span>
                </div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">From:</span>
                <span className="ml-2 text-blue-900">{route.startLocation}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">To:</span>
                <span className="ml-2 text-blue-900">{route.endLocation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Assignment Details */}
        <div className="space-y-4 pb-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Assignment</h3>
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Select Vehicle *</Label>
            <select 
              id="vehicleId" 
              name="vehicleId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              required
            >
              <option value="">-- Select a vehicle --</option>
              {activeVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} - {v.make} {v.model} ({v.type})
                </option>
              ))}
            </select>
          </div>

          {vehicle && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1 border border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Plate:</span>
                  <span className="ml-2 font-medium">{vehicle.plateNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{vehicle.type}</span>
                </div>
              </div>
              {vehicle.currentOdometer && (
                <div>
                  <span className="text-gray-600">Current Odometer:</span>
                  <span className="ml-2 font-medium">{vehicle.currentOdometer} km</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="driverId">Select Driver *</Label>
            <select 
              id="driverId" 
              name="driverId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              required
            >
              <option value="">-- Select a driver --</option>
              {activeDrivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} - {d.phone}
                </option>
              ))}
            </select>
          </div>

          {driver && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1 border border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{driver.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{driver.phone}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">License:</span>
                <span className="ml-2 font-medium">{driver.licenseNumber}</span>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Times */}
        <div className="space-y-4 pb-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledStartTime">Scheduled Start Time *</Label>
              <Input 
                id="scheduledStartTime" 
                name="scheduledStartTime"
                type="datetime-local"
                defaultValue={initialData?.scheduledStartTime?.slice(0, 16)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledEndTime">Scheduled End Time *</Label>
              <Input 
                id="scheduledEndTime" 
                name="scheduledEndTime"
                type="datetime-local"
                defaultValue={initialData?.scheduledEndTime?.slice(0, 16)}
                required 
              />
            </div>
          </div>
        </div>

        {/* Trip Status & Actual Times (Only when editing) */}
        {isEditing && (
          <div className="space-y-4 pb-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Status & Actual Times</h3>
            <div className="space-y-2">
              <Label htmlFor="status">Trip Status</Label>
              <select 
                id="status" 
                name="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={initialData?.status}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualStartTime">Actual Start Time</Label>
                <Input 
                  id="actualStartTime" 
                  name="actualStartTime"
                  type="datetime-local"
                  defaultValue={initialData?.actualStartTime?.slice(0, 16)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="actualEndTime">Actual End Time</Label>
                <Input 
                  id="actualEndTime" 
                  name="actualEndTime"
                  type="datetime-local"
                  defaultValue={initialData?.actualEndTime?.slice(0, 16)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fuel & Odometer (Only when editing) */}
        {isEditing && (
          <div className="space-y-4 pb-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Fuel & Odometer Readings</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuelStart">Fuel Start (L)</Label>
                <Input 
                  id="fuelStart" 
                  name="fuelStart"
                  type="number"
                  step="0.1"
                  placeholder="45.5" 
                  defaultValue={initialData?.fuelStart}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fuelEnd">Fuel End (L)</Label>
                <Input 
                  id="fuelEnd" 
                  name="fuelEnd"
                  type="number"
                  step="0.1"
                  placeholder="40.0" 
                  defaultValue={initialData?.fuelEnd}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelConsumed">Fuel Consumed (L)</Label>
                <Input 
                  id="fuelConsumed" 
                  name="fuelConsumed"
                  type="number"
                  step="0.1"
                  placeholder="5.5" 
                  defaultValue={initialData?.fuelConsumed}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="odometerStart">Odometer Start (km)</Label>
                <Input 
                  id="odometerStart" 
                  name="odometerStart"
                  type="number"
                  step="0.1"
                  placeholder="125430" 
                  defaultValue={initialData?.odometerStart}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="odometerEnd">Odometer End (km)</Label>
                <Input 
                  id="odometerEnd" 
                  name="odometerEnd"
                  type="number"
                  step="0.1"
                  placeholder="125445" 
                  defaultValue={initialData?.odometerEnd}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes & Issues */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Notes & Instructions</h3>
          <div className="space-y-2">
            <Label htmlFor="dispatcherNotes">Dispatcher Instructions</Label>
            <textarea 
              id="dispatcherNotes" 
              name="dispatcherNotes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Special instructions, priorities, or notes for the driver..."
              defaultValue={initialData?.dispatcherNotes}
            />
          </div>

          {isEditing && (
            <>
              <div className="space-y-2">
                <Label htmlFor="maintenanceIssues">Maintenance Issues</Label>
                <textarea 
                  id="maintenanceIssues" 
                  name="maintenanceIssues"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any vehicle issues encountered during the trip..."
                  defaultValue={initialData?.maintenanceIssues}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routeDeviations">Route Deviations</Label>
                <textarea 
                  id="routeDeviations" 
                  name="routeDeviations"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any deviations from the planned route..."
                  defaultValue={initialData?.routeDeviations}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">General Notes</Label>
            <textarea 
              id="notes" 
              name="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Additional trip notes, incidents, or observations..."
              defaultValue={initialData?.notes}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
