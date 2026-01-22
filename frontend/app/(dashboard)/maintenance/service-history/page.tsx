'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Plus,
  ChevronRight,
  User,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Car,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { mockServiceHistory } from '@/constants/service-history';
import type { ServiceHistoryRecord } from '@/types/maintenance';

export default function ServiceHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  // Get unique values for filters
  const vehicles = useMemo(() => {
    const unique = Array.from(new Set(mockServiceHistory.map((record) => record.vehicleId)));
    return unique;
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(mockServiceHistory.map((record) => record.serviceCategory)));
    return unique;
  }, []);

  const serviceTypes = useMemo(() => {
    const unique = Array.from(new Set(mockServiceHistory.map((record) => record.serviceType)));
    return unique;
  }, []);

  const technicians = useMemo(() => {
    const unique = Array.from(new Set(mockServiceHistory.map((record) => record.technicianName)));
    return unique;
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    return mockServiceHistory.filter((record) => {
      const matchesSearch =
        searchQuery === '' ||
        record.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.technicianName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVehicle = selectedVehicle === 'all' || record.vehicleId === selectedVehicle;
      const matchesCategory = selectedCategory === 'all' || record.serviceCategory === selectedCategory;
      const matchesType = selectedType === 'all' || record.serviceType === selectedType;
      const matchesTechnician = selectedTechnician === 'all' || record.technicianName === selectedTechnician;

      let matchesDate = true;
      if (dateRange !== 'all') {
        const recordDate = new Date(record.serviceDate);
        const now = new Date();
        const daysAgo = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dateRange === '7days') matchesDate = daysAgo <= 7;
        else if (dateRange === '30days') matchesDate = daysAgo <= 30;
        else if (dateRange === '90days') matchesDate = daysAgo <= 90;
      }

      return matchesSearch && matchesVehicle && matchesCategory && matchesType && matchesTechnician && matchesDate;
    });
  }, [searchQuery, selectedVehicle, selectedCategory, selectedType, selectedTechnician, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEvents = filteredRecords.length;
    const totalCost = filteredRecords.reduce((sum, record) => sum + record.cost, 0);
    const averageCost = totalEvents > 0 ? totalCost / totalEvents : 0;
    const totalDuration = filteredRecords.reduce((sum, record) => sum + record.duration, 0);

    // Count service categories
    const categoryCounts = filteredRecords.reduce((acc, record) => {
      acc[record.serviceCategory] = (acc[record.serviceCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonService = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalEvents,
      totalCost,
      averageCost,
      mostCommonService,
      totalDuration,
    };
  }, [filteredRecords]);

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'bg-blue-100 text-blue-700';
      case 'corrective':
        return 'bg-yellow-100 text-yellow-700';
      case 'emergency':
        return 'bg-red-100 text-red-700';
      case 'inspection':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting service history...');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Service History</h1>
          <p className="text-gray-600 text-sm mt-1">
            Complete maintenance and repair records
          </p>
        </div>
        <div className="flex gap-2">
          {selectedVehicle !== 'all' && (
            <Link href={`/dashboard/maintenance/history/vehicle/${selectedVehicle}`}>
              <Button variant="outline">
                <Car className="w-4 h-4 mr-2" />
                Vehicle Details
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/dashboard/maintenance/work-orders/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Work Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by vehicle, work order, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map((vehicleId) => {
                const record = mockServiceHistory.find((r) => r.vehicleId === vehicleId);
                return (
                  <option key={vehicleId} value={vehicleId}>
                    {record?.vehiclePlate} - {record?.vehicleModel}
                  </option>
                );
              })}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Technicians</option>
              {technicians.map((technician) => (
                <option key={technician} value={technician}>
                  {technician}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          {/* Active filters count */}
          {(searchQuery || selectedVehicle !== 'all' || selectedCategory !== 'all' || selectedType !== 'all' || selectedTechnician !== 'all' || dateRange !== 'all') && (
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                Showing {filteredRecords.length} of {mockServiceHistory.length} records
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedVehicle('all');
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSelectedTechnician('all');
                  setDateRange('all');
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Service Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No service records found</h3>
            <p className="text-gray-600 text-sm">
              Try adjusting your filters or search criteria
            </p>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Link
              key={record.id}
              href={`/maintenance/history/vehicle/${record.vehicleId}`}
            >
              <Card className="p-4 hover:border-primary transition-colors cursor-pointer">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Vehicle Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{record.vehiclePlate}</h3>
                          <span className="text-gray-600 text-sm">
                            {record.vehicleModel}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getServiceTypeColor(
                              record.serviceType
                            )}`}
                          >
                            {record.serviceType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {record.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {record.workOrderNumber}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {record.technicianName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span suppressHydrationWarning>
                              {new Date(record.serviceDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {record.duration}h
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost & Status */}
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="text-lg font-bold">
                        UGX {record.cost.toLocaleString()}
                      </p>
                      <div className="flex gap-2 text-xs text-gray-500 mt-1">
                        <span>Parts: {record.partsCost.toLocaleString()}</span>
                        <span>Labor: {record.laborCost.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {record.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Parts used (if any) */}
                {record.partsUsed && record.partsUsed.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 mb-2">Parts Used:</p>
                    <div className="flex flex-wrap gap-2">
                      {record.partsUsed.map((part) => (
                        <span
                          key={part.id}
                          className="px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {part.name} ({part.quantity}x)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
