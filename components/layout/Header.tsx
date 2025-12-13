import React from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-white px-6 shadow-md">
      <div className="flex items-center gap-4 md:hidden">
        <span className="text-lg font-bold text-[#020887]">Fleet Manager</span>
      </div>
      
      <div className="hidden md:flex items-center gap-4 flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome back, <span className="text-[#020887]">Admin User</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Desktop User Info */}
        <div className="hidden md:flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src="/avatars/01.png" alt="@admin" />
            <AvatarFallback className="bg-[#020887]/10 text-[#020887]">AD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900">Admin User</span>
            <span className="text-xs text-gray-500">admin@fleet.com</span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        
        {/* Mobile User Dropdown */}
        <div className="md:hidden">
          <DropdownMenu modal={true}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="@admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end">
              <DropdownMenuLabel className="font-normal p-0 mb-2">
                <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src="/avatars/01.png" alt="@admin" />
                    <AvatarFallback className="bg-[#020887]/10 text-[#020887]">AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-semibold text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">admin@fleet.com</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem className="cursor-pointer py-2.5">
                <User className="mr-2 h-4 w-4 text-gray-500" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2.5">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem className="cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
