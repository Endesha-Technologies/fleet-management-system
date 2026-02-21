'use client';

import { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { MOCK_INVENTORY_ITEMS } from '@/constants/inventory';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Trash2, Wrench } from 'lucide-react';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormNumberInput,
  FormDateInput,
  FormSection,
} from '@/components/ui/form';
import type { InventoryPageProps, MoveTransactionType, MoveFormData } from '../../_types';

export default function MoveInventoryPage({ params }: InventoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const item = MOCK_INVENTORY_ITEMS.find((i) => i.id === id);

  const [transactionType, setTransactionType] = useState<MoveTransactionType>('sold');
  const [formData, setFormData] = useState<MoveFormData>({
    quantity: '1',
    saleAmount: '',
    buyer: '',
    disposalMethod: 'Recycled',
    disposalReason: '',
    vehicleId: '',
    maintenanceId: '',
    performedBy: '',
    notes: '',
    transactionDate: new Date().toISOString().slice(0, 16),
  });

  if (!item) {
    notFound();
  }

  if (item.status !== 'In Storage') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md text-center">
          <p className="text-gray-600">This part is no longer in storage and cannot be moved.</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Moving inventory item:', { type: transactionType, ...formData });
    alert(`Part ${transactionType} successfully!`);
    router.push('/inventory');
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className=" mx-auto max-w-4xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Move Inventory Part</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{item.partName} - {item.partNumber}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Part Summary */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 block mb-1">Part</span>
                  <span className="font-medium text-blue-900">{item.partName}</span>
                </div>
                <div>
                  <span className="text-blue-700 block mb-1">Available</span>
                  <span className="font-medium text-blue-900">{item.quantity}</span>
                </div>
                <div>
                  <span className="text-blue-700 block mb-1">Condition</span>
                  <span className="font-medium text-blue-900">{item.condition}</span>
                </div>
                <div>
                  <span className="text-blue-700 block mb-1">Value</span>
                  <span className="font-medium text-blue-900">{formatCurrency(item.totalValue)}</span>
                </div>
              </div>
            </div>

            {/* Transaction Type Selection */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-medium">Transaction Type *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTransactionType('sold')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    transactionType === 'sold'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ShoppingCart className={`h-6 w-6 mx-auto mb-2 ${transactionType === 'sold' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Sell Part</div>
                  <div className="text-xs text-gray-500 mt-1">Sell to customer/shop</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTransactionType('disposed')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    transactionType === 'disposed'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Trash2 className={`h-6 w-6 mx-auto mb-2 ${transactionType === 'disposed' ? 'text-red-600' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Dispose Part</div>
                  <div className="text-xs text-gray-500 mt-1">Recycle/Scrap/Donate</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTransactionType('used')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    transactionType === 'used'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wrench className={`h-6 w-6 mx-auto mb-2 ${transactionType === 'used' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div className="text-sm font-medium">Use in Maintenance</div>
                  <div className="text-xs text-gray-500 mt-1">Install on vehicle</div>
                </button>
              </div>
            </div>

            {/* Common Fields */}
            <FormSection title="Transaction Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormNumberInput
                  label="Quantity"
                  name="quantity"
                  min={1}
                  max={item.quantity}
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />

                <FormDateInput
                  label="Transaction Date"
                  name="transactionDate"
                  includeTime
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </FormSection>

            {/* Sale Specific Fields */}
            {transactionType === 'sold' && (
              <FormSection title="Sale Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormNumberInput
                    label="Sale Amount (UGX)"
                    name="saleAmount"
                    min={0}
                    value={formData.saleAmount}
                    onChange={handleChange}
                    placeholder={`Est. ${formatCurrency(item.unitPrice * 0.8)}`}
                    required
                  />

                  <FormInput
                    label="Buyer Name/Shop"
                    name="buyer"
                    value={formData.buyer}
                    onChange={handleChange}
                    placeholder="e.g., ABC Mechanic Shop"
                    required
                  />
                </div>
              </FormSection>
            )}

            {/* Disposal Specific Fields */}
            {transactionType === 'disposed' && (
              <FormSection title="Disposal Information">
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

                  <div className="sm:col-span-2">
                    <FormInput
                      label="Disposal Reason"
                      name="disposalReason"
                      value={formData.disposalReason}
                      onChange={handleChange}
                      placeholder="e.g., Damaged beyond repair"
                      required
                    />
                  </div>
                </div>
              </FormSection>
            )}

            {/* Use in Maintenance Specific Fields */}
            {transactionType === 'used' && (
              <FormSection title="Maintenance Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Vehicle"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select vehicle...' },
                      ...MOCK_VEHICLES.map(vehicle => ({
                        value: vehicle.id,
                        label: `${vehicle.plateNumber} - ${vehicle.make} ${vehicle.model}`,
                      })),
                    ]}
                    required
                  />

                  <FormInput
                    label="Maintenance ID"
                    name="maintenanceId"
                    value={formData.maintenanceId}
                    onChange={handleChange}
                    placeholder="e.g., MNT-2024-001"
                  />
                </div>
              </FormSection>
            )}

            {/* Personnel & Notes */}
            <FormSection title="Additional Information">
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  label="Performed By"
                  name="performedBy"
                  value={formData.performedBy}
                  onChange={handleChange}
                  placeholder="e.g., Sarah Sales"
                  required
                />

                <FormTextarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional details about this transaction..."
                />
              </div>
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
                className={`flex-1 sm:flex-none text-white ${
                  transactionType === 'sold' ? 'bg-green-600 hover:bg-green-700' :
                  transactionType === 'disposed' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {transactionType === 'sold' ? 'Complete Sale' :
                 transactionType === 'disposed' ? 'Dispose Part' :
                 'Use in Maintenance'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
