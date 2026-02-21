'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormDateInput, FormSelect, FormNumberInput, FormTextarea } from '@/components/ui/form';
import type { RotateTyresDrawerProps, RotationScheme, RotationItem } from '../../_types';

export function RotateTyresDrawer({ open, onOpenChange, truck }: RotateTyresDrawerProps) {
  const [rotationDate, setRotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState(truck.currentOdometer?.toString() || '');
  const [engineHours, setEngineHours] = useState(truck.engineHours?.toString() || '');
  const [scheme, setScheme] = useState<RotationScheme>('Standard Cross');
  const [notes, setNotes] = useState('');

  // Mock tyre positions - in a real app this would come from the truck prop or API
  const [tyres, setTyres] = useState<RotationItem[]>([
    { position: 'Steer 1 - Left', serial: 'TY-001-A', currentTread: 12, mountOdometer: 100000, lastRotationOdometer: 120000, newPosition: '' },
    { position: 'Steer 1 - Right', serial: 'TY-001-B', currentTread: 11.5, mountOdometer: 100000, lastRotationOdometer: 120000, newPosition: '' },
    { position: 'Drive 1 - Left Outer', serial: 'TY-002-A', currentTread: 14, mountOdometer: 110000, lastRotationOdometer: 122000, newPosition: '' },
    { position: 'Drive 1 - Left Inner', serial: 'TY-002-B', currentTread: 13.8, mountOdometer: 110000, lastRotationOdometer: 122000, newPosition: '' },
    { position: 'Drive 1 - Right Inner', serial: 'TY-002-C', currentTread: 14.1, mountOdometer: 110000, lastRotationOdometer: 122000, newPosition: '' },
    { position: 'Drive 1 - Right Outer', serial: 'TY-002-D', currentTread: 13.9, mountOdometer: 110000, lastRotationOdometer: 122000, newPosition: '' },
  ]);

  const allPositions = useMemo(() => tyres.map(t => t.position), [tyres]);

  const applyRotationScheme = useCallback((newScheme: RotationScheme) => {
    if (newScheme === 'Standard Cross') {
      // Mock logic for Standard Cross: Front -> Drive Rear (Cross), Drive -> Front
      setTyres(prev => prev.map(t => {
        let newPos = '';
        if (t.position === 'Steer 1 - Left') newPos = 'Drive 1 - Right Inner';
        else if (t.position === 'Steer 1 - Right') newPos = 'Drive 1 - Left Inner';
        else if (t.position.includes('Drive')) newPos = 'Steer 1 - Left'; // Simplified for demo
        else newPos = t.position;
        return { ...t, newPosition: newPos };
      }));
    } else if (newScheme === 'Front-to-Rear') {
      // Mock logic: Front -> Back, Back -> Front
      setTyres(prev => prev.map(t => {
        let newPos = '';
        if (t.position.includes('Steer')) newPos = t.position.replace('Steer', 'Drive');
        else if (t.position.includes('Drive')) newPos = t.position.replace('Drive', 'Steer');
        return { ...t, newPosition: newPos };
      }));
    } else {
      // Custom: Reset new positions
      setTyres(prev => prev.map(t => ({ ...t, newPosition: '' })));
    }
  }, []);

  // Initialize with default scheme
  useEffect(() => {
    // eslint-disable-next-line 
    applyRotationScheme('Standard Cross');
  }, [applyRotationScheme]);

  const handleSchemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScheme = e.target.value as RotationScheme;
    setScheme(newScheme);
    applyRotationScheme(newScheme);
  };

  const handleNewPositionChange = (idx: number, val: string) => {
    if (scheme !== 'Custom') return; // Only allow manual edit in Custom mode
    const newTyres = [...tyres];
    newTyres[idx].newPosition = val;
    setTyres(newTyres);
  };

  const handleConfirm = () => {
    // Validation
    if (tyres.some(t => !t.newPosition)) {
      // In a real app, use a toast notification here
      alert('Please ensure all tyres have a new position assigned.');
      return;
    }

    // Mock Submission
    console.log('Submitting Rotation:', {
      truckId: truck.id,
      date: rotationDate,
      odometer,
      engineHours,
      scheme,
      rotations: tyres.map(t => ({
        serial: t.serial,
        from: t.position,
        to: t.newPosition
      })),
      notes
    });

    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-white shadow-xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Rotate Tyres</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormDateInput
              label="Rotation Date"
              value={rotationDate}
              onChange={e => setRotationDate(e.target.value)}
            />
            <FormSelect
              label="Rotation Scheme"
              value={scheme}
              onChange={handleSchemeChange}
              options={[
                { value: 'Standard Cross', label: 'Standard Cross Rotation' },
                { value: 'Front-to-Rear', label: 'Front-to-Rear' },
                { value: 'Custom', label: 'Custom' },
              ]}
            />
            <FormNumberInput
              label="Current Odometer (km)"
              value={odometer}
              onChange={e => setOdometer(e.target.value)}
            />
            <FormNumberInput
              label="Engine Hours"
              value={engineHours}
              onChange={e => setEngineHours(e.target.value)}
            />
          </div>

          {/* Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tyre Rotation Plan</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Current Position</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Tyre Serial</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Current Tread</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Mount Odo</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Last Rot. Odo</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Total Km on Tyre</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">New Position</th>
                  </tr>
                </thead>
                <tbody>
                  {tyres.map((tyre, idx) => {
                    const startOdo = tyre.lastRotationOdometer > 0 ? tyre.lastRotationOdometer : tyre.mountOdometer;
                    const totalKm = (parseInt(odometer) || 0) - startOdo;
                    return (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{tyre.position}</td>
                        <td className="px-4 py-3 font-mono text-blue-600">{tyre.serial}</td>
                        <td className="px-4 py-3 text-gray-700">{tyre.currentTread} mm</td>
                        <td className="px-4 py-3 text-gray-700">{tyre.mountOdometer.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-700">{tyre.lastRotationOdometer > 0 ? tyre.lastRotationOdometer.toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{totalKm > 0 ? totalKm.toLocaleString() : '-'} km</td>
                        <td className="px-4 py-3">
                          {scheme === 'Custom' ? (
                            <select 
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              value={tyre.newPosition}
                              onChange={e => handleNewPositionChange(idx, e.target.value)}
                            >
                              <option value="">Select Position</option>
                              {allPositions.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-900 font-medium">{tyre.newPosition}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <FormTextarea
            label="Rotation Notes"
            rows={3}
            placeholder="Enter any observations or notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleConfirm}
          >
            Confirm Rotation
          </Button>
        </div>
      </div>
    </>
  );
}
