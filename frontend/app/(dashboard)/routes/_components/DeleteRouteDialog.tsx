'use client';

import { useState } from 'react';
import { AlertTriangle, X, Power, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { routesService } from '@/api/routes';
import type { Route } from '@/types/route';

interface ToggleRouteStatusDialogProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ToggleRouteStatusDialog({ 
  route, 
  open, 
  onOpenChange,
  onSuccess 
}: ToggleRouteStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!route) return null;

  const isActive = route.status === 'ACTIVE';
  const action = isActive ? 'Deactivate' : 'Reactivate';
  const actionLower = isActive ? 'deactivate' : 'reactivate';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isActive) {
        await routesService.deactivateRoute(route.id);
      } else {
        await routesService.activateRoute(route.id);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(`Failed to ${actionLower} route:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${actionLower} route`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isActive ? 'bg-amber-100' : 'bg-green-100'
            }`}>
              {isActive ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <Power className="h-5 w-5 text-green-600" />
              )}
            </div>
            <Dialog.Title className="text-lg font-semibold">{action} Route</Dialog.Title>
          </div>
          
          <Dialog.Description className="text-sm text-gray-600 mb-4">
            Are you sure you want to {actionLower} <span className="font-semibold text-gray-900">&quot;{route.name}&quot;</span>?
            {isActive ? (
              <> This will prevent the route from being used in new trips.</>
            ) : (
              <> This will make the route available for use in trips again.</>
            )}
          </Dialog.Description>
          
          <div className="p-3 bg-gray-50 rounded-lg text-sm mb-6">
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>
                <span className="text-gray-500">Origin:</span>
                <p className="font-medium text-gray-900">{route.origin.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Destination:</span>
                <p className="font-medium text-gray-900">{route.destination.name}</p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={isActive 
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {action.slice(0, -1)}ing...
                </>
              ) : (
                `${action} Route`
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Keep old name as alias for backward compatibility
export { ToggleRouteStatusDialog as DeleteRouteDialog };
