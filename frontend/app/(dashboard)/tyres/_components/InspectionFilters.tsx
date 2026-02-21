'use client';

import { Button } from '@/components/ui/button';
import { FormInput, FormSelect, FormDateInput } from '@/components/ui/form';
import { INSPECTION_STATUSES } from '@/constants/inspections';
import { X } from 'lucide-react';
import type { InspectionFilterState } from '../_types';

interface InspectionFiltersProps {
  onFilterChange: (filters: InspectionFilterState) => void;
  filters: InspectionFilterState;
}

export function InspectionFilters({ onFilterChange, filters }: InspectionFiltersProps) {
  const handleReset = () => {
    onFilterChange({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      inspector: '',
    });
  };

  const hasActiveFilters =
    filters.search || filters.status || filters.dateFrom || filters.dateTo || filters.inspector;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...INSPECTION_STATUSES.map((status) => ({
      value: status.value,
      label: status.label,
    })),
  ];

  return (
    <div className="bg-white p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <FormInput
          label="Search"
          type="text"
          placeholder="Vehicle, ID..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />

        <FormSelect
          label="Status"
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          options={statusOptions}
        />

        <FormDateInput
          label="Date From"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
        />

        <FormDateInput
          label="Date To"
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
        />

        <FormInput
          label="Inspector"
          type="text"
          placeholder="Inspector name..."
          value={filters.inspector}
          onChange={(e) => onFilterChange({ ...filters, inspector: e.target.value })}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
