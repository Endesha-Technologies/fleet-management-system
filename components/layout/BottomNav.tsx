'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants/navigation';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block bg-white pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
      <ul className="flex h-16 items-center justify-between px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="flex-1 min-w-0">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-[#020887]"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="w-full truncate text-center px-0.5">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
