'use client';

import { AlertTriangle, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { LowStockBannerProps } from '../_types';

export default function LowStockBanner({ alerts }: LowStockBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || alerts.length === 0) {
    return null;
  }

  const outOfStockCount = alerts.filter((a) => a.currentStock === 0).length;
  const lowStockCount = alerts.filter((a) => a.currentStock > 0).length;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900">
              Stock Alert: {alerts.length} item{alerts.length > 1 ? 's' : ''} need attention
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              {outOfStockCount > 0 && (
                <span className="font-medium text-red-600">
                  {outOfStockCount} out of stock
                </span>
              )}
              {outOfStockCount > 0 && lowStockCount > 0 && <span> • </span>}
              {lowStockCount > 0 && (
                <span className="font-medium text-amber-600">
                  {lowStockCount} low stock
                </span>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {alerts.slice(0, 3).map((alert) => (
                <Link
                  key={alert.assetId}
                  href={`/inventory/${alert.assetId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <span className={alert.currentStock === 0 ? 'text-red-600' : ''}>
                    {alert.assetName}
                  </span>
                  <span className="text-amber-500">
                    ({alert.currentStock}/{alert.reorderLevel})
                  </span>
                </Link>
              ))}
              {alerts.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-amber-600">
                  +{alerts.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Restock Now
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
