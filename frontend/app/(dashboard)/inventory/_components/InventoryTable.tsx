'use client';

import { useState, useMemo } from 'react';
import type { InventoryTableProps } from '../_types';
import { Package, Filter, X, Search, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InventoryTable({ items }: InventoryTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const categories = useMemo(() => {
    return Array.from(new Set(items.map(item => item.category))).sort();
  }, [items]);

  const conditions = useMemo(() => {
    return Array.from(new Set(items.map(item => item.condition))).sort();
  }, [items]);

  const statuses = useMemo(() => {
    return Array.from(new Set(items.map(item => item.status))).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;
      const matchesSearch = searchQuery === '' ||
        item.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.removedFromVehicle.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesCategory && matchesCondition && matchesSearch;
    });
  }, [items, statusFilter, categoryFilter, conditionFilter, searchQuery]);

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setConditionFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || conditionFilter !== 'all' || searchQuery !== '';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Storage': return 'bg-blue-100 text-blue-800';
      case 'Sold': return 'bg-green-100 text-green-800';
      case 'Disposed': return 'bg-red-100 text-red-800';
      case 'Used in Maintenance': return 'bg-purple-100 text-purple-800';
      case 'Installed in Truck': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-orange-600';
      case 'Damaged': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by part name, number, or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center"
          >
            <Filter className="w-4 h-4" />
            Filters {hasActiveFilters && '(Active)'}
          </button>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:flex md:flex-wrap md:items-center gap-3`}>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Condition Filter */}
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
            Showing {filteredItems.length} of {items.length} items
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No inventory items found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.partName}</h3>
                    <p className="text-xs text-gray-500">{item.partNumber}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Category</span>
                    <p className="font-medium">{item.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Condition</span>
                    <p className={`font-medium ${getConditionColor(item.condition)}`}>{item.condition}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Quantity</span>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Value</span>
                    <p className="font-medium">{formatCurrency(item.totalValue)}</p>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-600">
                    From: <span className="font-medium text-gray-900">{item.removedFromVehicle}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(item.removalDate)} • {item.storageLocation}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/inventory/${item.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
                {item.status === 'In Storage' && (
                  <Link
                    href={`/inventory/${item.id}/move`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Move Part
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Part Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  From Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Storage
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No inventory items found</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/inventory/${item.id}`} className="hover:text-blue-600">
                        <div className="font-medium text-gray-900">{item.partName}</div>
                        <div className="text-xs text-gray-500">{item.partNumber}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(item.totalValue)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.removedFromVehicle}</div>
                      <div className="text-xs text-gray-500">{formatDate(item.removalDate)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.storageLocation}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        {item.status === 'In Storage' && (
                          <Link
                            href={`/inventory/${item.id}/move`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            Move
                          </Link>
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

      {/* Summary Stats */}
      {filteredItems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Items</div>
              <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                {filteredItems.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Value</div>
              <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(filteredItems.reduce((sum, item) => sum + item.totalValue, 0))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">In Storage</div>
              <div className="text-lg md:text-xl font-bold text-blue-600 mt-1">
                {filteredItems.filter(item => item.status === 'In Storage').length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Categories</div>
              <div className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                {Array.from(new Set(filteredItems.map(item => item.category))).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
