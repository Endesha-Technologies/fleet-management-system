import React, { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Asset, StockUnit } from '@/types/asset';
import { Select } from '@/components/ui/select';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';

interface SellAssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
  stockUnits?: StockUnit[];
  allAssets?: Asset[];
  allStockUnits?: StockUnit[];
}

interface SaleLineItem {
  id: string;
  assetId: string;
  assetName: string;
  tracking: string; // 'Serial Number', 'Batch', 'FIFO', 'None'
  
  // Bulk
  quantity: number;
  maxQuantity: number; // Available stock for bulk
  
  // Serial
  selectedSerialIds: Set<string>;
  unitPrices: Record<string, number>; // Individual prices for serial units
  
  // Pricing
  unitPrice: number; // For bulk, or default for serial
  total: number;
}

export default function SellAssetDrawer({ 
  isOpen, 
  onClose, 
  asset: initialAsset, 
  stockUnits: initialStockUnits,
  allAssets = [],
  allStockUnits = [] 
}: SellAssetDrawerProps) {

  // -- State --

  // View State
  const [view, setView] = useState<'form' | 'unit-selection'>('form');
  const [selectingItemId, setSelectingItemId] = useState<string | null>(null);

  // Sale Info
  const [buyer, setBuyer] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Items
  const [lineItems, setLineItems] = useState<SaleLineItem[]>([]);

  // -- Effects --

  // Reset/Initialize when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Reset Info
      setBuyer('');
      setInvoiceNo('');
      setSaleDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('');
      setNotes('');
      setView('form');
      setSelectingItemId(null);

      // Initialize Items
      if (initialAsset) {
        // Single Asset Mode
        addItem(initialAsset, initialStockUnits || []);
      } else {
        // Global Mode
        setLineItems([]);
      }
    }
  }, [isOpen, initialAsset, initialStockUnits]); // Re-run if initial props change too

  // -- Helpers --

  const getAvailableStockUnits = (assetId: string) => {
    // If we have initialStockUnits and they match this asset, use them (optimization)
    if (initialAsset && initialAsset.id === assetId && initialStockUnits) {
       return initialStockUnits.filter(u => u.status === 'In Stock');
    }
    // Otherwise search all
    return allStockUnits.filter(u => u.assetId === assetId && u.status === 'In Stock');
  };

  const addItem = (asset: Asset, assetStockUnits: StockUnit[]) => {
    const isSerial = asset.tracking === 'Serial Number';
    const available = isSerial ? 0 : asset.inStock; // Only used for maxQuantity in Bulk

    const newItem: SaleLineItem = {
      id: crypto.randomUUID(),
      assetId: asset.id,
      assetName: asset.name,
      tracking: asset.tracking,
      quantity: isSerial ? 0 : 0,
      maxQuantity: asset.inStock,
      selectedSerialIds: new Set(),
      unitPrices: {},
      unitPrice: asset.unitPrice || 0,
      total: 0
    };
    
    setLineItems(prev => [...prev, newItem]);
  };

  const handleAssetSelect = (itemId: string, assetId: string) => {
    const asset = allAssets.find(a => a.id === assetId);
    if (!asset) return;

    // Replace item with new clean item
    setLineItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          id: item.id, // Keep ID
          assetId: asset.id,
          assetName: asset.name,
          tracking: asset.tracking,
          quantity: 0,
          maxQuantity: asset.inStock,
          selectedSerialIds: new Set(),
          unitPrices: {},
          unitPrice: asset.unitPrice || 0,
          total: 0
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<SaleLineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        // Calc Total automatically if price/qty changes
        const updatedItem = { ...item, ...updates };
        
        if (updatedItem.tracking === 'Serial Number') {
           // Total is sum of individual unit prices
           let sum = 0;
           updatedItem.selectedSerialIds.forEach(serialId => {
             sum += (updatedItem.unitPrices[serialId] || updatedItem.unitPrice || 0);
           });
           updatedItem.total = sum;
           updatedItem.quantity = updatedItem.selectedSerialIds.size;
        } else {
           // Bulk
           updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // -- Actions --

  const onAddEmptyRow = () => {
    setLineItems(prev => [...prev, {
      id: crypto.randomUUID(),
      assetId: '',
      assetName: '',
      tracking: 'None',
      quantity: 0,
      maxQuantity: 0,
      selectedSerialIds: new Set(),
      unitPrices: {},
      unitPrice: 0,
      total: 0
    }]);
  };

  const onOpenSelection = (itemId: string) => {
    setSelectingItemId(itemId);
    setView('unit-selection');
  };

  const onConfirm = () => {
    // Basic validation
    if (lineItems.length === 0) return;
    if (lineItems.some(i => i.quantity === 0)) {
      alert("Please ensure all items have a quantity greater than 0.");
      return;
    }
    
    console.log("Sale Confirmed", { buyer, invoiceNo, lineItems });
    onClose();
  };

  const calculateGrandTotal = () => {
    return lineItems.reduce((acc, item) => acc + item.total, 0);
  };

  // -- Selection Logic --
  
  // Helper to toggle selection within the modal view
  const toggleSelectionInView = (unitId: string) => {
     if (!selectingItemId) return;
     const currentItem = lineItems.find(i => i.id === selectingItemId);
     if (!currentItem) return;

     const newSet = new Set(currentItem.selectedSerialIds);
     if (newSet.has(unitId)) {
       newSet.delete(unitId);
     } else {
       newSet.add(unitId);
     }
     
     // Initialize price if needed
     const newPrices = { ...currentItem.unitPrices };
     if (!newPrices[unitId]) {
       newPrices[unitId] = currentItem.unitPrice;
     }

     updateItem(selectingItemId, { selectedSerialIds: newSet, unitPrices: newPrices });
  };
  
  const handleSelectAllInView = (checked: boolean, units: StockUnit[]) => {
      if (!selectingItemId) return;
      
      const currentItem = lineItems.find(i => i.id === selectingItemId);
      if (!currentItem) return;

      if (checked) {
          const allIds = units.map(u => u.id);
          const newSet = new Set(allIds);
          const newPrices = { ...currentItem.unitPrices };
          allIds.forEach(id => {
              if (newPrices[id] === undefined) newPrices[id] = currentItem.unitPrice;
          });
          updateItem(selectingItemId, { selectedSerialIds: newSet, unitPrices: newPrices });
      } else {
          updateItem(selectingItemId, { selectedSerialIds: new Set() });
      }
  };

  const handleSerialPriceChange = (unitId: string, price: number) => {
      if (!selectingItemId) return;
      const currentItem = lineItems.find(i => i.id === selectingItemId);
      if (!currentItem) return;
      
      const newPrices = { ...currentItem.unitPrices, [unitId]: price };
      updateItem(selectingItemId, { unitPrices: newPrices });
  };


  // -- Render Content --

  const renderFormView = () => {
    // SINGLE ASSET VIEW
    if (initialAsset && lineItems.length > 0) {
      const item = lineItems[0];
      const stockUnits = getAvailableStockUnits(item.assetId);

      return (
        <div className="space-y-6 mt-6">
          {/* Sale Header */}
          <div className="space-y-4">
               <h3 className="text-sm font-medium border-b border-gray-200 pb-2">Sale Information</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer">Buyer / Customer</Label>
                    <Input id="buyer" placeholder="Name" value={buyer} onChange={(e) => setBuyer(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice">Invoice No</Label>
                    <Input id="invoice" placeholder="INV-" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment</Label>
                    <Select id="payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="Method" 
                       options={[{ value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank Transfer' }, { value: 'card', label: 'Credit Card' }]} />
                  </div>
               </div>
          </div>

          {/* Single Item Form */}
          <div className="space-y-4">
              <h3 className="text-sm font-medium border-b border-gray-200 pb-2">
                  {item.tracking === 'Serial Number' ? 'Select Units' : 'Quantity'}
              </h3>
              
              {item.tracking === 'Serial Number' ? (
                <div className="border border-gray-200 rounded-md max-h-[300px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 border-gray-200">
                                <TableHead className="w-[50px]">
                                    <Checkbox checked={stockUnits.length > 0 && item.selectedSerialIds.size === stockUnits.length}
                                        onChange={(e) => {
                                            if (!e.target.checked) updateItem(item.id, { selectedSerialIds: new Set() });
                                            else {
                                                const allIds = stockUnits.map(u => u.id);
                                                const prices = { ...item.unitPrices };
                                                allIds.forEach(id => { if(!prices[id]) prices[id] = item.unitPrice });
                                                updateItem(item.id, { selectedSerialIds: new Set(allIds), unitPrices: prices });
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Serial</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead className="w-[100px]">Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockUnits.map(unit => {
                                const isSelected = item.selectedSerialIds.has(unit.id);
                                return (
                                    <TableRow key={unit.id} className="border-gray-200">
                                        <TableCell>
                                           <Checkbox checked={isSelected} onChange={() => {
                                               const newSet = new Set(item.selectedSerialIds);
                                               if (newSet.has(unit.id)) newSet.delete(unit.id);
                                               else newSet.add(unit.id);
                                               
                                               const prices = { ...item.unitPrices };
                                               if (!prices[unit.id]) prices[unit.id] = item.unitPrice;
                                               
                                               updateItem(item.id, { selectedSerialIds: newSet, unitPrices: prices });
                                           }} />
                                        </TableCell>
                                        <TableCell className="font-medium">{unit.serialNumber}</TableCell>
                                        <TableCell>{unit.condition}</TableCell>
                                        <TableCell>
                                            <Input className="h-8" type="number" disabled={!isSelected} value={item.unitPrices[unit.id] || ''}
                                                onChange={(e) => {
                                                    const prices = { ...item.unitPrices, [unit.id]: parseFloat(e.target.value) || 0 };
                                                    updateItem(item.id, { unitPrices: prices });
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Quantity to Sell</Label>
                        <Input type="number" min={0} max={item.maxQuantity} value={item.quantity || ''}
                            onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-gray-500">Available: {item.maxQuantity}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Unit Price</Label>
                        <Input type="number" value={item.unitPrice || ''}
                            onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </div>
              )}
          </div>
          
           <div className="flex justify-end pt-4 border-t border-gray-100">
               <div className="text-right">
                  <span className="text-sm text-gray-500 mr-2">Total:</span>
                  <span className="text-xl font-bold text-gray-900">${item.total.toLocaleString()}</span>
               </div>
            </div>
        </div>
      );
    }
    
    // GLOBAL MULTI-ASSET VIEW
    return (
    <div className="space-y-6 mt-6">
        {/* Sale Header */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="buyer">Buyer / Customer</Label>
            <Input 
                id="buyer" 
                placeholder="Enter buyer name"
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="invoice">Invoice / Receipt No</Label>
            <Input 
                id="invoice" 
                placeholder="e.g. INV-001"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="date">Sale Date</Label>
            <Input 
                id="date" 
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="payment">Method</Label>
            <Select 
                id="payment"
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Select method"
                options={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'card', label: 'Credit Card' },
                ]}
            />
            </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Items to Sell</h3>
                {!initialAsset && (
                    <Button variant="outline" size="sm" onClick={onAddEmptyRow}>
                        <Plus className="w-3 h-3 mr-2"/> Add Item
                    </Button>
                )}
            </div>

            <div className="rounded-md border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-gray-200">
                            <TableHead className="w-[180px]">Asset</TableHead>
                            <TableHead className="w-[100px]">Qty</TableHead>
                            <TableHead className="w-[110px]">Unit Price</TableHead>
                            <TableHead className="w-[100px] text-right">Total</TableHead>
                            {!initialAsset && <TableHead className="w-[50px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lineItems.length === 0 ? (
                             <TableRow>
                                 <TableCell colSpan={5} className="text-center h-24 text-gray-400">
                                     No items added.
                                 </TableCell>
                             </TableRow>
                        ) : lineItems.map((item) => (
                            <TableRow key={item.id} className="border-gray-200">
                                <TableCell>
                                    {initialAsset ? (
                                        <span className="font-medium text-sm">{item.assetName}</span>
                                    ) : (
                                        <div className="w-full min-w-[140px]">
                                             <Select 
                                                value={item.assetId} 
                                                onChange={(e) => handleAssetSelect(item.id, e.target.value)}
                                                placeholder="Select Asset"
                                                options={allAssets.map(a => ({ value: a.id, label: a.name }))}
                                            />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {item.tracking === 'Serial Number' ? (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full text-xs h-8"
                                            onClick={() => onOpenSelection(item.id)}
                                            disabled={!item.assetId}
                                        >
                                            {item.quantity > 0 ? `${item.quantity} Selected` : 'Select Units'}
                                        </Button>
                                    ) : (
                                        <Input
                                            type="number"
                                            className="h-8 w-full"
                                            min={0}
                                            max={item.maxQuantity}
                                            value={item.quantity || ''}
                                            onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                            disabled={!item.assetId}
                                        />
                                    )}
                                    {item.tracking !== 'Serial Number' && item.assetId && (
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            Max: {item.maxQuantity}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        className="h-8 w-full"
                                        value={item.unitPrice || ''}
                                        onChange={(e) => {
                                            const newPrice = parseFloat(e.target.value) || 0;
                                            // Propagate new price to serial units
                                            const newPrices = { ...item.unitPrices };
                                            item.selectedSerialIds.forEach(id => newPrices[id] = newPrice);
                                            updateItem(item.id, { unitPrice: newPrice, unitPrices: newPrices });
                                        }}
                                        disabled={!item.assetId}
                                    />
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                                {!initialAsset && (
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
               <div className="text-right">
                  <span className="text-sm text-gray-500 mr-2">Grand Total:</span>
                  <span className="text-xl font-bold text-gray-900">${calculateGrandTotal().toLocaleString()}</span>
               </div>
            </div>
        </div>
    </div>
  )};

  const renderSelectionView = () => {
      const item = lineItems.find(i => i.id === selectingItemId);
      if (!item) return null;
      
      const units = getAvailableStockUnits(item.assetId);
      
      return (
          <div className="space-y-4 mt-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                 <Button variant="ghost" size="sm" onClick={() => setView('form')}>
                    <ChevronLeft className="w-4 h-4 mr-1"/> Back
                 </Button>
                 <h3 className="font-semibold text-lg">Select {item.assetName} Units</h3>
              </div>

            <div className="border border-gray-200 rounded-md flex-1 overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 bg-gray-50">
                      <TableHead className="w-[50px]">
                          <Checkbox 
                             checked={units.length > 0 && item.selectedSerialIds.size === units.length}
                             onChange={(e) => handleSelectAllInView(e.target.checked, units)}
                          />
                      </TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-[100px]">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                                No available units found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        units.map((unit) => {
                            const isSelected = item.selectedSerialIds.has(unit.id);
                            return (
                                <TableRow key={unit.id} data-state={isSelected ? 'selected' : undefined} className="border-gray-200">
                                    <TableCell>
                                        <Checkbox 
                                            checked={isSelected}
                                            onChange={() => toggleSelectionInView(unit.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{unit.serialNumber}</TableCell>
                                    <TableCell>{unit.condition}</TableCell>
                                    <TableCell>{unit.location}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            className="h-8 w-full"
                                            disabled={!isSelected}
                                            value={item.unitPrices[unit.id] || ''}
                                            onChange={(e) => handleSerialPriceChange(unit.id, parseFloat(e.target.value))}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                  </TableBody>
                </Table>
            </div>
            
             <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <div className="text-sm text-gray-600">
                     <span className="font-medium text-gray-900">{item.selectedSerialIds.size}</span> units selected
                 </div>
                 <Button onClick={() => setView('form')}>Done Selecting</Button>
             </div>
          </div>
      );
  };


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto sm:max-w-[700px] w-full">
        {view === 'form' && (
            <>
                <SheetHeader>
                <SheetTitle>Sell Assets</SheetTitle>
                <SheetDescription>Create a new sale transaction.</SheetDescription>
                </SheetHeader>
                {renderFormView()}
                <SheetFooter className="mt-8">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">Confirm Sale</Button>
                </SheetFooter>
            </>
        )}
        
        {view === 'unit-selection' && renderSelectionView()}
        
      </SheetContent>
    </Sheet>
  );
}
