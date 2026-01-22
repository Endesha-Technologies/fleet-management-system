'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { PART_CATEGORIES, STORAGE_LOCATIONS } from '@/constants/inventory';
import { MOCK_VEHICLES } from '@/constants/vehicles';

export default function AddInventoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
            <div className="space-y-4 pb-4 border-b border-gray-100">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Part Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="partName" className="text-xs sm:text-sm">Part Name *</Label>
                  <Input
                    id="partName"
                    name="partName"
                    value={formData.partName}
                    onChange={handleChange}
                    placeholder="e.g., Front Brake Pads"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="partNumber" className="text-xs sm:text-sm">Part Number *</Label>
                  <Input
                    id="partNumber"
                    name="partNumber"
                    value={formData.partNumber}
                    onChange={handleChange}
                    placeholder="e.g., BP-F-2024"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-xs sm:text-sm">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select category...</option>
                    {PART_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="condition" className="text-xs sm:text-sm">Condition *</Label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-xs sm:text-sm">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4 pb-4 border-b border-gray-100">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Pricing</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitPrice" className="text-xs sm:text-sm">Unit Price (UGX) *</Label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="0"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    placeholder="e.g., 75000"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-end">
                  <div className="w-full">
                    <Label className="text-xs sm:text-sm">Total Value</Label>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                      UGX {totalValue}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle & Removal Details */}
            <div className="space-y-4 pb-4 border-b border-gray-100">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Removal Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="removedFromVehicle" className="text-xs sm:text-sm">Removed From Vehicle *</Label>
                  <select
                    id="removedFromVehicle"
                    name="removedFromVehicle"
                    value={formData.removedFromVehicle}
                    onChange={handleChange}
                    className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select vehicle...</option>
                    {MOCK_VEHICLES.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.plateNumber}>
                        {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="removalDate" className="text-xs sm:text-sm">Removal Date & Time *</Label>
                  <Input
                    id="removalDate"
                    name="removalDate"
                    type="datetime-local"
                    value={formData.removalDate}
                    onChange={handleChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="removalReason" className="text-xs sm:text-sm">Removal Reason *</Label>
                  <Input
                    id="removalReason"
                    name="removalReason"
                    value={formData.removalReason}
                    onChange={handleChange}
                    placeholder="e.g., Preventive Maintenance - 50% wear"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Storage & Personnel */}
            <div className="space-y-4 pb-4 border-b border-gray-100">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Storage & Personnel</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storageLocation" className="text-xs sm:text-sm">Storage Location *</Label>
                  <select
                    id="storageLocation"
                    name="storageLocation"
                    value={formData.storageLocation}
                    onChange={handleChange}
                    className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select location...</option>
                    {STORAGE_LOCATIONS.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="addedBy" className="text-xs sm:text-sm">Added By *</Label>
                  <Input
                    id="addedBy"
                    name="addedBy"
                    value={formData.addedBy}
                    onChange={handleChange}
                    placeholder="e.g., John Mechanic"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="notes" className="text-xs sm:text-sm">Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Additional notes about the part condition, potential use, etc..."
                  />
                </div>
              </div>
            </div>

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
