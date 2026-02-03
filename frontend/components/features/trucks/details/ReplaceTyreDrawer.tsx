'use client';

import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Truck } from '@/types/truck';
import { PostReplacementDialog } from './PostReplacementDialog';

interface ReplaceTyreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truck: Truck;
}

interface ReplacementItem {
  position: string;
  currentSerial: string;
  currentTread: number;
  kmOnTyre: number;
  replaceWith: string;
  notes: string;
}

export function ReplaceTyreDrawer({ open, onOpenChange, truck }: ReplaceTyreDrawerProps) {
  const [replaceDate, setReplaceDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState(truck.currentOdometer?.toString() || '');
  const [showPostDialog, setShowPostDialog] = useState(false);

  // Mock data
  const [replacements, setReplacements] = useState<ReplacementItem[]>([
    { position: 'Steer 1 - Left', currentSerial: 'TY-001-A', currentTread: 3.5, kmOnTyre: 45000, replaceWith: '', notes: '' },
    { position: 'Drive 1 - Left Outer', currentSerial: 'TY-002-A', currentTread: 2.0, kmOnTyre: 52000, replaceWith: '', notes: '' },
  ]);

  const handleUpdate = (idx: number, field: keyof ReplacementItem, value: string) => {
    const newItems = [...replacements];
    // @ts-expect-error - value is always string from input, but some fields are numbers
    newItems[idx][field] = value;
    setReplacements(newItems);
  };

  const handleConfirm = () => {
    setShowPostDialog(true);
  };

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-5xl bg-white shadow-xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Replace Tyres</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={replaceDate}
                onChange={e => setReplaceDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Odometer</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tyres to Replace</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Position</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Current Serial</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Tread (mm)</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Km on Tyre</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 w-64">Replace With</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {replacements.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.position}</td>
                      <td className="px-4 py-3 font-mono text-blue-600">{item.currentSerial}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">{item.currentTread}</td>
                      <td className="px-4 py-3 text-gray-700">{item.kmOnTyre.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Search new tyre..."
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm"
                            value={item.replaceWith}
                            onChange={e => handleUpdate(idx, 'replaceWith', e.target.value)}
                          />
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          {/* In real app, this would be a combobox/autocomplete */}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          placeholder="Reason..."
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          value={item.notes}
                          onChange={e => handleUpdate(idx, 'notes', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Note: Only listing tyres marked for replacement. To add more positions, inspect the tyre first.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleConfirm}>
            Confirm Replacement
          </Button>
        </div>
      </div>

      <PostReplacementDialog 
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
        removedTyres={replacements}
        onComplete={() => {
          setShowPostDialog(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
