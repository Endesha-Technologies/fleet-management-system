'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_TRIPS } from '@/constants/trips';
import { Trip } from '@/types/trip';
import { ArrowLeft, CheckCircle2, Truck } from 'lucide-react';
import { FormSelect } from '@/components/ui/form';
import { FuelLogForm } from '../_components';
import type { FuelLogFormData } from '../_types';

export default function CreateFuelLogPage() {
  const router = useRouter();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Filter only completed trips
  const completedTrips = MOCK_TRIPS.filter(trip => trip.status === 'Completed');

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleSubmit = (formData: FuelLogFormData) => {
    console.log('Fuel log submitted:', formData);
    alert('Fuel log added successfully!');
    router.push('/fuel');
  };

  const handleCancel = () => {
    router.push('/fuel');
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex-none bg-white px-4 py-3 md:px-6 md:py-4 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.push('/fuel')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Add Fuel Log</h1>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column - Completed Trips List (Desktop Only) */}
        <div className="hidden md:flex md:w-96 bg-white shadow-sm flex-col border-r border-gray-200">
          <div className="flex-none p-4 border-b border-gray-200">
            <h2 className="font-semibold text-lg">Completed Trips</h2>
            <p className="text-sm text-gray-600">{completedTrips.length} trips available</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {completedTrips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No completed trips found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {completedTrips.map((trip) => (
                  <li key={trip.id}>
                    <button
                      onClick={() => handleTripSelect(trip)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        selectedTrip?.id === trip.id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-base">{trip.routeName}</h3>
                        {selectedTrip?.id === trip.id && (
                          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 ml-2" />
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-0.5">
                        <div>{trip.vehiclePlate} • {trip.driverName}</div>
                        <div className="truncate">{trip.startLocation} → {trip.endLocation}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-500">
                            {trip.actualEndTime && new Date(trip.actualEndTime).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-gray-700">{trip.distance}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column - Fuel Log Form */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {/* Mobile Trip Selector Dropdown */}
            <div className="md:hidden mb-4">
              <FormSelect
                label="Select Completed Trip"
                value={selectedTrip?.id || ''}
                onChange={(e) => {
                  const trip = completedTrips.find(t => t.id === e.target.value);
                  if (trip) handleTripSelect(trip);
                }}
                options={[
                  { value: '', label: 'Choose a trip...' },
                  ...completedTrips.map((trip) => ({
                    value: trip.id,
                    label: `${trip.routeName} - ${trip.vehiclePlate} (${new Date(trip.actualEndTime!).toLocaleDateString()})`,
                  })),
                ]}
              />
            </div>

            {!selectedTrip ? (
              <div className="hidden md:block text-center py-16 text-gray-500">
                <Truck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Select a Trip</h3>
                <p className="text-base">Choose a completed trip to start logging fuel</p>
              </div>
            ) : (
              <FuelLogForm
                selectedTrip={selectedTrip}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
