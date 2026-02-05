'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MOCK_ROUTES } from '@/constants/routes';
import { MOCK_DRIVERS } from '@/constants/drivers';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import { MapPin, Truck, User, Calendar, Package } from 'lucide-react';

interface TripFormDrawerProps {
  open: boolean;
  onClose: () => void;
}

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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Route Details</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Select Route *</Label>
              <select 
                id="route" 
                name="routeId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                required
              >
                <option value="">-- Select a route --</option>
                {MOCK_ROUTES.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.origin.name} → {route.destination.name})
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
                  <span className="ml-2 text-blue-900">{route.origin.name}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">To:</span>
                  <span className="ml-2 text-blue-900">{route.destination.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Vehicle Assignment</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Select Vehicle *</Label>
              <select 
                id="vehicle" 
                name="vehicleId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                required
              >
                <option value="">-- Select a vehicle --</option>
                {activeVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

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
            <div className="space-y-2">
              <Label htmlFor="driver">Select Driver *</Label>
              <select 
                id="driver" 
                name="driverId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                required
              >
                <option value="">-- Select a driver --</option>
                {activeDrivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.licenseNumber}
                  </option>
                ))}
              </select>
            </div>

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
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date *</Label>
                <Input 
                  type="date" 
                  id="departureDate" 
                  name="departureDate"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time *</Label>
                <Input 
                  type="time" 
                  id="departureTime" 
                  name="departureTime"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Cargo Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargoType">Cargo Type</Label>
                <Input 
                  type="text" 
                  id="cargoType" 
                  name="cargoType"
                  placeholder="e.g., General Freight"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargoWeight">Weight (kg)</Label>
                <Input 
                  type="number" 
                  id="cargoWeight" 
                  name="cargoWeight"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea 
                id="notes" 
                name="notes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Add any special instructions or notes..."
              />
            </div>
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
