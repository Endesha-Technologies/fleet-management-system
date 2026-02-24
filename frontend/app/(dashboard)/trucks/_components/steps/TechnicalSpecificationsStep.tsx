'use client';

import React from 'react';
import {
  FormInput,
  FormSelect,
  FormNumberInput,
  FormDateInput,
  FormSection,
  FormTextarea,
} from '@/components/ui/form';
import {
  FUEL_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  DRIVE_TYPE_OPTIONS,
  OWNERSHIP_OPTIONS,
} from '../../_types';
import type { FormStepProps, TruckFormData } from '../../_types';

export function TechnicalSpecificationsStep({
  formData,
  setFormData,
}: FormStepProps) {
  const handleChange = (field: keyof TruckFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="divide-y divide-gray-200 [&>fieldset+fieldset]:pt-6 [&>fieldset]:pb-6 [&>fieldset:last-of-type]:pb-0">
      {/* Engine & Drivetrain */}
      <FormSection
        title="Engine & Drivetrain"
        description="Powertrain and fuel specifications."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect
            label="Fuel Type"
            value={formData.fuelType}
            onChange={(e) => handleChange('fuelType', e.target.value)}
            options={FUEL_TYPE_OPTIONS}
          />
          <FormNumberInput
            label="Tank Capacity (litres)"
            placeholder="e.g. 400"
            value={formData.tankCapacityLiters}
            onChange={(e) =>
              handleChange('tankCapacityLiters', e.target.value)
            }
          />
          <FormNumberInput
            label="Engine Capacity (cc)"
            placeholder="e.g. 7790"
            value={formData.engineCapacityCc}
            onChange={(e) =>
              handleChange('engineCapacityCc', e.target.value)
            }
          />
          <FormNumberInput
            label="Horsepower"
            placeholder="e.g. 280"
            value={formData.horsepower}
            onChange={(e) => handleChange('horsepower', e.target.value)}
          />
          <FormNumberInput
            label="Number of Gears"
            placeholder="e.g. 9"
            value={formData.numberOfGears}
            onChange={(e) =>
              handleChange('numberOfGears', e.target.value)
            }
          />
          <FormSelect
            label="Transmission"
            placeholder="Select transmission"
            value={formData.transmissionType}
            onChange={(e) =>
              handleChange('transmissionType', e.target.value)
            }
            options={TRANSMISSION_OPTIONS}
          />
          <FormSelect
            label="Drive Type"
            placeholder="Select drive type"
            value={formData.driveType}
            onChange={(e) => handleChange('driveType', e.target.value)}
            options={DRIVE_TYPE_OPTIONS}
          />
        </div>
      </FormSection>

      {/* Weight & Capacity */}
      <FormSection
        title="Weight & Capacity"
        description="Legal weight limits and payload."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormNumberInput
            label="Gross Vehicle Mass (kg)"
            placeholder="e.g. 26000"
            value={formData.grossVehicleMass}
            onChange={(e) =>
              handleChange('grossVehicleMass', e.target.value)
            }
          />
          <FormNumberInput
            label="Tare Weight (kg)"
            placeholder="e.g. 8500"
            value={formData.tareWeight}
            onChange={(e) => handleChange('tareWeight', e.target.value)}
          />
          <FormNumberInput
            label="Payload Capacity (kg)"
            placeholder="e.g. 17500"
            value={formData.payloadCapacity}
            onChange={(e) =>
              handleChange('payloadCapacity', e.target.value)
            }
          />
        </div>
      </FormSection>

      {/* Current Status */}
      <FormSection
        title="Current Status"
        description="Odometer and engine hours at time of registration."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormNumberInput
            label="Odometer (km)"
            placeholder="e.g. 125430"
            value={formData.currentOdometer}
            onChange={(e) =>
              handleChange('currentOdometer', e.target.value)
            }
          />
          <FormNumberInput
            label="Engine Hours"
            placeholder="e.g. 3200"
            value={formData.engineHours}
            onChange={(e) =>
              handleChange('engineHours', e.target.value)
            }
          />
        </div>
      </FormSection>

      {/* Ownership & Purchase */}
      <FormSection
        title="Ownership & Purchase"
        description="Acquisition details."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect
            label="Ownership Type"
            placeholder="Select ownership"
            value={formData.ownershipType}
            onChange={(e) =>
              handleChange('ownershipType', e.target.value)
            }
            options={OWNERSHIP_OPTIONS}
          />
          <FormDateInput
            label="Purchase Date"
            value={formData.purchaseDate}
            onChange={(e) =>
              handleChange('purchaseDate', e.target.value)
            }
          />
          <FormNumberInput
            label="Purchase Price"
            placeholder="e.g. 85000000"
            value={formData.purchasePrice}
            onChange={(e) =>
              handleChange('purchasePrice', e.target.value)
            }
          />
          <FormInput
            label="Purchased From"
            placeholder="e.g. Isuzu East Africa"
            value={formData.purchasedFrom}
            onChange={(e) =>
              handleChange('purchasedFrom', e.target.value)
            }
          />
        </div>
      </FormSection>

      {/* Notes */}
      <FormSection
        title="Notes"
        description="Additional information about this vehicle."
      >
        <FormTextarea
          label="Notes"
          placeholder="Any additional notes about this truck..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
      </FormSection>
    </div>
  );
}
