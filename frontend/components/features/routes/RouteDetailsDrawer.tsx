'use client';

import { useEffect, useRef, useState } from 'react';
import { Route } from '@/types/route';
import { MapPin, Calendar, Clock, Navigation, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface RouteDetailsDrawerProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (route: Route) => void;
  onDelete?: (route: Route) => void;
}

export function RouteDetailsDrawer({ 
  route, 
  open, 
  onOpenChange,
  onEdit,
  onDelete 
}: RouteDetailsDrawerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet script once
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkEl);

    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptEl.onload = () => setLeafletLoaded(true);
    document.head.appendChild(scriptEl);
  }, []);

  // Initialize map when drawer opens, route changes, and leaflet is loaded
  useEffect(() => {
    if (!open || !route || !leafletLoaded) return;

    // Delay to ensure drawer is rendered
    const timer = setTimeout(() => {
      createMap();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open, route?.id, leafletLoaded]);

  const createMap = () => {
    if (!mapRef.current || !route || typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    // Remove existing map if any
    if (mapInstanceRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapInstanceRef.current as any).remove();
    }

    // Clear container
    mapRef.current.innerHTML = '';

    // Calculate center point between origin and destination
    const centerLat = (route.origin.lat + route.destination.lat) / 2;
    const centerLon = (route.origin.lon + route.destination.lon) / 2;

    // Create map
    const map = L.map(mapRef.current).setView([centerLat, centerLon], 7);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM'
    }).addTo(map);

    // Custom icons
    const originIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const destinationIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Add markers
    L.marker([route.origin.lat, route.origin.lon], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<strong>Origin</strong><br/>${route.origin.name}`);

    L.marker([route.destination.lat, route.destination.lon], { icon: destinationIcon })
      .addTo(map)
      .bindPopup(`<strong>Destination</strong><br/>${route.destination.name}`);

    // Fit bounds to show both markers
    const bounds = L.latLngBounds(
      [route.origin.lat, route.origin.lon],
      [route.destination.lat, route.destination.lon]
    );
    map.fitBounds(bounds, { padding: [30, 30] });

    // Fetch and draw route from OSRM
    fetchAndDrawRoute(map, L);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchAndDrawRoute = async (map: any, L: any) => {
    if (!route) return;
    
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${route.origin.lon},${route.origin.lat};${route.destination.lon},${route.destination.lat}?overview=full&geometries=geojson`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          const coordinates = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );
          
          L.polyline(coordinates, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
          }).addTo(map);
        }
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
      // Fall back to straight line
      L.polyline([
        [route.origin.lat, route.origin.lon],
        [route.destination.lat, route.destination.lon]
      ], {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
      }).addTo(map);
    }
  };

  if (!route) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">{route.name}</SheetTitle>
              <SheetDescription className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${route.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    route.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                    route.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {route.status}
                </span>
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <Button 
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => onEdit?.(route)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => onDelete?.(route)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Map */}
          <div 
            ref={mapRef} 
            className="w-full h-48 rounded-lg border border-gray-200 bg-gray-100"
          />

          {/* Route Info */}
          <div className="grid gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">Origin</p>
                <p className="text-sm text-gray-900">{route.origin.name}</p>
                <p className="text-xs text-gray-400">{route.origin.lat.toFixed(4)}, {route.origin.lon.toFixed(4)}</p>
              </div>
            </div>

            <div className="ml-3 border-l-2 border-dashed border-gray-300 h-4" />

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">Destination</p>
                <p className="text-sm text-gray-900">{route.destination.name}</p>
                <p className="text-xs text-gray-400">{route.destination.lat.toFixed(4)}, {route.destination.lon.toFixed(4)}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Navigation className="h-3 w-3 text-blue-500" />
                <p className="text-xs font-medium text-gray-500">Distance</p>
              </div>
              <p className="text-base font-semibold">{route.distance}</p>
            </div>
            
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <p className="text-xs font-medium text-gray-500">Duration</p>
              </div>
              <p className="text-base font-semibold">{route.estimatedDuration}</p>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <p className="text-xs font-medium text-gray-500">Deviation</p>
              </div>
              <p className="text-base font-semibold">{route.deviationThreshold}m</p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Created on {new Date(route.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
