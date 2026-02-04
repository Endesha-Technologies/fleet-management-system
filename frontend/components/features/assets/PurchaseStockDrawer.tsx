'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { MOCK_ASSETS, CONDITION_OPTIONS } from '@/constants/assets';
import { MOCK_SUPPLIERS, PAYMENT_METHODS } from '@/constants/suppliers';
import { Asset } from '@/types/asset';

interface PurchaseStockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAssetId?: string;
}

interface LineItem {
  id: string;
  assetId: string;
  assetName: string;
  tracking: string;
  condition: string;
  quantity: number;
  unitCost: number;
  serialNumbers: string;
  total: number;
}

export default function PurchaseStockDrawer({
  open,
  onOpenChange,
  initialAssetId,
}: PurchaseStockDrawerProps) {
  // Reset form when drawer opens/closes or initialAssetId changes
  useEffect(() => {
    if (open) {
      if (initialAssetId) {
        const asset = MOCK_ASSETS.find((a) => a.id === initialAssetId);
        if (asset) {
          setLineItems([
            {
              id: crypto.randomUUID(),
              assetId: asset.id,
              assetName: asset.name,
              tracking: asset.tracking,
              condition: 'New',
              quantity: 1,
              unitCost: asset.unitPrice,
              serialNumbers: '',
              total: asset.unitPrice,
            },
          ]);
        }
      } else {
         setLineItems([]);
      }
      setSupplierNotest('');
      setSupplier('');
      setInvoiceNumber('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('');
    }
  }, [open, initialAssetId]);

  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [supplierNotes, setSupplierNotest] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const assetOptions = MOCK_ASSETS.map((asset) => ({
    value: asset.id,
    label: asset.name,
  }));

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        assetId: '',
        assetName: '',
        tracking: '',
        condition: 'New',
        quantity: 1,
        unitCost: 0,
        serialNumbers: '',
        total: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof LineItem,
    value: any
  ) => {
    setLineItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Handle Asset Selection
          if (field === 'assetId') {
            const asset = MOCK_ASSETS.find((a) => a.id === value);
            if (asset) {
              updatedItem.assetName = asset.name;
              updatedItem.tracking = asset.tracking;
              updatedItem.unitCost = asset.unitPrice;
              updatedItem.total = asset.unitPrice * (updatedItem.quantity || 0);
            }
          }

          // Handle Totals
          if (field === 'quantity' || field === 'unitCost') {
            updatedItem.total =
              Number(updatedItem.quantity || 0) * Number(updatedItem.unitCost || 0);
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!supplier) newErrors.push('Supplier is required');
    if (!invoiceNumber) newErrors.push('Invoice number is required');
    if (!purchaseDate) newErrors.push('Purchase date is required');
    if (lineItems.length === 0) newErrors.push('At least one line item is required');

    lineItems.forEach((item, index) => {
      if (!item.assetId) newErrors.push(`Item ${index + 1}: Asset is required`);
      if (item.quantity <= 0)
        newErrors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      if (item.unitCost < 0)
        newErrors.push(`Item ${index + 1}: Unit cost cannot be negative`);

      if (item.tracking === 'Serial Number') {
        const serials = item.serialNumbers
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s !== '');
        
        if (serials.length !== item.quantity) {
           newErrors.push(
            `Item ${index + 1}: Serial count (${serials.length}) must match quantity (${item.quantity})`
          );
        }
      }
      
      // Check for disposed assets (Assuming status 'Discontinued' implies we shouldn't buy more?)
      // Actually Requirement says: "Disposed asset cannot be purchased"
      // My Mock Data has 'status' on the asset. Let's check status 'Discontinued' or similar.
      const asset = MOCK_ASSETS.find(a => a.id === item.assetId);
      if(asset && asset.status === 'Discontinued') {
          newErrors.push(`Item ${index + 1}: Cannot purchase discontinued asset '${asset.name}'`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Purchase Submitted:', {
        supplier,
        invoiceNumber,
        purchaseDate,
        paymentMethod,
        supplierNotes,
        lineItems,
      });
      // Mock API call simulation
      alert('Stock purchased successfully! (Mock Action)');
      onOpenChange(false);
    }
  };

  const calculateGrandTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" size="4xl" className="overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-gray-200">
          <SheetTitle className="text-xl font-semibold text-gray-900">
            Purchase Stock
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Record new stock arrival from suppliers.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Supplier Info */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">
              Supplier Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">
                  Supplier <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  options={MOCK_SUPPLIERS}
                  placeholder="Select Supplier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">
                  Invoice Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g., INV-2026-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">
                  Purchase Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={PAYMENT_METHODS}
                  placeholder="Select Method"
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotest(e.target.value)}
                  placeholder="Optional notes..."
                  className="h-20"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Line Items
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLineItem}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {lineItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500">No items added yet.</p>
                  <Button
                    variant="link"
                    onClick={handleAddLineItem}
                    className="text-blue-600 font-medium"
                  >
                    Click to add your first item
                  </Button>
                </div>
              ) : (
                lineItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="relative border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:border-gray-300 transition-colors"
                  >
                    {/* Header: Item # and Remove Button */}
                    <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                           Item #{index + 1}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Asset Selection - 5 cols */}
                        <div className="md:col-span-5 space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">Asset</Label>
                            <Select
                                value={item.assetId}
                                onChange={(e) =>
                                handleItemChange(item.id, 'assetId', e.target.value)
                                }
                                options={assetOptions}
                                placeholder="Select Asset"
                                className={!item.assetId ? "border-red-300" : ""}
                            />
                            {item.assetName && (
                                <p className="text-xs text-blue-600 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full inline-block"></span>
                                    Tracking: {item.tracking}
                                </p>
                            )}
                        </div>

                        {/* Condition - 3 cols */}
                        <div className="md:col-span-3 space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">Condition</Label>
                            <Select
                                value={item.condition}
                                onChange={(e) =>
                                handleItemChange(item.id, 'condition', e.target.value)
                                }
                                options={[
                                    { value: 'New', label: 'New' },
                                    { value: 'Good', label: 'Good' },
                                ]}
                            />
                        </div>

                        {/* Quantity - 2 cols */}
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">Qty</Label>
                            <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                handleItemChange(
                                    item.id,
                                    'quantity',
                                    parseInt(e.target.value) || 0
                                )
                                }
                            />
                        </div>

                         {/* Unit Cost - 2 cols */}
                         <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-xs font-medium text-gray-600">Unit Cost</Label>
                            <Input
                                type="number"
                                min="0"
                                value={item.unitCost}
                                onChange={(e) =>
                                handleItemChange(
                                    item.id,
                                    'unitCost',
                                    parseFloat(e.target.value) || 0
                                )
                                }
                            />
                        </div>
                    </div>

                    {/* Lower Section: Serials & Total */}
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-col md:flex-row gap-6">
                         
                         {/* Serial Numbers Section (Flexible Width) */}
                         <div className="flex-grow">
                            {item.tracking === 'Serial Number' ? (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-gray-600">
                                        Serial Numbers 
                                        <span className="text-gray-400 font-normal ml-1">(Comma separated)</span>
                                    </Label>
                                    <Textarea
                                        value={item.serialNumbers}
                                        onChange={(e) =>
                                            handleItemChange(
                                            item.id,
                                            'serialNumbers',
                                            e.target.value
                                            )
                                        }
                                        placeholder="S/N: 12345, S/N: 67890..."
                                        className="min-h-[60px] text-sm resize-y"
                                    />
                                    {item.quantity > 0 && (
                                         <p className="text-xs text-right text-gray-400">
                                            {item.serialNumbers.split(',').filter(s => s.trim()).length} / {item.quantity} entered
                                         </p>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center">
                                    <p className="text-sm text-gray-400 italic">
                                        Serial numbers not required for this asset type.
                                    </p>
                                </div>
                            )}
                         </div>

                         {/* Line Total Section (Fixed Width) */}
                         <div className="md:w-48 bg-gray-50 rounded p-3 flex flex-col justify-center items-end self-start md:self-stretch">
                            <span className="text-xs font-medium text-gray-500 uppercase">Line Total</span>
                            <span className="text-xl font-bold text-gray-900 mt-1">
                                {item.total.toLocaleString()}
                            </span>
                             <span className="text-xs text-gray-400">UGX</span>
                         </div>
                    </div>
                  </div>
                ))
              )}
            </div>
             <div className="flex justify-end p-4 bg-gray-50 rounded-lg">
                <div className="text-right">
                    <span className="text-gray-600 mr-2">Grand Total:</span>
                    <span className="text-lg font-bold text-gray-900">UGX {calculateGrandTotal().toLocaleString()}</span>
                </div>
            </div>
          </div>
          
          {/* Error Display */}
          {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                      <AlertCircle className="h-5 w-5"/>
                      Validation Errors
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                      ))}
                  </ul>
              </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-2 mt-auto flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Purchase
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
