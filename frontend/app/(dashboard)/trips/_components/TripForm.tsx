'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FormSelect,
  FormDateInput,
  FormNumberInput,
  FormTextarea,
  FormSection,
} from '@/components/ui/form';
import { MOCK_ROUTES } from '@/constants/routes';
import { MOCK_DRIVERS } from '@/constants/drivers';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import type { TripFormProps } from '../_types';

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

  const routeOptions = [
    { value: '', label: '-- Select a route --' },
    ...MOCK_ROUTES.map(r => ({
      value: r.id,
      label: `${r.name} (${r.origin.name} → ${r.destination.name})`,
    })),
  ];

  const vehicleOptions = [
    { value: '', label: '-- Select a vehicle --' },
    ...activeVehicles.map(v => ({
      value: v.id,
      label: `${v.plateNumber} - ${v.make} ${v.model} (${v.type})`,
    })),
  ];

  const driverOptions = [
    { value: '', label: '-- Select a driver --' },
    ...activeDrivers.map(d => ({
      value: d.id,
      label: `${d.name} - ${d.phone}`,
    })),
  ];

  const statusOptions = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
      <div className="flex flex-col gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 shrink-0 px-1">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold">{isEditing ? 'Update Trip' : 'Assign New Trip'}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isEditing ? 'Update trip details and status.' : 'Assign a route, vehicle, and driver to create a new trip dispatch.'}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none">
            {isEditing ? 'Update Trip' : 'Assign Trip'}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-3 sm:py-4 px-1 space-y-4 sm:space-y-6">
        {/* Route Selection */}
        <FormSection title="Route Details">
          <FormSelect
            label="Select Route"
            name="routeId"
            options={routeOptions}
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            required
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />

          {route && (
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm space-y-2 border border-blue-200">
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
                <span className="ml-2 text-blue-900">{route.origin.name}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">To:</span>
                <span className="ml-2 text-blue-900">{route.destination.name}</span>
              </div>
            </div>
          )}
        </FormSection>

        {/* Assignment Details */}
        <FormSection title="Assignment">
          <FormSelect
            label="Select Vehicle"
            name="vehicleId"
            options={vehicleOptions}
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            required
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />

          {vehicle && (
            <div className="bg-gray-50 p-3 rounded-lg text-xs sm:text-sm space-y-1 border border-gray-200">
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

          <FormSelect
            label="Select Driver"
            name="driverId"
            options={driverOptions}
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            required
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />

          {driver && (
            <div className="bg-gray-50 p-3 rounded-lg text-xs sm:text-sm space-y-1 border border-gray-200">
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
        </FormSection>

        {/* Schedule Times */}
        <FormSection title="Schedule">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormDateInput
              label="Scheduled Start Time"
              name="scheduledStartTime"
              includeTime
              className="h-9 sm:h-10 text-xs sm:text-sm"
              defaultValue={initialData?.scheduledStartTime?.slice(0, 16)}
              required
            />

            <FormDateInput
              label="Scheduled End Time"
              name="scheduledEndTime"
              includeTime
              className="h-9 sm:h-10 text-xs sm:text-sm"
              defaultValue={initialData?.scheduledEndTime?.slice(0, 16)}
              required
            />
          </div>
        </FormSection>

        {/* Trip Status & Actual Times (Only when editing) */}
        {isEditing && (
          <FormSection title="Status & Actual Times">
            <FormSelect
              label="Trip Status"
              name="status"
              options={statusOptions}
              defaultValue={initialData?.status}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormDateInput
                label="Actual Start Time"
                name="actualStartTime"
                includeTime
                className="h-9 sm:h-10 text-xs sm:text-sm"
                defaultValue={initialData?.actualStartTime?.slice(0, 16)}
              />
              
              <FormDateInput
                label="Actual End Time"
                name="actualEndTime"
                includeTime
                className="h-9 sm:h-10 text-xs sm:text-sm"
                defaultValue={initialData?.actualEndTime?.slice(0, 16)}
              />
            </div>
          </FormSection>
        )}

        {/* Fuel & Odometer (Only when editing) */}
        {isEditing && (
          <FormSection title="Fuel & Odometer Readings">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <FormNumberInput
                label="Fuel Start (L)"
                name="fuelStart"
                step={0.1}
                placeholder="45.5"
                className="h-9 sm:h-10 text-xs sm:text-sm"
                defaultValue={initialData?.fuelStart}
              />
              
              <FormNumberInput
                label="Fuel End (L)"
                name="fuelEnd"
                step={0.1}
                placeholder="40.0"
                className="h-9 sm:h-10 text-xs sm:text-sm"
                defaultValue={initialData?.fuelEnd}
              />

              <FormNumberInput
                label="Fuel Consumed (L)"
                name="fuelConsumed"
                step={0.1}
                placeholder="5.5"
                className="h-9 sm:h-10 text-xs sm:text-sm bg-gray-100"
                defaultValue={initialData?.fuelConsumed}
                readOnly
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormNumberInput
                label="Odometer Start (km)"
                name="odometerStart"
                step={0.1}
                placeholder="125430"
                className="h-9 sm:h-10 text-xs sm:text-sm"
                defaultValue={initialData?.odometerStart}
              />
              
              <FormNumberInput
                label="Odometer End (km)"
                name="odometerEnd"
                step={0.1}
                placeholder="125445"
                className="h-9 sm:h-10 text-xs sm:text-sm"
                defaultValue={initialData?.odometerEnd}
              />
            </div>
          </FormSection>
        )}

        {/* Notes & Issues */}
        <FormSection title="Notes & Instructions">
          <FormTextarea
            label="Dispatcher Instructions"
            name="dispatcherNotes"
            placeholder="Special instructions, priorities, or notes for the driver..."
            defaultValue={initialData?.dispatcherNotes}
            className="min-h-[80px] text-xs sm:text-sm"
          />

          {isEditing && (
            <>
              <FormTextarea
                label="Maintenance Issues"
                name="maintenanceIssues"
                placeholder="Any vehicle issues encountered during the trip..."
                defaultValue={initialData?.maintenanceIssues}
                className="min-h-[60px] text-xs sm:text-sm"
              />

              <FormTextarea
                label="Route Deviations"
                name="routeDeviations"
                placeholder="Any deviations from the planned route..."
                defaultValue={initialData?.routeDeviations}
                className="min-h-[60px] text-xs sm:text-sm"
              />
            </>
          )}

          <FormTextarea
            label="General Notes"
            name="notes"
            placeholder="Additional trip notes, incidents, or observations..."
            defaultValue={initialData?.notes}
            className="min-h-[80px] text-xs sm:text-sm"
          />
        </FormSection>
      </div>
    </form>
  );
}
