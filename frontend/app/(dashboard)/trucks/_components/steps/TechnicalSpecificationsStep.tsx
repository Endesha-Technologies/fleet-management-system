'use client';

import React from 'react';
import { FormInput, FormSelect, FormNumberInput } from '@/components/ui/form';
import type { TechnicalSpecificationsStepProps, TruckFormData } from '../../_types';

export function TechnicalSpecificationsStep({
  formData,
  setFormData,
}: TechnicalSpecificationsStepProps) {
  const handleChange = (field: keyof TruckFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Fuel Type"
          required
          value={formData.fuelType}
          onChange={(e) => handleChange('fuelType', e.target.value)}
          options={[
            { value: 'Diesel', label: 'Diesel' },
            { value: 'Petrol', label: 'Petrol' },
            { value: 'LPG', label: 'LPG' },
            { value: 'CNG', label: 'CNG' },
          ]}
        />
        <FormNumberInput
          label="Fuel Tank Capacity (Litres)"
          required
          placeholder="e.g., 150"
          value={formData.fuelTankCapacity}
          onChange={(e) => handleChange('fuelTankCapacity', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Engine Number"
          required
          placeholder="e.g., ENG-2022-001"
          value={formData.engineNumber}
          onChange={(e) => handleChange('engineNumber', e.target.value)}
        />
        <FormNumberInput
          label="Engine Capacity (CC)"
          required
          placeholder="e.g., 5200"
          value={formData.engineCapacity}
          onChange={(e) => handleChange('engineCapacity', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Transmission Type"
          required
          value={formData.transmissionType}
          onChange={(e) => handleChange('transmissionType', e.target.value)}
          options={[
            { value: 'Manual', label: 'Manual' },
            { value: 'Automatic', label: 'Automatic' },
            { value: 'Semi-Automatic', label: 'Semi-Automatic' },
          ]}
        />
        <FormNumberInput
          label="Odometer Reading at Entry (km)"
          placeholder="e.g., 125430"
          value={formData.odometerReadingAtEntry}
          onChange={(e) => handleChange('odometerReadingAtEntry', e.target.value)}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Technical specifications help monitor maintenance intervals and vehicle performance.
        </p>
      </div>
    </div>
  );
}
