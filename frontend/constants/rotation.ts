export const ROTATION_PATTERNS = [
  {
    value: 'cross',
    label: 'Cross Pattern',
    description: 'Front-left ↔ Rear-right, Front-right ↔ Rear-left',
    icon: '✕',
  },
  {
    value: 'front-to-back',
    label: 'Front to Back',
    description: 'Front-left → Rear-left, Front-right → Rear-right',
    icon: '↓',
  },
  {
    value: 'side-to-side',
    label: 'Side to Side',
    description: 'Left ↔ Right (keep front/rear)',
    icon: '↔',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Manual position selection',
    icon: '⊙',
  },
] as const;

export const TYRE_POSITIONS = [
  { value: 'front-left', label: 'Front Left', shortCode: 'FL' },
  { value: 'front-right', label: 'Front Right', shortCode: 'FR' },
  { value: 'rear-left', label: 'Rear Left', shortCode: 'RL' },
  { value: 'rear-right', label: 'Rear Right', shortCode: 'RR' },
  { value: 'spare', label: 'Spare', shortCode: 'SP' },
] as const;

export const DEFAULT_ROTATION_INTERVAL_DAYS = 180; // 6 months
export const DEFAULT_ROTATION_INTERVAL_KM = 10000; // 10,000 km

export const TREAD_DEPTH_THRESHOLDS = {
  CRITICAL: 1.6, // Minimum legal limit (mm)
  WARNING: 3.0, // Recommend rotation
  GOOD: 4.0, // Acceptable
  EXCELLENT: 6.0, // New tyre range
} as const;

export const ROTATION_STATUSES = [
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
] as const;

export const WEAR_VARIATION_LIMITS = {
  ACCEPTABLE: 1.5, // mm acceptable variation
  POOR: 3.0, // mm poor variation - indicates uneven wear
} as const;
