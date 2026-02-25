// ---------------------------------------------------------------------------
// Maintenance module – types
// ---------------------------------------------------------------------------
// Re-export API types for convenience within the maintenance module,
// plus UI-specific types needed by page / component files.
// ---------------------------------------------------------------------------

import type { LucideIcon } from 'lucide-react';
import type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  MaintenanceAlert,
  RecentActivity,
} from '@/types/maintenance';

// ---------------------------------------------------------------------------
// Re-export API types for convenience
// ---------------------------------------------------------------------------

export type {
  MaintenanceSchedule,
  MaintenanceScheduleListItem,
  MaintenanceScheduleDetail,
  CreateScheduleInput,
  CreateSchedulesRequest,
  UpdateScheduleRequest,

  MaintenancePlan,
  MaintenancePlanWithRefs,
  MaintenancePlanListItem,
  MaintenancePlanDetail,
  AssignPlanInput,
  AssignPlansRequest,
  UpdatePlanRequest,

  CompletePlanRequest,
  CompletePlanData,

  ServiceLog,
  ServiceLogListItem,
  ServiceLogDetail,

  MaintenanceAlertsData,
  MaintenanceAlertsSummary,
  MaintenanceAlertItem,

  TruckMaintenanceHistoryData,

  MaintenanceTaskType,
} from '@/api/maintenance';

// ---------------------------------------------------------------------------
// UI-specific types
// ---------------------------------------------------------------------------

export type MaintenanceTab = 'schedules' | 'plans' | 'logs' | 'alerts';

// ---------------------------------------------------------------------------
// Legacy UI types (used by existing page / component files)
// ---------------------------------------------------------------------------

export type ViewMode = 'list' | 'calendar';
export type CalendarView = 'month' | 'week' | 'day';
export type ScheduleFormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PartItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
  variant: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  color?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  iconColor?: string;
  iconBgColor?: string;
}

export interface StatusOverviewCardProps {
  title: string;
  data: { label: string; value: number; bgColor: string }[];
  total: number;
}

export interface AlertsCardProps {
  alerts?: MaintenanceAlert[];
}

export interface RecentActivityCardProps {
  activities?: RecentActivity[];
}

export interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export interface WorkOrderTableProps {
  workOrders: WorkOrder[];
}

export interface WorkOrderFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (status: WorkOrderStatus | 'all') => void;
  onPriorityChange: (priority: WorkOrderPriority | 'all') => void;
}
