'use client';

import React, { useState } from 'react';
import { RefreshCw, Wrench, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Truck } from '@/types/truck';
import { RotateTyresDrawer } from './RotateTyresDrawer';
import { ReplaceTyreDrawer } from './ReplaceTyreDrawer';

interface TruckTyresProps {
  truck: Truck;
}

export function TruckTyres({ truck }: TruckTyresProps) {
  // We'll simulate fetching tyres. If assignedTyres > 0 we show list, else empty state.
  // Using mock data for now.
  const hasTyres = truck.assignedTyres > 0;

  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);

  const tyreList = [
    { position: 'Steer 1 - Left', serial: 'TY-001-A', kmStart: 45000, tread: 12, condition: 'Good', lastRotation: '2025-12-01', status: 'Active' },
    { position: 'Steer 1 - Right', serial: 'TY-001-B', kmStart: 45000, tread: 11.5, condition: 'Good', lastRotation: '2025-12-01', status: 'Active' },
    { position: 'Drive 1 - Left Outer', serial: 'TY-002-A', kmStart: 32000, tread: 14, condition: 'Excellent', lastRotation: '2025-11-15', status: 'Active' },
    { position: 'Drive 1 - Left Inner', serial: 'TY-002-B', kmStart: 32000, tread: 13.8, condition: 'Excellent', lastRotation: '2025-11-15', status: 'Active' },
    { position: 'Drive 1 - Right Inner', serial: 'TY-002-C', kmStart: 32000, tread: 14.1, condition: 'Excellent', lastRotation: '2025-11-15', status: 'Active' },
    { position: 'Drive 1 - Right Outer', serial: 'TY-002-D', kmStart: 32000, tread: 13.9, condition: 'Excellent', lastRotation: '2025-11-15', status: 'Active' },
  ];

  if (!hasTyres) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-gray-200 rounded-lg border-dashed shadow-sm">
        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <Wrench className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tyres Assigned</h3>
        <p className="text-gray-500 text-center max-w-sm mb-6">
          This truck currently has no tyres assigned to its positions. Configure the tyre layout to start tracking usage.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="h-4 w-4 mr-2" />
          Assign Tyres Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Inspect Tyre
        </Button>
        <Button variant="outline" onClick={() => setIsReplaceOpen(true)}>
          <Wrench className="h-4 w-4 mr-2" />
          Replace Tyre
        </Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsRotateOpen(true)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rotate Tyres
        </Button>
      </div>

      {/* Tyre Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Position</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Tyre Serial</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Km Since Start</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Tread Now</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Condition</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Last Rotation</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {tyreList.map((tyre, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{tyre.position}</td>
                <td className="px-4 py-3 font-mono text-blue-600">{tyre.serial}</td>
                <td className="px-4 py-3 text-gray-700">{tyre.kmStart.toLocaleString()} km</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${tyre.tread < 4 ? 'text-red-600' : tyre.tread < 8 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {tyre.tread} mm
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{tyre.condition}</td>
                <td className="px-4 py-3 text-gray-700">{tyre.lastRotation}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    {tyre.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RotateTyresDrawer 
        open={isRotateOpen} 
        onOpenChange={setIsRotateOpen} 
        truck={truck}
      />

      <ReplaceTyreDrawer
        open={isReplaceOpen}
        onOpenChange={setIsReplaceOpen}
        truck={truck}
      />
    </div>
  );
}
