'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { StatusOverviewCardProps } from '../_types';

export function StatusOverviewCard({ title, data, total }: StatusOverviewCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {/* Mobile: Stacked bars with labels */}
        <div className="space-y-3 sm:space-y-4">
          {data.map((item) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-muted-foreground truncate">
                    {item.label}
                  </span>
                  <span className="font-bold ml-2 flex-shrink-0">
                    {item.value}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', item.bgColor)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% of total
                </p>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total
            </span>
            <span className="text-lg sm:text-xl font-bold">
              {total}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
