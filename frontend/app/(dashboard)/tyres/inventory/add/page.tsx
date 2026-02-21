'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Check } from 'lucide-react';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormNumberInput,
  FormDateInput,
  FormSection,
} from '@/components/ui/form';
import type { AddTyreFormData } from '../../_types';

export default function AddTyrePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<AddTyreFormData>({
    // Basic Information
    serialNumber: '',
    autoGenerateSerial: true,
    brand: '',
    model: '',
    type: 'all-season',
    
    // Specifications
    width: '',
    aspectRatio: '',
    diameter: '',
    loadIndex: '',
    speedRating: '',
    treadPattern: '',
    
    // Purchase Details
    supplier: '',
    purchaseDate: '',
    purchaseOrderNumber: '',
    unitCost: '',
    quantity: '1',
    warrantyMonths: '24',
    
    // Initial Status
    warehouseLocation: '',
    initialTreadDepth: '18',
    
    // Optional
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would send data to an API
    console.log('Form data:', formData);

    // Navigate back to inventory
    router.push('/dashboard/tyres/inventory');
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tyreSize = formData.width && formData.aspectRatio && formData.diameter
    ? `${formData.width}/${formData.aspectRatio}R${formData.diameter}`
    : '';

  const steps = [
    { number: 1, title: 'Basic Info & Specifications' },
    { number: 2, title: 'Purchase Details & Status' },
    { number: 3, title: 'Additional Information' },
  ];

  const tyreTypeOptions = [
    { value: 'all-season', label: 'All-Season' },
    { value: 'summer', label: 'Summer' },
    { value: 'winter', label: 'Winter' },
    { value: 'all-terrain', label: 'All-Terrain' },
    { value: 'mud-terrain', label: 'Mud-Terrain' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/tyres/inventory"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Tyre</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Step {currentStep} of 3: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <span
                  className={`text-xs mt-2 text-center font-medium ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-colors ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ marginTop: '-24px' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information & Specifications */}
        {currentStep === 1 && (
          <>
            {/* Basic Information */}
            <FormSection title="Basic Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FormInput
                    label="Serial Number"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    disabled={formData.autoGenerateSerial}
                    placeholder={formData.autoGenerateSerial ? 'Auto-generated' : 'Enter serial number'}
                  />
                  <div className="mt-2">
                    <FormCheckbox
                      label="Auto-generate serial number"
                      checked={formData.autoGenerateSerial}
                      onCheckedChange={handleCheckboxChange('autoGenerateSerial')}
                    />
                  </div>
                </div>

                <FormSelect
                  label="Tyre Type"
                  required
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={tyreTypeOptions}
                />

                <FormInput
                  label="Brand"
                  required
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Michelin"
                />

                <FormInput
                  label="Model"
                  required
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., XZE"
                />
              </div>
            </FormSection>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Specifications</h2>
                {tyreSize && (
                  <p className="text-sm text-green-600 mt-1">
                    Size: {tyreSize}
                  </p>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormInput
                    label="Width (mm)"
                    required
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="e.g., 295"
                  />

                  <FormInput
                    label="Aspect Ratio"
                    required
                    name="aspectRatio"
                    value={formData.aspectRatio}
                    onChange={handleChange}
                    placeholder="e.g., 80"
                  />

                  <FormInput
                    label="Diameter (inches)"
                    required
                    name="diameter"
                    value={formData.diameter}
                    onChange={handleChange}
                    placeholder="e.g., 22.5"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormInput
                    label="Load Index"
                    required
                    name="loadIndex"
                    value={formData.loadIndex}
                    onChange={handleChange}
                    placeholder="e.g., 152"
                  />

                  <FormInput
                    label="Speed Rating"
                    required
                    name="speedRating"
                    value={formData.speedRating}
                    onChange={handleChange}
                    placeholder="e.g., L"
                  />

                  <FormInput
                    label="Tread Pattern"
                    name="treadPattern"
                    value={formData.treadPattern}
                    onChange={handleChange}
                    placeholder="e.g., Highway"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Purchase Details & Initial Status */}
        {currentStep === 2 && (
          <>
            {/* Purchase Details */}
            <FormSection title="Purchase Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Supplier"
                  required
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="Supplier name"
                />

                <FormDateInput
                  label="Purchase Date"
                  required
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />

                <FormInput
                  label="Purchase Order Number"
                  name="purchaseOrderNumber"
                  value={formData.purchaseOrderNumber}
                  onChange={handleChange}
                  placeholder="PO number"
                />

                <FormNumberInput
                  label="Unit Cost (UGX)"
                  required
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleChange}
                  placeholder="Cost per tyre"
                />

                <FormNumberInput
                  label="Quantity"
                  required
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min={1}
                />

                <FormNumberInput
                  label="Warranty Period (months)"
                  name="warrantyMonths"
                  value={formData.warrantyMonths}
                  onChange={handleChange}
                  placeholder="e.g., 24"
                />
              </div>
            </FormSection>

            {/* Initial Status */}
            <FormSection title="Initial Status">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Warehouse Location"
                  required
                  name="warehouseLocation"
                  value={formData.warehouseLocation}
                  onChange={handleChange}
                  placeholder="e.g., Section A, Shelf 3"
                />

                <FormNumberInput
                  label="Initial Tread Depth (mm)"
                  required
                  name="initialTreadDepth"
                  value={formData.initialTreadDepth}
                  onChange={handleChange}
                  step={0.1}
                  placeholder="e.g., 18"
                />
              </div>
            </FormSection>
          </>
        )}

        {/* Step 3: Additional Information */}
        {currentStep === 3 && (
          <>
            {/* Optional Information */}
            <FormSection title="Additional Information">
              <FormTextarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Any additional notes or observations..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Invoice, warranty documents, or photos (PDF, PNG, JPG up to 10MB)
                  </p>
                </div>
              </div>
            </FormSection>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <div className="flex gap-3">
            <Link
              href="/dashboard/tyres/inventory"
              className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            {currentStep === 3 && (
              <button
                type="button"
                className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Save as Draft
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Tyre'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
