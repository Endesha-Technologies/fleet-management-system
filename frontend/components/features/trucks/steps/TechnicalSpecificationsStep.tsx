'use client';

import React from 'react';
import { FormData } from '../AddTruckDrawer';

interface TechnicalSpecificationsStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function TechnicalSpecificationsStep({
  formData,
  setFormData,
}: TechnicalSpecificationsStepProps) {
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuel Type *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.fuelType}
            onChange={(e) => handleChange('fuelType', e.target.value)}
          >
            <option value="Diesel">Diesel</option>
            <option value="Petrol">Petrol</option>
            <option value="LPG">LPG</option>
            <option value="CNG">CNG</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuel Tank Capacity (Litres) *
          </label>
          <input
            type="number"
            placeholder="e.g., 150"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.fuelTankCapacity}
            onChange={(e) => handleChange('fuelTankCapacity', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Engine Number *
          </label>
          <input
            type="text"
            placeholder="e.g., ENG-2022-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.engineNumber}
            onChange={(e) => handleChange('engineNumber', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Engine Capacity (CC) *
          </label>
          <input
            type="number"
            placeholder="e.g., 5200"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.engineCapacity}
            onChange={(e) => handleChange('engineCapacity', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transmission Type *
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.transmissionType}
            onChange={(e) => handleChange('transmissionType', e.target.value)}
          >
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
            <option value="Semi-Automatic">Semi-Automatic</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Odometer Reading at Entry (km)
          </label>
          <input
            type="number"
            placeholder="e.g., 125430"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.odometerReadingAtEntry}
            onChange={(e) => handleChange('odometerReadingAtEntry', e.target.value)}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Technical specifications help monitor maintenance intervals and vehicle performance.
        </p>
      </div>
    </div>
  );
}
