'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK_TRUCK_LOCATIONS, getHeadingDirection, getTimeAgo } from '@/constants/tracking';
import { Truck, Clock, Fuel, Navigation as NavigationIcon, MapPin, Calendar, Gauge, Package, AlertTriangle, Thermometer, TrendingUp, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TruckLocation } from '../_types';
import type { TrackingMapProps, TruckDetailsProps } from '../_types';

// Define color constants - Blue theme for GPS tracking
const COLORS = {
  truckActive: '#3b82f6',      // Blue - active truck marker
  truckSelected: '#1d4ed8',    // Darker blue - selected truck
  gpsTrail: '#3b82f6',         // Blue - GPS trail polyline
  gpsTrailSelected: '#1d4ed8', // Darker blue - selected GPS trail
  startPoint: '#10b981',       // Emerald - start point
  truckBorder: '#1e40af',      // Dark blue border
} as const;

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
          // Simulate GPS movement based on speed and heading
          const speedKmPerHour = truck.speed + (Math.random() - 0.5) * 10; // Add some variance
          const speedKmPerSecond = speedKmPerHour / 3600;
          const distanceKm = speedKmPerSecond * (updateIntervalMs / 1000);
          
          // Convert heading to radians (0 = North, 90 = East)
          const headingRad = (truck.heading * Math.PI) / 180;
          
          // Calculate new position (approximate, 1 degree ≈ 111km)
          const latChange = (distanceKm / 111) * Math.cos(headingRad);
          const lngChange = (distanceKm / 111) * Math.sin(headingRad);
          
          const newLat = truck.latitude + latChange;
          const newLng = truck.longitude + lngChange;
          
          // Add slight heading variation
          const newHeading = (truck.heading + (Math.random() - 0.5) * 5 + 360) % 360;
          
          // Update speed with variance
          const newSpeed = Math.max(40, Math.min(90, truck.speed + (Math.random() - 0.5) * 15));
          
          // Add new waypoint
          const newWaypoint = {
            lat: newLat,
            lng: newLng,
            timestamp: new Date().toISOString(),
          };
          
          // Update distance traveled
          const newDistanceTraveled = truck.distanceTraveled + distanceKm;
          const newDistanceRemaining = Math.max(0, truck.distanceRemaining - distanceKm);
          
          // Update fuel level (slight decrease)
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

// Create custom truck icon with rotation
function createTruckIconHtml(heading: number, isSelected: boolean): string {
  const color = isSelected ? COLORS.truckSelected : COLORS.truckActive;
  const size = isSelected ? 46 : 38;
  const iconSize = isSelected ? 22 : 18;
  
  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 3px solid ${COLORS.truckBorder};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
      transform: rotate(${heading}deg);
    ">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#dbeafe" stroke="#dbeafe" stroke-width="2">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.579l-1.5-4.5A1 1 0 0 0 16.382 7H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>
  `;
}

function TrackingMap({ trucks, selectedTruck, onTruckSelect }: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const gpsTrailRef = useRef<Map<string, L.Polyline>>(new Map());
  const startMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const initialBoundsSetRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  // Store onTruckSelect in a ref to avoid dependency issues
  const onTruckSelectRef = useRef(onTruckSelect);
  onTruckSelectRef.current = onTruckSelect;

  // Store trucks in ref for initial center calculation
  const trucksRef = useRef(trucks);
  trucksRef.current = trucks;

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      try {
        // Dynamically load Leaflet
        const L = await import('leaflet');
        leafletRef.current = L;

        // Load CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Wait for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!mapContainerRef.current) return;

        // Calculate initial center from current trucks
        const currentTrucks = trucksRef.current;
        const center: [number, number] = currentTrucks.length > 0
          ? [
              currentTrucks.reduce((sum, t) => sum + t.latitude, 0) / currentTrucks.length,
              currentTrucks.reduce((sum, t) => sum + t.longitude, 0) / currentTrucks.length,
            ]
          : [1.3733, 32.2903]; // Uganda center

        const map = L.map(mapContainerRef.current, {
          center,
          zoom: 7,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapRef.current = map;
        setMapReady(true);
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
        gpsTrailRef.current.clear();
        startMarkersRef.current.clear();
      }
    };
  }, []); // Empty dependency array - initialize only once

  // Update markers and polylines when trucks or selection changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const map = mapRef.current;

    // Collect all coordinates for bounds calculation
    const allCoordinates: [number, number][] = [];

    // Update each truck
    trucks.forEach((truck) => {
      const isSelected = selectedTruck?.tripId === truck.tripId;
      const trailColor = isSelected ? COLORS.gpsTrailSelected : COLORS.gpsTrail;

      // GPS trail from recorded waypoints
      const gpsTrail: [number, number][] = truck.routeWaypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
      
      // Add to bounds calculation
      allCoordinates.push(...gpsTrail);
      allCoordinates.push([truck.latitude, truck.longitude]);

      // Update or create GPS trail polyline
      const existingTrail = gpsTrailRef.current.get(truck.tripId);
      if (existingTrail) {
        existingTrail.setLatLngs(gpsTrail);
        existingTrail.setStyle({
          color: trailColor,
          weight: isSelected ? 5 : 4,
          opacity: isSelected ? 1 : 0.8,
        });
      } else {
        const trail = L.polyline(gpsTrail, {
          color: trailColor,
          weight: 4,
          opacity: 0.8,
        }).addTo(map);
        gpsTrailRef.current.set(truck.tripId, trail);
      }

      // Update or create start marker (small circle at trip origin)
      const existingStartMarker = startMarkersRef.current.get(truck.tripId);
      if (existingStartMarker) {
        existingStartMarker.setLatLng([truck.startLocation.lat, truck.startLocation.lng]);
      } else {
        const startIcon = L.divIcon({
          html: `<div style="
            width: 14px;
            height: 14px;
            background: ${COLORS.startPoint};
            border: 3px solid #065f46;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(16, 185, 129, 0.5);
          "></div>`,
          className: 'start-marker',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const startMarker = L.marker([truck.startLocation.lat, truck.startLocation.lng], { icon: startIcon }).addTo(map);
        startMarkersRef.current.set(truck.tripId, startMarker);
      }

      // Update or create truck marker (current GPS position)
      const existingMarker = markersRef.current.get(truck.tripId);
      const truckIcon = L.divIcon({
        html: createTruckIconHtml(truck.heading, isSelected),
        className: 'truck-marker',
        iconSize: [isSelected ? 46 : 38, isSelected ? 46 : 38],
        iconAnchor: [isSelected ? 23 : 19, isSelected ? 23 : 19],
      });

      if (existingMarker) {
        existingMarker.setLatLng([truck.latitude, truck.longitude]);
        existingMarker.setIcon(truckIcon);
      } else {
        const marker = L.marker([truck.latitude, truck.longitude], { icon: truckIcon }).addTo(map);
        marker.on('click', () => onTruckSelectRef.current(truck));
        markersRef.current.set(truck.tripId, marker);
      }
    });

    // Remove markers for trucks that no longer exist
    const currentTruckIds = new Set(trucks.map(t => t.tripId));
    markersRef.current.forEach((marker, tripId) => {
      if (!currentTruckIds.has(tripId)) {
        marker.remove();
        markersRef.current.delete(tripId);
      }
    });
    gpsTrailRef.current.forEach((trail, tripId) => {
      if (!currentTruckIds.has(tripId)) {
        trail.remove();
        gpsTrailRef.current.delete(tripId);
      }
    });
    startMarkersRef.current.forEach((marker, tripId) => {
      if (!currentTruckIds.has(tripId)) {
        marker.remove();
        startMarkersRef.current.delete(tripId);
      }
    });

    // Fit bounds to show all routes on initial load
    if (!initialBoundsSetRef.current && allCoordinates.length > 0) {
      const bounds = L.latLngBounds(allCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      initialBoundsSetRef.current = true;
    }
  }, [trucks, selectedTruck, mapReady]);

  // Center on selected truck
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedTruck) return;
    mapRef.current.setView([selectedTruck.latitude, selectedTruck.longitude], 10, { animate: true });
  }, [selectedTruck, mapReady]);

  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}>
      {!mapReady && (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TruckDetails({ truck, onClose }: TruckDetailsProps) {
  // Use state to keep the reference time stable during render cycle and pure
  const [now] = React.useState(Date.now());

  // Calculate time remaining
  const timeRemaining = () => {
    const etaTime = new Date(truck.eta).getTime();
    const diff = etaTime - now;
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Truck className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h3 className="font-semibold text-xl">{truck.vehiclePlate}</h3>
            <p className="text-sm text-gray-500">{truck.driverName} • {truck.driverPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            truck.status === 'On Time' ? 'bg-green-100 text-green-800' : 
            truck.status === 'Delayed' ? 'bg-orange-100 text-orange-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {truck.status}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {truck.alerts && truck.alerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 mb-2">Active Alerts</p>
              <div className="space-y-1">
                {truck.alerts.map((alert, index) => (
                  <div key={index} className="text-sm text-red-600">• {alert}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Location, Route & Distance */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Location & Progress</h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Route</p>
                <p className="text-sm font-medium">{truck.routeName}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Current Location</p>
                <p className="text-sm font-medium">{truck.currentLocation}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <NavigationIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">GPS Coordinates</p>
                <p className="text-xs font-mono text-gray-700">
                  {truck.latitude.toFixed(6)}, {truck.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Distance & Progress */}
          <div className="pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Traveled</p>
                <p className="text-xl font-bold text-blue-600">{truck.distanceTraveled} km</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Remaining</p>
                <p className="text-xl font-bold text-orange-600">{truck.distanceRemaining} km</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Time to ETA:</span>
              <span className="font-semibold">{timeRemaining()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Driver Hours:</span>
              <span className="font-semibold">{truck.driverHours}h today</span>
            </div>
          </div>

          {/* Cargo Info */}
          {truck.cargoType && (
            <div className="pt-4 border-t">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Cargo</p>
                    <p className="text-sm font-semibold text-gray-900">{truck.cargoType}</p>
                    {truck.cargoWeight && (
                      <p className="text-lg font-bold text-gray-700 mt-1">{truck.cargoWeight} tons</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Telemetry & Schedule */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Vehicle & Schedule</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Gauge className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Speed</p>
                <p className="text-sm font-medium">{truck.speed} km/h</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Avg Speed</p>
                <p className="text-sm font-medium">{truck.averageSpeed} km/h</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <NavigationIcon className="h-4 w-4 text-gray-500 mt-0.5" style={{ transform: `rotate(${truck.heading}deg)` }} />
              <div>
                <p className="text-xs text-gray-500">Heading</p>
                <p className="text-sm font-medium">{getHeadingDirection(truck.heading)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Updated</p>
                <p className="text-sm font-medium">{getTimeAgo(truck.lastUpdate)}</p>
              </div>
            </div>
          </div>

          {/* Fuel & Engine */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-3">
              {truck.fuelLevel !== undefined && (
                <div className="flex items-start gap-2">
                  <Fuel className={`h-4 w-4 mt-0.5 ${truck.fuelLevel < 30 ? 'text-red-500' : 'text-gray-500'}`} />
                  <div>
                    <p className="text-xs text-gray-500">Fuel</p>
                    <p className={`text-sm font-medium ${truck.fuelLevel < 30 ? 'text-red-600 font-semibold' : ''}`}>
                      {truck.fuelLevel}L
                    </p>
                  </div>
                </div>
              )}
              
              {truck.fuelConsumption && (
                <div className="flex items-start gap-2">
                  <Fuel className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Rate</p>
                    <p className="text-sm font-medium">{truck.fuelConsumption} L/100km</p>
                  </div>
                </div>
              )}
              
              {truck.engineTemp !== undefined && (
                <div className="flex items-start gap-2">
                  <Thermometer className={`h-4 w-4 mt-0.5 ${truck.engineTemp > 95 ? 'text-red-500' : 'text-gray-500'}`} />
                  <div>
                    <p className="text-xs text-gray-500">Engine</p>
                    <p className={`text-sm font-medium ${truck.engineTemp > 95 ? 'text-red-600 font-semibold' : ''}`}>
                      {truck.engineTemp}°C
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <Gauge className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Odometer</p>
                  <p className="text-sm font-medium">{truck.odometer.toLocaleString()} km</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Trip Started</p>
                <p className="text-sm font-medium">
                  {new Date(truck.startTime).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Estimated Arrival</p>
                <p className="text-sm font-medium">
                  {new Date(truck.eta).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FleetTrackingPage() {
  const [selectedTruck, setSelectedTruck] = useState<TruckLocation | null>(null);

  // Use live GPS simulation hook
  const { trucks: movingTrucks, isLive, setIsLive } = useLiveGpsSimulation(MOCK_TRUCK_LOCATIONS, 3000);

  // Keep selected truck in sync with updated data
  const selectedTruckData = selectedTruck 
    ? movingTrucks.find(t => t.tripId === selectedTruck.tripId) || null
    : null;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fleet Tracking</h1>
            <p className="text-sm text-gray-500">Real-time locations of moving trucks</p>
          </div>
          <div className="flex items-center gap-6">
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
              {isLive ? 'Live' : 'Paused'}
            </button>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{movingTrucks.length}</p>
              <p className="text-xs text-gray-500">Moving Trucks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Details */}
      <div className="flex-1 relative">
        <TrackingMap 
          trucks={movingTrucks}
          selectedTruck={selectedTruckData}
          onTruckSelect={setSelectedTruck}
        />
        
        {/* Truck Details Panel */}
        {selectedTruckData && (
          <div className="absolute top-4 right-4 z-[1000]">
            <TruckDetails truck={selectedTruckData} onClose={() => setSelectedTruck(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
