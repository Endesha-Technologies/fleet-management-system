'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_INVENTORY_ITEMS } from '@/constants/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShoppingCart, Package, DollarSign } from 'lucide-react';

export default function RecordSalePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
            <div className="space-y-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-sm sm:text-base text-gray-900">Part Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="inventoryItemId" className="text-xs sm:text-sm">Select Part to Sell *</Label>
                  <select
                    id="inventoryItemId"
                    name="inventoryItemId"
                    value={formData.inventoryItemId}
                    onChange={handleChange}
                    className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Choose a part...</option>
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.partName} ({item.partNumber}) - Available: {item.quantity} - {formatCurrency(item.unitPrice)}/unit
                      </option>
                    ))}
                  </select>
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

                <div>
                  <Label htmlFor="quantity" className="text-xs sm:text-sm">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={selectedItem?.quantity || 1}
                    value={formData.quantity}
                    onChange={handleChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                    disabled={!selectedItem}
                  />
                </div>
              </div>
            </div>

            {/* Sale Details */}
            <div className="space-y-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-sm sm:text-base text-gray-900">Sale Details</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="saleAmount" className="text-xs sm:text-sm">Sale Amount (UGX) *</Label>
                  <Input
                    id="saleAmount"
                    name="saleAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.saleAmount}
                    onChange={handleChange}
                    placeholder={selectedItem ? `Min: ${formatCurrency(selectedItem.unitPrice * 0.5)}` : ''}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="transactionDate" className="text-xs sm:text-sm">Sale Date & Time *</Label>
                  <Input
                    id="transactionDate"
                    name="transactionDate"
                    type="datetime-local"
                    value={formData.transactionDate}
                    onChange={handleChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

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
            </div>

            {/* Buyer Information */}
            <div className="space-y-4 pb-4 border-b border-gray-100">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Buyer Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyer" className="text-xs sm:text-sm">Buyer Name/Shop *</Label>
                  <Input
                    id="buyer"
                    name="buyer"
                    value={formData.buyer}
                    onChange={handleChange}
                    placeholder="e.g., ABC Mechanic Shop"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="buyerContact" className="text-xs sm:text-sm">Contact Number</Label>
                  <Input
                    id="buyerContact"
                    name="buyerContact"
                    type="tel"
                    value={formData.buyerContact}
                    onChange={handleChange}
                    placeholder="e.g., +256 700 123 456"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod" className="text-xs sm:text-sm">Payment Method *</Label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="invoiceNumber" className="text-xs sm:text-sm">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="e.g., INV-2024-001"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Additional Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="performedBy" className="text-xs sm:text-sm">Recorded By *</Label>
                  <Input
                    id="performedBy"
                    name="performedBy"
                    value={formData.performedBy}
                    onChange={handleChange}
                    placeholder="e.g., Sarah Sales"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-xs sm:text-sm">Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Additional details about this sale..."
                  />
                </div>
              </div>
            </div>

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
