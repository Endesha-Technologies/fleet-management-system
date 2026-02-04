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
    right: 'right-0 top-0 h-screen w-full sm:w-[450px] lg:w-[500px]',
    left: 'left-0 top-0 h-screen w-full sm:w-[450px] lg:w-[500px]',
    top: 'top-0 left-0 w-full h-[70vh] sm:h-[80vh]',
    bottom: 'bottom-0 left-0 w-full h-[70vh] sm:h-[80vh]',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />
      {/* Sheet Container */}
      <div
        className={`fixed ${sideClasses[side]} z-50 bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0 sticky top-0 z-10">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{description}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close sheet"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
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
