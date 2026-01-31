'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { MOCK_VEHICLES } from '@/constants/vehicles';
import { serviceCategories, frequencyUnits, timeSlots } from '@/constants/schedules';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function CreateMaintenanceSchedulePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Vehicle Selection
    vehicleId: '',
    applyToFleet: false,
    vehicleIds: [] as string[],
    
    // Step 2: Service Definition
    serviceName: '',
    serviceCategory: '',
    description: '',
    
    // Step 3: Schedule Frequency
    triggerType: 'time' as 'time' | 'mileage' | 'engine-hours' | 'combined',
    frequencyUnit: 'months' as 'days' | 'weeks' | 'months' | 'years',
    frequencyValue: '',
    startDate: '',
    mileageInterval: '',
    startingOdometer: '',
    engineHoursInterval: '',
    startingEngineHours: '',
    
    // Step 4: Assignment
    defaultTechnicianName: '',
    workshopLocation: '',
    estimatedDuration: '',
    preferredTimeSlot: '',
    
    // Step 5: Parts & Costs
    estimatedPartsCost: '',
    estimatedLaborHours: '',
    
    // Step 6: Alerts & Reminders
    advanceNotificationDays: '',
    advanceNotificationKm: '',
    notifyFleetManager: true,
    notifyDriver: true,
    notifySupervisor: false,
    
    // Step 7: Additional Settings
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    allowDeferment: true,
    maxDeferrals: '',
    autoCreateWorkOrder: true,
    gracePeriodDays: '',
  });

  const steps = [
    { number: 1, title: 'Vehicle Selection', description: 'Select vehicle(s)' },
    { number: 2, title: 'Service Definition', description: 'Define the service' },
    { number: 3, title: 'Schedule Frequency', description: 'Set frequency' },
    { number: 4, title: 'Assignment', description: 'Assign technician' },
    { number: 5, title: 'Parts & Costs', description: 'Estimate costs' },
    { number: 6, title: 'Alerts', description: 'Configure alerts' },
    { number: 7, title: 'Settings', description: 'Additional settings' },
  ];

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep((prev) => (prev + 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    console.log('Creating schedule with data:', formData);
    // In real implementation, submit to API
    router.push('/maintenance/schedule');
  };

  const calculateTotalCost = () => {
    const partsCost = parseFloat(formData.estimatedPartsCost) || 0;
    const laborHours = parseFloat(formData.estimatedLaborHours) || 0;
    const laborCost = laborHours * 35000; // UGX 35,000 per hour
    return partsCost + laborCost;
  };

  const selectedVehicle = MOCK_VEHICLES.find(v => v.id === formData.vehicleId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/maintenance/schedule">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Maintenance Schedule</h1>
            <p className="text-sm text-gray-600 mt-1">Set up recurring preventive maintenance</p>
          </div>
        </div>

        {/* Progress Bar */}
        {/* <Card className="p-4"> */}
          {/* <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 7
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((currentStep / 7) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div> */}

          {/* Step Indicators - Desktop */}
          <div className="hidden md:flex items-center justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep > step.number
                        ? 'bg-green-600 text-white'
                        : currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <p className="text-xs font-medium mt-2 text-center text-gray-700">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        {/* </Card> */}

        {/* Step Content */}
        <Card className="p-6">
          {/* Step 1: Vehicle Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Vehicle Selection</h2>
                <p className="text-sm text-gray-600">Select the vehicle(s) for this maintenance schedule</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="vehicleId">Select Vehicle *</Label>
                  <select
                    id="vehicleId"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a vehicle...</option>
                    {MOCK_VEHICLES.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.make} {vehicle.model} ({vehicle.year})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedVehicle && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Vehicle Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 ${
                          selectedVehicle.status === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedVehicle.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Odometer:</span>
                        <span className="ml-2 text-gray-900">{selectedVehicle.odometer?.toLocaleString() || 'N/A'} km</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 text-gray-900 capitalize">{selectedVehicle.type || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Driver:</span>
                        <span className="ml-2 text-gray-900">{selectedVehicle.driver || 'Unassigned'}</span>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="applyToFleet"
                    checked={formData.applyToFleet}
                    onChange={(e) => setFormData({ ...formData, applyToFleet: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="applyToFleet" className="text-sm">
                    Apply to entire fleet or multiple vehicles
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Service Definition */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Service Definition</h2>
                <p className="text-sm text-gray-600">Define the maintenance service details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    placeholder="e.g., Oil Change & Filter Replacement"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="serviceCategory">Service Category *</Label>
                  <select
                    id="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category...</option>
                    {serviceCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Describe the maintenance service in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule Frequency */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Schedule Frequency</h2>
                <p className="text-sm text-gray-600">Define when this maintenance should occur</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Trigger Type *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {[
                      { value: 'time', label: 'Time-based', desc: 'By calendar intervals' },
                      { value: 'mileage', label: 'Mileage-based', desc: 'By distance traveled' },
                      { value: 'engine-hours', label: 'Engine Hours', desc: 'By operating hours' },
                      { value: 'combined', label: 'Combined', desc: 'Whichever comes first' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, triggerType: option.value as any })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.triggerType === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {(formData.triggerType === 'time' || formData.triggerType === 'combined') && (
                  <Card className="p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3">Time-based Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="frequencyValue">Frequency Interval *</Label>
                        <Input
                          id="frequencyValue"
                          type="number"
                          placeholder="e.g., 3"
                          value={formData.frequencyValue}
                          onChange={(e) => setFormData({ ...formData, frequencyValue: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="frequencyUnit">Frequency Unit *</Label>
                        <select
                          id="frequencyUnit"
                          value={formData.frequencyUnit}
                          onChange={(e) => setFormData({ ...formData, frequencyUnit: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {frequencyUnits.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {(formData.triggerType === 'mileage' || formData.triggerType === 'combined') && (
                  <Card className="p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3">Mileage-based Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mileageInterval">Mileage Interval (km) *</Label>
                        <Input
                          id="mileageInterval"
                          type="number"
                          placeholder="e.g., 5000"
                          value={formData.mileageInterval}
                          onChange={(e) => setFormData({ ...formData, mileageInterval: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="startingOdometer">Starting Odometer (km)</Label>
                        <Input
                          id="startingOdometer"
                          type="number"
                          placeholder={selectedVehicle ? selectedVehicle.odometer.toString() : '0'}
                          value={formData.startingOdometer}
                          onChange={(e) => setFormData({ ...formData, startingOdometer: e.target.value })}
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {(formData.triggerType === 'engine-hours' || formData.triggerType === 'combined') && (
                  <Card className="p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3">Engine Hours Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="engineHoursInterval">Engine Hours Interval *</Label>
                        <Input
                          id="engineHoursInterval"
                          type="number"
                          placeholder="e.g., 250"
                          value={formData.engineHoursInterval}
                          onChange={(e) => setFormData({ ...formData, engineHoursInterval: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="startingEngineHours">Starting Engine Hours</Label>
                        <Input
                          id="startingEngineHours"
                          type="number"
                          placeholder="0"
                          value={formData.startingEngineHours}
                          onChange={(e) => setFormData({ ...formData, startingEngineHours: e.target.value })}
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Assignment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Assignment</h2>
                <p className="text-sm text-gray-600">Assign default technician and workshop</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="defaultTechnicianName">Default Technician</Label>
                  <Input
                    id="defaultTechnicianName"
                    placeholder="e.g., John Kamau"
                    value={formData.defaultTechnicianName}
                    onChange={(e) => setFormData({ ...formData, defaultTechnicianName: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Technician assigned by default for this service</p>
                </div>

                <div>
                  <Label htmlFor="workshopLocation">Workshop/Bay Location</Label>
                  <Input
                    id="workshopLocation"
                    placeholder="e.g., Bay 1"
                    value={formData.workshopLocation}
                    onChange={(e) => setFormData({ ...formData, workshopLocation: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDuration">Estimated Duration (hours) *</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 1.5"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="preferredTimeSlot">Preferred Time Slot</Label>
                  <select
                    id="preferredTimeSlot"
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Parts & Costs */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Parts & Cost Estimates</h2>
                <p className="text-sm text-gray-600">Estimate the costs for this maintenance service</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="estimatedPartsCost">Estimated Parts Cost (UGX)</Label>
                  <Input
                    id="estimatedPartsCost"
                    type="number"
                    placeholder="e.g., 85000"
                    value={formData.estimatedPartsCost}
                    onChange={(e) => setFormData({ ...formData, estimatedPartsCost: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedLaborHours">Estimated Labor Hours *</Label>
                  <Input
                    id="estimatedLaborHours"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 1.5"
                    value={formData.estimatedLaborHours}
                    onChange={(e) => setFormData({ ...formData, estimatedLaborHours: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Labor rate: UGX 35,000 per hour</p>
                </div>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Cost Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Parts:</span>
                      <span className="text-gray-900">
                        UGX {parseFloat(formData.estimatedPartsCost || '0').toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Labor:</span>
                      <span className="text-gray-900">
                        UGX {(parseFloat(formData.estimatedLaborHours || '0') * 35000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="font-semibold text-gray-900">Total Estimated Cost:</span>
                      <span className="font-semibold text-gray-900">
                        UGX {calculateTotalCost().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 6: Alerts & Reminders */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Alerts & Reminders</h2>
                <p className="text-sm text-gray-600">Configure advance notifications</p>
              </div>

              <div className="space-y-4">
                {(formData.triggerType === 'time' || formData.triggerType === 'combined') && (
                  <div>
                    <Label htmlFor="advanceNotificationDays">Advance Notification (days)</Label>
                    <Input
                      id="advanceNotificationDays"
                      type="number"
                      placeholder="e.g., 7"
                      value={formData.advanceNotificationDays}
                      onChange={(e) => setFormData({ ...formData, advanceNotificationDays: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Days before due date to send notification</p>
                  </div>
                )}

                {(formData.triggerType === 'mileage' || formData.triggerType === 'combined') && (
                  <div>
                    <Label htmlFor="advanceNotificationKm">Advance Notification (km)</Label>
                    <Input
                      id="advanceNotificationKm"
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.advanceNotificationKm}
                      onChange={(e) => setFormData({ ...formData, advanceNotificationKm: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Kilometers before due mileage to send notification</p>
                  </div>
                )}

                <div>
                  <Label className="mb-3 block">Notification Recipients</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="notifyFleetManager"
                        checked={formData.notifyFleetManager}
                        onChange={(e) => setFormData({ ...formData, notifyFleetManager: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="notifyFleetManager" className="text-sm font-normal">
                        Notify Fleet Manager
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="notifyDriver"
                        checked={formData.notifyDriver}
                        onChange={(e) => setFormData({ ...formData, notifyDriver: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="notifyDriver" className="text-sm font-normal">
                        Notify Driver
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="notifySupervisor"
                        checked={formData.notifySupervisor}
                        onChange={(e) => setFormData({ ...formData, notifySupervisor: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="notifySupervisor" className="text-sm font-normal">
                        Notify Workshop Supervisor
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Additional Settings */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Settings</h2>
                <p className="text-sm text-gray-600">Configure advanced options</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Priority Level *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {[
                      { value: 'low', label: 'Low', color: 'gray' },
                      { value: 'medium', label: 'Medium', color: 'blue' },
                      { value: 'high', label: 'High', color: 'orange' },
                      { value: 'critical', label: 'Critical', color: 'red' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: option.value as any })}
                        className={`p-3 border-2 rounded-lg font-medium transition-all ${
                          formData.priority === option.value
                            ? `border-${option.color}-600 bg-${option.color}-50 text-${option.color}-700`
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowDeferment"
                    checked={formData.allowDeferment}
                    onChange={(e) => setFormData({ ...formData, allowDeferment: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="allowDeferment" className="text-sm font-normal">
                    Allow deferment of this maintenance
                  </Label>
                </div>

                {formData.allowDeferment && (
                  <div>
                    <Label htmlFor="maxDeferrals">Maximum Deferrals Allowed</Label>
                    <Input
                      id="maxDeferrals"
                      type="number"
                      placeholder="e.g., 2"
                      value={formData.maxDeferrals}
                      onChange={(e) => setFormData({ ...formData, maxDeferrals: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoCreateWorkOrder"
                    checked={formData.autoCreateWorkOrder}
                    onChange={(e) => setFormData({ ...formData, autoCreateWorkOrder: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="autoCreateWorkOrder" className="text-sm font-normal">
                    Automatically create work order when due
                  </Label>
                </div>

                <div>
                  <Label htmlFor="gracePeriodDays">Grace Period (days)</Label>
                  <Input
                    id="gracePeriodDays"
                    type="number"
                    placeholder="e.g., 7"
                    value={formData.gracePeriodDays}
                    onChange={(e) => setFormData({ ...formData, gracePeriodDays: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Days after due date before marking as overdue</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 7 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Check className="w-4 h-4 mr-2" />
                Create Schedule
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
