'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_TYRES } from '@/constants/tyres';
import { ArrowLeft, Edit, Download, MapPin, Calendar, DollarSign, Gauge, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function TyreDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tyreId = params.id as string;
  
  const tyre = MOCK_TYRES.find(t => t.id === tyreId);

  if (!tyre) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tyre Not Found</h2>
          <p className="text-gray-600 mb-6">The tyre you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/tyres/inventory"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const badges = {
      'in-use': 'bg-green-100 text-green-800 border-green-200',
      'storage': 'bg-blue-100 text-blue-800 border-blue-200',
      'maintenance': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'disposed': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[tyre.status] || badges.storage;
  };

  const treadPercentage = ((tyre.currentTreadDepth / tyre.initialTreadDepth) * 100).toFixed(0);
  const costPerKm = tyre.totalMileage > 0 ? (tyre.purchaseCost / tyre.totalMileage).toFixed(2) : '0.00';
  const remainingLife = Math.max(0, Math.round(((tyre.currentTreadDepth - tyre.minimumTreadDepth) / (tyre.initialTreadDepth - tyre.minimumTreadDepth)) * 100));

  const getConditionText = (rating: number) => {
    if (rating === 5) return 'Excellent';
    if (rating === 4) return 'Good';
    if (rating === 3) return 'Fair';
    if (rating === 2) return 'Poor';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/tyres/inventory"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Tyre Details</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tyre.brand} {tyre.model} • {tyre.serialNumber}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{tyre.brand} {tyre.model}</h2>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge()}`}>
                      {tyre.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Serial: {tyre.serialNumber}</p>
                  <p className="text-sm text-gray-600">ID: {tyre.id}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="text-base font-medium mt-1">{tyre.size}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-base font-medium mt-1 capitalize">{tyre.type.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Load Index</p>
                  <p className="text-base font-medium mt-1">{tyre.loadIndex}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Speed Rating</p>
                  <p className="text-base font-medium mt-1">{tyre.speedRating}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Location</p>
                  <p className="text-base font-medium mt-1">
                    {tyre.status === 'in-use' ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {tyre.vehiclePlate} • {tyre.position?.replace('-', ' ')}
                      </span>
                    ) : (
                      <span>{tyre.warehouseLocation || 'Warehouse'}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Condition Rating</p>
                  <p className="text-base font-medium mt-1">{getConditionText(tyre.conditionRating)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Current Metrics</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Tread Depth */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium">Tread Depth</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{tyre.currentTreadDepth}mm</span>
                      <span className="text-sm text-gray-500 ml-2">({treadPercentage}% remaining)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        parseInt(treadPercentage) >= 50
                          ? 'bg-green-500'
                          : parseInt(treadPercentage) >= 30
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${treadPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Min: {tyre.minimumTreadDepth}mm</span>
                    <span>Initial: {tyre.initialTreadDepth}mm</span>
                  </div>
                </div>

                {/* Other Metrics */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Total Mileage</span>
                    </div>
                    <p className="text-xl font-bold">{tyre.totalMileage.toLocaleString()} km</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Age in Service</span>
                    </div>
                    <p className="text-xl font-bold">
                      {tyre.installedDate
                        ? Math.floor(
                            (new Date().getTime() - new Date(tyre.installedDate).getTime()) /
                              (1000 * 60 * 60 * 24 * 30)
                          )
                        : 0}{' '}
                      months
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm">Remaining Life</span>
                    </div>
                    <p className="text-xl font-bold">{remainingLife}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase & Financial Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Purchase & Financial Information</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="text-base font-medium mt-1">{tyre.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Date</p>
                  <p className="text-base font-medium mt-1">
                    {new Date(tyre.purchaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Cost</p>
                  <p className="text-base font-medium mt-1">
                    UGX {tyre.purchaseCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost per Kilometer</p>
                  <p className="text-base font-medium mt-1">UGX {costPerKm}</p>
                </div>
                {tyre.warrantyMonths && (
                  <div>
                    <p className="text-sm text-gray-500">Warranty</p>
                    <p className="text-base font-medium mt-1">{tyre.warrantyMonths} months</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inspection History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Inspection History</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {tyre.lastInspectionDate ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Regular Inspection</p>
                        <span className="text-sm text-gray-500">
                          {new Date(tyre.lastInspectionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Tread depth: {tyre.currentTreadDepth}mm • Condition: Good
                      </p>
                      {tyre.nextInspectionDue && (
                        <p className="text-sm text-gray-500 mt-1">
                          Next inspection due: {new Date(tyre.nextInspectionDue).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No inspection history available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Quick Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {tyre.status === 'storage' && (
                <Link
                  href={`/dashboard/tyres/${tyre.id}/assign`}
                  className="block w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  Assign to Vehicle
                </Link>
              )}
              {tyre.status === 'in-use' && (
                <button className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  Remove from Vehicle
                </button>
              )}
              <button className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                Schedule Inspection
              </button>
              <button className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                Record Rotation
              </button>
              <button className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                Record Repair
              </button>
              <button className="w-full px-4 py-2.5 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left">
                Mark for Disposal
              </button>
            </div>
          </div>

          {/* Important Dates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Important Dates</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Purchased</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(tyre.purchaseDate).toLocaleDateString()}
                </p>
              </div>
              {tyre.installedDate && (
                <div>
                  <p className="text-sm text-gray-500">Installed</p>
                  <p className="text-sm font-medium mt-1">
                    {new Date(tyre.installedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {tyre.lastInspectionDate && (
                <div>
                  <p className="text-sm text-gray-500">Last Inspection</p>
                  <p className="text-sm font-medium mt-1">
                    {new Date(tyre.lastInspectionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {tyre.nextInspectionDue && (
                <div>
                  <p className="text-sm text-gray-500">Next Inspection Due</p>
                  <p className="text-sm font-medium mt-1 text-orange-600">
                    {new Date(tyre.nextInspectionDue).toLocaleDateString()}
                  </p>
                </div>
              )}
              {tyre.lastRotationDate && (
                <div>
                  <p className="text-sm text-gray-500">Last Rotation</p>
                  <p className="text-sm font-medium mt-1">
                    {new Date(tyre.lastRotationDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="sm:hidden bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-4 space-y-2">
              <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
