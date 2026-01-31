import React from 'react';
import Link from 'next/link';
import { Route } from '@/types/route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, Clock, Navigation, Eye } from 'lucide-react';

interface RouteCardProps {
  route: Route;
}

export function RouteCard({ route }: RouteCardProps) {
  return (
    <Card className="md:hidden mb-4 border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{route.name}</CardTitle>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${route.status === 'Completed' ? 'bg-green-100 text-green-800' : 
              route.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
              route.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'}`}>
            {route.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Start</p>
              <p className="font-medium">{route.startLocation}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">End</p>
              <p className="font-medium">{route.endLocation}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Navigation className="h-4 w-4" />
            <span>{route.distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{route.estimatedDuration}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 h-9 text-sm" asChild>
            <Link href={`/routes/${route.id}`} scroll={false}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 h-9 text-sm" asChild>
            <Link href={`/routes/${route.id}/edit`} scroll={false}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 h-9 text-sm text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
