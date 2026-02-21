'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getHeadingDirection, getTimeAgo } from '@/constants/tracking';
import 'leaflet/dist/leaflet.css';
import type { TruckLocation, TrackingMapProps, MapUpdaterProps } from '../_types';

// Fix default marker icon issue in Next.js
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

function MapUpdater({ center }: MapUpdaterProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function TrackingMap({ trucks, selectedTruck, onTruckSelect }: TrackingMapProps) {
  // Calculate center of all trucks or default to Kenya center
  const center: [number, number] = trucks.length > 0
    ? [
        trucks.reduce((sum, t) => sum + t.latitude, 0) / trucks.length,
        trucks.reduce((sum, t) => sum + t.longitude, 0) / trucks.length,
      ]
    : [-0.0236, 37.9062]; // Kenya center

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} />

      {trucks.map((truck) => (
        <Marker
          key={truck.tripId}
          position={[truck.latitude, truck.longitude]}
          icon={createTruckIcon(truck.heading, selectedTruck?.tripId === truck.tripId)}
          eventHandlers={{
            click: () => onTruckSelect(truck),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <div className="font-semibold text-base mb-1">{truck.vehiclePlate}</div>
              <div className="text-sm text-gray-600 mb-2">{truck.driverName}</div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Speed:</span>
                  <span className="font-medium">{truck.speed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Heading:</span>
                  <span className="font-medium">{getHeadingDirection(truck.heading)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated:</span>
                  <span className="font-medium">{getTimeAgo(truck.lastUpdate)}</span>
                </div>
                {truck.fuelLevel !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fuel:</span>
                    <span className="font-medium">{truck.fuelLevel}L</span>
                  </div>
                )}
              </div>
              
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-gray-500">Route</div>
                <div className="text-sm font-medium">{truck.routeName}</div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
