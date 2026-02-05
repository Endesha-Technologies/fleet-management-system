import { Driver, TurnBoy } from '@/types/driver';

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'John Doe',
    phone: '+254 712 345 678',
    email: 'john.doe@fleet.com',
    licenseNumber: 'DL-001234',
    status: 'Active',
  },
  {
    id: 'd2',
    name: 'Jane Smith',
    phone: '+254 722 456 789',
    email: 'jane.smith@fleet.com',
    licenseNumber: 'DL-002345',
    status: 'Active',
  },
  {
    id: 'd3',
    name: 'Mike Johnson',
    phone: '+254 733 567 890',
    email: 'mike.johnson@fleet.com',
    licenseNumber: 'DL-003456',
    status: 'Active',
  },
  {
    id: 'd4',
    name: 'David Kamau',
    phone: '+254 744 678 901',
    email: 'david.kamau@fleet.com',
    licenseNumber: 'DL-004567',
    status: 'Active',
  },
  {
    id: 'd5',
    name: 'Sarah Mwangi',
    phone: '+254 755 789 012',
    email: 'sarah.mwangi@fleet.com',
    licenseNumber: 'DL-005678',
    status: 'Active',
  },
  {
    id: 'd6',
    name: 'Peter Omondi',
    phone: '+254 766 890 123',
    email: 'peter.omondi@fleet.com',
    licenseNumber: 'DL-006789',
    status: 'On Leave',
  },
];

export const MOCK_TURN_BOYS: TurnBoy[] = [
  {
    id: 'tb1',
    name: 'James Okoth',
    phone: '+256 772 111 222',
    status: 'Active',
  },
  {
    id: 'tb2',
    name: 'Samuel Wanjiku',
    phone: '+256 772 222 333',
    status: 'Active',
  },
  {
    id: 'tb3',
    name: 'Brian Otieno',
    phone: '+256 772 333 444',
    status: 'Active',
  },
  {
    id: 'tb4',
    name: 'Charles Mutua',
    phone: '+256 772 444 555',
    status: 'Active',
  },
  {
    id: 'tb5',
    name: 'Dennis Kiprop',
    phone: '+256 772 555 666',
    status: 'On Leave',
  },
];
