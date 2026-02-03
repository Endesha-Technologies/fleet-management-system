'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TruckTable } from '@/components/features/trucks/TruckTable';
import { MOCK_TRUCKS } from '@/constants/trucks';
import { Truck, TruckFilters } from '@/types/truck';
import { AddTruckDrawer } from '@/components/features/trucks/AddTruckDrawer';

export default function TrucksPage() {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plate number, make/model, or driver..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.status || 'All'}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as any })
            }
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Truck Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Truck Type</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.truckType === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, truckType: '' })}
          >
            All Types
          </Button>
          <Button
            variant={filters.truckType === 'Isuzu' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, truckType: 'Isuzu' })}
          >
            Isuzu
          </Button>
          <Button
            variant={filters.truckType === 'Scania' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, truckType: 'Scania' })}
          >
            Scania
          </Button>
          <Button
            variant={filters.truckType === 'Mercedes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, truckType: 'Mercedes' })}
          >
            Mercedes-Benz
          </Button>
          <Button
            variant={filters.truckType === 'Volvo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, truckType: 'Volvo' })}
          >
            Volvo
          </Button>
          <Button
            variant={filters.truckType === 'MAN' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, truckType: 'MAN' })}
          >
            MAN
          </Button>
        </div>
      </div>

      {/* Truck Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <TruckTable
            trucks={filteredTrucks}
            onEdit={(truck) => {
              setSelectedTruck(truck);
              setShowAddDrawer(true);
            }}
          />
        </div>
      </div>

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
