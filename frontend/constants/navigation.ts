import { 
  LayoutDashboard, 
  Map, 
  Truck, 
  Fuel,
  Package, 
  Wrench, 
  Disc 
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
    name: 'Asset Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    name: 'Truck ',
    href: '/trucks',
    icon: Truck,
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
];
