import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, Eye } from 'lucide-react';
import type { RouteTableProps } from '../_types';

export function RouteTable({ routes, onViewRoute, onEditRoute, onDeleteRoute }: RouteTableProps) {
  return (
    <div className="hidden md:block w-full overflow-auto rounded-lg bg-white shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
          <tr>
            <th className="px-4 py-3">Route Name</th>
            <th className="px-4 py-3">Origin</th>
            <th className="px-4 py-3">Destination</th>
            <th className="px-4 py-3">Distance</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {routes.map((route) => (
            <tr key={route.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{route.name}</td>
              <td className="px-4 py-3 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-green-500" />
                  {route.origin.name}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-red-500" />
                  {route.destination.name}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">{route.distance}</td>
              <td className="px-4 py-3 text-gray-600">{route.estimatedDuration}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${route.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    route.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                    route.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {route.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                    onClick={() => onViewRoute?.(route)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                    onClick={() => onEditRoute?.(route)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                    onClick={() => onDeleteRoute?.(route)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
