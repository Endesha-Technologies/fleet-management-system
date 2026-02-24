import type { Metadata } from 'next';
import { SettingsNav } from './_components';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'System configuration and administration',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto  px-2 py-6 sm:px-4 lg:px-6">
        {/* Page header */}
        <header className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your system configuration, users, and permissions
          </p>
        </header>

        {/* Two-column layout: sidebar + content */}
        <div className="flex flex-col md:flex-row md:gap-6">
          {/* Sidebar navigation — wrapped in a card on desktop */}
          <div className="hidden md:block w-[260px] shrink-0">
            <div className="sticky top-6 rounded-lg bg-white p-3 shadow-sm">
              <SettingsNav />
            </div>
          </div>

          {/* Mobile navigation (horizontal tabs) */}
          <div className="md:hidden mb-4">
            <SettingsNav />
          </div>

          {/* Content area — wrapped in a card */}
          <main className="flex-1 min-w-0 rounded-lg bg-white p-4 sm:p-6 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
