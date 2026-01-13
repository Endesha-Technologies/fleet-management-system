export type InspectionStatus = 'scheduled' | 'in-progress' | 'completed' | 'overdue';

export type TyreCondition = 'good' | 'fair' | 'poor';

export type DamageType = 
  | 'cuts-punctures' 
  | 'cracks' 
  | 'bulges' 
  | 'uneven-wear' 
  | 'sidewall-damage' 
  | 'foreign-objects';

export type DamageSeverity = 'minor' | 'moderate' | 'severe';

export type RecommendedAction = 
  | 'continue-use' 
  | 'repair' 
  | 'rotate' 
  | 'replace';

export type ActionUrgency = 'immediate' | 'within-week' | 'next-service';

export type InspectionResult = 'pass' | 'fail';

export interface TreadDepthReading {
  inner: number;
  center: number;
  outer: number;
}

export interface TyreDamage {
  type: DamageType;
  severity: DamageSeverity;
  description?: string;
}

export interface TyreInspectionDetail {
  tyreId: string;
  position: string;
  treadDepth: TreadDepthReading;
  pressure: number;
  recommendedPressure: number;
  condition: TyreCondition;
  damages: TyreDamage[];
  result: InspectionResult;
  recommendedAction: RecommendedAction;
  urgency: ActionUrgency;
  photos: string[];
  notes?: string;
  remainingTreadLife: number; // percentage
}

export interface TyreInspection {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration: string;
  inspectionDate: string;
  currentOdometer: number;
  inspectorName: string;
  status: InspectionStatus;
  tyreInspections: TyreInspectionDetail[];
  overallNotes?: string;
  inspectorSignature?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface InspectionSchedule {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleRegistration: string;
  frequencyDays?: number;
  frequencyMileage?: number;
  lastInspectionDate?: string;
  lastInspectionOdometer?: number;
  nextDueDate: string;
  nextDueMileage?: number;
  assignedInspector?: string;
  isActive: boolean;
  reminderDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionSummary {
  totalInspections: number;
  completedToday: number;
  scheduledThisWeek: number;
  overdueInspections: number;
  passRate: number;
  failedInspections: number;
  vehiclesRequiringAttention: number;
}
