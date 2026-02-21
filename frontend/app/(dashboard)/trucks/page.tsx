'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TruckTable } from './_components/TruckTable';
import { AddTruckDrawer } from './_components/AddTruckDrawer';
import { MOCK_TRUCKS } from '@/constants/trucks';
import { useRouter } from 'next/navigation';
import type { Truck } from './_types';

export default function TrucksPage() {
  const router = useRouter();
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const handleEditTruck = (truck: Truck) => {
    setSelectedTruck(truck);
    setShowAddDrawer(true);
  };

  const handleAddTruck = () => {
    setSelectedTruck(null);
    setShowAddDrawer(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Truck Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage fleet trucks, maintenance, and assignments</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={handleAddTruck}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Truck
        </Button>
      </div>

      {/* Truck Table - Now handles its own filtering */}
      <TruckTable
        trucks={MOCK_TRUCKS}
        onView={(truck) => router.push(`/trucks/${truck.id}`)}
        onEdit={handleEditTruck}
      />

      {/* Add Truck Drawer */}
      <AddTruckDrawer
        open={showAddDrawer}
        onOpenChange={(open) => {
          setShowAddDrawer(open);
          if (!open) setSelectedTruck(null);
        }}
        initialTruck={selectedTruck}
        onAddComplete={() => {
          setShowAddDrawer(false);
          setSelectedTruck(null);
        }}
      />
    </div>
  );
}
