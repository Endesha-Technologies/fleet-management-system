'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar, 
  AlertTriangle, 
  FileText,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  variant?: 'default' | 'outline' | 'destructive';
  color?: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Create Work Order',
    icon: Plus,
    href: '/maintenance/work-orders/create',
    variant: 'default',
  },
  {
    label: 'Schedule Service',
    icon: Calendar,
    href: '/maintenance/schedule',
    variant: 'outline',
  },
  {
    label: 'Report Breakdown',
    icon: AlertTriangle,
    href: '/maintenance/breakdown',
    variant: 'destructive',
    color: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    label: 'View Work Orders',
    icon: FileText,
    href: '/maintenance/work-orders',
    variant: 'outline',
  },
];

export function QuickActionsBar() {
  return (
    <div className="w-full">
      {/* Desktop: Horizontal button group */}
      <div className="hidden md:flex gap-3 flex-wrap">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Button
                variant={action.variant}
                className={cn(
                  'gap-2',
                  action.color
                )}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Mobile: Grid of larger buttons */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Button
                variant={action.variant}
                className={cn(
                  'w-full h-auto py-4 flex-col gap-2',
                  action.color
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium leading-tight">
                  {action.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
