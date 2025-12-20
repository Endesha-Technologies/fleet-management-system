'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Route } from '@/types/route';
import { MapPin, Calendar, Clock, Navigation, User, Truck } from 'lucide-react';

interface RouteDetailsProps {
  route: Route;
}

export function RouteDetails({ route }: RouteDetailsProps) {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col gap-6 pb-4 border-b border-gray-100 shrink-0">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Route Details</h2>
          <p className="text-sm text-muted-foreground">View detailed information about this route.</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Close
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            asChild
          >
            <Link href={`/routes/${route.id}/edit`} scroll={false}>
              Edit Route
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{route.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2
            ${route.status === 'Completed' ? 'bg-green-100 text-green-800' : 
              route.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
              route.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'}`}>
            {route.status}
          </span>
        </div>

        <div className="grid gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-gray-900">{route.date}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Start Location</p>
              <p className="text-gray-900">{route.startLocation}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">End Location</p>
              <p className="text-gray-900">{route.endLocation}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 shadow-sm rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-500">Distance</p>
            </div>
            <p className="text-lg font-semibold">{route.distance}</p>
          </div>
          
          <div className="p-4 shadow-sm rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-500">Duration</p>
            </div>
            <p className="text-lg font-semibold">{route.estimatedDuration}</p>
          </div>
        </div>

        {/* <div className="space-y-4">
          <div className="flex items-center justify-between p-3 shadow-sm rounded-lg bg-white">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Assigned Driver</p>
                <p className="text-sm text-gray-500">{route.assignedDriver || 'Unassigned'}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600">Change</Button>
          </div>

          <div className="flex items-center justify-between p-3 shadow-sm rounded-lg bg-white">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Assigned Vehicle</p>
                <p className="text-sm text-gray-500">{route.assignedVehicle || 'Unassigned'}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600">Change</Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
