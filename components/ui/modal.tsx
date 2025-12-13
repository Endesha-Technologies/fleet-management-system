'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const onDismiss = () => {
    router.back();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onDismiss()}>
      <DialogOverlay className="fixed inset-0 z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent className="fixed inset-y-0 right-0 z-[60] h-full w-full gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300 sm:max-w-lg">
        <DialogTitle className="sr-only">Navigation Modal</DialogTitle>
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </DialogContent>
    </Dialog>
  );
}
