'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { MOCK_TYRES } from '@/constants/tyres';
import { MOCK_VEHICLES } from '@/constants/vehicles';

export default function AssignTyrePage() {
  const params = useParams();
  const router = useRouter();
  const tyreId = params.id as string;
  
  const tyre = MOCK_TYRES.find(t => t.id === tyreId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId: '',
    position: '',
    installationDate: new Date().toISOString().split('T')[0],
    currentOdometer: '',
    treadDepthAtInstallation: tyre?.currentTreadDepth.toString() || '',
    installedBy: '',
    notes: '',
  });

  if (!tyre) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tyre Not Found</h2>
          <p className="text-gray-600 mb-6">The tyre you&apos;re trying to assign doesn&apos;t exist.</p>
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

  // Check if tyre is already in use
  if (tyre.status === 'in-use') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/tyres/${tyreId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Assign Tyre</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tyre.serialNumber}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Tyre Already in Use</h3>
              <p className="text-sm text-yellow-800 mb-3">
                This tyre is currently installed on vehicle {tyre.vehiclePlate} at position{' '}
                {tyre.position?.replace('-', ' ')}. You need to remove it from the current vehicle before
                assigning it to another vehicle.
              </p>
              <div className="flex gap-3">
                <Link
                  href={`/dashboard/tyres/${tyreId}`}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  View Tyre Details
                </Link>
                <Link
                  href="/dashboard/tyres/inventory"
                  className="px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium"
                >
                  Back to Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would send data to an API
    console.log('Assignment data:', { tyreId, ...formData });

    // Navigate back to tyre details
    router.push(`/dashboard/tyres/${tyreId}`);
  };

  const selectedVehicle = MOCK_VEHICLES.find(v => v.id === formData.vehicleId);

  // Position options based on vehicle type
  const getPositionOptions = () => {
    if (!selectedVehicle) return [];
    
    // Basic positions for most vehicles
    const positions = [
      { value: 'front-left', label: 'Front Left' },
      { value: 'front-right', label: 'Front Right' },
      { value: 'rear-left', label: 'Rear Left' },
      { value: 'rear-right', label: 'Rear Right' },
      { value: 'spare', label: 'Spare' },
    ];

    return positions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/tyres/${tyreId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Assign/Install Tyre</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tyre.brand} {tyre.model} • {tyre.serialNumber}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Tyre Summary Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-3">Tyre Ready for Installation</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Size:</span>
                      <span className="font-medium">{tyre.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Tread Depth:</span>
                      <span className="font-medium">{tyre.currentTreadDepth}mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Condition:</span>
                      <span className="font-medium">{tyre.conditionRating}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Vehicle Selection</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="vehicleId"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Choose a vehicle...</option>
                    {MOCK_VEHICLES.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} - {vehicle.make} {vehicle.model} ({vehicle.type})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedVehicle && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Vehicle Details</h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium capitalize">{selectedVehicle.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Year:</span>
                        <span className="font-medium">{selectedVehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current Mileage:</span>
                        <span className="font-medium">{selectedVehicle.currentOdometer?.toLocaleString() || 'N/A'} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-medium capitalize">{selectedVehicle.status}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Position Selection */}
            {formData.vehicleId && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold">Position Selection</h2>
                </div>
                <div className="p-6">
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Tyre Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select position...</option>
                    {getPositionOptions().map(pos => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Installation Details */}
            {formData.position && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold">Installation Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label htmlFor="installationDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Installation Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="installationDate"
                      name="installationDate"
                      value={formData.installationDate}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="currentOdometer" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Vehicle Odometer (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="currentOdometer"
                      name="currentOdometer"
                      value={formData.currentOdometer}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 45000"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="treadDepthAtInstallation" className="block text-sm font-medium text-gray-700 mb-1">
                      Tread Depth at Installation (mm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="treadDepthAtInstallation"
                      name="treadDepthAtInstallation"
                      value={formData.treadDepthAtInstallation}
                      onChange={handleChange}
                      required
                      step="0.1"
                      placeholder="e.g., 12.5"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="installedBy" className="block text-sm font-medium text-gray-700 mb-1">
                      Installed By (Technician) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="installedBy"
                      name="installedBy"
                      value={formData.installedBy}
                      onChange={handleChange}
                      required
                      placeholder="Technician name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Installation Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any observations or special notes about the installation..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {formData.position && (
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Link
              href={`/dashboard/tyres/${tyreId}`}
              className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Installing...' : 'Install Tyre'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
