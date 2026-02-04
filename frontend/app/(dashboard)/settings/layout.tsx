'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Lock, UserCheck } from 'lucide-react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      href: '/settings/users',
    },
    {
      id: 'roles',
      label: 'Roles & Permissions',
      icon: Lock,
      href: '/settings/roles',
    },
    {
      id: 'drivers',
      label: 'Drivers & Turn Boys',
      icon: UserCheck,
      href: '/settings/drivers',
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage users, roles, permissions, and drivers
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-22 z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Content - Full width with sheet overlay */}
      <div className="max-w-full mx-auto">
        {children}
      </div>
    </div>
  );
}
