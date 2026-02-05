'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Route as RouteIcon, 
  User, 
  Users, 
  Clock, 
  ChevronDown,
  Check,
  Loader2,
  Info,
  Truck,
  Calendar
} from 'lucide-react';
import { Route } from '@/types/route';
import { Driver, TurnBoy } from '@/types/driver';
import { Vehicle } from '@/types/vehicle';
import { Trip, TripRoute, RouteWaypoint } from '@/types/trip';
import { MOCK_ROUTES } from '@/constants/routes';
import { MOCK_DRIVERS, MOCK_TURN_BOYS } from '@/constants/drivers';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import { Input } from '@/components/ui/input';

interface AssignRouteDrawerProps {
  open: boolean;
  onClose: () => void;
  trip: Trip | null;
  onAssign: (tripId: string, data: AssignRouteData) => void;
}

interface AssignRouteData {
  routeType: 'predefined' | 'custom';
  routeTemplateId?: string;
  tripRoute: TripRoute;
  vehicleId: string;
  vehiclePlate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  turnBoyId?: string;
  turnBoyName?: string;
  turnBoyPhone?: string;
}

export function AssignRouteDrawer({ open, onClose, trip, onAssign }: AssignRouteDrawerProps) {
  // Route selection
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [pathChoice, setPathChoice] = useState<'template' | 'alternative'>('template'); // Use template or find alternatives
  const [selectedPathOption, setSelectedPathOption] = useState<number>(0); // Which alternative to use
  const [alternativeRoutes, setAlternativeRoutes] = useState<Array<{ distance: number; duration: number; polyline?: string }>>([]);
  
  // Route calculation
  const [calculatedRoute, setCalculatedRoute] = useState<{ distance: number; duration: number; polyline?: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Vehicle and schedule
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  
  // Crew assignment
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedTurnBoy, setSelectedTurnBoy] = useState<TurnBoy | null>(null);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [showTurnBoyDropdown, setShowTurnBoyDropdown] = useState(false);

  const activeDrivers = MOCK_DRIVERS.filter(d => d.status === 'Active');
  const activeTurnBoys = MOCK_TURN_BOYS.filter(tb => tb.status === 'Active');
  const activeVehicles = MOCK_VEHICLES.filter(v => v.status === 'Active');

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setSelectedRoute(null);
      setPathChoice('template');
      setSelectedPathOption(0);
      setAlternativeRoutes([]);
      setCalculatedRoute(null);
      setSelectedVehicle(null);
      setScheduledStartTime('');
      setScheduledEndTime('');
      setSelectedDriver(null);
      setSelectedTurnBoy(null);
    }
  }, [open]);

  // When route is selected with template path, use the route's stored data
  useEffect(() => {
    if (selectedRoute && pathChoice === 'template') {
      // Use the template path stored with the route
      // Parse distance string like "245 km" to number
      const distanceNum = parseFloat(selectedRoute.distance.replace(/[^\d.]/g, ''));
      // Parse duration string like "4h 30m" to minutes
      const durationMatch = selectedRoute.estimatedDuration.match(/(\d+)h\s*(\d+)?m?/);
      const durationMins = durationMatch 
        ? (parseInt(durationMatch[1]) * 60) + (parseInt(durationMatch[2] || '0'))
        : 0;
      
      setCalculatedRoute({
        distance: distanceNum,
        duration: durationMins,
        polyline: '', // Template path polyline would be stored in route when implemented
      });
      setAlternativeRoutes([]);
    }
  }, [selectedRoute, pathChoice]);

  // Calculate alternative routes using OSRM when user chooses alternative path
  const calculateAlternatives = useCallback(async (origin: RouteWaypoint, destination: RouteWaypoint) => {
    setIsCalculating(true);
    setAlternativeRoutes([]);
    setSelectedPathOption(0);
    
    try {
      // Request alternatives from OSRM
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=3`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const routes = data.routes.map((route: { distance: number; duration: number; geometry: { coordinates: number[][] } }) => ({
          distance: Math.round(route.distance / 1000 * 10) / 10, // km
          duration: Math.round(route.duration / 60), // minutes
          polyline: JSON.stringify(route.geometry.coordinates),
        }));
        
        setAlternativeRoutes(routes);
        setCalculatedRoute(routes[0]); // Default to fastest route
      }
    } catch (error) {
      console.error('Failed to calculate routes:', error);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Fetch alternatives when user selects "alternative" path choice
  useEffect(() => {
    if (selectedRoute && pathChoice === 'alternative') {
      const origin: RouteWaypoint = {
        lat: selectedRoute.origin.lat,
        lng: selectedRoute.origin.lon,
        name: selectedRoute.origin.name,
      };
      const destination: RouteWaypoint = {
        lat: selectedRoute.destination.lat,
        lng: selectedRoute.destination.lon,
        name: selectedRoute.destination.name,
      };
      calculateAlternatives(origin, destination);
    }
  }, [selectedRoute, pathChoice, calculateAlternatives]);

  // Update calculatedRoute when path option changes (for alternatives)
  useEffect(() => {
    if (pathChoice === 'alternative' && alternativeRoutes.length > selectedPathOption) {
      setCalculatedRoute(alternativeRoutes[selectedPathOption]);
    }
  }, [selectedPathOption, alternativeRoutes]);

  const handleAssign = () => {
    if (!selectedDriver || !selectedRoute) return;
    
    const tripRoute: TripRoute = {
      type: selectedPathOption === 0 ? 'predefined' : 'custom',
      routeTemplateId: selectedRoute.id,
      origin: {
        lat: selectedRoute.origin.lat,
        lng: selectedRoute.origin.lon,
        name: selectedRoute.origin.name,
      },
      destination: {
        lat: selectedRoute.destination.lat,
        lng: selectedRoute.destination.lon,
        name: selectedRoute.destination.name,
      },
      distance: calculatedRoute?.distance || 0,
      duration: calculatedRoute?.duration || 0,
      polyline: calculatedRoute?.polyline,
    };
    
    // Use trip.id if editing existing trip, or generate a new ID for new trips
    const tripId = trip?.id || `new-${Date.now()}`;
    
    onAssign(tripId, {
      routeType: selectedPathOption === 0 ? 'predefined' : 'custom',
      routeTemplateId: selectedRoute?.id,
      tripRoute,
      vehicleId: selectedVehicle!.id,
      vehiclePlate: selectedVehicle!.plateNumber,
      scheduledStartTime,
      scheduledEndTime,
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverPhone: selectedDriver.phone,
      turnBoyId: selectedTurnBoy?.id,
      turnBoyName: selectedTurnBoy?.name,
      turnBoyPhone: selectedTurnBoy?.phone,
    });
    
    onClose();
  };

  const isValid = selectedDriver && selectedVehicle && scheduledStartTime && scheduledEndTime && selectedRoute && calculatedRoute;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-blue-600" />
            {trip ? 'Assign Route to Trip' : 'Assign New Trip'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
          {/* Trip Info Banner - only show if editing existing trip */}
          {trip && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Trip #{trip.id}</p>
                  <p className="text-sm text-blue-700">{trip.routeName}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Vehicle: {trip.vehiclePlate}
                  </p>
                </div>
              </div>
            </div>
          )}

            {/* Route Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Route <span className="text-red-500">*</span></Label>
              <select
                value={selectedRoute?.id || ''}
                onChange={(e) => {
                  const route = MOCK_ROUTES.find(r => r.id === e.target.value);
                  setSelectedRoute(route || null);
                  setPathChoice('template'); // Reset to template when changing route
                }}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a route --</option>
                {MOCK_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.origin.name} → {route.destination.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Path Choice - Template vs Alternative */}
            {selectedRoute && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Path Selection</Label>
                
                {/* Template Path Option */}
                <label
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    pathChoice === 'template'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="pathChoice"
                      checked={pathChoice === 'template'}
                      onChange={() => setPathChoice('template')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Use Template Path</p>
                      <p className="text-xs text-gray-500">Use the predefined route path</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{selectedRoute.distance}</p>
                    <p className="text-xs text-gray-500">{selectedRoute.estimatedDuration}</p>
                  </div>
                </label>

                {/* Alternative Path Option */}
                <label
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    pathChoice === 'alternative'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="pathChoice"
                      checked={pathChoice === 'alternative'}
                      onChange={() => setPathChoice('alternative')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Choose Alternative Path</p>
                      <p className="text-xs text-gray-500">Select a different route based on conditions</p>
                    </div>
                  </div>
                </label>

                {/* Alternative Routes List */}
                {pathChoice === 'alternative' && alternativeRoutes.length > 0 && (
                  <div className="ml-7 space-y-2">
                    {alternativeRoutes.map((route, index) => (
                      <label
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPathOption === index
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="pathOption"
                            checked={selectedPathOption === index}
                            onChange={() => setSelectedPathOption(index)}
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {index === 0 ? 'Fastest Route' : `Alternative ${index}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {index === 0 ? 'Recommended' : 'Different road'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{route.distance} km</p>
                          <p className="text-xs text-gray-500">
                            {route.duration < 60 
                              ? `${route.duration} mins`
                              : `${Math.floor(route.duration / 60)}h ${route.duration % 60}m`
                            }
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {pathChoice === 'alternative' && isCalculating && (
                  <div className="ml-7 flex items-center py-3 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Finding alternative paths...</span>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Assignment */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                Select Vehicle <span className="text-red-500">*</span>
              </Label>
              <select
                value={selectedVehicle?.id || ''}
                onChange={(e) => {
                  const vehicle = activeVehicles.find(v => v.id === e.target.value);
                  setSelectedVehicle(vehicle || null);
                }}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a vehicle --</option>
                {activeVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} - {vehicle.make} {vehicle.model} ({vehicle.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Schedule
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Start Time <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    value={scheduledStartTime}
                    onChange={(e) => setScheduledStartTime(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">End Time <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    value={scheduledEndTime}
                    onChange={(e) => setScheduledEndTime(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Driver & Turn Boy Assignment */}
            <div className="grid grid-cols-2 gap-4">
              {/* Driver */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  Driver <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDriverDropdown(!showDriverDropdown)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-gray-300"
                  >
                    <span className={`text-sm truncate ${selectedDriver ? 'text-gray-900' : 'text-gray-500'}`}>
                      {selectedDriver ? selectedDriver.name : 'Select...'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {showDriverDropdown && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {activeDrivers.map((driver) => (
                        <button
                          key={driver.id}
                          type="button"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setShowDriverDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{driver.name}</p>
                            <p className="text-xs text-gray-500 truncate">{driver.phone}</p>
                          </div>
                          {selectedDriver?.id === driver.id && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Turn Boy */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  Turn Boy <span className="text-gray-400 text-xs">(Optional)</span>
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTurnBoyDropdown(!showTurnBoyDropdown)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-gray-300"
                  >
                    <span className={`text-sm truncate ${selectedTurnBoy ? 'text-gray-900' : 'text-gray-500'}`}>
                      {selectedTurnBoy ? selectedTurnBoy.name : 'Select...'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {showTurnBoyDropdown && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTurnBoy(null);
                          setShowTurnBoyDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-500"
                      >
                        No turn boy
                      </button>
                      {activeTurnBoys.map((turnBoy) => (
                        <button
                          key={turnBoy.id}
                          type="button"
                          onClick={() => {
                            setSelectedTurnBoy(turnBoy);
                            setShowTurnBoyDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{turnBoy.name}</p>
                            <p className="text-xs text-gray-500 truncate">{turnBoy.phone}</p>
                          </div>
                          {selectedTurnBoy?.id === turnBoy.id && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!isValid}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Assign Route
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
