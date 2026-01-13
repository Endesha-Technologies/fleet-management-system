import type { 
  InspectionStatus, 
  TyreCondition, 
  DamageType, 
  DamageSeverity,
  RecommendedAction,
  ActionUrgency,
  InspectionResult,
  TyreInspection,
  InspectionSchedule
} from '@/types/inspection';

export const INSPECTION_STATUSES: { value: InspectionStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
];

export const TYRE_CONDITIONS: { value: TyreCondition; label: string; color: string }[] = [
  { value: 'good', label: 'Good', color: 'bg-green-100 text-green-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' },
];

export const DAMAGE_TYPES: { value: DamageType; label: string }[] = [
  { value: 'cuts-punctures', label: 'Cuts/Punctures' },
  { value: 'cracks', label: 'Cracks' },
  { value: 'bulges', label: 'Bulges' },
  { value: 'uneven-wear', label: 'Uneven Wear' },
  { value: 'sidewall-damage', label: 'Sidewall Damage' },
  { value: 'foreign-objects', label: 'Foreign Objects' },
];

export const DAMAGE_SEVERITIES: { value: DamageSeverity; label: string; color: string }[] = [
  { value: 'minor', label: 'Minor', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'moderate', label: 'Moderate', color: 'bg-orange-100 text-orange-800' },
  { value: 'severe', label: 'Severe', color: 'bg-red-100 text-red-800' },
];

export const RECOMMENDED_ACTIONS: { value: RecommendedAction; label: string }[] = [
  { value: 'continue-use', label: 'Continue Use' },
  { value: 'repair', label: 'Repair' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'replace', label: 'Replace' },
];

export const ACTION_URGENCIES: { value: ActionUrgency; label: string; color: string }[] = [
  { value: 'immediate', label: 'Immediate', color: 'bg-red-100 text-red-800' },
  { value: 'within-week', label: 'Within Week', color: 'bg-orange-100 text-orange-800' },
  { value: 'next-service', label: 'Next Service', color: 'bg-blue-100 text-blue-800' },
];

export const INSPECTION_RESULTS: { value: InspectionResult; label: string; color: string }[] = [
  { value: 'pass', label: 'Pass', color: 'bg-green-100 text-green-800' },
  { value: 'fail', label: 'Fail', color: 'bg-red-100 text-red-800' },
];

// Minimum tread depth thresholds (mm)
export const MIN_TREAD_DEPTH = 1.6; // Legal minimum
export const RECOMMENDED_MIN_TREAD_DEPTH = 3.0; // Recommended minimum

// Mock data for development
export const MOCK_INSPECTION_SCHEDULES: InspectionSchedule[] = [
  {
    id: 'SCH-001',
    vehicleId: 'VEH-001',
    vehicleName: 'Toyota Hilux',
    vehicleRegistration: 'KAA 123A',
    frequencyDays: 90,
    frequencyMileage: 10000,
    lastInspectionDate: '2025-10-15',
    lastInspectionOdometer: 45000,
    nextDueDate: '2026-01-15',
    nextDueMileage: 55000,
    assignedInspector: 'John Kamau',
    isActive: true,
    reminderDaysBefore: 7,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-10-15T00:00:00Z',
  },
  {
    id: 'SCH-002',
    vehicleId: 'VEH-002',
    vehicleName: 'Isuzu D-Max',
    vehicleRegistration: 'KBB 456B',
    frequencyDays: 90,
    frequencyMileage: 10000,
    lastInspectionDate: '2025-09-20',
    lastInspectionOdometer: 62000,
    nextDueDate: '2025-12-20',
    nextDueMileage: 72000,
    assignedInspector: 'Jane Wanjiru',
    isActive: true,
    reminderDaysBefore: 7,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-09-20T00:00:00Z',
  },
];

export const MOCK_INSPECTIONS: TyreInspection[] = [
  {
    id: 'INS-001',
    vehicleId: 'VEH-001',
    vehicleName: 'Toyota Hilux',
    vehicleRegistration: 'KAA 123A',
    inspectionDate: '2025-10-15',
    currentOdometer: 45000,
    inspectorName: 'John Kamau',
    status: 'completed',
    tyreInspections: [
      {
        tyreId: 'TYR-001',
        position: 'Front Left',
        treadDepth: { inner: 5.2, center: 5.5, outer: 5.0 },
        pressure: 32,
        recommendedPressure: 32,
        condition: 'good',
        damages: [],
        result: 'pass',
        recommendedAction: 'continue-use',
        urgency: 'next-service',
        photos: [],
        remainingTreadLife: 75,
      },
      {
        tyreId: 'TYR-002',
        position: 'Front Right',
        treadDepth: { inner: 5.0, center: 5.3, outer: 4.8 },
        pressure: 31,
        recommendedPressure: 32,
        condition: 'good',
        damages: [],
        result: 'pass',
        recommendedAction: 'continue-use',
        urgency: 'next-service',
        photos: [],
        remainingTreadLife: 72,
      },
      {
        tyreId: 'TYR-003',
        position: 'Rear Left',
        treadDepth: { inner: 3.5, center: 3.8, outer: 3.2 },
        pressure: 35,
        recommendedPressure: 35,
        condition: 'fair',
        damages: [
          {
            type: 'uneven-wear',
            severity: 'minor',
            description: 'Slight uneven wear on outer edge',
          },
        ],
        result: 'pass',
        recommendedAction: 'rotate',
        urgency: 'within-week',
        photos: [],
        remainingTreadLife: 45,
      },
      {
        tyreId: 'TYR-004',
        position: 'Rear Right',
        treadDepth: { inner: 3.8, center: 4.0, outer: 3.5 },
        pressure: 34,
        recommendedPressure: 35,
        condition: 'fair',
        damages: [],
        result: 'pass',
        recommendedAction: 'continue-use',
        urgency: 'next-service',
        photos: [],
        remainingTreadLife: 50,
      },
    ],
    overallNotes: 'Recommend rotation within next week to address uneven wear on rear left.',
    inspectorSignature: 'J. Kamau',
    createdAt: '2025-10-15T08:30:00Z',
    updatedAt: '2025-10-15T09:15:00Z',
    completedAt: '2025-10-15T09:15:00Z',
  },
  {
    id: 'INS-002',
    vehicleId: 'VEH-003',
    vehicleName: 'Nissan Patrol',
    vehicleRegistration: 'KCC 789C',
    inspectionDate: '2025-11-20',
    currentOdometer: 78500,
    inspectorName: 'Jane Wanjiru',
    status: 'completed',
    tyreInspections: [
      {
        tyreId: 'TYR-009',
        position: 'Front Left',
        treadDepth: { inner: 2.5, center: 2.8, outer: 2.3 },
        pressure: 30,
        recommendedPressure: 32,
        condition: 'poor',
        damages: [
          {
            type: 'cuts-punctures',
            severity: 'moderate',
            description: 'Small cut on sidewall, requires monitoring',
          },
          {
            type: 'uneven-wear',
            severity: 'severe',
            description: 'Significant uneven wear across tread',
          },
        ],
        result: 'fail',
        recommendedAction: 'replace',
        urgency: 'immediate',
        photos: ['photo1.jpg', 'photo2.jpg'],
        remainingTreadLife: 15,
      },
      {
        tyreId: 'TYR-010',
        position: 'Front Right',
        treadDepth: { inner: 4.5, center: 4.8, outer: 4.2 },
        pressure: 32,
        recommendedPressure: 32,
        condition: 'good',
        damages: [],
        result: 'pass',
        recommendedAction: 'continue-use',
        urgency: 'next-service',
        photos: [],
        remainingTreadLife: 65,
      },
      {
        tyreId: 'TYR-011',
        position: 'Rear Left',
        treadDepth: { inner: 4.2, center: 4.5, outer: 4.0 },
        pressure: 35,
        recommendedPressure: 35,
        condition: 'good',
        damages: [],
        result: 'pass',
        recommendedAction: 'continue-use',
        urgency: 'next-service',
        photos: [],
        remainingTreadLife: 60,
      },
      {
        tyreId: 'TYR-012',
        position: 'Rear Right',
        treadDepth: { inner: 4.3, center: 4.6, outer: 4.1 },
        pressure: 35,
        recommendedPressure: 35,
        condition: 'good',
        damages: [],
        result: 'pass',
        recommendedAction: 'continue-use',
        urgency: 'next-service',
        photos: [],
        remainingTreadLife: 62,
      },
    ],
    overallNotes: 'URGENT: Front left tyre requires immediate replacement. Sidewall damage and critically low tread depth.',
    inspectorSignature: 'J. Wanjiru',
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2025-11-20T10:45:00Z',
    completedAt: '2025-11-20T10:45:00Z',
  },
  {
    id: 'INS-003',
    vehicleId: 'VEH-002',
    vehicleName: 'Isuzu D-Max',
    vehicleRegistration: 'KBB 456B',
    inspectionDate: '2026-01-10',
    currentOdometer: 68000,
    inspectorName: 'Peter Omondi',
    status: 'scheduled',
    tyreInspections: [],
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z',
  },
];

export const TYRE_POSITIONS = [
  'Front Left',
  'Front Right',
  'Rear Left',
  'Rear Right',
  'Spare',
  'Rear Left Inner',
  'Rear Left Outer',
  'Rear Right Inner',
  'Rear Right Outer',
];
