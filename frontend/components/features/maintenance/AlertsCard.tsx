'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceAlert as Alert } from '@/types/maintenance';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock,
  Wrench,
  Package,
  FileWarning
} from 'lucide-react';

interface AlertsCardProps {
  alerts: Alert[];
}

const alertIcons = {
  overdue: AlertTriangle,
  'due-soon': Clock,
  'low-tread': AlertCircle,
  breakdown: Wrench,
  parts: Package,
  warranty: FileWarning,
};

const severityStyles = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-l-red-500',
    icon: 'text-red-600',
    text: 'text-red-900',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-l-amber-500',
    icon: 'text-amber-600',
    text: 'text-amber-900',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
    icon: 'text-blue-600',
    text: 'text-blue-900',
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

export function AlertsCard({ alerts = [] }: AlertsCardProps) {
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;


  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">
            Alerts & Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                {criticalCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {warningCount}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active alerts</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = alertIcons[alert.type];
              const styles = severityStyles[alert.severity];

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'border-l-4 p-3 sm:p-4 rounded-r-lg transition-all hover:shadow-md cursor-pointer',
                    styles.bg,
                    styles.border
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5', styles.icon)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs sm:text-sm font-medium leading-snug', styles.text)}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {alerts.length > 0 && (
          <button className="w-full mt-4 text-xs sm:text-sm text-primary hover:underline font-medium">
            View all alerts ({alerts.length})
          </button>
        )}
      </CardContent>
    </Card>
  );
}
