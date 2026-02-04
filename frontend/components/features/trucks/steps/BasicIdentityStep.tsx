'use client';

import React from 'react';
import { FormData } from '../AddTruckDrawer';

interface BasicIdentityStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function BasicIdentityStep({ formData, setFormData }: BasicIdentityStepProps) {
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plate Number *
          </label>
          <input
            type="text"
            placeholder="e.g., KBA 123A"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.plateNumber}
            onChange={(e) => handleChange('plateNumber', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VIN Number *
          </label>
          <input
            type="text"
            placeholder="e.g., JL5PJAZ8D5G215903"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.vinNumber}
            onChange={(e) => handleChange('vinNumber', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make *
          </label>
          <input
            type="text"
            placeholder="e.g., Isuzu"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.make}
            onChange={(e) => handleChange('make', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model *
          </label>
          <input
            type="text"
            placeholder="e.g., FRR"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year of Manufacture *
          </label>
          <input
            type="number"
            placeholder="e.g., 2022"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.yearOfManufacture}
            onChange={(e) => handleChange('yearOfManufacture', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color *
          </label>
          <input
            type="text"
            placeholder="e.g., White"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Basic information helps identify and track your truck in the system. All fields are required.
        </p>
      </div>
    </div>
  );
}
