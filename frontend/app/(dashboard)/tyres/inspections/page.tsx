'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  InspectionScheduleCard,
  InspectionTable,
  InspectionFilters,
} from '../_components';
import type { InspectionFilterState } from '../_types';
import { MOCK_INSPECTIONS, MOCK_INSPECTION_SCHEDULES } from '@/constants/inspections';
import {
  Calendar,
  AlertCircle,
  ClipboardCheck,
  TrendingUp,
  Plus,
  Settings,
} from 'lucide-react';

export default function TyreInspectionsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<InspectionFilterState>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    inspector: '',
  });

  // Filter inspections
  const filteredInspections = MOCK_INSPECTIONS.filter((inspection) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !inspection.vehicleName.toLowerCase().includes(searchLower) &&
        !inspection.vehicleRegistration.toLowerCase().includes(searchLower) &&
        !inspection.id.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filters.status && inspection.status !== filters.status) return false;
    if (filters.dateFrom && inspection.inspectionDate < filters.dateFrom) return false;
    if (filters.dateTo && inspection.inspectionDate > filters.dateTo) return false;
    if (
      filters.inspector &&
      !inspection.inspectorName.toLowerCase().includes(filters.inspector.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculate statistics
  const overdueSchedules = MOCK_INSPECTION_SCHEDULES.filter(
    (schedule) => new Date(schedule.nextDueDate) < new Date()
  );
  const scheduledThisWeek = MOCK_INSPECTION_SCHEDULES.filter((schedule) => {
    const nextDue = new Date(schedule.nextDueDate);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return nextDue <= weekFromNow && nextDue >= new Date();
  });
  const completedInspections = MOCK_INSPECTIONS.filter((i) => i.status === 'completed');
  const passedInspections = completedInspections.filter((inspection) => {
    return inspection.tyreInspections.every((t) => t.result === 'pass');
  });
  const passRate =
    completedInspections.length > 0
      ? ((passedInspections.length / completedInspections.length) * 100).toFixed(1)
      : '0';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tyre Inspections</h1>
          <p className="text-gray-600">Schedule, conduct, and track tyre inspections across your fleet</p>
        </div>
        <Button onClick={() => router.push('/tyres/inspections/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Conduct Inspection
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Overdue Inspections</p>
              <p className="text-3xl font-bold text-red-600">{overdueSchedules.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Due This Week</p>
              <p className="text-3xl font-bold text-orange-600">{scheduledThisWeek.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Inspections</p>
              <p className="text-3xl font-bold text-blue-600">{MOCK_INSPECTIONS.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
              <p className="text-3xl font-bold text-green-600">{passRate}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Inspection History */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Inspection History</h2>
        <InspectionFilters filters={filters} onFilterChange={setFilters} />
        <InspectionTable
          inspections={filteredInspections}
          onView={(id) => router.push(`/tyres/inspections/${id}`)}
          onExport={() => alert('Export functionality would be implemented here')}
        />
      </div>
    </div>
  );
}
