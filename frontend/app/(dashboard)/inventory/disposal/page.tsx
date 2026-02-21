'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_INVENTORY_ITEMS } from '@/constants/inventory';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Package, AlertTriangle } from 'lucide-react';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormNumberInput,
  FormDateInput,
  FormSection,
} from '@/components/ui/form';
import type { DisposalFormData, DisposalMethod } from '../_types';

export default function RecordDisposalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DisposalFormData>({
    inventoryItemId: '',
    quantity: '1',
    disposalMethod: 'Recycled' as DisposalMethod,
    disposalReason: '',
    disposedTo: '',
    disposalCost: '',
    transactionDate: new Date().toISOString().slice(0, 16),
    performedBy: '',
    approvedBy: '',
    notes: '',
  });

  // Get available items (only items in storage)
  const availableItems = MOCK_INVENTORY_ITEMS.filter(item => item.status === 'In Storage');
  const selectedItem = availableItems.find(item => item.id === formData.inventoryItemId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recording disposal:', formData);
    alert('Disposal recorded successfully!');
    router.push('/inventory');
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const calculateTotalLoss = () => {
    if (!selectedItem) return null;
    const partValue = selectedItem.unitPrice * parseInt(formData.quantity || '1');
    const disposalCost = parseFloat(formData.disposalCost || '0');
    return partValue + disposalCost;
  };

  const totalLoss = calculateTotalLoss();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Record Disposal</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Dispose spare part from inventory</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Warning Banner */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-900 font-medium text-sm mb-1">Important Notice</h4>
                <p className="text-red-800 text-xs sm:text-sm">
                  Disposing parts will permanently remove them from inventory. This action should require supervisor approval.
                </p>
              </div>
            </div>

            {/* Part Selection */}
            <FormSection title="Part Information">
              <div className="flex items-center gap-2 -mt-2 mb-2">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormSelect
                    label="Select Part to Dispose"
                    name="inventoryItemId"
                    value={formData.inventoryItemId}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Choose a part...' },
                      ...availableItems.map(item => ({
                        value: item.id,
                        label: `${item.partName} (${item.partNumber}) - Available: ${item.quantity} - ${formatCurrency(item.unitPrice)}/unit`,
                      })),
                    ]}
                    required
                  />
                </div>

                {selectedItem && (
                  <div className="sm:col-span-2 bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-red-700 block mb-1">Condition</span>
                        <span className="font-medium text-red-900">{selectedItem.condition}</span>
                      </div>
                      <div>
                        <span className="text-red-700 block mb-1">Category</span>
                        <span className="font-medium text-red-900">{selectedItem.category}</span>
                      </div>
                      <div>
                        <span className="text-red-700 block mb-1">Unit Value</span>
                        <span className="font-medium text-red-900">{formatCurrency(selectedItem.unitPrice)}</span>
                      </div>
                      <div>
                        <span className="text-red-700 block mb-1">Storage</span>
                        <span className="font-medium text-red-900">{selectedItem.storageLocation}</span>
                      </div>
                    </div>
                  </div>
                )}

                <FormNumberInput
                  label="Quantity"
                  name="quantity"
                  min={1}
                  max={selectedItem?.quantity || 1}
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  disabled={!selectedItem}
                />
              </div>
            </FormSection>

            {/* Disposal Details */}
            <FormSection title="Disposal Details">
              <div className="flex items-center gap-2 -mt-2 mb-2">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  label="Disposal Method"
                  name="disposalMethod"
                  value={formData.disposalMethod}
                  onChange={handleChange}
                  options={[
                    { value: 'Recycled', label: 'Recycled' },
                    { value: 'Scrapped', label: 'Scrapped' },
                    { value: 'Donated', label: 'Donated' },
                    { value: 'Returned to Supplier', label: 'Returned to Supplier' },
                  ]}
                  required
                />

                <FormDateInput
                  label="Disposal Date & Time"
                  name="transactionDate"
                  includeTime
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                />

                <div className="sm:col-span-2">
                  <FormInput
                    label="Disposal Reason"
                    name="disposalReason"
                    value={formData.disposalReason}
                    onChange={handleChange}
                    placeholder="e.g., Damaged beyond repair, Obsolete, Safety concern"
                    required
                  />
                </div>

                <FormInput
                  label="Disposed To"
                  name="disposedTo"
                  value={formData.disposedTo}
                  onChange={handleChange}
                  placeholder="e.g., Green Recycling Ltd"
                />

                <FormNumberInput
                  label="Disposal Cost (UGX)"
                  name="disposalCost"
                  min={0}
                  step={0.01}
                  value={formData.disposalCost}
                  onChange={handleChange}
                  placeholder="Cost for disposal service"
                />

                {totalLoss !== null && (
                  <div className="sm:col-span-2 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-amber-700 block mb-1">Part Value Loss</span>
                        <span className="font-medium text-amber-900">
                          {selectedItem ? formatCurrency(selectedItem.unitPrice * parseInt(formData.quantity || '1')) : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-700 block mb-1">Total Loss (incl. disposal cost)</span>
                        <span className="font-bold text-red-600">{formatCurrency(totalLoss)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Authorization */}
            <FormSection title="Authorization">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Performed By"
                  name="performedBy"
                  value={formData.performedBy}
                  onChange={handleChange}
                  placeholder="e.g., John Warehouse"
                  required
                />

                <FormInput
                  label="Approved By"
                  name="approvedBy"
                  value={formData.approvedBy}
                  onChange={handleChange}
                  placeholder="e.g., Manager Name"
                  required
                />
              </div>
            </FormSection>

            {/* Additional Information */}
            <FormSection title="Additional Information">
              <FormTextarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional details about this disposal..."
              />
            </FormSection>

            {/* Action Buttons */}
            <div className="flex flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Record Disposal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
