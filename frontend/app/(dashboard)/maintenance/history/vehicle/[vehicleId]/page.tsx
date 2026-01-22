'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, Wrench, Clock, MapPin, Gauge } from 'lucide-react';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import { mockServiceHistory } from '@/constants/service-history';

export default function VehicleServiceHistoryPage() {
  const params = useParams();
  const vehicleId = params?.vehicleId as string;

  // Find the vehicle
  const vehicle = MOCK_VEHICLES.find((v) => v.id === vehicleId);

  if (!vehicle) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Vehicle not found</p>
        </div>
      </div>
    );
  }

  // Get all service records for this vehicle, sorted by date (newest first)
  const serviceRecords = mockServiceHistory
    .filter((record) => record.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());

  // Calculate totals
  const totalCost = serviceRecords.reduce((sum, record) => sum + record.cost, 0);
  const totalServices = serviceRecords.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Link
              href="/maintenance/service-history"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Service History</h1>
              <p className="text-sm text-gray-500 mt-1">{vehicle.plateNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Vehicle Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Summary</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Vehicle Details */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Plate Number</p>
                <p className="text-lg font-semibold text-gray-900">{vehicle.plateNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Make & Model</p>
                  <p className="font-medium text-gray-900">{vehicle.make} {vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Year</p>
                  <p className="font-medium text-gray-900">{vehicle.year}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <p className="font-medium text-gray-900">{vehicle.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : vehicle.status === 'Maintenance'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {vehicle.currentOdometer && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Gauge className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Current Odometer</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {vehicle.currentOdometer.toLocaleString()} km
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Service Statistics */}
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      UGX {totalCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {totalServices > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Average Cost</p>
                      <p className="text-2xl font-bold text-gray-900">
                        UGX {Math.round(totalCost / totalServices).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Timeline */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Service Timeline</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete service history for this vehicle
            </p>
          </div>

          {serviceRecords.length === 0 ? (
            <div className="p-8 text-center">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No service records found for this vehicle</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {serviceRecords.map((record, index) => (
                <div key={record.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Timeline Indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          record.serviceType === 'preventive'
                            ? 'bg-green-100'
                            : record.serviceType === 'corrective'
                            ? 'bg-yellow-100'
                            : record.serviceType === 'emergency'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        <Wrench
                          className={`w-5 h-5 ${
                            record.serviceType === 'preventive'
                              ? 'text-green-600'
                              : record.serviceType === 'corrective'
                              ? 'text-yellow-600'
                              : record.serviceType === 'emergency'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}
                        />
                      </div>
                      {index < serviceRecords.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">
                            {record.description}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Work Order: {record.workOrderNumber}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            record.serviceType === 'preventive'
                              ? 'bg-green-100 text-green-700'
                              : record.serviceType === 'corrective'
                              ? 'bg-yellow-100 text-yellow-700'
                              : record.serviceType === 'emergency'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {record.serviceType}
                        </span>
                      </div>

                      {/* Service Info Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(record.serviceDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{record.duration}h</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Wrench className="w-4 h-4 text-gray-400" />
                          <span>{record.technicianName}</span>
                        </div>
                        {record.odometerReading && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Gauge className="w-4 h-4 text-gray-400" />
                            <span>{record.odometerReading.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {record.serviceCategory}
                        </span>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Parts Cost</span>
                          <span className="text-sm font-medium text-gray-900">
                            UGX {record.partsCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Labor Cost</span>
                          <span className="text-sm font-medium text-gray-900">
                            UGX {record.laborCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t border-gray-100 pt-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-semibold text-gray-900">Total Cost</span>
                            <span className="text-lg font-bold text-gray-900">
                              UGX {record.cost.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Parts Used */}
                      {record.partsUsed && record.partsUsed.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Parts Used:</p>
                          <div className="space-y-1">
                            {record.partsUsed.map((part) => (
                              <div
                                key={part.id}
                                className="flex items-center justify-between text-sm bg-white rounded px-3 py-1.5 border border-gray-100"
                              >
                                <span className="text-gray-700">
                                  {part.name} (x{part.quantity})
                                </span>
                                <span className="text-gray-900 font-medium">
                                  UGX {part.totalCost.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
                          <p className="text-sm text-blue-700">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
