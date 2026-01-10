'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Check } from 'lucide-react';

export default function AddTyrePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Basic Information
    serialNumber: '',
    autoGenerateSerial: true,
    brand: '',
    model: '',
    type: 'all-season' as const,
    
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Basic Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      id="serialNumber"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      disabled={formData.autoGenerateSerial}
                      placeholder={formData.autoGenerateSerial ? 'Auto-generated' : 'Enter serial number'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="autoGenerateSerial"
                          checked={formData.autoGenerateSerial}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-600">Auto-generate serial number</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Tyre Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="all-season">All-Season</option>
                      <option value="summer">Summer</option>
                      <option value="winter">Winter</option>
                      <option value="all-terrain">All-Terrain</option>
                      <option value="mud-terrain">Mud-Terrain</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Michelin"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      placeholder="e.g., XZE"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

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
                  <div>
                    <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
                      Width (mm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="width"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 295"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 mb-1">
                      Aspect Ratio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="aspectRatio"
                      name="aspectRatio"
                      value={formData.aspectRatio}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 80"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="diameter" className="block text-sm font-medium text-gray-700 mb-1">
                      Diameter (inches) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="diameter"
                      name="diameter"
                      value={formData.diameter}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 22.5"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="loadIndex" className="block text-sm font-medium text-gray-700 mb-1">
                      Load Index <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="loadIndex"
                      name="loadIndex"
                      value={formData.loadIndex}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 152"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="speedRating" className="block text-sm font-medium text-gray-700 mb-1">
                      Speed Rating <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="speedRating"
                      name="speedRating"
                      value={formData.speedRating}
                      onChange={handleChange}
                      required
                      placeholder="e.g., L"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="treadPattern" className="block text-sm font-medium text-gray-700 mb-1">
                      Tread Pattern
                    </label>
                    <input
                      type="text"
                      id="treadPattern"
                      name="treadPattern"
                      value={formData.treadPattern}
                      onChange={handleChange}
                      placeholder="e.g., Highway"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Purchase Details & Initial Status */}
        {currentStep === 2 && (
          <>
            {/* Purchase Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Purchase Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="supplier"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      required
                      placeholder="Supplier name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="purchaseDate"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="purchaseOrderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Order Number
                    </label>
                    <input
                      type="text"
                      id="purchaseOrderNumber"
                      name="purchaseOrderNumber"
                      value={formData.purchaseOrderNumber}
                      onChange={handleChange}
                      placeholder="PO number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost (UGX) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="unitCost"
                      name="unitCost"
                      value={formData.unitCost}
                      onChange={handleChange}
                      required
                      placeholder="Cost per tyre"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="warrantyMonths" className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Period (months)
                    </label>
                    <input
                      type="number"
                      id="warrantyMonths"
                      name="warrantyMonths"
                      value={formData.warrantyMonths}
                      onChange={handleChange}
                      placeholder="e.g., 24"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Initial Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Initial Status</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="warehouseLocation" className="block text-sm font-medium text-gray-700 mb-1">
                      Warehouse Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="warehouseLocation"
                      name="warehouseLocation"
                      value={formData.warehouseLocation}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Section A, Shelf 3"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="initialTreadDepth" className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Tread Depth (mm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="initialTreadDepth"
                      name="initialTreadDepth"
                      value={formData.initialTreadDepth}
                      onChange={handleChange}
                      required
                      step="0.1"
                      placeholder="e.g., 18"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Additional Information */}
        {currentStep === 3 && (
          <>
            {/* Optional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Additional Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any additional notes or observations..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

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
              </div>
            </div>
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
