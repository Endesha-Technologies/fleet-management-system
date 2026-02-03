'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PostReplacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removedTyres: any[];
  onComplete: () => void;
}

export function PostReplacementDialog({ open, onOpenChange, removedTyres, onComplete }: PostReplacementDialogProps) {
  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[60]" 
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[70] max-w-2xl w-full mx-4 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Process Removed Tyres</h2>
          <p className="text-sm text-gray-500 mt-1">Please specify what should happen to the removed tyres.</p>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Serial No.</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Position</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Total Km</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {removedTyres.map((tyre, idx) => (
                  <tr key={idx} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-blue-600 font-medium">{tyre.currentSerial}</td>
                    <td className="px-4 py-3 text-gray-900">{tyre.position}</td>
                    <td className="px-4 py-3 text-gray-700">{(tyre.kmOnTyre || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <select className="px-2 py-1.5 border border-gray-300 rounded text-sm w-full bg-white">
                        <option value="Store">Store (Spare)</option>
                        <option value="Dispose">Dispose (Scrap)</option>
                        <option value="Retread">Send for Retread</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        placeholder="Notes..."
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onComplete}>
            Save & Complete
          </Button>
        </div>
      </div>
    </>
  );
}
