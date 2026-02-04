'use client';

import Link from 'next/link';
import { Plus, Package, AlertTriangle, Wrench, Trash2, TrendingUp, DollarSign, Calendar, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { MOCK_TYRES } from '@/constants/tyres';

export default function TyresPage() {
  // Calculate statistics
  const totalTyres = MOCK_TYRES.length;
  const inUseTyres = MOCK_TYRES.filter((t) => t.status === 'in-use').length;
  const inStorage = MOCK_TYRES.filter((t) => t.status === 'storage').length;
  const inMaintenance = MOCK_TYRES.filter((t) => t.status === 'maintenance').length;
  const disposed = MOCK_TYRES.filter((t) => t.status === 'disposed').length;
  
  // Low tread depth warning (< 3mm)
  const lowTreadTyres = MOCK_TYRES.filter(
    (t) => t.status !== 'disposed' && t.currentTreadDepth < 3
  ).length;
  
  // Inspection due (overdue or due within 7 days)
  const today = new Date();
  const inspectionDue = MOCK_TYRES.filter((t) => {
    if (!t.nextInspectionDue || t.status === 'disposed') return false;
    const dueDate = new Date(t.nextInspectionDue);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7;
  }).length;
  
  // Total value and cost metrics
  const totalInvestment = MOCK_TYRES.filter((t) => t.status !== 'disposed').reduce(
    (sum, t) => sum + t.purchaseCost,
    0
  );
  
  const avgCostPerTyre = totalInvestment / (totalTyres - disposed);
  
  // Recent tyres needing attention
  const tyresNeedingAttention = MOCK_TYRES.filter((t) => {
    if (t.status === 'disposed') return false;
    const lowTread = t.currentTreadDepth < 3;
    const needsInspection = t.nextInspectionDue && 
      new Date(t.nextInspectionDue) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return lowTread || needsInspection;
  }).slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tyre Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and manage tyre inventory</p>
        </div>
      </div>

      {/* Quick Actions - Mobile First */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
          <Link
            href="/dashboard/tyres/inventory"
            className="min-w-fit whitespace-nowrap snap-start px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            View Inventory
          </Link>
          <Link
            href="/dashboard/tyres/inspections"
            className="min-w-fit whitespace-nowrap snap-start px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Inspections
          </Link>
          <Link
            href="/dashboard/tyres/rotation"
            className="min-w-fit whitespace-nowrap snap-start px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Tyre Rotation
          </Link>
          <Link
            href="/dashboard/tyres/disposal"
            className="min-w-fit whitespace-nowrap snap-start px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Disposal
          </Link>
          <Link
            href="/dashboard/tyres/inventory/add"
            className="min-w-fit whitespace-nowrap snap-start px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Add New
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Metrics, Status & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Tyres</p>
                    <p className="text-3xl font-bold mt-2">{totalTyres}</p>
                    <p className="text-xs text-muted-foreground mt-1">In system</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">In Use</p>
                    <p className="text-3xl font-bold mt-2 text-green-600">{inUseTyres}</p>
                    <p className="text-xs text-muted-foreground mt-1">On vehicles</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Low Tread</p>
                    <p className="text-3xl font-bold mt-2 text-yellow-600">{lowTreadTyres}</p>
                    <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Due Inspection</p>
                    <p className="text-3xl font-bold mt-2 text-orange-600">{inspectionDue}</p>
                    <p className="text-xs text-muted-foreground mt-1">This week</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Tyre Status Overview</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">In Use</span>
                    <span className="text-sm font-bold text-green-600">{inUseTyres}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${(inUseTyres / totalTyres) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">In Storage</span>
                    <span className="text-sm font-bold text-blue-600">{inStorage}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(inStorage / totalTyres) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maintenance</span>
                    <span className="text-sm font-bold text-orange-600">{inMaintenance}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full" 
                      style={{ width: `${(inMaintenance / totalTyres) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disposed</span>
                    <span className="text-sm font-bold text-gray-600">{disposed}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500 rounded-full" 
                      style={{ width: `${(disposed / totalTyres) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tyres Needing Attention */}
          {tyresNeedingAttention.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Tyres Needing Attention</h2>
                  <p className="text-sm text-muted-foreground mt-1">Low tread or due for inspection</p>
                </div>
                <Link href="/tyres/inventory" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {tyresNeedingAttention.map((tyre) => {
                  const lowTread = tyre.currentTreadDepth < 3;
                  const needsInspection = tyre.nextInspectionDue &&
                    new Date(tyre.nextInspectionDue) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <Link
                      key={tyre.id}
                      href={`/tyres/${tyre.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {lowTread ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Wrench className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{tyre.serialNumber}</p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                tyre.status === 'in-use'
                                  ? 'bg-green-100 text-green-700'
                                  : tyre.status === 'storage'
                                  ? 'bg-blue-100 text-blue-700'
                                  : tyre.status === 'maintenance'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {tyre.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {tyre.brand} {tyre.model} • {tyre.size}
                          </p>
                          {tyre.vehiclePlate && (
                            <p className="text-sm text-gray-500">
                              {tyre.vehiclePlate} • {tyre.position?.replace('-', ' ')}
                            </p>
                          )}
                          <div className="flex gap-3 mt-2">
                            {lowTread && (
                              <span className="text-xs text-red-600">
                                Low tread: {tyre.currentTreadDepth}mm
                              </span>
                            )}
                            {needsInspection && (
                              <span className="text-xs text-orange-600">
                                Inspection due
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-gray-900">
                            {tyre.totalMileage.toLocaleString()} km
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Financial (Desktop Only) */}
        <div className="hidden lg:block space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-2">
              <Link
                href="/tyres/inventory"
                className="flex items-center gap-3 w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Package className="h-4 w-4" />
                View Inventory
              </Link>
              <Link
                href="/tyres/inspections"
                className="flex items-center gap-3 w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Wrench className="h-4 w-4" />
                Inspections
              </Link>
              <Link
                href="/tyres/rotation"
                className="flex items-center gap-3 w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Tyre Rotation
              </Link>
              <Link
                href="/tyres/disposal"
                className="flex items-center gap-3 w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Disposal
              </Link>
              <Link
                href="/tyres/inventory/add"
                className="flex items-center gap-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add New Tyre
              </Link>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Financial Overview</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Investment</span>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  UGX {totalInvestment.toLocaleString()}
                </p>
              </div>
              
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Average per Tyre</span>
                  <DollarSign className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-indigo-900">
                  UGX {Math.round(avgCostPerTyre).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
