import React from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Slot - Rendered on Desktop via CSS in Sidebar component */}
      {sidebar}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Bottom Navigation - Rendered on Mobile via CSS in BottomNav component */}
        <BottomNav />
      </div>
    </div>
  );
}
