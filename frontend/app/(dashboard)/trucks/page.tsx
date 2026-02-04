'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input component
import { TruckTable } from '@/components/features/trucks/TruckTable';
import { AddTruckDrawer } from '@/components/features/trucks/AddTruckDrawer';
import { MOCK_TRUCKS } from '@/constants/trucks';
import { Truck, TruckFilters } from '@/types/truck';
import { useRouter } from 'next/navigation';

export default function TrucksPage() {
  const router = useRouter();
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [filters, setFilters] = useState<TruckFilters>({
    status: 'All',
    truckType: '',
    searchTerm: '',
  });
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const filteredTrucks = useMemo(() => {
    return MOCK_TRUCKS.filter((truck) => {
      // Status filter
      if (filters.status && filters.status !== 'All' && truck.status !== filters.status) {
        return false;
      }

      // Truck type filter (based on make/model)
      if (filters.truckType && !`${truck.make} ${truck.model}`.includes(filters.truckType)) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          truck.plateNumber.toLowerCase().includes(searchLower) ||
          `${truck.make} ${truck.model}`.toLowerCase().includes(searchLower) ||
          (truck.driver?.name.toLowerCase().includes(searchLower) || false)
        );
      }

      return true;
    });
  }, [filters]);

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
          onClick={() => {
            setSelectedTruck(null);
            setShowAddDrawer(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Truck
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by plate number, make/model, or driver..."
            className="pl-8"
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>

        {/* Truck Type Filter */}
        <div className="w-full md:w-48">
          <select
            className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={filters.truckType}
            onChange={(e) => setFilters({ ...filters, truckType: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Isuzu">Isuzu</option>
            <option value="Scania">Scania</option>
            <option value="Mercedes">Mercedes-Benz</option>
            <option value="Volvo">Volvo</option>
            <option value="MAN">MAN</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={filters.status || 'All'}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as TruckFilters['status'] })
            }
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Truck Table */}
      <TruckTable
        trucks={filteredTrucks}
        onView={(truck) => router.push(`/trucks/${truck.id}`)}
        onEdit={(truck) => {
          setSelectedTruck(truck);
          setShowAddDrawer(true);
        }}
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
