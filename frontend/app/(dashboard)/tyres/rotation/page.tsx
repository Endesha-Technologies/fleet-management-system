'use client';

import { useState } from 'react';
import { RotationScheduleCard } from '@/components/features/tyres/RotationScheduleCard';
import { RotationHistoryTable } from '@/components/features/tyres/RotationHistoryTable';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import type { RotationSchedule, RotationRecord } from '@/types/rotation';

// Mock data for demonstration
const mockSchedules: RotationSchedule[] = [
  {
    id: '1',
    vehicleId: 'truck-001',
    vehicleName: 'Volvo FH16',
    vehicleRegistration: 'ABC-1234',
    nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextDueMileage: 45000,
    currentMileage: 35000,
    lastRotationDate: new Date(Date.now() - 165 * 24 * 60 * 60 * 1000).toISOString(),
    rotationPattern: 'cross',
    intervalDays: 180,
    intervalMileage: 10000,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    vehicleId: 'truck-002',
    vehicleName: 'Mercedes Actros',
    vehicleRegistration: 'XYZ-5678',
    nextDueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    nextDueMileage: 50000,
    currentMileage: 51200,
    lastRotationDate: new Date(Date.now() - 185 * 24 * 60 * 60 * 1000).toISOString(),
    rotationPattern: 'front-to-back',
    intervalDays: 180,
    intervalMileage: 10000,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    vehicleId: 'truck-003',
    vehicleName: 'Scania R500',
    vehicleRegistration: 'DEF-9012',
    nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    nextDueMileage: 60000,
    currentMileage: 50000,
    lastRotationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    rotationPattern: 'side-to-side',
    intervalDays: 180,
    intervalMileage: 10000,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockRotations: RotationRecord[] = [
  {
    id: 'rot-001',
    vehicleId: 'truck-001',
    vehicleName: 'Volvo FH16',
    vehicleRegistration: 'ABC-1234',
    rotationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    mileage: 33500,
    rotationPattern: 'cross',
    performedBy: 'John Smith',
    tyreMovements: [
      {
        tyreId: 't1',
        tyreName: 'Michelin XZA',
        fromPosition: 'front-left',
        toPosition: 'rear-right',
        beforeTreadDepth: 5.5,
        afterTreadDepth: 5.5,
        wearPercentage: 35,
      },
      {
        tyreId: 't2',
        tyreName: 'Michelin XZA',
        fromPosition: 'front-right',
        toPosition: 'rear-left',
        beforeTreadDepth: 5.3,
        wearPercentage: 38,
      },
      {
        tyreId: 't3',
        tyreName: 'Michelin XZA',
        fromPosition: 'rear-left',
        toPosition: 'front-right',
        beforeTreadDepth: 4.8,
        wearPercentage: 42,
      },
      {
        tyreId: 't4',
        tyreName: 'Michelin XZA',
        fromPosition: 'rear-right',
        toPosition: 'front-left',
        beforeTreadDepth: 4.9,
        wearPercentage: 40,
      },
    ],
    notes: 'All tyres in good condition. Even wear pattern.',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rot-002',
    vehicleId: 'truck-002',
    vehicleName: 'Mercedes Actros',
    vehicleRegistration: 'XYZ-5678',
    rotationDate: new Date(Date.now() - 185 * 24 * 60 * 60 * 1000).toISOString(),
    mileage: 40800,
    rotationPattern: 'front-to-back',
    performedBy: 'Sarah Johnson',
    tyreMovements: [
      {
        tyreId: 't5',
        tyreName: 'Continental HDR',
        fromPosition: 'front-left',
        toPosition: 'rear-left',
        beforeTreadDepth: 6.2,
        wearPercentage: 28,
      },
      {
        tyreId: 't6',
        tyreName: 'Continental HDR',
        fromPosition: 'front-right',
        toPosition: 'rear-right',
        beforeTreadDepth: 6.0,
        wearPercentage: 30,
      },
      {
        tyreId: 't7',
        tyreName: 'Continental HDR',
        fromPosition: 'rear-left',
        toPosition: 'front-left',
        beforeTreadDepth: 5.5,
        wearPercentage: 35,
      },
      {
        tyreId: 't8',
        tyreName: 'Continental HDR',
        fromPosition: 'rear-right',
        toPosition: 'front-right',
        beforeTreadDepth: 5.6,
        wearPercentage: 34,
      },
    ],
    notes: 'Front tyres showing faster wear due to steering.',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rot-003',
    vehicleId: 'truck-004',
    vehicleName: 'DAF XF',
    vehicleRegistration: 'GHI-3456',
    rotationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    mileage: 28000,
    rotationPattern: 'cross',
    performedBy: 'Mike Wilson',
    tyreMovements: [],
    notes: 'Scheduled for next week.',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function TyreRotationPage() {
  const [activeTab, setActiveTab] = useState<'schedules' | 'history'>('schedules');

  const handleRotate = (scheduleId: string) => {
    console.log('Perform rotation for schedule:', scheduleId);
    // This would open a rotation form modal
    alert(`Opening rotation form for schedule: ${scheduleId}`);
  };

  const handleEdit = (scheduleId: string) => {
    console.log('Edit schedule:', scheduleId);
    alert(`Opening edit form for schedule: ${scheduleId}`);
  };

  const handleView = (id: string) => {
    console.log('View details:', id);
    alert(`Viewing details for: ${id}`);
  };

  const handleExport = () => {
    console.log('Exporting data...');
    alert('Export functionality would download CSV/PDF');
  };

  const handleCreateSchedule = () => {
    console.log('Create new schedule');
    alert('Opening form to create rotation schedule');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tyre Rotation Management</h1>
          <p className="text-gray-600 mt-1">
            Schedule and track tyre rotations to extend tyre life and ensure even wear
          </p>
        </div>
        <Button onClick={handleCreateSchedule}>
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Schedules</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {mockSchedules.filter((s) => s.isActive).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {
                  mockSchedules.filter(
                    (s) => new Date(s.nextDueDate) < new Date() || s.currentMileage >= s.nextDueMileage
                  ).length
                }
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {mockRotations.filter((r) => r.status === 'completed').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {mockRotations.filter((r) => r.status === 'scheduled').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rotation Schedules ({mockSchedules.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rotation History ({mockRotations.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSchedules.map((schedule) => (
            <RotationScheduleCard
              key={schedule.id}
              schedule={schedule}
              onRotate={handleRotate}
              onEdit={handleEdit}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <RotationHistoryTable
          rotations={mockRotations}
          onView={handleView}
          onEdit={handleEdit}
          onExport={handleExport}
        />
      )}
    </div>
  );
}
