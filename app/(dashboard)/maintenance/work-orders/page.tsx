'use client';

import { useState } from 'react';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '@/types/maintenance';
import { mockWorkOrders } from '@/constants/maintenance';
import { WorkOrderTable, WorkOrderCard, WorkOrderFilters } from '@/components/features/maintenance';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function WorkOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | 'all'>('all');

  // Filter logic
  const filteredOrders = mockWorkOrders.filter((wo) => {
    const matchesSearch = 
      wo.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      wo.id.toLowerCase().includes(search.toLowerCase()) ||
      wo.description.toLowerCase().includes(search.toLowerCase()) ||
      (wo.assignedTo && wo.assignedTo.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage vehicle maintenance tasks and schedules
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/maintenance/work-orders/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Work Order
          </Link>
        </Button>
      </div>

      <WorkOrderFilters
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />

      {/* Mobile/Tablet View (Cards) */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((wo) => (
            <WorkOrderCard key={wo.id} workOrder={wo} />
          ))
        ) : (
          <div className="text-center py-10 border rounded-lg bg-slate-50">
            <p className="text-muted-foreground">No work orders found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block">
        <WorkOrderTable workOrders={filteredOrders} />
      </div>
    </div>
  );
}
