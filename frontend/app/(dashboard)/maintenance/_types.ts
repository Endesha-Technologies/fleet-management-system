import type { LucideIcon } from 'lucide-react';
import type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  MaintenanceAlert,
  RecentActivity,
} from '@/types/maintenance';

// ─── Schedule Page Types ─────────────────────────────────────────────

export type ViewMode = 'calendar' | 'list';
export type CalendarView = 'month' | 'week' | 'day';

/** Multi-step form step number (1–7) used in schedule create/edit */
export type ScheduleFormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ─── WorkOrderForm Types ─────────────────────────────────────────────

export interface PartItem {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
}

// ─── Component Prop Types ────────────────────────────────────────────

export interface WorkOrderTableProps {
  workOrders: WorkOrder[];
}

export interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export interface WorkOrderFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (status: WorkOrderStatus | 'all') => void;
  onPriorityChange: (priority: WorkOrderPriority | 'all') => void;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export interface AlertsCardProps {
  alerts: MaintenanceAlert[];
}

export interface StatusData {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  percentage?: number;
}

export interface StatusOverviewCardProps {
  title: string;
  data: StatusData[];
  total: number;
}

export interface RecentActivityCardProps {
  activities: RecentActivity[];
}

export interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  variant?: 'default' | 'outline' | 'destructive';
  color?: string;
}
