'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronDown, Filter, Fuel, X } from 'lucide-react';
import type { FuelLog } from '@/types/fuel';
import type { FuelTableProps, DateFilterOption } from '../_types';

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number) {
  return `UGX ${amount.toLocaleString()}`;
}

function formatLiters(liters?: number) {
  if (liters === undefined) return '-';
  return `${liters.toFixed(1)}L`;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns: ColumnDef<FuelLog>[] = [
  {
    id: 'date',
    header: 'Date & Time',
    accessorKey: 'date',
    sortable: true,
    cell: (row) => (
      <span className="text-sm text-gray-900 whitespace-nowrap">
        {formatDate(row.date)}
      </span>
    ),
  },
  {
    id: 'truck',
    header: 'Truck',
    accessorKey: 'vehiclePlate',
    cell: (row) => (
      <div>
        <div className="font-medium text-gray-900">{row.vehiclePlate}</div>
        <div className="text-xs text-gray-500">{row.fuelType}</div>
      </div>
    ),
  },
  {
    id: 'driver',
    header: 'Driver',
    accessorKey: 'driverName',
    cell: (row) => <span className="text-sm text-gray-900">{row.driverName}</span>,
  },
  {
    id: 'trip',
    header: 'Trip',
    accessorFn: (row) => row.tripName ?? row.tripId ?? '',
    cell: (row) => (
      <span className="text-sm text-gray-900">
        {row.tripName || (row.tripId ? `Trip ${row.tripId}` : '-')}
      </span>
    ),
  },
  {
    id: 'fuelStart',
    header: 'Fuel Start',
    accessorKey: 'fuelStart',
    align: 'right',
    searchable: false,
    cell: (row) => (
      <span className="text-sm font-medium text-gray-900">
        {formatLiters(row.fuelStart)}
      </span>
    ),
  },
  {
    id: 'fuelUsed',
    header: 'Fuel Used',
    accessorKey: 'fuelUsed',
    align: 'right',
    searchable: false,
    cell: (row) => (
      <span className="text-sm font-medium text-red-600">
        {formatLiters(row.fuelUsed)}
      </span>
    ),
  },
  {
    id: 'fuelEnd',
    header: 'Fuel End',
    accessorKey: 'fuelEnd',
    align: 'right',
    searchable: false,
    cell: (row) => (
      <span className="text-sm font-medium text-green-600">
        {formatLiters(row.fuelEnd)}
      </span>
    ),
  },
  {
    id: 'purchased',
    header: 'Purchased',
    accessorKey: 'litersPurchased',
    align: 'right',
    searchable: false,
    cell: (row) => (
      <span className="text-sm font-medium text-blue-600">
        {formatLiters(row.litersPurchased)}
      </span>
    ),
  },
  {
    id: 'totalCost',
    header: 'Total Cost',
    accessorKey: 'totalCost',
    align: 'right',
    searchable: false,
    sortable: true,
    cell: (row) => (
      <span className="text-sm font-medium text-gray-900">
        {formatCurrency(row.totalCost)}
      </span>
    ),
  },
  {
    id: 'station',
    header: 'Station',
    accessorKey: 'fuelStation',
    cell: (row) => (
      <div>
        <div className="text-sm text-gray-900">{row.fuelStation}</div>
        <div className="text-xs text-gray-500">{row.location}</div>
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Mobile card
// ---------------------------------------------------------------------------

function FuelMobileCard({ log }: { log: FuelLog }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-3">
        <div>
          <div className="font-semibold text-gray-900">{log.vehiclePlate}</div>
          <div className="text-sm text-gray-600">{log.driverName}</div>
          <div className="text-xs text-gray-500 mt-1">{formatDate(log.date)}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(log.totalCost)}
          </div>
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
          <div className="text-sm font-semibold text-gray-900">
            {formatLiters(log.fuelStart)}
          </div>
        </div>
        <div className="bg-red-50 rounded p-2">
          <div className="text-xs text-red-600 mb-1">Fuel Used</div>
          <div className="text-sm font-semibold text-red-700">
            {formatLiters(log.fuelUsed)}
          </div>
        </div>
        <div className="bg-green-50 rounded p-2">
          <div className="text-xs text-green-600 mb-1">Fuel End</div>
          <div className="text-sm font-semibold text-green-700">
            {formatLiters(log.fuelEnd)}
          </div>
        </div>
        <div className="bg-blue-50 rounded p-2">
          <div className="text-xs text-blue-600 mb-1">Purchased</div>
          <div className="text-sm font-semibold text-blue-700">
            {formatLiters(log.litersPurchased)}
          </div>
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
  );
}

// ---------------------------------------------------------------------------
// Fuel filters toolbar
// ---------------------------------------------------------------------------

function FuelFiltersToolbar({
  logs,
  tripFilter,
  setTripFilter,
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  filteredCount,
  totalCount,
  hasActiveFilters,
  clearFilters,
}: {
  logs: FuelLog[];
  tripFilter: string;
  setTripFilter: (v: string) => void;
  dateFilter: DateFilterOption;
  setDateFilter: (v: DateFilterOption) => void;
  customStartDate: string;
  setCustomStartDate: (v: string) => void;
  customEndDate: string;
  setCustomEndDate: (v: string) => void;
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);

  const uniqueTrips = useMemo(() => {
    const trips = logs
      .filter((log) => log.tripId)
      .map((log) => ({
        id: log.tripId!,
        name: log.tripName || `Trip ${log.tripId}`,
      }));
    const uniqueMap = new Map<string, { id: string; name: string }>();
    trips.forEach((trip) => {
      if (!uniqueMap.has(trip.id)) uniqueMap.set(trip.id, trip);
    });
    return Array.from(uniqueMap.values());
  }, [logs]);

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'thisMonth':
        return 'This Month';
      case 'lastMonth':
        return 'Last Month';
      case 'custom':
        return customStartDate && customEndDate
          ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
          : 'Custom Range';
      default:
        return 'All Dates';
    }
  };

  const getTripFilterLabel = () => {
    if (tripFilter === 'all') return 'All Trips';
    const trip = uniqueTrips.find((t) => t.id === tripFilter);
    return trip?.name || 'Unknown Trip';
  };

  const dateOptions: { value: DateFilterOption; label: string }[] = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Mobile Header */}
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

      {/* Desktop Filters Row */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          Filters:
        </div>

        {/* Date Filter */}
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
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setDateFilter(opt.value);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      dateFilter === opt.value ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500">
                    Custom Range
                  </div>
                  <div className="px-3 py-2 space-y-2">
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="text-sm"
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

        {/* Trip Filter */}
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
                {uniqueTrips.map((trip) => (
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

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}

        <div className="ml-auto text-sm text-gray-600">
          Showing {filteredCount} of {totalCount} logs
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
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setDateFilter(opt.value);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      dateFilter === opt.value ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500">
                    Custom Range
                  </div>
                  <div className="px-3 py-2 space-y-2">
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="text-sm"
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
                {uniqueTrips.map((trip) => (
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
        Showing {filteredCount} of {totalCount} logs
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

function FuelSummaryStats({ logs }: { logs: FuelLog[] }) {
  if (logs.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Total Purchased
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatLiters(
              logs.reduce((sum, log) => sum + log.litersPurchased, 0),
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Total Used
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatLiters(
              logs.reduce((sum, log) => sum + (log.fuelUsed || 0), 0),
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Total Cost
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(logs.reduce((sum, log) => sum + log.totalCost, 0))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Avg Price/Liter
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(
              Math.round(
                logs.reduce((sum, log) => sum + log.pricePerLiter, 0) /
                  logs.length,
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FuelTable({ logs }: FuelTableProps) {
  const [tripFilter, setTripFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const hasActiveFilters = tripFilter !== 'all' || dateFilter !== 'all';

  const clearFilters = () => {
    setTripFilter('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Pre-filter by trip and date — DataTable receives filtered data
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    if (tripFilter !== 'all') {
      filtered = filtered.filter((log) => log.tripId === tripFilter);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    filtered = filtered.filter((log) => {
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

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [logs, tripFilter, dateFilter, customStartDate, customEndDate]);

  return (
    <div className="space-y-4">
      {/* Filter toolbar above DataTable */}
      <FuelFiltersToolbar
        logs={logs}
        tripFilter={tripFilter}
        setTripFilter={setTripFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        filteredCount={filteredLogs.length}
        totalCount={logs.length}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      <DataTable
        columns={columns}
        data={filteredLogs}
        getRowId={(row) => row.id}
        searchable={false}
        mobileCard={(log) => <FuelMobileCard log={log} />}
        emptyState={{
          icon: Fuel,
          title: 'No fuel logs found',
          description: 'No fuel logs found matching the selected filters.',
        }}
      />

      {/* Summary stats below DataTable */}
      <FuelSummaryStats logs={filteredLogs} />
    </div>
  );
}
