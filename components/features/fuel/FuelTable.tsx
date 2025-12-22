'use client';

import { useState, useMemo } from 'react';
import { FuelLog } from '@/types/fuel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronDown, Filter, X } from 'lucide-react';

interface FuelTableProps {
  logs: FuelLog[];
}

type DateFilterOption = 'all' | 'today' | 'yesterday' | 'thisMonth' | 'lastMonth' | 'custom';

export default function FuelTable({ logs }: FuelTableProps) {
  const [tripFilter, setTripFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);

  // Get unique trips for filter
  const uniqueTrips = useMemo(() => {
    const trips = logs
      .filter(log => log.tripId)
      .map(log => ({ id: log.tripId!, name: log.tripName || `Trip ${log.tripId}` }));
    
    const uniqueMap = new Map();
    trips.forEach(trip => {
      if (!uniqueMap.has(trip.id)) {
        uniqueMap.set(trip.id, trip);
      }
    });
    
    return Array.from(uniqueMap.values());
  }, [logs]);

  // Filter logs based on selected filters
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Trip filter
    if (tripFilter !== 'all') {
      filtered = filtered.filter(log => log.tripId === tripFilter);
    }

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    filtered = filtered.filter(log => {
      const logDate = new Date(log.date);
      
      switch (dateFilter) {
        case 'today':
          return logDate >= today;
        case 'yesterday':
          return logDate >= yesterday && logDate < today;
        case 'thisMonth':
          return logDate >= thisMonthStart;
        case 'lastMonth':
          return logDate >= lastMonthStart && logDate <= lastMonthEnd;
        case 'custom':
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59);
            return logDate >= start && logDate <= end;
          }
          return true;
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, tripFilter, dateFilter, customStartDate, customEndDate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const formatLiters = (liters?: number) => {
    if (liters === undefined) return '-';
    return `${liters.toFixed(1)}L`;
  };

  const clearFilters = () => {
    setTripFilter('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const hasActiveFilters = tripFilter !== 'all' || dateFilter !== 'all';

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'custom': return customStartDate && customEndDate 
        ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
        : 'Custom Range';
      default: return 'All Dates';
    }
  };

  const getTripFilterLabel = () => {
    if (tripFilter === 'all') return 'All Trips';
    const trip = uniqueTrips.find(t => t.id === tripFilter);
    return trip?.name || 'Unknown Trip';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="space-y-3">
          {/* Filter Header - Mobile */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Filters Row - Desktop */}
          <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filters:
            </div>

            {/* Date Filter - Desktop */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowTripDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-white whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                {getDateFilterLabel()}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showDateDropdown && (
                <div className="absolute top-full mt-1 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[280px]">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setDateFilter('all');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'all' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      All Dates
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('today');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'today' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('yesterday');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'yesterday' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('thisMonth');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'thisMonth' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('lastMonth');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'lastMonth' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      Last Month
                    </button>
                    
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <div className="px-3 py-1 text-xs font-medium text-gray-500">Custom Range</div>
                      <div className="px-3 py-2 space-y-2">
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="text-sm"
                          placeholder="Start date"
                        />
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="text-sm"
                          placeholder="End date"
                        />
                        <Button
                          onClick={() => {
                            if (customStartDate && customEndDate) {
                              setDateFilter('custom');
                              setShowDateDropdown(false);
                            }
                          }}
                          disabled={!customStartDate || !customEndDate}
                          className="w-full"
                          size="sm"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trip Filter - Desktop */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTripDropdown(!showTripDropdown);
                  setShowDateDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-white whitespace-nowrap"
              >
                {getTripFilterLabel()}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showTripDropdown && (
                <div className="absolute top-full mt-1 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[250px] max-h-[300px] overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setTripFilter('all');
                        setShowTripDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        tripFilter === 'all' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      All Trips
                    </button>
                    {uniqueTrips.map(trip => (
                      <button
                        key={trip.id}
                        onClick={() => {
                          setTripFilter(trip.id);
                          setShowTripDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          tripFilter === trip.id ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {trip.name}
                      </button>
                    ))}
                    {uniqueTrips.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No trips found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters - Desktop */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}

            {/* Results Count - Desktop */}
            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredLogs.length} of {logs.length} logs
            </div>
          </div>

          {/* Mobile Filter Buttons */}
          <div className="grid grid-cols-1 gap-2 md:hidden">
            {/* Date Filter - Mobile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowTripDropdown(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{getDateFilterLabel()}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showDateDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setDateFilter('all');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'all' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      All Dates
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('today');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'today' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('yesterday');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'yesterday' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('thisMonth');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'thisMonth' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => {
                        setDateFilter('lastMonth');
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        dateFilter === 'lastMonth' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      Last Month
                    </button>
                    
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <div className="px-3 py-1 text-xs font-medium text-gray-500">Custom Range</div>
                      <div className="px-3 py-2 space-y-2">
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="text-sm"
                          placeholder="Start date"
                        />
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="text-sm"
                          placeholder="End date"
                        />
                        <Button
                          onClick={() => {
                            if (customStartDate && customEndDate) {
                              setDateFilter('custom');
                              setShowDateDropdown(false);
                            }
                          }}
                          disabled={!customStartDate || !customEndDate}
                          className="w-full"
                          size="sm"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trip Filter - Mobile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTripDropdown(!showTripDropdown);
                  setShowDateDropdown(false);
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
              >
                <span className="text-gray-900">{getTripFilterLabel()}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showTripDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setTripFilter('all');
                        setShowTripDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        tripFilter === 'all' ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      All Trips
                    </button>
                    {uniqueTrips.map(trip => (
                      <button
                        key={trip.id}
                        onClick={() => {
                          setTripFilter(trip.id);
                          setShowTripDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          tripFilter === trip.id ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {trip.name}
                      </button>
                    ))}
                    {uniqueTrips.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No trips found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Count - Mobile */}
          <div className="md:hidden text-xs text-gray-600 pt-1 border-t border-gray-100">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No fuel logs found matching the selected filters.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <div className="font-semibold text-gray-900">{log.vehiclePlate}</div>
                  <div className="text-sm text-gray-600">{log.driverName}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(log.date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(log.totalCost)}</div>
                  <div className="text-xs text-gray-500">{log.fuelType}</div>
                </div>
              </div>

              {/* Trip Info */}
              {log.tripName && (
                <div className="flex items-center justify-between py-2 bg-blue-50 rounded px-3">
                  <span className="text-xs font-medium text-blue-700">Trip</span>
                  <span className="text-sm text-blue-900">{log.tripName}</span>
                </div>
              )}

              {/* Fuel Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500 mb-1">Fuel Start</div>
                  <div className="text-sm font-semibold text-gray-900">{formatLiters(log.fuelStart)}</div>
                </div>
                <div className="bg-red-50 rounded p-2">
                  <div className="text-xs text-red-600 mb-1">Fuel Used</div>
                  <div className="text-sm font-semibold text-red-700">{formatLiters(log.fuelUsed)}</div>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <div className="text-xs text-green-600 mb-1">Fuel End</div>
                  <div className="text-sm font-semibold text-green-700">{formatLiters(log.fuelEnd)}</div>
                </div>
                <div className="bg-blue-50 rounded p-2">
                  <div className="text-xs text-blue-600 mb-1">Purchased</div>
                  <div className="text-sm font-semibold text-blue-700">{formatLiters(log.litersPurchased)}</div>
                </div>
              </div>

              {/* Station Info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500">Station</div>
                  <div className="text-sm font-medium text-gray-900">{log.fuelStation}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="text-sm text-gray-700">{log.location}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Truck
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Trip
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Fuel Start
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Fuel Used
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Fuel End
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Purchased
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Station
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No fuel logs found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(log.date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{log.vehiclePlate}</div>
                      <div className="text-xs text-gray-500">{log.fuelType}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.driverName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.tripName || (log.tripId ? `Trip ${log.tripId}` : '-')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatLiters(log.fuelStart)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                      {formatLiters(log.fuelUsed)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                      {formatLiters(log.fuelEnd)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                      {formatLiters(log.litersPurchased)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(log.totalCost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{log.fuelStation}</div>
                      <div className="text-xs text-gray-500">{log.location}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {filteredLogs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Purchased</div>
              <div className="text-lg font-bold text-gray-900">
                {formatLiters(filteredLogs.reduce((sum, log) => sum + log.litersPurchased, 0))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Used</div>
              <div className="text-lg font-bold text-gray-900">
                {formatLiters(filteredLogs.reduce((sum, log) => sum + (log.fuelUsed || 0), 0))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Cost</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(filteredLogs.reduce((sum, log) => sum + log.totalCost, 0))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Price/Liter</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(Math.round(filteredLogs.reduce((sum, log) => sum + log.pricePerLiter, 0) / filteredLogs.length))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
