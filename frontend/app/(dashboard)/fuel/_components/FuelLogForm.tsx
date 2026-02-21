'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormNumberInput,
  FormDateInput,
  FormSection,
} from '@/components/ui/form';
import type { FuelLogFormProps, FuelLogFormData } from '../_types';

export default function FuelLogForm({ selectedTrip, onCancel, onSubmit }: FuelLogFormProps) {
  const [formData, setFormData] = useState<FuelLogFormData>({
    date: new Date().toISOString().slice(0, 16),
    vehiclePlate: selectedTrip.vehiclePlate,
    driverName: selectedTrip.driverName,
    tripId: selectedTrip.id,
    tripName: selectedTrip.routeName,
    fuelStation: '',
    location: '',
    litersPurchased: '',
    pricePerLiter: '5200',
    odometerReading: selectedTrip.odometerEnd?.toString() || '',
    fuelType: 'Diesel',
    paymentMethod: 'Account',
    receiptNumber: '',
    notes: '',
    fuelStart: selectedTrip.fuelStart?.toString() || '',
    fuelUsed: '',
    fuelEnd: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate fuel end when fuel start or fuel used changes
      if (name === 'fuelStart' || name === 'fuelUsed') {
        const fuelStart = parseFloat(name === 'fuelStart' ? value : updated.fuelStart);
        const fuelUsed = parseFloat(name === 'fuelUsed' ? value : updated.fuelUsed);
        
        if (!isNaN(fuelStart) && !isNaN(fuelUsed)) {
          const fuelEnd = fuelStart - fuelUsed;
          if (fuelEnd >= 0) {
            updated.fuelEnd = fuelEnd.toFixed(1);
          }
        }
      }
      
      return updated;
    });
  };

  const totalCost = formData.litersPurchased && formData.pricePerLiter
    ? (parseFloat(formData.litersPurchased) * parseFloat(formData.pricePerLiter)).toLocaleString()
    : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Trip Info Card */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Selected Trip</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
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

      {/* Trip Fuel Tracking */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 space-y-4">
        <FormSection title="Trip Fuel Tracking">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormNumberInput
              label="Fuel Start (Liters)"
              name="fuelStart"
              step="0.1"
              value={formData.fuelStart}
              onChange={handleChange}
              placeholder="e.g., 150.5"
              description="Fuel at trip start"
              required
            />

            <FormNumberInput
              label="Fuel Used (Liters)"
              name="fuelUsed"
              step="0.1"
              value={formData.fuelUsed}
              onChange={handleChange}
              placeholder="e.g., 85.3"
              description="Fuel consumed during trip"
              required
            />

            <FormNumberInput
              label="Fuel End (Liters)"
              name="fuelEnd"
              step="0.1"
              value={formData.fuelEnd}
              onChange={handleChange}
              placeholder="e.g., 65.2"
              description="Fuel remaining at trip end"
              required
            />
          </div>
        </FormSection>

        {/* Fuel Balance Indicator */}
        {formData.fuelStart && formData.fuelUsed && formData.fuelEnd && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            {(() => {
              const start = parseFloat(formData.fuelStart);
              const used = parseFloat(formData.fuelUsed);
              const end = parseFloat(formData.fuelEnd);
              const calculated = start - used;
              const difference = Math.abs(calculated - end);
              
              if (difference < 0.1) {
                return (
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="font-medium">✓ Fuel balance is correct</span>
                  </div>
                );
              } else {
                return (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-amber-700">
                    <span className="font-medium">⚠ Check fuel calculations</span>
                    <span className="text-xs">(Expected: {calculated.toFixed(1)}L, Entered: {end.toFixed(1)}L)</span>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </div>

      {/* Fuel Purchase Details */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
        <FormSection title="Fuel Purchase Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 md:col-span-1">
              <FormDateInput
                label="Date & Time"
                name="date"
                includeTime
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <FormInput
                label="Fuel Station"
                name="fuelStation"
                value={formData.fuelStation}
                onChange={handleChange}
                placeholder="e.g., Shell Kampala Central"
                required
              />
            </div>

            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Kampala"
              required
            />

            <FormSelect
              label="Fuel Type"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              options={[
                { value: 'Diesel', label: 'Diesel' },
                { value: 'Petrol', label: 'Petrol' },
              ]}
              required
            />

            <FormNumberInput
              label="Liters Purchased"
              name="litersPurchased"
              step="0.1"
              value={formData.litersPurchased}
              onChange={handleChange}
              placeholder="e.g., 120.5"
              required
            />

            <FormNumberInput
              label="Price per Liter (UGX)"
              name="pricePerLiter"
              value={formData.pricePerLiter}
              onChange={handleChange}
              placeholder="e.g., 5200"
              required
            />

            <FormNumberInput
              label="Odometer Reading (km)"
              name="odometerReading"
              value={formData.odometerReading}
              onChange={handleChange}
              placeholder="e.g., 145678"
              required
            />

            <FormSelect
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              options={[
                { value: 'Account', label: 'Account' },
                { value: 'Card', label: 'Card' },
                { value: 'Mobile Money', label: 'Mobile Money' },
                { value: 'Cash', label: 'Cash' },
              ]}
              required
            />

            <div className="col-span-1 sm:col-span-2">
              <FormInput
                label="Receipt Number"
                name="receiptNumber"
                value={formData.receiptNumber}
                onChange={handleChange}
                placeholder="e.g., SHL-2025-0456"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <FormTextarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes..."
              />
            </div>

            {/* Total Cost Display */}
            <div className="col-span-1 sm:col-span-2 bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-gray-700 font-medium">Total Cost:</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  UGX {totalCost}
                </span>
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row items-center justify-end gap-3 sticky bottom-0 bg-gray-50 py-4 -mx-4 px-4 md:-mx-6 md:px-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 sm:flex-none sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none sm:w-auto"
        >
          Save
        </Button>
      </div>
    </form>
  );
}
