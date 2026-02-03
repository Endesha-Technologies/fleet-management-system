'use client';

import React, { useState } from 'react';
import { Eye, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Truck } from '@/types/truck';

interface TruckTableProps {
  trucks: Truck[];
  onView?: (truck: Truck) => void;
  onEdit?: (truck: Truck) => void;
}

export function TruckTable({ trucks, onView, onEdit }: TruckTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(trucks.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedTrucks = trucks.slice(startIdx, startIdx + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Maintenance':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Plate No</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Make/Model</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Axle Config</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Driver</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Odometer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Engine Hours</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Alerts</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrucks.map((truck) => (
              <tr key={truck.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{truck.plateNumber}</td>
                <td className="px-4 py-3 text-gray-700">
                  {truck.make} {truck.model} ({truck.year})
                </td>
                <td className="px-4 py-3 text-gray-700">{truck.axleConfig}</td>
                <td className="px-4 py-3 text-gray-700">
                  {truck.driver ? truck.driver.name : '-'}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {truck.currentOdometer.toLocaleString()} km
                </td>
                <td className="px-4 py-3 text-gray-700">{truck.engineHours.toLocaleString()} hrs</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(truck.status)}`}
                  >
                    {truck.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {truck.alerts > 0 ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">{truck.alerts}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onView?.(truck)}
                      title="View truck details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit?.(truck)}
                      title="Edit truck"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, trucks.length)} of{' '}
          {trucks.length} trucks
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                className="min-w-10"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
