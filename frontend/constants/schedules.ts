import type { MaintenanceSchedule } from '@/types/maintenance';

// Mock data for maintenance schedules
export const mockMaintenanceSchedules: MaintenanceSchedule[] = [
  {
    id: 'SCH001',
    vehicleId: 'VEH001',
    vehiclePlate: 'UBJ 234A',
    vehicleModel: 'Toyota Hiace',
    serviceName: 'Oil Change & Filter Replacement',
    serviceCategory: 'fluids',
    description: 'Regular engine oil change and oil filter replacement',
    triggerType: 'combined',
    
    // Time-based
    frequencyUnit: 'months',
    frequencyValue: 3,
    startDate: '2025-01-15',
    nextDueDate: '2026-01-20',
    
    // Mileage-based
    mileageInterval: 5000,
    startingOdometer: 45000,
    nextDueMileage: 50000,
    currentOdometer: 48500,
    
    // Assignment
    defaultTechnicianName: 'John Kamau',
    workshopLocation: 'Bay 1',
    estimatedDuration: 1.5,
    preferredTimeSlot: 'Morning',
    
    // Costs
    estimatedPartsCost: 85000,
    estimatedLaborHours: 1.5,
    estimatedTotalCost: 120000,
    
    // Alerts
    advanceNotificationDays: 7,
    advanceNotificationKm: 500,
    notifyFleetManager: true,
    notifyDriver: true,
    notifySupervisor: false,
    
    // Settings
    priority: 'medium',
    allowDeferment: true,
    maxDeferrals: 2,
    autoCreateWorkOrder: true,
    gracePeriodDays: 7,
    
    // Status
    status: 'scheduled',
    lastServiceDate: '2025-10-15',
    lastServiceOdometer: 45000,
    completedCount: 12,
    deferredCount: 0,
    
    // Metadata
    createdBy: 'Fleet Manager',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-10-15T14:30:00Z',
    isActive: true,
  },
  {
    id: 'SCH002',
    vehicleId: 'VEH002',
    vehiclePlate: 'UAM 567B',
    vehicleModel: 'Nissan Urvan',
    serviceName: 'Brake System Inspection',
    serviceCategory: 'brakes',
    description: 'Complete brake system inspection including pads, rotors, and fluid',
    triggerType: 'time',
    
    // Time-based
    frequencyUnit: 'months',
    frequencyValue: 6,
    startDate: '2025-03-01',
    nextDueDate: '2026-01-05',
    
    // Assignment
    defaultTechnicianName: 'Peter Ochieng',
    workshopLocation: 'Bay 2',
    estimatedDuration: 2,
    
    // Costs
    estimatedPartsCost: 150000,
    estimatedLaborHours: 2,
    estimatedTotalCost: 200000,
    
    // Alerts
    advanceNotificationDays: 14,
    notifyFleetManager: true,
    notifyDriver: false,
    notifySupervisor: true,
    
    // Settings
    priority: 'high',
    allowDeferment: false,
    autoCreateWorkOrder: true,
    gracePeriodDays: 3,
    
    // Status
    status: 'overdue',
    lastServiceDate: '2025-07-01',
    completedCount: 8,
    deferredCount: 0,
    
    // Metadata
    createdBy: 'Fleet Manager',
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2025-07-01T16:00:00Z',
    isActive: true,
  },
  {
    id: 'SCH003',
    vehicleId: 'VEH003',
    vehiclePlate: 'UBA 890C',
    vehicleModel: 'Isuzu D-Max',
    serviceName: 'Tire Rotation & Alignment',
    serviceCategory: 'tyres',
    description: 'Rotate all tires and perform wheel alignment',
    triggerType: 'mileage',
    
    // Mileage-based
    mileageInterval: 10000,
    startingOdometer: 20000,
    nextDueMileage: 40000,
    currentOdometer: 35800,
    
    // Assignment
    defaultTechnicianName: 'David Mutua',
    workshopLocation: 'Bay 3',
    estimatedDuration: 1,
    
    // Costs
    estimatedPartsCost: 0,
    estimatedLaborHours: 1,
    estimatedTotalCost: 50000,
    
    // Alerts
    advanceNotificationKm: 1000,
    notifyFleetManager: true,
    notifyDriver: true,
    notifySupervisor: false,
    
    // Settings
    priority: 'low',
    allowDeferment: true,
    maxDeferrals: 3,
    autoCreateWorkOrder: false,
    gracePeriodDays: 14,
    
    // Status
    status: 'scheduled',
    lastServiceDate: '2025-09-10',
    lastServiceOdometer: 30000,
    completedCount: 2,
    deferredCount: 1,
    
    // Metadata
    createdBy: 'Fleet Manager',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2025-09-10T12:00:00Z',
    isActive: true,
  },
  {
    id: 'SCH004',
    vehicleId: 'VEH004',
    vehiclePlate: 'UBD 123D',
    vehicleModel: 'Mitsubishi Canter',
    serviceName: 'Engine Tune-Up',
    serviceCategory: 'engine',
    description: 'Complete engine tune-up including spark plugs, filters, and timing check',
    triggerType: 'combined',
    
    // Time-based
    frequencyUnit: 'months',
    frequencyValue: 12,
    startDate: '2025-02-01',
    nextDueDate: '2026-02-01',
    
    // Mileage-based
    mileageInterval: 20000,
    startingOdometer: 60000,
    nextDueMileage: 80000,
    currentOdometer: 72000,
    
    // Assignment
    defaultTechnicianName: 'John Kamau',
    workshopLocation: 'Bay 1',
    estimatedDuration: 3,
    
    // Costs
    estimatedPartsCost: 250000,
    estimatedLaborHours: 3,
    estimatedTotalCost: 400000,
    
    // Alerts
    advanceNotificationDays: 14,
    advanceNotificationKm: 2000,
    notifyFleetManager: true,
    notifyDriver: false,
    notifySupervisor: true,
    
    // Settings
    priority: 'medium',
    allowDeferment: false,
    autoCreateWorkOrder: true,
    gracePeriodDays: 5,
    
    // Status
    status: 'scheduled',
    lastServiceDate: '2025-02-01',
    lastServiceOdometer: 60000,
    completedCount: 3,
    deferredCount: 0,
    
    // Metadata
    createdBy: 'Fleet Manager',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2025-02-01T15:00:00Z',
    isActive: true,
  },
  {
    id: 'SCH005',
    vehicleId: 'VEH005',
    vehiclePlate: 'UAB 456E',
    vehicleModel: 'Toyota Coaster',
    serviceName: 'HVAC System Service',
    serviceCategory: 'hvac',
    description: 'Air conditioning system service and refrigerant recharge',
    triggerType: 'time',
    
    // Time-based
    frequencyUnit: 'months',
    frequencyValue: 6,
    startDate: '2025-06-01',
    nextDueDate: '2026-01-12',
    
    // Assignment
    defaultTechnicianName: 'Peter Ochieng',
    workshopLocation: 'Bay 2',
    estimatedDuration: 2,
    
    // Costs
    estimatedPartsCost: 120000,
    estimatedLaborHours: 2,
    estimatedTotalCost: 180000,
    
    // Alerts
    advanceNotificationDays: 7,
    notifyFleetManager: true,
    notifyDriver: true,
    notifySupervisor: false,
    
    // Settings
    priority: 'low',
    allowDeferment: true,
    maxDeferrals: 2,
    autoCreateWorkOrder: false,
    gracePeriodDays: 14,
    
    // Status
    status: 'scheduled',
    lastServiceDate: '2025-06-15',
    completedCount: 5,
    deferredCount: 1,
    
    // Metadata
    createdBy: 'Fleet Manager',
    createdAt: '2024-06-01T11:00:00Z',
    updatedAt: '2025-06-15T13:00:00Z',
    isActive: true,
  },
  {
    id: 'SCH006',
    vehicleId: 'VEH001',
    vehiclePlate: 'UBJ 234A',
    vehicleModel: 'Toyota Hiace',
    serviceName: 'Annual Safety Inspection',
    serviceCategory: 'inspection',
    description: 'Comprehensive annual safety inspection as per regulations',
    triggerType: 'time',
    
    // Time-based
    frequencyUnit: 'years',
    frequencyValue: 1,
    startDate: '2025-01-01',
    nextDueDate: '2026-01-15',
    
    // Assignment
    defaultTechnicianName: 'David Mutua',
    workshopLocation: 'Inspection Bay',
    estimatedDuration: 2,
    
    // Costs
    estimatedPartsCost: 50000,
    estimatedLaborHours: 2,
    estimatedTotalCost: 150000,
    
    // Alerts
    advanceNotificationDays: 30,
    notifyFleetManager: true,
    notifyDriver: false,
    notifySupervisor: true,
    
    // Settings
    priority: 'critical',
    allowDeferment: false,
    autoCreateWorkOrder: true,
    gracePeriodDays: 0,
    
    // Status
    status: 'scheduled',
    lastServiceDate: '2025-01-10',
    completedCount: 1,
    deferredCount: 0,
    
    // Metadata
    createdBy: 'Fleet Manager',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
    isActive: true,
  },
];

export const serviceCategories = [
  { value: 'engine', label: 'Engine Service' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'body-paint', label: 'Body/Paint' },
  { value: 'tyres', label: 'Tyres' },
  { value: 'fluids', label: 'Fluids' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'other', label: 'Other' },
];

export const frequencyUnits = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

export const timeSlots = [
  { value: 'morning', label: 'Morning (8AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
  { value: 'anytime', label: 'Anytime' },
];
