'use client';

// ---------------------------------------------------------------------------
// SettingsNav — Settings sidebar / mobile tab navigation
// ---------------------------------------------------------------------------
// Renders a vertical navigation list on desktop and a horizontal scrollable
// tab bar on mobile. Uses `usePathname()` to highlight the active item.
// Disabled items are shown as grayed-out with a "Soon" badge.
//
// On desktop, the parent layout wraps this in a white card.
// On mobile, the parent renders this in a horizontal scrollable area.
// ---------------------------------------------------------------------------

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Shield,
  Truck,
  Fuel,
  Bell,
  Settings2,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Navigation definitions
// ---------------------------------------------------------------------------

interface NavItem {
  id: string;
  label: string;
  shortLabel: string; // Compact label for mobile tabs
  description: string;
  icon: LucideIcon;
  href: string;
  enabled: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'users',
    label: 'Users & Access',
    shortLabel: 'Users',
    description: 'Manage users, drivers, and turn boys',
    icon: Users,
    href: '/settings/users',
    enabled: true,
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    shortLabel: 'Roles',
    description: 'Configure roles and access control',
    icon: Shield,
    href: '/settings/roles',
    enabled: true,
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    shortLabel: 'Suppliers',
    description: 'Manage parts and asset suppliers',
    icon: Building2,
    href: '/settings/suppliers',
    enabled: true,
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SettingsNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* ─── Desktop sidebar list ────────────────────────────────── */}
      <nav aria-label="Settings navigation" className="hidden md:block">
        <div className="divide-y divide-gray-100">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.enabled && isActive(item.href);

            if (!item.enabled) {
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px]">{item.label}</span>
                      <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                        Soon
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0',
                    active ? 'text-primary' : 'text-gray-400',
                  )}
                />
                <div className="flex-1 min-w-0">
                  <span className="truncate block text-[13px]">{item.label}</span>
                  <span
                    className={cn(
                      'text-[11px] truncate block leading-tight',
                      active ? 'text-primary/70' : 'text-gray-400',
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─── Mobile horizontal tab bar ───────────────────────────── */}
      <nav aria-label="Settings navigation" className="md:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.enabled && isActive(item.href);

            if (!item.enabled) {
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-gray-300 cursor-not-allowed whitespace-nowrap"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.shortLabel}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap',
                  active
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.shortLabel}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
