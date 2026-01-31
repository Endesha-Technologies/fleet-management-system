'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { InspectionSchedule } from '@/types/inspection';
import { Calendar, Wrench, AlertCircle } from 'lucide-react';

interface InspectionScheduleCardProps {
  schedule: InspectionSchedule;
  onInspect?: (scheduleId: string) => void;
  onEdit?: (scheduleId: string) => void;
}

export function InspectionScheduleCard({
  schedule,
  onInspect,
  onEdit,
}: InspectionScheduleCardProps) {
  const isOverdue = new Date(schedule.nextDueDate) < new Date();
  const daysUntilDue = Math.ceil(
    (new Date(schedule.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{schedule.vehicleName}</h3>
          <p className="text-sm text-gray-600">{schedule.vehicleRegistration}</p>
        </div>
        {isOverdue && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Next Due:</span>
          <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
            {new Date(schedule.nextDueDate).toLocaleDateString()}
          </span>
          {!isOverdue && (
            <span className="text-gray-500">
              ({daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'})
            </span>
          )}
        </div>

        {schedule.nextDueMileage && (
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Next Due Mileage:</span>
            <span className="font-medium">{schedule.nextDueMileage.toLocaleString()} km</span>
          </div>
        )}

        {schedule.assignedInspector && (
          <div className="text-sm text-gray-600">
            Inspector: <span className="font-medium text-gray-900">{schedule.assignedInspector}</span>
          </div>
        )}

        {schedule.lastInspectionDate && (
          <div className="text-sm text-gray-600">
            Last Inspection: {new Date(schedule.lastInspectionDate).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onInspect?.(schedule.id)}
          className="flex-1"
          variant={isOverdue ? 'default' : 'outline'}
        >
          Conduct Inspection
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit?.(schedule.id)}
        >
          Edit Schedule
        </Button>
      </div>
    </Card>
  );
}
