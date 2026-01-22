export type WorkOrderStatus = 
  | 'pending'
  | 'in-progress'
  | 'awaiting-parts'
  | 'completed'
  | 'cancelled';

export type WorkOrderPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type WorkOrderType = 
  | 'preventive'
  | 'corrective'
  | 'emergency'
  | 'inspection'
  | 'recall';

export type MaintenanceCategory = 
  | 'engine'
  | 'transmission'
  | 'brakes'
  | 'electrical'
  | 'hvac'
  | 'body-paint'
  | 'tyres'
  | 'fluids'
  | 'inspection'
  | 'other';

export interface MaintenanceAlert {
  id: string;
  type: 'overdue' | 'due-soon' | 'low-tread' | 'breakdown' | 'parts' | 'warranty';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  vehicleId?: string;
  workOrderId?: string;
  createdAt: Date;
}

export interface WorkOrderPart {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  category: MaintenanceCategory;
  description: string;
  reportedBy: string;
  assignedTo?: string;
  startDate?: Date;
  completedDate?: Date;
  dueDate: Date;
  cost?: number;
  parts?: WorkOrderPart[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceStats {
  totalActiveWorkOrders: number;
  vehiclesOverdue: number;
  scheduledThisWeek: number;
  vehiclesInWorkshop: number;
  averageDowntimeDays: number;
  monthlyCost: number;
  partsInventoryAlerts: number;
}

export interface VehicleStatusCount {
  operational: number;
  dueForService: number;
  inWorkshop: number;
  outOfService: number;
}

export interface WorkOrderStatusCount {
  pending: number;
  inProgress: number;
  awaitingParts: number;
  completed: number;
  cancelled: number;
}

export interface MaintenanceTypeDistribution {
  preventive: number;
  corrective: number;
  emergency: number;
  inspection: number;
  recall: number;
}

export interface RecentActivity {
  id: string;
  type: 'work-order-completed' | 'work-order-created' | 'breakdown-reported' | 'service-started';
  message: string;
  vehicleId: string;
  vehiclePlate: string;
  timestamp: Date;
  workOrderId?: string;
}

export interface MaintenanceDashboardData {
  stats: MaintenanceStats;
  alerts: MaintenanceAlert[];
  vehicleStatus: VehicleStatusCount;
  workOrderStatus: WorkOrderStatusCount;
  maintenanceDistribution: MaintenanceTypeDistribution;
  recentActivity: RecentActivity[];
}

// Maintenance Schedule Types

export type MaintenanceScheduleStatus = 'scheduled' | 'overdue' | 'in-progress' | 'completed';
export type ScheduleTriggerType = 'time' | 'mileage' | 'engine-hours' | 'combined';
export type TimeFrequencyUnit = 'days' | 'weeks' | 'months' | 'years';

export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  vehicleIds?: string[]; // For bulk scheduling
  vehiclePlate?: string;
  vehicleModel?: string;
  serviceName: string;
  serviceCategory: MaintenanceCategory;
  description: string;
  triggerType: ScheduleTriggerType;
  
  // Time-based
  frequencyUnit?: TimeFrequencyUnit;
  frequencyValue?: number;
  startDate?: string;
  nextDueDate?: string;
  
  // Mileage-based
  mileageInterval?: number;
  startingOdometer?: number;
  nextDueMileage?: number;
  currentOdometer?: number;
  
  // Engine hours-based
  engineHoursInterval?: number;
  startingEngineHours?: number;
  nextDueEngineHours?: number;
  currentEngineHours?: number;
  
  // Assignment
  defaultTechnicianId?: string;
  defaultTechnicianName?: string;
  workshopLocation?: string;
  estimatedDuration: number; // hours
  preferredTimeSlot?: string;
  
  // Parts & Costs
  standardParts?: { partId: string; partName: string; quantity: number }[];
  estimatedPartsCost: number;
  estimatedLaborHours: number;
  estimatedTotalCost: number;
  
  // Alerts
  advanceNotificationDays?: number;
  advanceNotificationKm?: number;
  notifyFleetManager: boolean;
  notifyDriver: boolean;
  notifySupervisor: boolean;
  
  // Settings
  priority: WorkOrderPriority;
  allowDeferment: boolean;
  maxDeferrals?: number;
  autoCreateWorkOrder: boolean;
  gracePeriodDays?: number;
  
  // Status
  status: MaintenanceScheduleStatus;
  lastServiceDate?: string;
  lastServiceOdometer?: number;
  completedCount: number;
  deferredCount: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ScheduleCreateWorkOrderData {
  scheduleId: string;
  scheduledDate: string;
  notes?: string;
}

// Service History Types

export interface ServiceHistoryRecord {
  id: string;
  workOrderId: string;
  workOrderNumber: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  serviceDate: string;
  completedDate: string;
  serviceType: WorkOrderType;
  serviceCategory: MaintenanceCategory;
  description: string;
  technicianName: string;
  duration: number; // hours
  cost: number;
  partsCost: number;
  laborCost: number;
  status: WorkOrderStatus;
  odometerReading: number;
  partsUsed?: WorkOrderPart[];
  notes?: string;
}

export interface ServiceHistoryStats {
  totalEvents: number;
  totalCost: number;
  averageCost: number;
  mostCommonService: string;
  totalDuration: number;
}
