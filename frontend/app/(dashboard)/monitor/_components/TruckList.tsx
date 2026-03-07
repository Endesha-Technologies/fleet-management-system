'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Truck,
  MapPin,
  Gauge,
  Fuel,
  Clock,
  Navigation,
  AlertTriangle,
  Package,
  Thermometer,
} from 'lucide-react';
import { getHeadingDirection, getTimeAgo, TRIP_COLORS } from '@/constants/tracking';
import type { TruckLocation } from '@/types/tracking';

interface TruckCardProps {
  truck: TruckLocation;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  tripColor: { trail: string; marker: string };
}

export function TruckCard({ truck, isSelected, isExpanded, onSelect, onToggleExpand, tripColor }: TruckCardProps) {
  // Calculate progress percentage
  const totalDistance = truck.distanceTraveled + truck.distanceRemaining;
  const progressPercent = totalDistance > 0 ? (truck.distanceTraveled / totalDistance) * 100 : 0;

  // Calculate time remaining
  const getTimeRemaining = () => {
    const etaTime = new Date(truck.eta).getTime();
    const now = Date.now();
    const diff = etaTime - now;
    if (diff <= 0) return 'Arrived';
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const statusColor = {
    'On Time': 'bg-green-100 text-green-700 border-green-200',
    'Delayed': 'bg-orange-100 text-orange-700 border-orange-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  }[truck.status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden relative ${
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-100'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Color indicator strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: tripColor.marker }}
      />
      
      {/* Header - Always visible */}
      <div
        className="p-4 pl-5 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Truck Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: isSelected ? tripColor.marker : `${tripColor.marker}20` }}
            >
              <Truck
                className="h-5 w-5"
                style={{ color: isSelected ? '#ffffff' : tripColor.marker }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 truncate">{truck.vehiclePlate}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                  {truck.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{truck.driverName}</p>
            </div>
          </div>

          {/* Speed indicator */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-gray-900">
              <Gauge className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-lg">{truck.speed}</span>
              <span className="text-xs text-gray-500">km/h</span>
            </div>
            <p className="text-xs text-gray-400">{getTimeAgo(truck.lastUpdate)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="truncate max-w-[40%]">{truck.startLocation.name}</span>
            <span className="truncate max-w-[40%] text-right">{truck.endLocation.name}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(to right, ${tripColor.trail}, ${tripColor.marker})`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-1.5">
            <span className="text-gray-500">{truck.distanceTraveled.toFixed(1)} km</span>
            <span className="text-gray-500">{truck.distanceRemaining.toFixed(1)} km left</span>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="w-full mt-3 pt-2 border-t border-gray-100 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Less details</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>More details</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 bg-gray-50">
          {/* Alerts */}
          {truck.alerts && truck.alerts.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {truck.alerts.map((alert, i) => (
                    <p key={i} className="text-sm text-red-700">{alert}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Location Details */}
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</h4>
            <div className="grid gap-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Current</p>
                  <p className="text-sm text-gray-900 truncate">{truck.currentLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" style={{ transform: `rotate(${truck.heading}deg)` }} />
                <div>
                  <p className="text-xs text-gray-500">Heading</p>
                  <p className="text-sm text-gray-900">{getHeadingDirection(truck.heading)} ({truck.heading}°)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Coordinates</p>
                  <p className="text-xs font-mono text-gray-700">
                    {truck.latitude.toFixed(6)}, {truck.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Telemetry */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Telemetry</h4>
            <div className="grid grid-cols-2 gap-3">
              {truck.fuelLevel !== undefined && (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${truck.fuelLevel < 30 ? 'bg-red-50' : 'bg-white'} border`}>
                  <Fuel className={`h-4 w-4 ${truck.fuelLevel < 30 ? 'text-red-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-xs text-gray-500">Fuel</p>
                    <p className={`text-sm font-semibold ${truck.fuelLevel < 30 ? 'text-red-600' : 'text-gray-900'}`}>
                      {truck.fuelLevel}L
                    </p>
                  </div>
                </div>
              )}
              {truck.engineTemp !== undefined && (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${truck.engineTemp > 95 ? 'bg-red-50' : 'bg-white'} border`}>
                  <Thermometer className={`h-4 w-4 ${truck.engineTemp > 95 ? 'text-red-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-xs text-gray-500">Engine</p>
                    <p className={`text-sm font-semibold ${truck.engineTemp > 95 ? 'text-red-600' : 'text-gray-900'}`}>
                      {truck.engineTemp}°C
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white border">
                <Gauge className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Avg Speed</p>
                  <p className="text-sm font-semibold text-gray-900">{truck.averageSpeed} km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white border">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">ETA</p>
                  <p className="text-sm font-semibold text-gray-900">{getTimeRemaining()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo */}
          {truck.cargoType && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cargo</h4>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Package className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{truck.cargoType}</p>
                  {truck.cargoWeight && (
                    <p className="text-xs text-gray-500">{truck.cargoWeight} tons</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TruckListProps {
  trucks: TruckLocation[];
  selectedTruckId: string | null;
  onSelectTruck: (truckId: string) => void;
}

export function TruckList({ trucks, selectedTruckId, onSelectTruck }: TruckListProps) {
  const [expandedTruckId, setExpandedTruckId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrucks = trucks.filter(truck =>
    truck.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    truck.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    truck.routeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (truckId: string) => {
    onSelectTruck(truckId);
    // Auto-expand when selected
    if (expandedTruckId !== truckId) {
      setExpandedTruckId(truckId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <input
          type="text"
          placeholder="Search trucks, drivers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Truck List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTrucks.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No trucks found</p>
          </div>
        ) : (
          filteredTrucks.map((truck, index) => (
            <TruckCard
              key={truck.tripId}
              truck={truck}
              isSelected={selectedTruckId === truck.tripId}
              isExpanded={expandedTruckId === truck.tripId}
              onSelect={() => handleSelect(truck.tripId)}
              onToggleExpand={() => setExpandedTruckId(
                expandedTruckId === truck.tripId ? null : truck.tripId
              )}
              tripColor={TRIP_COLORS[index % TRIP_COLORS.length]}
            />
          ))
        )}
      </div>
    </div>
  );
}
