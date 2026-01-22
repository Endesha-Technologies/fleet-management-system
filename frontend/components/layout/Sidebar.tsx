'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants/navigation';
import { Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "hidden md:flex h-full flex-col bg-slate-900 text-white transition-all duration-300 shadow-xl",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "flex h-16 items-center border-b border-slate-800 px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && <span className="text-lg font-bold text-white truncate">Fleet Manager</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="border-t border-slate-800 p-2 space-y-2">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-slate-400 hover:bg-slate-800 hover:text-white",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Settings"}
        </Button>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-red-400 hover:bg-red-900/20 hover:text-red-300",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
