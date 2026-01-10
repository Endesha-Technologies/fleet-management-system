'use client';

import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkOrderStatus, WorkOrderPriority } from '@/types/maintenance';
import { useState, useEffect } from 'react';

interface WorkOrderFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (status: WorkOrderStatus | 'all') => void;
  onPriorityChange: (priority: WorkOrderPriority | 'all') => void;
}

export function WorkOrderFilters({
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: WorkOrderFiltersProps) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<WorkOrderPriority | 'all'>('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    onSearchChange('');
    onStatusChange('all');
    onPriorityChange('all');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by vehicle, ID, or description..."
          className="pl-8"
          value={searchValue}
          onChange={handleSearch}
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSearchValue('');
              onSearchChange('');
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      <div className="flex gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
              {selectedStatus !== 'all' && (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  1
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatus === 'all'}
              onCheckedChange={() => {
                setSelectedStatus('all');
                onStatusChange('all');
              }}
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === 'pending'}
              onCheckedChange={() => {
                setSelectedStatus('pending');
                onStatusChange('pending');
              }}
            >
              Pending
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === 'in-progress'}
              onCheckedChange={() => {
                setSelectedStatus('in-progress');
                onStatusChange('in-progress');
              }}
            >
              In Progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === 'awaiting-parts'}
              onCheckedChange={() => {
                setSelectedStatus('awaiting-parts');
                onStatusChange('awaiting-parts');
              }}
            >
              Awaiting Parts
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === 'completed'}
              onCheckedChange={() => {
                setSelectedStatus('completed');
                onStatusChange('completed');
              }}
            >
              Completed
            </DropdownMenuCheckboxItem>
             <DropdownMenuCheckboxItem
              checked={selectedStatus === 'cancelled'}
              onCheckedChange={() => {
                setSelectedStatus('cancelled');
                onStatusChange('cancelled');
              }}
            >
              Cancelled
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Priority</span>
              {selectedPriority !== 'all' && (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  1
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedPriority === 'all'}
              onCheckedChange={() => {
                setSelectedPriority('all');
                onPriorityChange('all');
              }}
            >
              All Priorities
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedPriority === 'critical'}
              onCheckedChange={() => {
                setSelectedPriority('critical');
                onPriorityChange('critical');
              }}
            >
              Critical
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedPriority === 'high'}
              onCheckedChange={() => {
                setSelectedPriority('high');
                onPriorityChange('high');
              }}
            >
              High
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedPriority === 'medium'}
              onCheckedChange={() => {
                setSelectedPriority('medium');
                onPriorityChange('medium');
              }}
            >
              Medium
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedPriority === 'low'}
              onCheckedChange={() => {
                setSelectedPriority('low');
                onPriorityChange('low');
              }}
            >
              Low
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {(selectedStatus !== 'all' || selectedPriority !== 'all' || searchValue) && (
          <Button 
            variant="ghost" 
            onClick={handleClearFilters}
            className="hidden sm:flex"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
