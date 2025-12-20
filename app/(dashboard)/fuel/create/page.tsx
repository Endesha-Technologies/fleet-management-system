'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_TRIPS } from '@/constants/trips';
import { Trip } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Truck } from 'lucide-react';

export default function CreateFuelLogPage() {
  const router = useRouter();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    vehiclePlate: '',
    driverName: '',
    tripId: '',
    fuelStation: '',
    location: '',
    litersPurchased: '',
    pricePerLiter: '5200',
    odometerReading: '',
    fuelType: 'Diesel',
    paymentMethod: 'Account',
    receiptNumber: '',
    notes: '',
  });

  // Filter only completed trips
  const completedTrips = MOCK_TRIPS.filter(trip => trip.status === 'Completed');

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    setFormData(prev => ({
      ...prev,
      vehiclePlate: trip.vehiclePlate,
      driverName: trip.driverName,
      tripId: trip.id,
      odometerReading: trip.odometerEnd?.toString() || '',
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalCost = formData.litersPurchased && formData.pricePerLiter
    ? (parseFloat(formData.litersPurchased) * parseFloat(formData.pricePerLiter)).toLocaleString()
    : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Fuel log submitted:', formData);
    alert('Fuel log added successfully!');
    router.push('/fuel');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex-none bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/fuel')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Add Fuel Log</h1>
            <p className="text-sm text-gray-600">Select a completed trip and log fuel consumption</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Completed Trips List */}
        <div className="w-96 bg-white shadow-sm flex flex-col">
          <div className="flex-none p-4 border-b border-gray-200">
            <h2 className="font-semibold text-lg">Completed Trips</h2>
            <p className="text-sm text-gray-600">{completedTrips.length} trips available</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {completedTrips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No completed trips found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {completedTrips.map((trip) => (
                  <li key={trip.id}>
                    <button
                      onClick={() => handleTripSelect(trip)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        selectedTrip?.id === trip.id
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-sm">{trip.routeName}</h3>
                        {selectedTrip?.id === trip.id && (
                          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 ml-2" />
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-0.5">
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
          <div className="max-w-3xl mx-auto p-6">
            {!selectedTrip ? (
              <div className="text-center py-16 text-gray-500">
                <Truck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Select a Trip</h3>
                <p>Choose a completed trip from the left to start logging fuel</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trip Info Card */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Selected Trip</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-700">Vehicle:</span>
                      <span className="ml-2 font-medium">{selectedTrip.vehiclePlate}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Driver:</span>
                      <span className="ml-2 font-medium">{selectedTrip.driverName}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Route:</span>
                      <span className="ml-2 font-medium">{selectedTrip.routeName}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Distance:</span>
                      <span className="ml-2 font-medium">{selectedTrip.distance}</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  <h3 className="font-semibold text-lg">Fuel Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Date & Time */}
                    <div>
                      <Label htmlFor="date">Date & Time *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="datetime-local"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Fuel Station */}
                    <div>
                      <Label htmlFor="fuelStation">Fuel Station *</Label>
                      <Input
                        id="fuelStation"
                        name="fuelStation"
                        value={formData.fuelStation}
                        onChange={handleChange}
                        placeholder="e.g., Shell Kampala Central"
                        required
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Kampala"
                        required
                      />
                    </div>

                    {/* Fuel Type */}
                    <div>
                      <Label htmlFor="fuelType">Fuel Type *</Label>
                      <select
                        id="fuelType"
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                      </select>
                    </div>

                    {/* Liters Purchased */}
                    <div>
                      <Label htmlFor="litersPurchased">Liters Purchased *</Label>
                      <Input
                        id="litersPurchased"
                        name="litersPurchased"
                        type="number"
                        step="0.1"
                        value={formData.litersPurchased}
                        onChange={handleChange}
                        placeholder="e.g., 120.5"
                        required
                      />
                    </div>

                    {/* Price Per Liter */}
                    <div>
                      <Label htmlFor="pricePerLiter">Price per Liter (UGX) *</Label>
                      <Input
                        id="pricePerLiter"
                        name="pricePerLiter"
                        type="number"
                        value={formData.pricePerLiter}
                        onChange={handleChange}
                        placeholder="e.g., 5200"
                        required
                      />
                    </div>

                    {/* Odometer Reading */}
                    <div>
                      <Label htmlFor="odometerReading">Odometer Reading (km) *</Label>
                      <Input
                        id="odometerReading"
                        name="odometerReading"
                        type="number"
                        value={formData.odometerReading}
                        onChange={handleChange}
                        placeholder="e.g., 145678"
                        required
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="Account">Account</option>
                        <option value="Card">Card</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>

                    {/* Receipt Number */}
                    <div className="col-span-2">
                      <Label htmlFor="receiptNumber">Receipt Number</Label>
                      <Input
                        id="receiptNumber"
                        name="receiptNumber"
                        value={formData.receiptNumber}
                        onChange={handleChange}
                        placeholder="e.g., SHL-2025-0456"
                      />
                    </div>

                    {/* Notes */}
                    <div className="col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>

                  {/* Total Cost Display */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Total Cost:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        UGX {totalCost}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    onClick={() => router.push('/fuel')}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Fuel Log
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
