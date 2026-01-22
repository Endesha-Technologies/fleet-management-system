'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { mockWorkOrders } from '@/constants/maintenance';
import { WorkOrderForm } from '@/components/features/maintenance';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditWorkOrderPage() {
  const params = useParams();
  const router = useRouter();
  const workOrder = mockWorkOrders.find(wo => wo.id === params.id);

  if (!workOrder) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/maintenance/work-orders/${workOrder.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Work Order</h1>
          <p className="text-muted-foreground mt-1">
            Update work order details for {workOrder.vehiclePlate}
          </p>
        </div>
      </div>
      
      {/* TODO: Pass workOrder data as initialData prop to WorkOrderForm */}
      <WorkOrderForm />
    </div>
  );
}
