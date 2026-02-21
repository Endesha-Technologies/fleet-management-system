'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  FormSelect,
  FormInput,
  FormDateInput,
  FormNumberInput,
  FormTextarea,
  FormSection,
} from '@/components/ui/form';
import { MOCK_ROUTES } from '@/constants/routes';
import { MOCK_DRIVERS } from '@/constants/drivers';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import { MapPin, Truck, User, Calendar, Package } from 'lucide-react';
import type { TripFormDrawerProps } from '../_types';

export function TripFormDrawer({ open, onClose }: TripFormDrawerProps) {
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const route = MOCK_ROUTES.find(r => r.id === selectedRoute);
  const driver = MOCK_DRIVERS.find(d => d.id === selectedDriver);
  const vehicle = MOCK_VEHICLES.find(v => v.id === selectedVehicle);

  // Filter active drivers and vehicles
  const activeDrivers = MOCK_DRIVERS.filter(d => d.status === 'Active');
  const activeVehicles = MOCK_VEHICLES.filter(v => v.status === 'Active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    console.log('Trip form submitted', Object.fromEntries(formData));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    alert('Trip assigned successfully!');
    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedRoute('');
    setSelectedDriver('');
    setSelectedVehicle('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
      label: `${v.plateNumber} - ${v.make} ${v.model}`,
    })),
  ];

  const driverOptions = [
    { value: '', label: '-- Select a driver --' },
    ...activeDrivers.map(d => ({
      value: d.id,
      label: `${d.name} - ${d.licenseNumber}`,
    })),
  ];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-gray-100">
          <SheetTitle className="text-xl font-semibold">Assign New Trip</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Assign a route, vehicle, and driver to create a new trip dispatch.
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="py-6 space-y-6">
          {/* Route Selection */}
          <FormSection title="Route Details">
            <div className="flex items-center gap-2 -mt-2 mb-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900 text-sm">Route Details</span>
            </div>
            <FormSelect
              label="Select Route"
              name="routeId"
              options={routeOptions}
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              required
            />

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
                  <span className="ml-2 text-blue-900">{route.origin.name}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">To:</span>
                  <span className="ml-2 text-blue-900">{route.destination.name}</span>
                </div>
              </div>
            )}
          </FormSection>

          {/* Vehicle Selection */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Vehicle Assignment</h3>
            </div>
            <FormSelect
              label="Select Vehicle"
              name="vehicleId"
              options={vehicleOptions}
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              required
            />

            {vehicle && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600 font-medium">Plate:</span>
                    <span className="ml-2 text-gray-900">{vehicle.plateNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Type:</span>
                    <span className="ml-2 text-gray-900">{vehicle.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Make:</span>
                    <span className="ml-2 text-gray-900">{vehicle.make} {vehicle.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Year:</span>
                    <span className="ml-2 text-gray-900">{vehicle.year}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Driver Selection */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Driver Assignment</h3>
            </div>
            <FormSelect
              label="Select Driver"
              name="driverId"
              options={driverOptions}
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              required
            />

            {driver && (
              <div className="bg-green-50 p-4 rounded-lg text-sm space-y-2 border border-green-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-green-700 font-medium">Name:</span>
                    <span className="ml-2 text-green-900">{driver.name}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Phone:</span>
                    <span className="ml-2 text-green-900">{driver.phone}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">License:</span>
                    <span className="ml-2 text-green-900">{driver.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Status:</span>
                    <span className="ml-2 text-green-900">{driver.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Schedule</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormDateInput
                label="Departure Date"
                name="departureDate"
                required
              />
              <FormInput
                label="Departure Time"
                name="departureTime"
                type="time"
                required
              />
            </div>
          </div>

          {/* Cargo Details */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Cargo Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Cargo Type"
                name="cargoType"
                placeholder="e.g., General Freight"
              />
              <FormNumberInput
                label="Weight (kg)"
                name="cargoWeight"
                placeholder="e.g., 5000"
              />
            </div>
            <FormTextarea
              label="Notes"
              name="notes"
              rows={3}
              placeholder="Add any special instructions or notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Trip'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
