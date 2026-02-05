'use client';

import { Route } from '@/types/route';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';

interface DeleteRouteDialogProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (route: Route) => void;
}

export function DeleteRouteDialog({ 
  route, 
  open, 
  onOpenChange,
  onConfirm 
}: DeleteRouteDialogProps) {
  if (!route) return null;

  const handleConfirm = () => {
    onConfirm?.(route);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <Dialog.Title className="text-lg font-semibold">Delete Route</Dialog.Title>
          </div>
          
          <Dialog.Description className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <span className="font-semibold text-gray-900">&quot;{route.name}&quot;</span>? 
            This action cannot be undone and will permanently remove the route from the system.
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
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Route
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
