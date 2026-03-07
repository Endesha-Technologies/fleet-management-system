'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Radio, Truck, Map, List, X } from 'lucide-react';
import { TruckList } from './_components/TruckList';
import { MOCK_TRUCK_LOCATIONS } from '@/constants/tracking';
import type { TruckLocation } from '@/types/tracking';

// Dynamically import map to avoid SSR issues with Leaflet
const MonitorMap = dynamic(
  () => import('./_components/MonitorMap').then(mod => ({ default: mod.MonitorMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-500">Loading map...</span>
        </div>
      </div>
    ),
  }
);

// Hook to simulate live GPS updates
function useLiveGpsSimulation(initialTrucks: TruckLocation[], updateIntervalMs: number = 3000) {
  const [trucks, setTrucks] = useState<TruckLocation[]>(() =>
    initialTrucks.filter(t => t.speed > 0).map(t => ({ ...t }))
  );
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTrucks(prevTrucks =>
        prevTrucks.map(truck => {
          const speedKmPerHour = truck.speed + (Math.random() - 0.5) * 10;
          const speedKmPerSecond = speedKmPerHour / 3600;
          const distanceKm = speedKmPerSecond * (updateIntervalMs / 1000);

          const headingRad = (truck.heading * Math.PI) / 180;
          const latChange = (distanceKm / 111) * Math.cos(headingRad);
          const lngChange = (distanceKm / 111) * Math.sin(headingRad);

          const newLat = truck.latitude + latChange;
          const newLng = truck.longitude + lngChange;
          const newHeading = (truck.heading + (Math.random() - 0.5) * 5 + 360) % 360;
          const newSpeed = Math.max(40, Math.min(90, truck.speed + (Math.random() - 0.5) * 15));

          const newWaypoint = {
            lat: newLat,
            lng: newLng,
            timestamp: new Date().toISOString(),
          };

          const newDistanceTraveled = truck.distanceTraveled + distanceKm;
          const newDistanceRemaining = Math.max(0, truck.distanceRemaining - distanceKm);

          const fuelUsed = (distanceKm * (truck.fuelConsumption || 20)) / 100;
          const newFuelLevel = truck.fuelLevel ? Math.max(0, truck.fuelLevel - fuelUsed) : undefined;

          return {
            ...truck,
            latitude: newLat,
            longitude: newLng,
            heading: Math.round(newHeading),
            speed: Math.round(newSpeed),
            lastUpdate: new Date().toISOString(),
            routeWaypoints: [...truck.routeWaypoints, newWaypoint],
            distanceTraveled: Math.round(newDistanceTraveled * 10) / 10,
            distanceRemaining: Math.round(newDistanceRemaining * 10) / 10,
            fuelLevel: newFuelLevel ? Math.round(newFuelLevel * 10) / 10 : undefined,
            odometer: truck.odometer + Math.round(distanceKm * 10) / 10,
          };
        })
      );
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [isLive, updateIntervalMs]);

  return { trucks, isLive, setIsLive };
}

export default function MonitorPage() {
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  const { trucks, isLive, setIsLive } = useLiveGpsSimulation(MOCK_TRUCK_LOCATIONS, 3000);

  // Get selected truck data
  const selectedTruck = selectedTruckId ? trucks.find(t => t.tripId === selectedTruckId) : null;

  // Stats
  const onTimeCount = trucks.filter(t => t.status === 'On Time').length;
  const delayedCount = trucks.filter(t => t.status === 'Delayed').length;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 -m-4 md:-m-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Fleet Monitor</h1>
            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Real-time GPS tracking</p>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile view toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 md:hidden">
              <button
                onClick={() => setMobileView('map')}
                className={`p-2 rounded-md transition-colors ${
                  mobileView === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
              >
                <Map className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileView('list')}
                className={`p-2 rounded-md transition-colors ${
                  mobileView === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Live indicator */}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isLive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Radio className={`h-4 w-4 ${isLive ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isLive ? 'Live' : 'Paused'}</span>
            </button>

            {/* Stats badges */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">{trucks.length}</span>
                <span className="text-xs text-blue-600">Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                <span className="text-sm font-semibold text-green-700">{onTimeCount}</span>
                <span className="text-xs text-green-600">On Time</span>
              </div>
              {delayedCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
                  <span className="text-sm font-semibold text-orange-700">{delayedCount}</span>
                  <span className="text-xs text-orange-600">Delayed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Two-column layout */}
        <div className="hidden md:flex flex-1">
          {/* Map - Left column (larger) */}
          <div className="flex-1 p-4 pr-2">
            <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <MonitorMap
                trucks={trucks}
                selectedTruckId={selectedTruckId}
                onTruckSelect={setSelectedTruckId}
              />
            </div>
          </div>

          {/* Truck List - Right column */}
          <div className="w-[480px] xl:w-[520px] p-4 pl-2">
            <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Active Trips</h2>
                <p className="text-xs text-gray-500">{trucks.length} trucks on the road</p>
              </div>
              <TruckList
                trucks={trucks}
                selectedTruckId={selectedTruckId}
                onSelectTruck={setSelectedTruckId}
              />
            </div>
          </div>
        </div>

        {/* Mobile: Toggle between map and list */}
        <div className="flex-1 md:hidden relative">
          {/* Map View */}
          <div className={`absolute inset-0 ${mobileView === 'map' ? 'block' : 'hidden'}`}>
            <MonitorMap
              trucks={trucks}
              selectedTruckId={selectedTruckId}
              onTruckSelect={(truckId) => {
                setSelectedTruckId(truckId);
                setShowMobilePanel(true);
              }}
            />

            {/* Floating stats on mobile map */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-semibold text-gray-700">{trucks.length} active</span>
              </div>
            </div>

            {/* Mobile truck panel (slide-up) */}
            {showMobilePanel && selectedTruck && (
              <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 max-h-[60vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedTruck.vehiclePlate}</h3>
                      <p className="text-sm text-gray-500">{selectedTruck.driverName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowMobilePanel(false);
                      setSelectedTruckId(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-4">
                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Speed</p>
                      <p className="text-lg font-bold text-gray-900">{selectedTruck.speed} km/h</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="text-lg font-bold text-gray-900">{selectedTruck.distanceRemaining.toFixed(0)} km</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Fuel</p>
                      <p className="text-lg font-bold text-gray-900">{selectedTruck.fuelLevel || '—'}L</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="truncate max-w-[40%]">{selectedTruck.startLocation.name}</span>
                      <span className="truncate max-w-[40%] text-right">{selectedTruck.endLocation.name}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(selectedTruck.distanceTraveled / (selectedTruck.distanceTraveled + selectedTruck.distanceRemaining)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* List View */}
          <div className={`absolute inset-0 bg-gray-50 ${mobileView === 'list' ? 'block' : 'hidden'}`}>
            <TruckList
              trucks={trucks}
              selectedTruckId={selectedTruckId}
              onSelectTruck={(truckId) => {
                setSelectedTruckId(truckId);
                setMobileView('map');
                setShowMobilePanel(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
