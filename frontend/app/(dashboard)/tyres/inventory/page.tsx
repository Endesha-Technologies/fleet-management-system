'use client';

import Link from 'next/link';
import { MOCK_TYRES } from '@/constants/tyres';
import { Search, Plus, Filter, Download, MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Tyre, TyreStatus } from '../_types';

export default function TyreInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TyreStatus | 'all'>('all');
  const [sortColumn, setSortColumn] = useState<keyof Tyre>('serialNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort tyres
  const filteredTyres = MOCK_TYRES.filter((tyre) => {
    const matchesSearch =
      tyre.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tyre.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tyre.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tyre.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tyre.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tyre.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (column: keyof Tyre) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: TyreStatus) => {
    const badges = {
      'in-use': 'bg-green-100 text-green-800 border-green-200',
      'storage': 'bg-blue-100 text-blue-800 border-blue-200',
      'maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'disposed': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[status] || badges.storage;
  };

  const getConditionColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConditionText = (rating: number) => {
    if (rating === 5) return 'Excellent';
    if (rating === 4) return 'Good';
    if (rating === 3) return 'Fair';
    if (rating === 2) return 'Poor';
    return 'Critical';
  };

  const getTreadDepthColor = (current: number, minimum: number) => {
    const percentage = (current / 18) * 100;
    if (percentage >= 50) return 'text-green-600';
    if (percentage >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tyre Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all tyres across your fleet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/tyres/inventory/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Tyre
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by serial number, brand, vehicle plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">Status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({MOCK_TYRES.length})
              </button>
              <button
                onClick={() => setStatusFilter('in-use')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === 'in-use'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                In Use ({MOCK_TYRES.filter((t) => t.status === 'in-use').length})
              </button>
              <button
                onClick={() => setStatusFilter('storage')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === 'storage'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Storage ({MOCK_TYRES.filter((t) => t.status === 'storage').length})
              </button>
              <button
                onClick={() => setStatusFilter('maintenance')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === 'maintenance'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                Maintenance ({MOCK_TYRES.filter((t) => t.status === 'maintenance').length})
              </button>
              <button
                onClick={() => setStatusFilter('disposed')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === 'disposed'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Disposed ({MOCK_TYRES.filter((t) => t.status === 'disposed').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTyres.length} of {MOCK_TYRES.length} tyres
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('serialNumber')}
                >
                  Serial Number
                  {sortColumn === 'serialNumber' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('brand')}
                >
                  Brand & Model
                  {sortColumn === 'brand' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortColumn === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('currentTreadDepth')}
                >
                  Tread Depth
                  {sortColumn === 'currentTreadDepth' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalMileage')}
                >
                  Mileage
                  {sortColumn === 'totalMileage' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('conditionRating')}
                >
                  Condition
                  {sortColumn === 'conditionRating' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTyres.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                    No tyres found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredTyres.map((tyre) => (
                  <tr key={tyre.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tyre.serialNumber}</div>
                        <div className="text-xs text-gray-500">{tyre.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tyre.brand}</div>
                        <div className="text-xs text-gray-500">{tyre.model}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{tyre.size}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                          tyre.status
                        )}`}
                      >
                        {tyre.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {tyre.status === 'in-use' ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tyre.vehiclePlate}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {tyre.position?.replace('-', ' ')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {tyre.warehouseLocation || 'Warehouse'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div
                          className={`text-sm font-medium ${getTreadDepthColor(
                            tyre.currentTreadDepth,
                            tyre.minimumTreadDepth
                          )}`}
                        >
                          {tyre.currentTreadDepth}mm
                        </div>
                        <div className="text-xs text-gray-500">
                          {((tyre.currentTreadDepth / tyre.initialTreadDepth) * 100).toFixed(0)}% left
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{tyre.totalMileage.toLocaleString()} km</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          getConditionColor(tyre.conditionRating)
                        }`}
                      >
                        {getConditionText(tyre.conditionRating)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative" ref={openMenuId === tyre.id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === tyre.id ? null : tyre.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreHorizontal className="h-5 w-5 text-gray-600" />
                        </button>
                        
                        {openMenuId === tyre.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <Link
                              href={`/tyres/${tyre.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              View Details
                            </Link>
                            
                            {tyre.status === 'storage' && (
                              <Link
                                href={`/tyres/${tyre.id}/assign`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setOpenMenuId(null)}
                              >
                                Assign to Vehicle
                              </Link>
                            )}
                            
                            {tyre.status === 'in-use' && (
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setOpenMenuId(null)}
                              >
                                Remove from Vehicle
                              </button>
                            )}
                            
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              Schedule Inspection
                            </button>
                            
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              Record Rotation
                            </button>
                            
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              Record Repair
                            </button>
                            
                            <div className="border-t border-gray-100 my-1" />
                            
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => setOpenMenuId(null)}
                            >
                              Mark for Disposal
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
