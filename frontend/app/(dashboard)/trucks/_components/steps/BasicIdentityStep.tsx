'use client';

import React from 'react';
import { FormInput } from '@/components/ui/form';
import type { BasicIdentityStepProps, TruckFormData } from '../../_types';

export function BasicIdentityStep({ formData, setFormData }: BasicIdentityStepProps) {
  const handleChange = (field: keyof TruckFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Plate Number"
          required
          placeholder="e.g., KBA 123A"
          value={formData.plateNumber}
          onChange={(e) => handleChange('plateNumber', e.target.value)}
        />
        <FormInput
          label="VIN Number"
          required
          placeholder="e.g., JL5PJAZ8D5G215903"
          value={formData.vinNumber}
          onChange={(e) => handleChange('vinNumber', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Make"
          required
          placeholder="e.g., Isuzu"
          value={formData.make}
          onChange={(e) => handleChange('make', e.target.value)}
        />
        <FormInput
          label="Model"
          required
          placeholder="e.g., FRR"
          value={formData.model}
          onChange={(e) => handleChange('model', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Year of Manufacture"
          required
          type="number"
          placeholder="e.g., 2022"
          value={formData.yearOfManufacture}
          onChange={(e) => handleChange('yearOfManufacture', e.target.value)}
        />
        <FormInput
          label="Color"
          required
          placeholder="e.g., White"
          value={formData.color}
          onChange={(e) => handleChange('color', e.target.value)}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Basic information helps identify and track your truck in the system. All fields are required.
        </p>
      </div>
    </div>
  );
}
