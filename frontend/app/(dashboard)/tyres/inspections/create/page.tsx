'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TyreInspectionForm } from '@/components/features/tyres';
import type { TyreInspectionDetail } from '@/types/inspection';
import { VEHICLES } from '@/constants/vehicles';
import { TYRE_POSITIONS } from '@/constants/inspections';
import { ArrowLeft, Save, CheckCircle, AlertCircle } from 'lucide-react';

function ConductInspectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('scheduleId');

  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [overallNotes, setOverallNotes] = useState('');
  const [tyreInspections, setTyreInspections] = useState<TyreInspectionDetail[]>([]);
  const [currentTyreIndex, setCurrentTyreIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock tyre assignments for selected vehicle
  const [vehicleTyres, setVehicleTyres] = useState<Array<{ tyreId: string; position: string }>>([]);

  useEffect(() => {
    if (selectedVehicle) {
      // Mock: Generate tyre positions for vehicle
      const positions = TYRE_POSITIONS.slice(0, 4); // Front Left, Front Right, Rear Left, Rear Right
      setVehicleTyres(
        positions.map((pos, idx) => ({
          tyreId: `TYR-${selectedVehicle}-${idx + 1}`,
          position: pos,
        }))
      );
      // Initialize empty inspections
      setTyreInspections([]);
      setCurrentTyreIndex(0);
    }
  }, [selectedVehicle]);

  const handleTyreInspectionSave = (inspection: TyreInspectionDetail) => {
    const updated = [...tyreInspections];
    const existingIndex = updated.findIndex((t) => t.position === inspection.position);
    
    if (existingIndex >= 0) {
      updated[existingIndex] = inspection;
    } else {
      updated.push(inspection);
    }
    
    setTyreInspections(updated);

    // Move to next tyre if not the last one
    if (currentTyreIndex < vehicleTyres.length - 1) {
      setCurrentTyreIndex(currentTyreIndex + 1);
    }
  };

  const handleSubmitInspection = () => {
    if (!selectedVehicle || !inspectorName || !currentOdometer) {
      alert('Please fill in all required fields');
      return;
    }

    if (tyreInspections.length !== vehicleTyres.length) {
      alert('Please complete inspection for all tyres');
      return;
    }

    // Here you would save the inspection to your backend
    console.log('Saving inspection:', {
      vehicleId: selectedVehicle,
      inspectionDate,
      currentOdometer: parseInt(currentOdometer),
      inspectorName,
      tyreInspections,
      overallNotes,
    });

    setShowSuccess(true);
    setTimeout(() => {
      router.push('/tyres/inspections');
    }, 2000);
  };

  const currentTyre = vehicleTyres[currentTyreIndex];
  const completedCount = tyreInspections.length;
  const failedCount = tyreInspections.filter((t) => t.result === 'fail').length;

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inspection Completed!</h2>
          <p className="text-gray-600">
            The inspection has been saved successfully. Redirecting to inspections list...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conduct Tyre Inspection</h1>
        <p className="text-gray-600">Record detailed inspection for all tyres on the vehicle</p>
      </div>

      {/* Progress Indicator */}
      {selectedVehicle && vehicleTyres.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completedCount} of {vehicleTyres.length} tyres inspected
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                {failedCount} Failed
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / vehicleTyres.length) * 100}%` }}
            />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vehicle & Inspector Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Inspection Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicle">Vehicle *</Label>
                <select
                  id="vehicle"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {VEHICLES.map((vehicle: any) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="inspectionDate">Inspection Date *</Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="odometer">Current Odometer (km) *</Label>
                <Input
                  id="odometer"
                  type="number"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value)}
                  placeholder="e.g., 45000"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="inspector">Inspector Name *</Label>
                <Input
                  id="inspector"
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Overall Notes</Label>
                <textarea
                  id="notes"
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="General observations about the inspection..."
                />
              </div>
            </div>
          </Card>

          {/* Tyre Navigation */}
          {selectedVehicle && vehicleTyres.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tyres</h3>
              <div className="space-y-2">
                {vehicleTyres.map((tyre, index) => {
                  const isCompleted = tyreInspections.some((t) => t.position === tyre.position);
                  const isFailed = tyreInspections.find((t) => t.position === tyre.position)?.result === 'fail';
                  const isCurrent = index === currentTyreIndex;

                  return (
                    <button
                      key={tyre.position}
                      type="button"
                      onClick={() => setCurrentTyreIndex(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50'
                          : isCompleted
                          ? isFailed
                            ? 'border-red-200 bg-red-50'
                            : 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tyre.position}</span>
                        {isCompleted && (
                          <span className={`text-xs font-medium ${isFailed ? 'text-red-600' : 'text-green-600'}`}>
                            {isFailed ? 'Failed' : 'Pass'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{tyre.tyreId}</div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Tyre Inspection Form */}
        <div className="lg:col-span-2">
          {!selectedVehicle ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Please select a vehicle to begin inspection</p>
            </Card>
          ) : currentTyre ? (
            <TyreInspectionForm
              key={currentTyre.position}
              tyreId={currentTyre.tyreId}
              position={currentTyre.position}
              onSave={handleTyreInspectionSave}
              initialData={tyreInspections.find((t) => t.position === currentTyre.position)}
            />
          ) : null}
        </div>
      </div>

      {/* Submit Button */}
      {selectedVehicle && tyreInspections.length === vehicleTyres.length && (
        <div className="mt-6 flex justify-end">
          <Button size="lg" onClick={handleSubmitInspection} className="min-w-50">
            <Save className="h-5 w-5 mr-2" />
            Submit Inspection
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ConductInspectionPage() {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="p-12 text-center">
          <p className="text-gray-500">Loading...</p>
        </Card>
      </div>
    }>
      <ConductInspectionContent />
    </Suspense>
  );
}
