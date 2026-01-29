'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RotationSchedule } from '@/types/rotation';
import { ROTATION_PATTERNS } from '@/constants/rotation';
import { RefreshCw, Calendar, Gauge, AlertCircle } from 'lucide-react';

interface RotationScheduleCardProps {
  schedule: RotationSchedule;
  onRotate?: (scheduleId: string) => void;
  onEdit?: (scheduleId: string) => void;
  onView?: (scheduleId: string) => void;
}

export function RotationScheduleCard({
  schedule,
  onRotate,
  onEdit,
  onView,
}: RotationScheduleCardProps) {
  const isOverdue = new Date(schedule.nextDueDate) < new Date();
  const daysUntilDue = Math.ceil(
    (new Date(schedule.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const mileageRemaining = schedule.nextDueMileage - schedule.currentMileage;
  const isMileageOverdue = mileageRemaining <= 0;

  const patternConfig = ROTATION_PATTERNS.find((p) => p.value === schedule.rotationPattern);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{schedule.vehicleName}</h3>
          <p className="text-sm text-gray-600">{schedule.vehicleRegistration}</p>
        </div>
        {(isOverdue || isMileageOverdue) && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Next Rotation:</span>
          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
            {new Date(schedule.nextDueDate).toLocaleDateString()}
          </span>
          {!isOverdue && (
            <span className="text-gray-500">
              ({daysUntilDue > 0 ? daysUntilDue : 0} {daysUntilDue === 1 ? 'day' : 'days'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Mileage Remaining:</span>
          <span className={`font-medium ${isMileageOverdue ? 'text-red-600' : 'text-gray-900'}`}>
            {mileageRemaining.toLocaleString()} km
          </span>
        </div>

        {schedule.lastRotationDate && (
          <div className="text-sm text-gray-600">
            Last Rotation: <span className="font-medium text-gray-900">
              {new Date(schedule.lastRotationDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {patternConfig && (
          <div className="text-sm text-gray-600">
            Pattern: <span className="font-medium text-gray-900">{patternConfig.label}</span>
            <span className="text-xs text-gray-500 ml-2">({patternConfig.description})</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onRotate?.(schedule.id)}
          className="flex-1"
          variant={isOverdue || isMileageOverdue ? 'default' : 'outline'}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Perform Rotation
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit?.(schedule.id)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView?.(schedule.id)}
        >
          View
        </Button>
      </div>
    </Card>
  );
}
