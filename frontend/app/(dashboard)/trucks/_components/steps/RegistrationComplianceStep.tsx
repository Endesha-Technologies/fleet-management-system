'use client';

import React from 'react';
import { FormInput, FormDateInput } from '@/components/ui/form';
import type { RegistrationComplianceStepProps, TruckFormData } from '../../_types';

export function RegistrationComplianceStep({
  formData,
  setFormData,
}: RegistrationComplianceStepProps) {
  const handleChange = (field: keyof TruckFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Registration Number"
          required
          placeholder="e.g., REG-2022-001"
          value={formData.registrationNumber}
          onChange={(e) => handleChange('registrationNumber', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormDateInput
          label="Insurance Expiry Date"
          value={formData.insuranceExpiryDate}
          onChange={(e) => handleChange('insuranceExpiryDate', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormDateInput
          label="Road Licence Expiry Date"
          value={formData.roadLicenceExpiryDate}
          onChange={(e) => handleChange('roadLicenceExpiryDate', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormDateInput
          label="Inspection Expiry Date"
          value={formData.inspectionExpiryDate}
          onChange={(e) => handleChange('inspectionExpiryDate', e.target.value)}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Keep compliance documents up to date. The system will notify you when expiry dates are approaching.
        </p>
      </div>
    </div>
  );
}
