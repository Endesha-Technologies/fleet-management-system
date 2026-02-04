'use client';

import { useState } from 'react';
import { Plus, Loader } from 'lucide-react';
import { DriversTab } from '@/components/settings/DriversTab';

export default function DriversPage() {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drivers & Turn Boys</h1>
          <p className="text-gray-600 mt-2">
            Manage drivers and support staff
          </p>
        </div>
        <button
          onClick={() => setShowAddSheet(true)}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        >
          {isSubmitting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add Driver
        </button>
      </div>

      {/* Content */}
      <DriversTab
        showAddSheet={showAddSheet}
        setShowAddSheet={setShowAddSheet}
        setIsSubmitting={setIsSubmitting}
      />
    </>
  );
}
