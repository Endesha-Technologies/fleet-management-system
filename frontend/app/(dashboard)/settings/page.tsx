import Link from 'next/link';
import {
  Users,
  Shield,
  Truck,
  Fuel,
  Bell,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

interface CategoryDef {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  enabled: boolean;
  iconBg: string; // Tailwind bg class for the icon circle
  iconColor: string; // Tailwind text class for the icon
}

const categories: CategoryDef[] = [
  {
    id: 'users',
    title: 'Users & Access',
    description: 'Manage system users, drivers, and turn boys',
    icon: Users,
    href: '/settings/users',
    enabled: true,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'roles',
    title: 'Roles & Permissions',
    description: 'Configure roles and access control',
    icon: Shield,
    href: '/settings/roles',
    enabled: true,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: 'vehicle-categories',
    title: 'Vehicle Categories',
    description: 'Manage truck types and categories',
    icon: Truck,
    href: '/settings/vehicle-categories',
    enabled: false,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'fuel',
    title: 'Fuel Configuration',
    description: 'Set up fuel types and pricing',
    icon: Fuel,
    href: '/settings/fuel',
    enabled: false,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure alerts and notification preferences',
    icon: Bell,
    href: '/settings/notifications',
    enabled: false,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'system',
    title: 'System',
    description: 'General system preferences and configuration',
    icon: Settings2,
    href: '/settings/system',
    enabled: false,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Settings
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage your system configuration, users, and permissions
          </p>
        </header>

        {/* Category grid */}
        <section
          aria-label="Settings categories"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;

            if (!cat.enabled) {
              return (
                <Card
                  key={cat.id}
                  className="relative flex flex-col gap-4 p-6 opacity-60 cursor-not-allowed border border-gray-200 shadow-sm"
                >
                  {/* Coming Soon badge */}
                  <span className="absolute right-4 top-4 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    Coming Soon
                  </span>

                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${cat.iconBg}`}
                  >
                    <Icon className={`h-6 w-6 ${cat.iconColor}`} />
                  </div>

                  {/* Text */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {cat.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>
                </Card>
              );
            }

            return (
              <Link key={cat.id} href={cat.href} className="group">
                <Card className="relative flex h-full flex-col gap-4 border border-gray-200 p-6 shadow-sm transition-all duration-200 group-hover:border-primary/20 group-hover:shadow-md">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${cat.iconBg}`}
                  >
                    <Icon className={`h-6 w-6 ${cat.iconColor}`} />
                  </div>

                  {/* Text */}
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {cat.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
