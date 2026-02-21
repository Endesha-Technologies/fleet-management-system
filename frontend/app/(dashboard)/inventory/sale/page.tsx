'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_INVENTORY_ITEMS } from '@/constants/inventory';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Package, DollarSign } from 'lucide-react';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormNumberInput,
  FormDateInput,
  FormSection,
} from '@/components/ui/form';
import type { SaleFormData } from '../_types';

export default function RecordSalePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SaleFormData>({
    inventoryItemId: '',
    quantity: '1',
    saleAmount: '',
    buyer: '',
    buyerContact: '',
    paymentMethod: 'Cash',
    invoiceNumber: '',
    transactionDate: new Date().toISOString().slice(0, 16),
    performedBy: '',
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
    console.log('Recording sale:', formData);
    alert('Sale recorded successfully!');
    router.push('/inventory');
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const calculateProfit = () => {
    if (!selectedItem || !formData.saleAmount) return null;
    const costPrice = selectedItem.unitPrice * parseInt(formData.quantity || '1');
    const salePrice = parseFloat(formData.saleAmount);
    const profit = salePrice - costPrice;
    return { costPrice, salePrice, profit };
  };

  const profitInfo = calculateProfit();

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
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Record Sale</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Sell spare part from inventory</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Part Selection */}
            <FormSection title="Part Information">
              <div className="flex items-center gap-2 -mt-2 mb-2">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormSelect
                    label="Select Part to Sell"
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
                  <div className="sm:col-span-2 bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-green-700 block mb-1">Condition</span>
                        <span className="font-medium text-green-900">{selectedItem.condition}</span>
                      </div>
                      <div>
                        <span className="text-green-700 block mb-1">Category</span>
                        <span className="font-medium text-green-900">{selectedItem.category}</span>
                      </div>
                      <div>
                        <span className="text-green-700 block mb-1">Cost Price</span>
                        <span className="font-medium text-green-900">{formatCurrency(selectedItem.unitPrice)}</span>
                      </div>
                      <div>
                        <span className="text-green-700 block mb-1">Storage</span>
                        <span className="font-medium text-green-900">{selectedItem.storageLocation}</span>
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

            {/* Sale Details */}
            <FormSection title="Sale Details">
              <div className="flex items-center gap-2 -mt-2 mb-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormNumberInput
                  label="Sale Amount (UGX)"
                  name="saleAmount"
                  min={0}
                  step={0.01}
                  value={formData.saleAmount}
                  onChange={handleChange}
                  placeholder={selectedItem ? `Min: ${formatCurrency(selectedItem.unitPrice * 0.5)}` : ''}
                  required
                />

                <FormDateInput
                  label="Sale Date & Time"
                  name="transactionDate"
                  includeTime
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                />

                {profitInfo && (
                  <div className="sm:col-span-2 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-900 font-medium text-sm">Profit Calculation</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-blue-700 block mb-1">Cost</span>
                        <span className="font-medium text-blue-900">{formatCurrency(profitInfo.costPrice)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 block mb-1">Sale</span>
                        <span className="font-medium text-blue-900">{formatCurrency(profitInfo.salePrice)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 block mb-1">Profit</span>
                        <span className={`font-bold ${profitInfo.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(profitInfo.profit))}
                          {profitInfo.profit < 0 && ' (Loss)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Buyer Information */}
            <FormSection title="Buyer Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Buyer Name/Shop"
                  name="buyer"
                  value={formData.buyer}
                  onChange={handleChange}
                  placeholder="e.g., ABC Mechanic Shop"
                  required
                />

                <FormInput
                  label="Contact Number"
                  name="buyerContact"
                  type="tel"
                  value={formData.buyerContact}
                  onChange={handleChange}
                  placeholder="e.g., +256 700 123 456"
                />

                <FormSelect
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  options={[
                    { value: 'Cash', label: 'Cash' },
                    { value: 'Mobile Money', label: 'Mobile Money' },
                    { value: 'Bank Transfer', label: 'Bank Transfer' },
                    { value: 'Check', label: 'Check' },
                  ]}
                  required
                />

                <FormInput
                  label="Invoice Number"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="e.g., INV-2024-001"
                />
              </div>
            </FormSection>

            {/* Additional Information */}
            <FormSection title="Additional Information">
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  label="Recorded By"
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
                  placeholder="Additional details about this sale..."
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
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Record Sale
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
