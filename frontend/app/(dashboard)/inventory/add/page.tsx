'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { PART_CATEGORIES, STORAGE_LOCATIONS } from '@/constants/inventory';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormNumberInput,
  FormDateInput,
  FormSection,
} from '@/components/ui/form';
import type { AddFormData } from '../_types';

export default function AddInventoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AddFormData>({
    partName: '',
    partNumber: '',
    category: '',
    condition: 'Good',
    quantity: '1',
    unitPrice: '',
    removedFromVehicle: '',
    removalDate: new Date().toISOString().slice(0, 16),
    removalReason: '',
    storageLocation: '',
    addedBy: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalValue = formData.quantity && formData.unitPrice
    ? (parseFloat(formData.quantity) * parseFloat(formData.unitPrice)).toLocaleString()
    : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding inventory item:', formData);
    alert('Part added to inventory successfully!');
    router.push('/inventory');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Add Part to Inventory</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Record parts removed from trucks</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Part Information */}
            <FormSection title="Part Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormInput
                    label="Part Name"
                    name="partName"
                    value={formData.partName}
                    onChange={handleChange}
                    placeholder="e.g., Front Brake Pads"
                    required
                  />
                </div>

                <FormInput
                  label="Part Number"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleChange}
                  placeholder="e.g., BP-F-2024"
                  required
                />

                <FormSelect
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select category...' },
                    ...PART_CATEGORIES.map(category => ({
                      value: category,
                      label: category,
                    })),
                  ]}
                  required
                />

                <FormSelect
                  label="Condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  options={[
                    { value: 'New', label: 'New' },
                    { value: 'Good', label: 'Good' },
                    { value: 'Fair', label: 'Fair' },
                    { value: 'Poor', label: 'Poor' },
                    { value: 'Damaged', label: 'Damaged' },
                  ]}
                  required
                />

                <FormNumberInput
                  label="Quantity"
                  name="quantity"
                  min={1}
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </FormSection>

            {/* Pricing */}
            <FormSection title="Pricing">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormNumberInput
                  label="Unit Price (UGX)"
                  name="unitPrice"
                  min={0}
                  value={formData.unitPrice}
                  onChange={handleChange}
                  placeholder="e.g., 75000"
                  required
                />

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-end">
                  <div className="w-full">
                    <Label className="text-xs sm:text-sm">Total Value</Label>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                      UGX {totalValue}
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Vehicle & Removal Details */}
            <FormSection title="Removal Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Removed From Vehicle"
                  name="removedFromVehicle"
                  value={formData.removedFromVehicle}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select vehicle...' },
                    ...MOCK_VEHICLES.map(vehicle => ({
                      value: vehicle.plateNumber,
                      label: `${vehicle.plateNumber} - ${vehicle.make} ${vehicle.model}`,
                    })),
                  ]}
                  required
                />

                <FormDateInput
                  label="Removal Date & Time"
                  name="removalDate"
                  includeTime
                  value={formData.removalDate}
                  onChange={handleChange}
                  required
                />

                <div className="sm:col-span-2">
                  <FormInput
                    label="Removal Reason"
                    name="removalReason"
                    value={formData.removalReason}
                    onChange={handleChange}
                    placeholder="e.g., Preventive Maintenance - 50% wear"
                    required
                  />
                </div>
              </div>
            </FormSection>

            {/* Storage & Personnel */}
            <FormSection title="Storage &amp; Personnel">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Storage Location"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select location...' },
                    ...STORAGE_LOCATIONS.map(location => ({
                      value: location,
                      label: location,
                    })),
                  ]}
                  required
                />

                <FormInput
                  label="Added By"
                  name="addedBy"
                  value={formData.addedBy}
                  onChange={handleChange}
                  placeholder="e.g., John Mechanic"
                  required
                />

                <div className="sm:col-span-2">
                  <FormTextarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional notes about the part condition, potential use, etc..."
                  />
                </div>
              </div>
            </FormSection>

            {/* Action Buttons */}
            <div className="flex flex-row items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
              >
                Add to Inventory
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
