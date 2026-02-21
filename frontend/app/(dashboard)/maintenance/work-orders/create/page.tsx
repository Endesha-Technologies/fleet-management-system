import { WorkOrderForm } from '../../_components';

export default function CreateWorkOrderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Work Order</h1>
        <p className="text-muted-foreground">
          Create a new maintenance work order for a fleet vehicle.
        </p>
      </div>
      
      <WorkOrderForm />
    </div>
  );
}
