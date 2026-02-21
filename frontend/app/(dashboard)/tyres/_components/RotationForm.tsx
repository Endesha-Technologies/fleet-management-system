'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormNumberInput, FormDateInput } from '@/components/ui/form';
import type { RotationSchedule } from '../_types';
import { ROTATION_PATTERNS, DEFAULT_ROTATION_INTERVAL_DAYS, DEFAULT_ROTATION_INTERVAL_KM } from '@/constants/rotation';
import { X } from 'lucide-react';

interface RotationFormProps {
  schedule?: RotationSchedule;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration: string;
  currentMileage: number;
  onSubmit: (data: Partial<RotationSchedule>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function RotationForm({
  schedule,
  vehicleId,
  vehicleName,
  vehicleRegistration,
  currentMileage,
  onSubmit,
  onCancel,
  isLoading = false,
}: RotationFormProps) {
  const getDefaultNextDueDate = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    return nextDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Partial<RotationSchedule>>({
    vehicleId,
    vehicleName,
    vehicleRegistration,
    currentMileage,
    rotationPattern: schedule?.rotationPattern || 'cross',
    intervalDays: schedule?.intervalDays || DEFAULT_ROTATION_INTERVAL_DAYS,
    intervalMileage: schedule?.intervalMileage || DEFAULT_ROTATION_INTERVAL_KM,
    nextDueDate: schedule?.nextDueDate || getDefaultNextDueDate(),
    nextDueMileage: schedule?.nextDueMileage || currentMileage + DEFAULT_ROTATION_INTERVAL_KM,
    isActive: schedule?.isActive !== false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.rotationPattern) {
      newErrors.rotationPattern = 'Rotation pattern is required';
    }

    if ((formData.intervalDays || 0) < 30) {
      newErrors.intervalDays = 'Interval must be at least 30 days';
    }

    if ((formData.intervalMileage || 0) < 5000) {
      newErrors.intervalMileage = 'Interval must be at least 5,000 km';
    }

    if (!formData.nextDueDate) {
      newErrors.nextDueDate = 'Next due date is required';
    }

    if ((formData.nextDueMileage || 0) <= currentMileage) {
      newErrors.nextDueMileage = 'Next due mileage must be greater than current mileage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const calculateNextDueDate = (days: number) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    const formattedDate = nextDate.toISOString().split('T')[0];
    setFormData((prev) => ({
      ...prev,
      nextDueDate: formattedDate,
      intervalDays: days,
    }));
  };

  const calculateNextDueMileage = (km: number) => {
    setFormData((prev) => ({
      ...prev,
      nextDueMileage: currentMileage + km,
      intervalMileage: km,
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {schedule ? 'Edit Rotation Schedule' : 'Create Rotation Schedule'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {vehicleName} ({vehicleRegistration})
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Info Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Vehicle</label>
              <div className="text-sm font-medium text-gray-900 mt-1">{vehicleName}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Registration</label>
              <div className="text-sm font-medium text-gray-900 mt-1">{vehicleRegistration}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Current Mileage</label>
              <div className="text-sm font-medium text-gray-900 mt-1">{currentMileage.toLocaleString()} km</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Status</label>
              <div className="text-sm font-medium text-green-600 mt-1">
                {formData.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>

        {/* Rotation Pattern Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rotation Pattern <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROTATION_PATTERNS.map((pattern) => (
              <label
                key={pattern.value}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.rotationPattern === pattern.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="rotationPattern"
                  value={pattern.value}
                  checked={formData.rotationPattern === pattern.value}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{pattern.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{pattern.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.rotationPattern && (
            <p className="text-sm text-red-600 mt-2">{errors.rotationPattern}</p>
          )}
        </div>

        {/* Time Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rotation Interval - Days <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            {[90, 180, 270, 360].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => calculateNextDueDate(days)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  formData.intervalDays === days
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
          <FormNumberInput
            name="intervalDays"
            value={formData.intervalDays || ''}
            onChange={handleChange}
            min={30}
            step={30}
            placeholder="Enter number of days"
            error={errors.intervalDays}
          />
        </div>

        {/* Mileage Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rotation Interval - Mileage (km) <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            {[5000, 10000, 15000, 20000].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => calculateNextDueMileage(km)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  formData.intervalMileage === km
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {km / 1000}k
              </button>
            ))}
          </div>
          <FormNumberInput
            name="intervalMileage"
            value={formData.intervalMileage || ''}
            onChange={handleChange}
            min={5000}
            step={1000}
            placeholder="Enter mileage in km"
            error={errors.intervalMileage}
          />
        </div>

        {/* Next Due Date */}
        <FormDateInput
          label="Next Due Date"
          required
          name="nextDueDate"
          value={formData.nextDueDate || ''}
          onChange={handleChange}
          error={errors.nextDueDate}
        />

        {/* Next Due Mileage */}
        <FormNumberInput
          label="Next Due Mileage (km)"
          required
          name="nextDueMileage"
          value={formData.nextDueMileage || ''}
          onChange={handleChange}
          error={errors.nextDueMileage}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : schedule ? 'Update Schedule' : 'Create Schedule'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
