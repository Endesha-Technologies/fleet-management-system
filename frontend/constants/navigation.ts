import { 
  LayoutDashboard, 
  Users, 
  Map, 
  Truck, 
  Fuel,
  Package, 
  Wrench, 
  Disc,
  Settings
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Routes',
    href: '/routes',
    icon: Map,
  },
  {
    name: 'Trips',
    href: '/trips',
    icon: Truck,
  },
  {
    name: 'Fuel',
    href: '/fuel',
    icon: Fuel,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    name: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
  },
  {
    name: 'Tyres',
    href: '/tyres',
    icon: Disc,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
