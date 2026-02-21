'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RotationSchedule } from '../_types';
import { ROTATION_PATTERNS } from '@/constants/rotation';
import { RefreshCw, Calendar, Gauge, AlertCircle, Clock, TrendingUp } from 'lucide-react';

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
  
  // Calculate progress percentages
  const mileageProgress = Math.min(100, ((schedule.currentMileage / schedule.nextDueMileage) * 100));
  const daysElapsed = schedule.intervalDays - (daysUntilDue > 0 ? daysUntilDue : 0);
  const timeProgress = Math.min(100, ((daysElapsed / schedule.intervalDays) * 100));

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-t-4 ${
      isOverdue || isMileageOverdue 
        ? 'border-t-red-500 bg-gradient-to-br from-red-50/50 to-white' 
        : daysUntilDue <= 30 
        ? 'border-t-orange-500 bg-gradient-to-br from-orange-50/50 to-white'
        : 'border-t-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white'
    }`}>
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm p-5 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xl text-gray-900">{schedule.vehicleName}</h3>
              {schedule.isActive && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">{schedule.vehicleRegistration}</p>
          </div>
          {(isOverdue || isMileageOverdue) && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              Overdue
            </span>
          )}
          {!isOverdue && !isMileageOverdue && daysUntilDue <= 30 && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-500 text-white shadow-sm">
              <Clock className="h-3.5 w-3.5" />
              Due Soon
            </span>
          )}
        </div>
        
        {/* Pattern Badge */}
        {patternConfig && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mt-2">
            <RefreshCw className="h-3 w-3" />
            {patternConfig.label}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4">
        {/* Next Rotation Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                isOverdue ? 'bg-red-100' : daysUntilDue <= 30 ? 'bg-orange-100' : 'bg-blue-100'
              }`}>
                <Calendar className={`h-4 w-4 ${
                  isOverdue ? 'text-red-600' : daysUntilDue <= 30 ? 'text-orange-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Next Rotation</p>
                <p className={`text-sm font-bold ${
                  isOverdue ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {new Date(schedule.nextDueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            {!isOverdue && daysUntilDue >= 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{daysUntilDue}</p>
                <p className="text-xs text-gray-500">{daysUntilDue === 1 ? 'day' : 'days'}</p>
              </div>
            )}
          </div>
          
          {/* Time Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Time Progress</span>
              <span className="font-medium text-gray-700">{Math.round(timeProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  timeProgress >= 100 ? 'bg-red-500' : timeProgress >= 80 ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, timeProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mileage Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                isMileageOverdue ? 'bg-red-100' : mileageProgress >= 80 ? 'bg-orange-100' : 'bg-purple-100'
              }`}>
                <Gauge className={`h-4 w-4 ${
                  isMileageOverdue ? 'text-red-600' : mileageProgress >= 80 ? 'text-orange-600' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Mileage</p>
                <p className={`text-sm font-bold ${
                  isMileageOverdue ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {schedule.currentMileage.toLocaleString()} / {schedule.nextDueMileage.toLocaleString()} km
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                isMileageOverdue ? 'text-red-600' : 'text-gray-900'
              }`}>
                {isMileageOverdue ? '0' : mileageRemaining.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">km left</p>
            </div>
          </div>
          
          {/* Mileage Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Mileage Progress</span>
              <span className="font-medium text-gray-700">{Math.round(mileageProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  mileageProgress >= 100 ? 'bg-red-500' : mileageProgress >= 80 ? 'bg-orange-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, mileageProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Last Rotation */}
        {schedule.lastRotationDate && (
          <div className="flex items-center gap-2 text-xs text-gray-600 px-2">
            <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
            <span>Last rotated on</span>
            <span className="font-semibold text-gray-900">
              {new Date(schedule.lastRotationDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-5 pb-5 flex gap-2">
        <Button
          size="sm"
          onClick={() => onRotate?.(schedule.id)}
          className={`flex-1 font-semibold shadow-sm ${
            isOverdue || isMileageOverdue 
              ? 'bg-red-600 hover:bg-red-700' 
              : daysUntilDue <= 30
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rotate Now
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit?.(schedule.id)}
          className="hover:bg-gray-50"
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView?.(schedule.id)}
          className="hover:bg-gray-50"
        >
          Details
        </Button>
      </div>
    </Card>
  );
}
