'use client';

// ---------------------------------------------------------------------------
// MaintenanceNav — Maintenance sidebar / mobile tab navigation
// ---------------------------------------------------------------------------
// Renders a vertical navigation list on desktop and a horizontal scrollable
// tab bar on mobile. Uses `usePathname()` to highlight the active item.
//
// On desktop, the parent layout wraps this in a white card.
// On mobile, the parent renders this in a horizontal scrollable area.
// ---------------------------------------------------------------------------

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarClock,
  ClipboardList,
  FileText,
  Bell,
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
  /** Exact match only — when true, only pathname === href counts as active */
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    description: 'Dashboard & quick stats',
    icon: LayoutDashboard,
    href: '/maintenance',
    exact: true,
  },
  {
    id: 'schedules',
    label: 'Schedules',
    shortLabel: 'Schedules',
    description: 'Recurring maintenance rules',
    icon: CalendarClock,
    href: '/maintenance/schedules',
  },
  {
    id: 'plans',
    label: 'Plans',
    shortLabel: 'Plans',
    description: 'Schedule → truck assignments',
    icon: ClipboardList,
    href: '/maintenance/plans',
  },
  {
    id: 'logs',
    label: 'Service Logs',
    shortLabel: 'Logs',
    description: 'Completed service entries',
    icon: FileText,
    href: '/maintenance/logs',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    shortLabel: 'Alerts',
    description: 'Overdue & upcoming maintenance',
    icon: Bell,
    href: '/maintenance/alerts',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MaintenanceNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <>
      {/* ─── Desktop sidebar list ────────────────────────────────── */}
      <nav aria-label="Maintenance navigation" className="hidden md:block">
        <div className="divide-y divide-gray-100">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

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
      <nav aria-label="Maintenance navigation" className="md:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

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
