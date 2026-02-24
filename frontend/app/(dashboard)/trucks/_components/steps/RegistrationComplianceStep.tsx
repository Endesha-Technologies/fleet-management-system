'use client';

import React from 'react';
import { FormInput, FormDateInput, FormSection } from '@/components/ui/form';
import type { FormStepProps, TruckFormData } from '../../_types';

export function RegistrationComplianceStep({ formData, setFormData }: FormStepProps) {
  const handleChange = (field: keyof TruckFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="divide-y divide-gray-200 [&>fieldset+fieldset]:pt-6 [&>fieldset]:pb-6 [&>fieldset:last-of-type]:pb-0">
      {/* Identification */}
      <FormSection title="Identification" description="Vehicle chassis and engine identifiers.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="VIN (Chassis Number)"
            placeholder="e.g. JL5PJAZ8D5G215903"
            value={formData.vin}
            onChange={(e) => handleChange('vin', e.target.value)}
          />
          <FormInput
            label="Engine Number"
            placeholder="e.g. 4HK1-ABC1234"
            value={formData.engineNumber}
            onChange={(e) => handleChange('engineNumber', e.target.value)}
          />
        </div>
      </FormSection>

      {/* Registration */}
      <FormSection title="Registration" description="Vehicle registration details and validity.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormDateInput
            label="Registration Date"
            value={formData.registrationDate}
            onChange={(e) => handleChange('registrationDate', e.target.value)}
          />
          <FormDateInput
            label="Registration Expiry"
            value={formData.registrationExpiry}
            onChange={(e) => handleChange('registrationExpiry', e.target.value)}
          />
        </div>
      </FormSection>

      {/* Insurance */}
      <FormSection title="Insurance" description="Insurance coverage details.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="Insurance Provider"
            placeholder="e.g. Jubilee Insurance"
            value={formData.insuranceProvider}
            onChange={(e) => handleChange('insuranceProvider', e.target.value)}
          />
          <FormInput
            label="Policy Number"
            placeholder="e.g. POL-2024-001234"
            value={formData.insurancePolicyNumber}
            onChange={(e) => handleChange('insurancePolicyNumber', e.target.value)}
          />
          <FormDateInput
            label="Insurance Expiry"
            value={formData.insuranceExpiry}
            onChange={(e) => handleChange('insuranceExpiry', e.target.value)}
          />
        </div>
      </FormSection>

      {/* Inspection & License */}
      <FormSection title="Inspection & Operating License" description="Road worthiness and operating permits.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormDateInput
            label="Inspection Expiry"
            value={formData.inspectionExpiry}
            onChange={(e) => handleChange('inspectionExpiry', e.target.value)}
          />
          <FormInput
            label="Operating License Number"
            placeholder="e.g. OPL-2024-5678"
            value={formData.operatingLicenseNumber}
            onChange={(e) => handleChange('operatingLicenseNumber', e.target.value)}
          />
          <FormDateInput
            label="Operating License Expiry"
            value={formData.operatingLicenseExpiry}
            onChange={(e) => handleChange('operatingLicenseExpiry', e.target.value)}
          />
        </div>
      </FormSection>

      <div className="pt-6">
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800">
            Keep compliance documents up to date. The system will notify you when expiry dates are approaching.
          </p>
        </div>
      </div>
    </div>
  );
}
