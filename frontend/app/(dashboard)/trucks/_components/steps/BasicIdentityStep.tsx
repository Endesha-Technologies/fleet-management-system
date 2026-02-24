'use client';

import React from 'react';
import { FormInput, FormSelect } from '@/components/ui/form';
import { BODY_TYPE_OPTIONS } from '../../_types';
import type { FormStepProps, TruckFormData } from '../../_types';

export function BasicIdentityStep({ formData, setFormData }: FormStepProps) {
  const handleChange = (field: keyof TruckFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* Registration — most important, shown first */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Registration Number"
          required
          placeholder="e.g. UAX 123A"
          value={formData.registrationNumber}
          onChange={(e) => handleChange('registrationNumber', e.target.value)}
        />
        <FormInput
          label="Fleet Number"
          placeholder="e.g. FLT-042"
          value={formData.fleetNumber}
          onChange={(e) => handleChange('fleetNumber', e.target.value)}
        />
      </div>

      {/* Make & Model */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Make"
          required
          placeholder="e.g. Isuzu"
          value={formData.make}
          onChange={(e) => handleChange('make', e.target.value)}
        />
        <FormInput
          label="Model"
          required
          placeholder="e.g. FVZ 34T"
          value={formData.model}
          onChange={(e) => handleChange('model', e.target.value)}
        />
      </div>

      {/* Year, Body Type, Color */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormInput
          label="Year of Manufacture"
          required
          type="number"
          min="1990"
          max={new Date().getFullYear() + 1}
          placeholder="e.g. 2022"
          value={formData.year}
          onChange={(e) => handleChange('year', e.target.value)}
        />
        <FormSelect
          label="Body Type"
          placeholder="Select body type"
          value={formData.bodyType}
          onChange={(e) => handleChange('bodyType', e.target.value)}
          options={BODY_TYPE_OPTIONS}
        />
        <FormInput
          label="Color"
          placeholder="e.g. White"
          value={formData.color}
          onChange={(e) => handleChange('color', e.target.value)}
        />
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
        <p className="text-sm text-blue-800">
          <strong>Registration Number</strong>, <strong>Make</strong>, <strong>Model</strong>, and <strong>Year</strong> are
          required to register a truck. Other fields help with fleet tracking and reporting.
        </p>
      </div>
    </div>
  );
}
