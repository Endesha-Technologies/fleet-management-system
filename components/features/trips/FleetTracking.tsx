'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TruckLocation } from '@/types/tracking';
import { MOCK_TRUCK_LOCATIONS, getHeadingDirection, getTimeAgo } from '@/constants/tracking';
import { Truck, Clock, Fuel, Navigation as NavigationIcon, Phone, MapPin, Calendar, Gauge, Package, AlertTriangle, Thermometer, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Create custom truck icon with rotation
function createTruckIcon(heading: number, isSelected: boolean) {
  const color = isSelected ? '#2563eb' : '#16a34a';
  const size = isSelected ? 40 : 32;
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(${heading}deg);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.579l-1.5-4.5A1 1 0 0 0 16.382 7H14"/>
          <circle cx="17" cy="18" r="2"/>
          <circle cx="7" cy="18" r="2"/>
        </svg>
      </div>
    `,
    className: 'truck-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

function TrackingMap({ 
  trucks, 
  selectedTruck, 
  onTruckSelect 
}: { 
  trucks: TruckLocation[]; 
  selectedTruck: TruckLocation | null; 
  onTruckSelect: (truck: TruckLocation) => void;
}) {
  // Calculate center of all trucks or default to Uganda center
  const center: [number, number] = trucks.length > 0
    ? [
        trucks.reduce((sum, t) => sum + t.latitude, 0) / trucks.length,
        trucks.reduce((sum, t) => sum + t.longitude, 0) / trucks.length,
      ]
    : [1.3733, 32.2903]; // Uganda center

  return (
    <MapContainer
      key="fleet-tracking-map"
      center={center}
      zoom={7}
      style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} />

      {trucks.map((truck) => {
        // Prepare route coordinates: start → waypoints → end
        const routeCoordinates: [number, number][] = [
          [truck.startLocation.lat, truck.startLocation.lng],
          ...truck.routeWaypoints.map(wp => [wp.lat, wp.lng] as [number, number]),
          [truck.endLocation.lat, truck.endLocation.lng],
        ];

        return (
          <React.Fragment key={truck.tripId}>
            {/* Route polyline - dotted line showing the path */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: selectedTruck?.tripId === truck.tripId ? '#2563eb' : '#16a34a',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10',
              }}
            />

            {/* Start marker */}
            <Marker
              position={[truck.startLocation.lat, truck.startLocation.lng]}
              icon={L.divIcon({
                html: `<div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">Start: ${truck.startLocation.name}</div>`,
                className: 'custom-marker',
                iconAnchor: [0, 0],
              })}
            />

            {/* End marker */}
            <Marker
              position={[truck.endLocation.lat, truck.endLocation.lng]}
              icon={L.divIcon({
                html: `<div style="background: #f97316; color: #1f2937; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">End: ${truck.endLocation.name}</div>`,
                className: 'custom-marker',
                iconAnchor: [0, 0],
              })}
            />

            {/* Truck current position marker */}
            <Marker
              position={[truck.latitude, truck.longitude]}
              icon={createTruckIcon(truck.heading, selectedTruck?.tripId === truck.tripId)}
              eventHandlers={{
                click: () => onTruckSelect(truck),
              }}
            />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}

interface TruckDetailsProps {
  truck: TruckLocation;
  onClose: () => void;
}

function TruckDetails({ truck, onClose }: TruckDetailsProps) {
  // Calculate time remaining
  const timeRemaining = () => {
    const now = Date.now();
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

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fleet Tracking</h1>
            <p className="text-sm text-gray-500">Real-time truck locations and telemetry</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{MOCK_TRUCK_LOCATIONS.length}</p>
              <p className="text-xs text-gray-500">Active Trucks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Details */}
      <div className="flex-1 relative">
        <TrackingMap 
          trucks={MOCK_TRUCK_LOCATIONS}
          selectedTruck={selectedTruck}
          onTruckSelect={setSelectedTruck}
        />
        
        {/* Truck Details Panel */}
        {selectedTruck && (
          <div className="absolute top-4 right-4 z-[1000]">
            <TruckDetails truck={selectedTruck} onClose={() => setSelectedTruck(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
