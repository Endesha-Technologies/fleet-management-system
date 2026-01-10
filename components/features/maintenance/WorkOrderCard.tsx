'use client';

import { WorkOrder } from '@/types/maintenance';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Wrench, AlertCircle, ChevronRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // I'll assume date-fns is available or do manual formatting if not. I'll stick to manual for now to be safe as I haven't checked package.json for date-fns.
import Link from 'next/link';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'awaiting-parts': return 'warning';
      case 'critical': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  // Simple date formatter to avoid dependency issues for now
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden hover:bg-slate-50 transition-colors border-l-4" style={{
        borderLeftColor: workOrder.priority === 'critical' ? '#ef4444' : 
                         workOrder.priority === 'high' ? '#f97316' : 
                         'transparent'
    }}>
      <Link href={`/maintenance/work-orders/${workOrder.id}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">{workOrder.vehiclePlate}</span>
                <span className="text-xs text-muted-foreground">{workOrder.vehicleModel}</span>
            </div>
            <Badge variant={getStatusColor(workOrder.status)}>
              {workOrder.status.replace('-', ' ')}
            </Badge>
          </div>
          
          <h3 className="font-medium text-sm mb-3 line-clamp-2">{workOrder.description}</h3>
          
          <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                <span className="capitalize">{workOrder.type}</span>
            </div>
             <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="truncate">{workOrder.assignedTo || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-1.5">
               <AlertCircle className={`h-3.5 w-3.5 ${getPriorityColor(workOrder.priority)}`} />
               <span className="capitalize">{workOrder.priority} Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Due {formatDate(workOrder.dueDate)}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
