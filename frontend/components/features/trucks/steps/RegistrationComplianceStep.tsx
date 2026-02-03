'use client';

import React from 'react';
import { FormData } from '../AddTruckDrawer';

interface RegistrationComplianceStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function RegistrationComplianceStep({
  formData,
  setFormData,
}: RegistrationComplianceStepProps) {
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Number *
          </label>
          <input
            type="text"
            placeholder="e.g., REG-2022-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.registrationNumber}
            onChange={(e) => handleChange('registrationNumber', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Insurance Expiry Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.insuranceExpiryDate}
            onChange={(e) => handleChange('insuranceExpiryDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Road Licence Expiry Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.roadLicenceExpiryDate}
            onChange={(e) => handleChange('roadLicenceExpiryDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inspection Expiry Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.inspectionExpiryDate}
            onChange={(e) => handleChange('inspectionExpiryDate', e.target.value)}
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Keep compliance documents up to date. The system will notify you when expiry dates are approaching.
        </p>
      </div>
    </div>
  );
}
