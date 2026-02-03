'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function Sheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  side = 'right',
}: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!open) return null;

  const sideClasses = {
    right: 'right-0 top-0 h-screen w-full sm:w-[400px] md:w-96',
    left: 'left-0 top-0 h-screen w-full sm:w-[400px] md:w-96',
    top: 'top-0 left-0 w-full h-[60vh] sm:h-96',
    bottom: 'bottom-0 left-0 w-full h-[60vh] sm:h-96',
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
        style={{ pointerEvents: 'auto' }}
      />
      <div
        className={`fixed ${sideClasses[side]} z-50 bg-white shadow-2xl border border-gray-200 flex flex-col transform transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          pointerEvents: 'auto',
          animation: side === 'right' ? 'slideInRight 0.3s ease-out' : 
                     side === 'left' ? 'slideInLeft 0.3s ease-out' :
                     side === 'top' ? 'slideInUp 0.3s ease-out' :
                     'slideInDown 0.3s ease-out'
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 bg-white sticky top-0">
          <div className="flex-1">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="ml-4 p-2 rounded-md hover:bg-gray-100 transition flex-shrink-0 text-gray-500 hover:text-gray-700"
            aria-label="Close dialog"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export function SheetTrigger({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>;
}

export function SheetContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
