'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function AddFuelLogModal() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    vehiclePlate: '',
    driverName: '',
    tripId: '',
    fuelStation: '',
    location: '',
    litersPurchased: '',
    pricePerLiter: '',
    odometerReading: '',
    fuelType: 'Diesel',
    paymentMethod: 'Account',
    receiptNumber: '',
    notes: '',
  });

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Fuel log submitted:', formData);
    // In production: API call to save fuel log
    alert('Fuel log added successfully!');
    handleClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Add Fuel Log</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Vehicle */}
            <div>
              <Label htmlFor="vehiclePlate">Vehicle Plate *</Label>
              <select
                id="vehiclePlate"
                name="vehiclePlate"
                value={formData.vehiclePlate}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select vehicle</option>
                <option value="UAH 123K">UAH 123K</option>
                <option value="UBB 456M">UBB 456M</option>
                <option value="UBD 789P">UBD 789P</option>
              </select>
            </div>

            {/* Driver */}
            <div>
              <Label htmlFor="driverName">Driver Name *</Label>
              <Input
                id="driverName"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="e.g., Patrick Okello"
                required
              />
            </div>

            {/* Trip ID (Optional) */}
            <div>
              <Label htmlFor="tripId">Trip ID (Optional)</Label>
              <Input
                id="tripId"
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                placeholder="Link to specific trip"
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
                placeholder="e.g., 120"
                required
              />
            </div>

            {/* Price per Liter */}
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
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>

            {/* Receipt Number */}
            <div>
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
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Total Cost Display */}
            {formData.litersPurchased && formData.pricePerLiter && (
              <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {(parseFloat(formData.litersPurchased) * parseFloat(formData.pricePerLiter)).toLocaleString()} UGX
                  </span>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Add Fuel Log
          </Button>
        </div>
      </div>
    </div>
  );
}
