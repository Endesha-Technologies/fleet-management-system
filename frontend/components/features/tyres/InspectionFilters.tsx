'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { INSPECTION_STATUSES } from '@/constants/inspections';
import { Search, X } from 'lucide-react';

interface InspectionFiltersProps {
  onFilterChange: (filters: InspectionFilterState) => void;
  filters: InspectionFilterState;
}

export interface InspectionFilterState {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  inspector: string;
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

  return (
    <div className="bg-white p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Vehicle, ID..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Statuses</option>
            {INSPECTION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="dateFrom">Date From</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="dateTo">Date To</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="inspector">Inspector</Label>
          <Input
            id="inspector"
            type="text"
            placeholder="Inspector name..."
            value={filters.inspector}
            onChange={(e) => onFilterChange({ ...filters, inspector: e.target.value })}
            className="mt-1"
          />
        </div>
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
