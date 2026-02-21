'use client';

import React, { useMemo } from 'react';
import { FormSelect, FormCheckbox } from '@/components/ui/form';
import type { AxleTyreConfigStepProps, TyrePosition } from '../../_types';

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
        <FormSelect
          label="Steer Axles (Number)"
          required
          value={formData.steerAxles}
          onChange={(e) => handleChange('steerAxles', e.target.value)}
          options={[
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
          ]}
        />
        <FormSelect
          label="Drive Axles (Number)"
          required
          value={formData.driveAxles}
          onChange={(e) => handleChange('driveAxles', e.target.value)}
          options={[
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
          ]}
        />
        <div className="flex items-end">
          <FormCheckbox
            label="Lift Axle Present"
            checked={formData.liftAxlePresent}
            onCheckedChange={(checked) => handleChange('liftAxlePresent', checked)}
          />
        </div>
      </div>

      <FormCheckbox
        label="Twin Tyres on Drive Axles"
        checked={formData.twinTyresOnDrive}
        onCheckedChange={(checked) => handleChange('twinTyresOnDrive', checked)}
      />

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
