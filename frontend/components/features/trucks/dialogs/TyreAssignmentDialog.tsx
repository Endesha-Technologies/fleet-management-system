'use client';

import React, { useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormData } from '../AddTruckDrawer';

interface TyreAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  onComplete: () => void;
}

interface TyrePosition {
  id: string;
  name: string;
  row: string;
  side: string;
}

interface TyreAssignment {
  positionId: string;
  tyreId: string;
  currentTread: string;
  condition: string;
  estKilometers: string;
  notes: string;
}

// Mock available tyres
const AVAILABLE_TYRES = [
  { id: 'tyre-1', code: 'TYRE-001', size: '275/80 R22.5', brand: 'Bridgestone', condition: 'Good' },
  { id: 'tyre-2', code: 'TYRE-002', size: '275/80 R22.5', brand: 'Michelin', condition: 'Good' },
  { id: 'tyre-3', code: 'TYRE-003', size: '275/80 R22.5', brand: 'Continental', condition: 'Fair' },
  { id: 'tyre-4', code: 'TYRE-004', size: '275/80 R22.5', brand: 'Goodyear', condition: 'Good' },
  { id: 'tyre-5', code: 'TYRE-005', size: '275/80 R22.5', brand: 'Pirelli', condition: 'Good' },
  { id: 'tyre-6', code: 'TYRE-006', size: '275/80 R22.5', brand: 'Dunlop', condition: 'Fair' },
  { id: 'tyre-7', code: 'TYRE-007', size: '7.00 R16', brand: 'Bridgestone', condition: 'Good' },
  { id: 'tyre-8', code: 'TYRE-008', size: '7.00 R16', brand: 'Michelin', condition: 'Good' },
];

export function TyreAssignmentDialog({
  open,
  onOpenChange,
  formData,
  onComplete,
}: TyreAssignmentDialogProps) {
  const [assignments, setAssignments] = useState<TyreAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const tyrePositions = useMemo(() => {
    const positions: TyrePosition[] = [];

    const steerCount = parseInt(formData.steerAxles) || 2;
    for (let i = 0; i < steerCount; i++) {
      positions.push({
        id: `steer-${i}`,
        name: `Steer ${i + 1}`,
        row: 'Steer Axle (1)',
        side: i === 0 ? 'Left' : i === 1 ? 'Right' : `Dual ${i - 1}`,
      });
    }

    const driveCount = parseInt(formData.driveAxles) || 2;
    const tyresPerDriveAxle = formData.twinTyresOnDrive ? 2 : 1;

    for (let axle = 0; axle < driveCount; axle++) {
      for (let tyre = 0; tyre < tyresPerDriveAxle; tyre++) {
        positions.push({
          id: `drive-${axle}-${tyre}`,
          name: `Drive Axle ${axle + 1}`,
          row: `Drive Axle ${axle + 1}`,
          side: tyresPerDriveAxle === 1 ? 'Single' : tyre === 0 ? 'Left' : 'Right',
        });
      }
    }

    if (formData.liftAxlePresent) {
      const liftCount = 2;
      for (let i = 0; i < liftCount; i++) {
        positions.push({
          id: `lift-${i}`,
          name: `Lift Axle`,
          row: 'Lift Axle',
          side: i === 0 ? 'Left' : 'Right',
        });
      }
    }

    return positions;
  }, [
    formData.steerAxles,
    formData.driveAxles,
    formData.liftAxlePresent,
    formData.twinTyresOnDrive,
  ]);

  const filteredTyres = AVAILABLE_TYRES.filter(
    (tyre) =>
      tyre.code.includes(searchTerm.toUpperCase()) ||
      tyre.brand.toUpperCase().includes(searchTerm.toUpperCase())
  );

  const handleAssignmentChange = (
    positionId: string,
    field: keyof TyreAssignment,
    value: string
  ) => {
    setAssignments((prev) => {
      const existing = prev.find((a) => a.positionId === positionId);
      if (existing) {
        return prev.map((a) =>
          a.positionId === positionId ? { ...a, [field]: value } : a
        );
      } else {
        return [...prev, { positionId, tyreId: '', currentTread: '', condition: '', estKilometers: '', notes: '', [field]: value }];
      }
    });
  };

  const handleSave = () => {
    // Validate that all positions have tyres assigned
    const allAssigned = tyrePositions.every((pos) =>
      assignments.some((a) => a.positionId === pos.id && a.tyreId)
    );

    if (!allAssigned) {
      alert('Please assign a tyre to all positions');
      return;
    }

    onComplete();
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-4 bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Assign Tyres to Truck</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Available Tyres
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or brand..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Tyre Position
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Tyre Selection
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Current Tread (mm)
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Condition
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Est. Km Used
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {tyrePositions.map((position) => {
                  const assignment = assignments.find((a) => a.positionId === position.id);
                  return (
                    <tr key={position.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">
                        <div className="font-medium">{position.name}</div>
                        <div className="text-xs text-gray-500">
                          {position.row} - {position.side}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assignment?.tyreId || ''}
                          onChange={(e) =>
                            handleAssignmentChange(position.id, 'tyreId', e.target.value)
                          }
                        >
                          <option value="">Select tyre...</option>
                          {filteredTyres.map((tyre) => (
                            <option key={tyre.id} value={tyre.id}>
                              {tyre.code} - {tyre.brand} ({tyre.size})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          placeholder="mm"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assignment?.currentTread || ''}
                          onChange={(e) =>
                            handleAssignmentChange(position.id, 'currentTread', e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assignment?.condition || ''}
                          onChange={(e) =>
                            handleAssignmentChange(position.id, 'condition', e.target.value)
                          }
                        >
                          <option value="">Select...</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          placeholder="km"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assignment?.estKilometers || ''}
                          onChange={(e) =>
                            handleAssignmentChange(position.id, 'estKilometers', e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Notes..."
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assignment?.notes || ''}
                          onChange={(e) =>
                            handleAssignmentChange(position.id, 'notes', e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Assignments
          </Button>
        </div>
      </div>
    </>
  );
}
