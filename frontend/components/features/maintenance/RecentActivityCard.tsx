'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentActivity } from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  FileText, 
  Wrench, 
  AlertTriangle,
  Clock
} from 'lucide-react';

interface RecentActivityCardProps {
  activities: RecentActivity[];
}

const activityIcons = {
  'work-order-completed': CheckCircle2,
  'work-order-created': FileText,
  'breakdown-reported': AlertTriangle,
  'service-started': Wrench,
};

const activityColors = {
  'work-order-completed': {
    icon: 'text-green-600',
    bg: 'bg-green-100',
  },
  'work-order-created': {
    icon: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  'breakdown-reported': {
    icon: 'text-red-600',
    bg: 'bg-red-100',
  },
  'service-started': {
    icon: 'text-amber-600',
    bg: 'bg-amber-100',
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function RecentActivityCard({ activities = [] }: RecentActivityCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">

          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colors = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 sm:gap-4 group cursor-pointer hover:bg-accent/50 p-2 sm:p-3 rounded-lg transition-colors"
                >
                  {/* Timeline indicator - hidden on mobile, shown on larger screens */}
                  <div className="hidden sm:flex flex-col items-center">
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-full p-2',
                        colors.bg
                      )}
                    >
                      <Icon className={cn('h-4 w-4', colors.icon)} />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Mobile: Icon inline with content */}
                  <div
                    className={cn(
                      'flex sm:hidden items-center justify-center rounded-full p-1.5 flex-shrink-0',
                      colors.bg
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', colors.icon)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs sm:text-sm font-medium leading-tight">
                        {activity.message}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{activity.vehiclePlate}</span>
                      {activity.workOrderId && (
                        <>
                          <span>•</span>
                          <span className="truncate">WO-{activity.workOrderId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activities.length > 0 && (
          <button className="w-full mt-4 text-xs sm:text-sm text-primary hover:underline font-medium">
            View all activity
          </button>
        )}
      </CardContent>
    </Card>
  );
}
