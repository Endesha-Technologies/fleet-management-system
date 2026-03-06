'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  Truck,
  User,
  MapPin,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Timer,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types (until trip types are properly imported)
// ---------------------------------------------------------------------------

interface Trip {
  id: string;
  tripNumber: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driver?: {
    id: string;
    name: string;
  };
  truck?: {
    id: string;
    registrationNumber: string;
  };
  scheduledStartTime: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const TRIP_STATUS_CONFIG: Record<Trip['status'], { label: string; icon: React.ElementType; className: string }> = {
  SCHEDULED: {
    label: 'Scheduled',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Timer,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TripsTabProps {
  trips: Trip[];
  routeId: string;
}

export function TripsTab({ trips, routeId }: TripsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = trips.filter((trip) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      trip.tripNumber.toLowerCase().includes(query) ||
      trip.driver?.name.toLowerCase().includes(query) ||
      trip.truck?.registrationNumber.toLowerCase().includes(query)
    );
  });

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No trips yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            There are no trips associated with this route. Trips will appear here once they are created.
          </p>
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
            Create Trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by trip number, driver, or truck..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">{filteredTrips.length}</span>
            <span>of {trips.length} trips</span>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-3">
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>

      {filteredTrips.length === 0 && searchQuery && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <Search className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No trips match your search.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trip Card
// ---------------------------------------------------------------------------

function TripCard({ trip }: { trip: Trip }) {
  const statusConfig = TRIP_STATUS_CONFIG[trip.status];
  const StatusIcon = statusConfig.icon;

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const scheduled = formatDateTime(trip.scheduledStartTime);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Trip Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-base font-semibold text-gray-900">{trip.tripNumber}</h4>
            <Badge className={statusConfig.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            {trip.driver && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate">{trip.driver.name}</span>
              </div>
            )}
            {trip.truck && (
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate">{trip.truck.registrationNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>{scheduled.date}</span>
              <Clock className="h-3.5 w-3.5 text-gray-400 ml-2" />
              <span>{scheduled.time}</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 hidden sm:block transition-colors" />
      </div>
    </div>
  );
}
