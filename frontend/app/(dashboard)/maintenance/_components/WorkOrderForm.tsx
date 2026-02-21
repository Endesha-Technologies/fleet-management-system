'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Save, Info, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import { FormSelect, FormTextarea, FormInput, FormNumberInput, FormDateInput } from '@/components/ui/form';

import type { WorkOrderPriority, WorkOrderType, MaintenanceCategory } from '@/types/maintenance';
import type { PartItem } from '../_types';

const STEPS = [
  { id: 1, title: 'Vehicle Selection', description: 'Select vehicle and odometer' },
  { id: 2, title: 'Work Order Details', description: 'Type and priority' },
  { id: 3, title: 'Service Information', description: 'Category and description' },
  { id: 4, title: 'Scheduling', description: 'Date and duration' },
  { id: 5, title: 'Assignment', description: 'Technician and workshop' },
  { id: 6, title: 'Parts & Estimates', description: 'Parts and costs' },
  { id: 7, title: 'Additional Info', description: 'Attachments and notes' },
];

const vehicleOptions = MOCK_VEHICLES.map(v => ({
  value: v.id,
  label: `${v.plateNumber} - ${v.make} ${v.model}`,
}));

const workOrderTypeOptions = [
  { value: 'preventive', label: 'Preventive Maintenance (PM)' },
  { value: 'corrective', label: 'Corrective Maintenance (CM)' },
  { value: 'emergency', label: 'Emergency Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'recall', label: 'Recall' },
];

const priorityOptions = [
  { value: 'low', label: 'Low (can wait)' },
  { value: 'medium', label: 'Medium (schedule soon)' },
  { value: 'high', label: 'High (urgent)' },
  { value: 'critical', label: 'Critical (immediate)' },
];

const categoryOptions = [
  { value: 'engine', label: 'Engine Service' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'body-paint', label: 'Body/Paint' },
  { value: 'tyres', label: 'Tyres' },
  { value: 'fluids', label: 'Fluids' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'other', label: 'Other' },
];

const serviceLocationOptions = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'external', label: 'External Service Center' },
  { value: 'on-site', label: 'On-Site' },
];

const timeSlotOptions = [
  { value: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
  { value: 'afternoon', label: 'Afternoon (12:00 PM - 5:00 PM)' },
  { value: 'evening', label: 'Evening (5:00 PM - 8:00 PM)' },
];

export function WorkOrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State - Basic Details
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState<WorkOrderType>('corrective');
  const [priority, setPriority] = useState<WorkOrderPriority>('medium');
  const [category, setCategory] = useState<MaintenanceCategory>('other');
  const [description, setDescription] = useState('');
  const [reportedIssue, setReportedIssue] = useState('');
  const [serviceLocation, setServiceLocation] = useState<'workshop' | 'external' | 'on-site'>('workshop');
  
  // Scheduling
  const [scheduledDate, setScheduledDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('');
  const [deadline, setDeadline] = useState('');
  
  // Assignment
  const [assignedTo, setAssignedTo] = useState('');
  const [workshopBay, setWorkshopBay] = useState('');
  const [supervisor, setSupervisor] = useState('');
  
  // Parts & Estimates
  const [parts, setParts] = useState<PartItem[]>([]);
  const [estimatedLaborHours, setEstimatedLaborHours] = useState('');
  const [laborCostPerHour, setLaborCostPerHour] = useState('500'); // Default UGX 500/hr
  
  // Additional Information
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [driverComplaints, setDriverComplaints] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Parts management
  const addPart = () => {
    setParts([
      ...parts, 
      { id: Math.random().toString(36).substr(2, 9), name: '', quantity: 1, unitCost: 0 }
    ]);
  };

  const removePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const updatePart = (id: string, field: keyof PartItem, value: string | number) => {
    setParts(parts.map(p => {
        if (p.id === id) {
            return { ...p, [field]: value };
        }
        return p;
    }));
  };

  const calculatePartsCost = () => {
      return parts.reduce((sum, part) => sum + (part.quantity * part.unitCost), 0);
  };
  
  const calculateLaborCost = () => {
      const hours = parseFloat(estimatedLaborHours) || 0;
      const rate = parseFloat(laborCostPerHour) || 0;
      return hours * rate;
  };
  
  const calculateTotalCost = () => {
      return calculatePartsCost() + calculateLaborCost();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const selectedVehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(vehicleId && currentOdometer);
      case 2:
        return !!(type && priority);
      case 3:
        return !!(category && description);
      case 4:
        return !!(scheduledDate && estimatedDuration);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep();
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock submission
    console.log({
        vehicleId,
        type,
        priority,
        category,
        description,
        reportedIssue,
        serviceLocation,
        scheduledDate,
        estimatedDuration,
        preferredTimeSlot,
        deadline,
        assignedTo,
        workshopBay,
        supervisor,
        parts,
        estimatedLaborHours,
        laborCostPerHour,
        currentOdometer,
        specialInstructions,
        driverComplaints,
        attachments: attachments.map(f => f.name)
    });

    // Simulate network delay
    setTimeout(() => {
        setLoading(false);
        router.push('/maintenance/work-orders');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              {/* Step Indicators (Desktop) */}
              <div className="hidden lg:flex items-center justify-between pt-4">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                        currentStep > step.id
                          ? 'bg-green-600 text-white'
                          : currentStep === step.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                      </div>
                      <p className="text-xs mt-1 text-center font-medium">{step.title}</p>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 transition-colors ${
                        currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Step 1: Vehicle Selection */}
          {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">A. Vehicle Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Select Vehicle"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  placeholder="-- Select Vehicle --"
                  options={vehicleOptions}
                  required
                />
                <FormNumberInput
                  label="Current Odometer Reading (km)"
                  placeholder="Enter current odometer"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value)}
                  required
                />
            </div>
            
            {/* Vehicle Status Display */}
            {selectedVehicle && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1 text-sm">
                            <p className="font-medium text-blue-900">Vehicle Information</p>
                            <p className="text-blue-700">Status: <span className="font-medium">{selectedVehicle.status}</span></p>
                            <p className="text-blue-700">Last Recorded Odometer: <span className="font-medium">{selectedVehicle.currentOdometer?.toLocaleString() || 'N/A'} km</span></p>
                        </div>
                    </div>
                </div>
            )}
          </div>
          )}

          {/* Step 2: Work Order Details */}
          {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">B. Work Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Work Order Type"
                  value={type}
                  onChange={(e) => setType(e.target.value as WorkOrderType)}
                  options={workOrderTypeOptions}
                  required
                />
                <FormSelect
                  label="Priority Level"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
                  options={priorityOptions}
                  required
                />
            </div>
          </div>
          )}

          {/* Step 3: Service Information */}
          {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">C. Service Information</h3>
            <div className="space-y-4">
                <FormSelect
                  label="Service Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                  options={categoryOptions}
                  required
                />
                <FormTextarea
                  label="Detailed Description"
                  placeholder="Describe the work to be performed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
                <FormTextarea
                  label="Reported Issue/Symptoms"
                  placeholder="Describe any reported issues or symptoms..."
                  value={reportedIssue}
                  onChange={(e) => setReportedIssue(e.target.value)}
                  rows={2}
                />
                <FormSelect
                  label="Service Location"
                  value={serviceLocation}
                  onChange={(e) => setServiceLocation(e.target.value as 'workshop' | 'external' | 'on-site')}
                  options={serviceLocationOptions}
                  required
                />
            </div>
          </div>
          )}

          {/* Step 4: Scheduling */}
          {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">D. Scheduling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormDateInput
                  label="Scheduled Date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
                <FormNumberInput
                  label="Estimated Duration (hours)"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 2.5"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  required
                />
                <FormSelect
                  label="Preferred Time Slot"
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  placeholder="-- Select Time --"
                  options={timeSlotOptions}
                />
                <FormDateInput
                  label="Deadline (if applicable)"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
            </div>
          </div>
          )}

          {/* Step 5: Assignment */}
          {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">E. Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Assign Technician"
                  placeholder="e.g. John Mechanic"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
                <FormInput
                  label="Workshop/Bay Number"
                  placeholder="e.g. Bay 3"
                  value={workshopBay}
                  onChange={(e) => setWorkshopBay(e.target.value)}
                />
                <FormInput
                  label="Supervisor (optional)"
                  placeholder="e.g. James Supervisor"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                />
            </div>
          </div>
          )}

          {/* Step 6: Parts & Estimates */}
          {currentStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-lg font-semibold">F. Parts & Estimates</h3>
                <Button type="button" variant="outline" size="sm" onClick={addPart}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Part
                </Button>
            </div>
            
            <div className="space-y-3">
                {parts.map((part) => (
                    <div key={part.id} className="border border-gray-100 rounded-lg p-3 bg-slate-50 relative">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-1 right-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removePart(part.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pr-8">
                             <div className="md:col-span-5 space-y-1">
                                <Label className="text-xs text-muted-foreground md:hidden">Part Name</Label>
                                <Input 
                                    placeholder="Part Name" 
                                    value={part.name}
                                    onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                                    className="h-9"
                                    required
                                />
                             </div>
                             <div className="md:col-span-2 space-y-1">
                                <Label className="text-xs text-muted-foreground md:hidden">Quantity</Label>
                                <Input 
                                    type="number" 
                                    placeholder="Qty" 
                                    min="1"
                                    value={part.quantity}
                                    onChange={(e) => updatePart(part.id, 'quantity', parseInt(e.target.value) || 0)}
                                    className="h-9"
                                />
                             </div>
                             <div className="md:col-span-3 space-y-1">
                                <Label className="text-xs text-muted-foreground md:hidden">Unit Cost (UGX)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="Cost" 
                                    min="0"
                                    step="0.01"
                                    value={part.unitCost}
                                    onChange={(e) => updatePart(part.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                    className="h-9"
                                />
                             </div>
                             <div className="md:col-span-2 flex items-center justify-end md:justify-start font-medium text-sm">
                                <span className="md:hidden mr-2 text-muted-foreground">Total:</span>
                                <span>UGX {(part.quantity * part.unitCost).toLocaleString()}</span>
                             </div>
                        </div>
                    </div>
                ))}
                
                {parts.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-muted-foreground text-sm">
                        No parts added yet. Click &quot;Add Part&quot; to include required parts.
                    </div>
                )}
            </div>

            {/* Labor Estimates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <FormNumberInput
                  label="Estimated Labor Hours"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 4"
                  value={estimatedLaborHours}
                  onChange={(e) => setEstimatedLaborHours(e.target.value)}
                />
                <FormNumberInput
                  label="Labor Cost per Hour (UGX)"
                  min="0"
                  placeholder="500"
                  value={laborCostPerHour}
                  onChange={(e) => setLaborCostPerHour(e.target.value)}
                />
                <div className="space-y-2">
                    <Label>Total Labor Cost</Label>
                    <div className="h-10 flex items-center px-3 bg-gray-50 border border-gray-100 rounded-md font-medium">
                        UGX {calculateLaborCost().toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Cost Summary */}
            <div className="pt-4 border-t border-gray-100 bg-gray-50 -mx-6 px-6 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Parts Cost:</span>
                    <span className="font-medium">UGX {calculatePartsCost().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Labor Cost:</span>
                    <span className="font-medium">UGX {calculateLaborCost().toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="font-semibold text-gray-900">Estimated Total Cost:</span>
                    <span className="text-xl font-bold text-blue-600">UGX {calculateTotalCost().toLocaleString()}</span>
                </div>
            </div>
          </div>
          )}

          {/* Step 7: Additional Information */}
          {currentStep === 7 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">G. Additional Information</h3>
            <div className="space-y-4">
                <FormTextarea
                  label="Customer/Driver Complaints"
                  placeholder="Any specific complaints from the driver or customer..."
                  value={driverComplaints}
                  onChange={(e) => setDriverComplaints(e.target.value)}
                  rows={2}
                />
                <FormTextarea
                  label="Special Instructions"
                  placeholder="Any special handling instructions or notes..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={2}
                />
                <div className="space-y-2">
                    <Label htmlFor="attachments">Attach Photos/Documents</Label>
                    <div className="relative">
                        <Input 
                            id="attachments" 
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    {attachments.length > 0 && (
                        <div className="text-sm text-gray-600 p-3 bg-green-50 border border-green-100 rounded-md">
                            <p className="font-medium mb-1 text-green-900">{attachments.length} file(s) selected:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                {attachments.map((file, index) => (
                                    <li key={index} className="truncate text-green-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
          </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()} 
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>
            
            {currentStep < STEPS.length ? (
              <Button 
                type="button" 
                onClick={handleNext}
                className="w-full sm:w-auto"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                    <>
                        <span className="animate-spin mr-2">⏳</span> Creating Work Order...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Work Order
                    </>
                )}
              </Button>
            )}
        </CardFooter>
      </Card>
    </form>
  );
}
