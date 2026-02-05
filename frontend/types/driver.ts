export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

export interface TurnBoy {
  id: string;
  name: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}
