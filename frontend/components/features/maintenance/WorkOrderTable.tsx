'use client';

import { WorkOrder } from '@/types/maintenance';
import { DataTable, DataTableColumn, DataTableBadge, DataTableCellLink } from '@/components/ui/data-table';
import { Eye, Edit, Wrench } from 'lucide-react';
import Link from 'next/link';

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
}

export function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success' as const;
      case 'in-progress': return 'info' as const;
      case 'awaiting-parts': return 'warning' as const;
      case 'cancelled': return 'default' as const;
      default: return 'default' as const;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      default: return 'text-gray-900';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: DataTableColumn<WorkOrder>[] = [
    {
      header: 'Work Order',
      cell: (wo) => (
        <DataTableCellLink href={`/maintenance/work-orders/${wo.id}`}>
          <div className="font-medium text-gray-900">{wo.id}</div>
          <div className="text-xs text-gray-500 truncate max-w-[200px]" title={wo.description}>
            {wo.description}
          </div>
        </DataTableCellLink>
      ),
    },
    {
      header: 'Vehicle',
      cell: (wo) => (
        <div>
          <div className="font-medium text-gray-900">{wo.vehiclePlate}</div>
          <div className="text-xs text-gray-500">{wo.vehicleModel}</div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (wo) => <span className="capitalize text-gray-900">{wo.type}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (wo) => (
        <DataTableBadge variant={getStatusVariant(wo.status)}>
          {wo.status.replace('-', ' ')}
        </DataTableBadge>
      ),
    },
    {
      header: 'Priority',
      cell: (wo) => (
        <span className={`capitalize font-medium ${getPriorityColor(wo.priority)}`}>
          {wo.priority}
        </span>
      ),
    },
    {
      header: 'Assigned To',
      cell: (wo) => <span className="text-gray-900">{wo.assignedTo || '-'}</span>,
    },
    {
      header: 'Due Date',
      cell: (wo) => <span className="text-gray-900">{formatDate(wo.dueDate)}</span>,
    },
    {
      header: 'Actions',
      align: 'center',
      cell: (wo) => (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/maintenance/work-orders/${wo.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
          <Link
            href={`/maintenance/work-orders/${wo.id}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      ),
    },
  ];

  const mobileCard = (wo: WorkOrder) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{wo.vehiclePlate}</h3>
          <p className="text-xs text-gray-500">{wo.vehicleModel}</p>
        </div>
        <DataTableBadge variant={getStatusVariant(wo.status)}>
          {wo.status.replace('-', ' ')}
        </DataTableBadge>
      </div>

      <p className="text-sm text-gray-700 line-clamp-2">{wo.description}</p>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500 text-xs">Type</span>
          <p className="font-medium capitalize">{wo.type}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Priority</span>
          <p className={`font-medium capitalize ${getPriorityColor(wo.priority)}`}>{wo.priority}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Assigned To</span>
          <p className="font-medium">{wo.assignedTo || 'Unassigned'}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Due Date</span>
          <p className="font-medium">{formatDate(wo.dueDate)}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Link
          href={`/maintenance/work-orders/${wo.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Link>
        <Link
          href={`/maintenance/work-orders/${wo.id}/edit`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Link>
      </div>
    </div>
  );

  return (
    <DataTable
      data={workOrders}
      columns={columns}
      mobileCard={mobileCard}
      emptyState={{
        icon: <Wrench className="h-12 w-12 mx-auto mb-2 text-gray-400" />,
        message: 'No work orders found',
      }}
    />
  );
}
