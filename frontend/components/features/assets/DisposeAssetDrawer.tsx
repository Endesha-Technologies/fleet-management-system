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

interface DisposeAssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
  stockUnits?: StockUnit[];
  allAssets?: Asset[];
  allStockUnits?: StockUnit[];
}

interface DisposeLineItem {
  id: string;
  assetId: string;
  assetName: string;
  tracking: string; // 'Serial Number', 'Batch', 'FIFO', 'None'
  
  // Bulk
  quantity: number;
  maxQuantity: number; // Available stock

  // Serial
  selectedSerialIds: Set<string>;
}

export default function DisposeAssetDrawer({ 
  isOpen, 
  onClose, 
  asset: initialAsset, 
  stockUnits: initialStockUnits,
  allAssets = [],
  allStockUnits = []
}: DisposeAssetDrawerProps) {

  // -- State --

  // View State
  const [view, setView] = useState<'form' | 'unit-selection'>('form');
  const [selectingItemId, setSelectingItemId] = useState<string | null>(null);

  // Disposal Info
  const [disposalDate, setDisposalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Items
  const [lineItems, setLineItems] = useState<DisposeLineItem[]>([]);

  // -- Effects --

  useEffect(() => {
    if (isOpen) {
      setDisposalDate(new Date().toISOString().split('T')[0]);
      setReason('');
      setNotes('');
      setView('form');
      setSelectingItemId(null);

      // Initialize Items
      if (initialAsset) {
        addItem(initialAsset, initialStockUnits || []);
      } else {
        setLineItems([]);
      }
    }
  }, [isOpen, initialAsset, initialStockUnits]);

  // -- Helpers --

  const getAvailableStockUnits = (assetId: string) => {
    if (initialAsset && initialAsset.id === assetId && initialStockUnits) {
       return initialStockUnits.filter(u => u.status === 'In Stock');
    }
    return allStockUnits.filter(u => u.assetId === assetId && u.status === 'In Stock');
  };

  const addItem = (asset: Asset, assetStockUnits: StockUnit[]) => {
    const isSerial = asset.tracking === 'Serial Number';
    const newItem: DisposeLineItem = {
      id: crypto.randomUUID(),
      assetId: asset.id,
      assetName: asset.name,
      tracking: asset.tracking,
      quantity: 0,
      maxQuantity: asset.inStock,
      selectedSerialIds: new Set(),
    };
    
    setLineItems(prev => [...prev, newItem]);
  };

  const handleAssetSelect = (itemId: string, assetId: string) => {
    const asset = allAssets.find(a => a.id === assetId);
    if (!asset) return;

    setLineItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          id: item.id,
          assetId: asset.id,
          assetName: asset.name,
          tracking: asset.tracking,
          quantity: 0,
          maxQuantity: asset.inStock,
          selectedSerialIds: new Set(),
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<DisposeLineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        // Sync quantity for serial
        if (updatedItem.tracking === 'Serial Number') {
           updatedItem.quantity = updatedItem.selectedSerialIds.size;
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
    }]);
  };

  const onOpenSelection = (itemId: string) => {
    setSelectingItemId(itemId);
    setView('unit-selection');
  };

  const onConfirm = () => {
    if (lineItems.length === 0) return;
    if (lineItems.some(i => i.quantity === 0)) {
      alert("Please ensure all items have a quantity greater than 0.");
      return;
    }
    if (!reason) {
        alert("Please select a reason for disposal.");
        return;
    }
    
    console.log("Disposal Confirmed", { disposalDate, reason, notes, lineItems });
    onClose();
  };

  // -- Selection Logic --

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
     
     updateItem(selectingItemId, { selectedSerialIds: newSet });
  };
  
  const handleSelectAllInView = (checked: boolean, units: StockUnit[]) => {
      if (!selectingItemId) return;
      if (checked) {
          const allIds = units.map(u => u.id);
          updateItem(selectingItemId, { selectedSerialIds: new Set(allIds) });
      } else {
          updateItem(selectingItemId, { selectedSerialIds: new Set() });
      }
  };

  // -- Render Views --

  const renderFormView = () => {
    // SINGLE ASSET VIEW
    if (initialAsset && lineItems.length > 0) {
      const item = lineItems[0];
      const stockUnits = getAvailableStockUnits(item.assetId);

      return (
        <div className="space-y-6 mt-6">
          {/* Disposal Info */}
          <div className="space-y-4">
               <h3 className="text-sm font-medium border-b border-gray-200 pb-2">Disposal Information</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input type="date" value={disposalDate} onChange={(e) => setDisposalDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Select id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Select reason"
                        options={[
                            { value: 'Damaged', label: 'Damaged' },
                            { value: 'Obsolete', label: 'Obsolete' },
                            { value: 'Lost', label: 'Lost / Stolen' },
                            { value: 'Expired', label: 'Expired' },
                            { value: 'Other', label: 'Other' },
                        ]} 
                    />
                  </div>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="notes">Notes</Label>
                 <Textarea id="notes" placeholder="Additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
               </div>
          </div>

          {/* Single Item Selection */}
          <div className="space-y-4">
              <h3 className="text-sm font-medium border-b border-gray-200 pb-2">
                  {item.tracking === 'Serial Number' ? 'Select Units to Dispose' : 'Quantity to Dispose'}
              </h3>
              
              {item.tracking === 'Serial Number' ? (
                <div className="border border-gray-200 rounded-md max-h-[300px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 border-gray-200">
                                <TableHead className="w-[50px]">
                                    <Checkbox checked={stockUnits.length > 0 && item.selectedSerialIds.size === stockUnits.length}
                                        onCheckedChange={(c) => {
                                            if (!c) updateItem(item.id, { selectedSerialIds: new Set() });
                                            else {
                                                const allIds = stockUnits.map(u => u.id);
                                                updateItem(item.id, { selectedSerialIds: new Set(allIds) });
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Serial</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {stockUnits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-gray-500">No available units.</TableCell>
                                </TableRow>
                             ) : stockUnits.map(unit => {
                                const isSelected = item.selectedSerialIds.has(unit.id);
                                return (
                                    <TableRow key={unit.id} className="border-gray-200">
                                        <TableCell>
                                           <Checkbox checked={isSelected} onCheckedChange={() => {
                                               const newSet = new Set(item.selectedSerialIds);
                                               if (newSet.has(unit.id)) newSet.delete(unit.id);
                                               else newSet.add(unit.id);
                                               updateItem(item.id, { selectedSerialIds: newSet });
                                           }} />
                                        </TableCell>
                                        <TableCell className="font-medium">{unit.serialNumber}</TableCell>
                                        <TableCell>{unit.condition}</TableCell>
                                        <TableCell>{unit.location}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
              ) : (
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" min={0} max={item.maxQuantity} value={item.quantity || ''}
                        onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-gray-500">Available: {item.maxQuantity}</p>
                </div>
              )}
          </div>
        </div>
      );
    }
    
    // GLOBAL MULTI-ASSET VIEW
    return (
    <div className="space-y-6 mt-6">
         {/* Disposal Info */}
         <div className="space-y-4">
            <h3 className="text-sm font-medium border-b border-gray-200 pb-2">Disposal Information</h3>
            <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input type="date" value={disposalDate} onChange={(e) => setDisposalDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Select id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Select reason"
                        options={[
                            { value: 'Damaged', label: 'Damaged' },
                            { value: 'Obsolete', label: 'Obsolete' },
                            { value: 'Lost', label: 'Lost / Stolen' },
                            { value: 'Expired', label: 'Expired' },
                            { value: 'Other', label: 'Other' },
                        ]} 
                    />
                  </div>
            </div>
             <div className="space-y-2">
                 <Label htmlFor="notes">Notes</Label>
                 <Textarea id="notes" placeholder="Additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
             </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Items to Dispose</h3>
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
                            <TableHead className="w-[200px]">Asset</TableHead>
                            <TableHead className="w-[120px]">Qty</TableHead>
                            {!initialAsset && <TableHead className="w-[50px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lineItems.length === 0 ? (
                             <TableRow>
                                 <TableCell colSpan={3} className="text-center h-24 text-gray-400">
                                     No items added.
                                 </TableCell>
                             </TableRow>
                        ) : lineItems.map((item) => (
                            <TableRow key={item.id} className="border-gray-200">
                                <TableCell>
                                    <div className="w-full min-w-[140px]">
                                            <Select 
                                            value={item.assetId} 
                                            onChange={(e) => handleAssetSelect(item.id, e.target.value)}
                                            placeholder="Select Asset"
                                            options={allAssets.map(a => ({ value: a.id, label: a.name }))}
                                        />
                                    </div>
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
                             onCheckedChange={(c) => handleSelectAllInView(!!c, units)}
                          />
                      </TableHead>
                      <TableHead>Serial</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {units.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24 text-gray-500">
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
                                            onCheckedChange={() => toggleSelectionInView(unit.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{unit.serialNumber}</TableCell>
                                    <TableCell>{unit.condition}</TableCell>
                                    <TableCell>{unit.location}</TableCell>
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
                <SheetTitle>Dispose Asset</SheetTitle>
                <SheetDescription>Record asset disposal.</SheetDescription>
                </SheetHeader>
                {renderFormView()}
                <SheetFooter className="mt-8">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">Confirm Disposal</Button>
                </SheetFooter>
            </>
        )}
        
        {view === 'unit-selection' && renderSelectionView()}
        
      </SheetContent>
    </Sheet>
  );
}
