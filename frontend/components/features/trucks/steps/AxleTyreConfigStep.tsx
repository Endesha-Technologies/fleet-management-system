'use client';

import React, { useMemo } from 'react';
import { FormData } from '../AddTruckDrawer';

interface AxleTyreConfigStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

interface TyrePosition {
  id: string;
  name: string;
  row: string;
  side: string;
}

export function AxleTyreConfigStep({ formData, setFormData }: AxleTyreConfigStepProps) {
  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateTyrePositions = useMemo(() => {
    const positions: TyrePosition[] = [];

    // Steer Axle (1)
    const steerCount = parseInt(formData.steerAxles) || 2;
    for (let i = 0; i < steerCount; i++) {
      positions.push({
        id: `steer-${i}`,
        name: `Steer ${i + 1}`,
        row: 'Steer Axle (1)',
        side: i === 0 ? 'Left' : i === 1 ? 'Right' : `Dual ${i - 1}`,
      });
    }

    // Drive Axles
    const driveCount = parseInt(formData.driveAxles) || 2;
    const tyresPerDriveAxle = formData.twinTyresOnDrive ? 2 : 1;

    for (let axle = 0; axle < driveCount; axle++) {
      for (let tyre = 0; tyre < tyresPerDriveAxle; tyre++) {
        positions.push({
          id: `drive-${axle}-${tyre}`,
          name: `Drive Axle ${axle + 1}`,
          row: `Drive Axle ${axle + 1}`,
          side:
            tyresPerDriveAxle === 1
              ? 'Single'
              : tyre === 0
                ? 'Left'
                : 'Right',
        });
      }
    }

    // Lift Axle
    if (formData.liftAxlePresent) {
      const liftCount = 2; // Typical lift axle configuration
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Steer Axles (Number) *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.steerAxles}
            onChange={(e) => handleChange('steerAxles', e.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drive Axles (Number) *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.driveAxles}
            onChange={(e) => handleChange('driveAxles', e.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            &nbsp;
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="liftAxle"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={formData.liftAxlePresent}
              onChange={(e) => handleChange('liftAxlePresent', e.target.checked)}
            />
            <label htmlFor="liftAxle" className="text-sm font-medium text-gray-700">
              Lift Axle Present
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="twinTyres"
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={formData.twinTyresOnDrive}
          onChange={(e) => handleChange('twinTyresOnDrive', e.target.checked)}
        />
        <label htmlFor="twinTyres" className="text-sm font-medium text-gray-700">
          Twin Tyres on Drive Axles
        </label>
      </div>

      {/* Tyre Position Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Tyre Positions Preview</h3>
          <p className="text-xs text-gray-600 mt-1">
            {generateTyrePositions.length} tyre positions will be created
          </p>
        </div>
        <div className="p-4 bg-white">
          <div className="grid grid-cols-2 gap-3">
            {generateTyrePositions.map((position) => (
              <div
                key={position.id}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-900">{position.name}</div>
                <div className="text-xs text-gray-600">
                  {position.row} - {position.side}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          After you submit, you&apos;ll be able to assign tyres to these positions.
        </p>
      </div>
    </div>
  );
}
