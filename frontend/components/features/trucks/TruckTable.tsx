'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Truck } from '@/types/truck';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Truck as TruckIcon,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import { Select } from "@/components/ui/select"

interface TruckTableProps {
  trucks: Truck[];
  onView?: (truck: Truck) => void;
  onEdit?: (truck: Truck) => void;
}

export function TruckTable({ trucks, onView, onEdit }: TruckTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [makeFilter, setMakeFilter] = useState('all');

  // Extract unique makes for filter
  const uniqueMakes = useMemo(() => {
    const makes = new Set(trucks.map(t => t.make));
    return Array.from(makes).sort();
  }, [trucks]);

  const filteredTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      const matchesSearch =
        searchQuery === '' ||
        truck.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        truck.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        truck.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (truck.driver?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === 'all' || truck.status === statusFilter;
      const matchesMake = makeFilter === 'all' || truck.make === makeFilter;

      return matchesSearch && matchesStatus && matchesMake;
    });
  }, [trucks, searchQuery, statusFilter, makeFilter]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    makeFilter !== 'all' ||
    searchQuery !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMakeFilter('all');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Active</Badge>;
      case 'Maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Maintenance</Badge>;
      case 'Inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex-1 relative w-full">
           <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
           <Input
            placeholder="Search trucks, drivers, plates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
           />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           <div className="w-full sm:w-48">
              <Select
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Makes' },
                  ...uniqueMakes.map(make => ({ value: make, label: make }))
                ]}
                className="bg-white border-gray-200"
              />
           </div>
           
           <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Maintenance', label: 'Maintenance' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
                className="bg-white border-gray-200"
              />
           </div>

           {hasActiveFilters && (
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
               <X className="h-4 w-4 mr-2" />
               Clear
             </Button>
           )}
        </div>
      </div>


      {/* Table */}
      <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-gray-50/50 border-gray-200">
              <TableHead className="font-semibold text-gray-900">Plate Number</TableHead>
              <TableHead className="font-semibold text-gray-900">Make / Model</TableHead>
              <TableHead className="font-semibold text-gray-900">Driver</TableHead>
              <TableHead className="text-center font-semibold text-gray-900">Odometer</TableHead>
              <TableHead className="text-center font-semibold text-gray-900">Status</TableHead>
              <TableHead className="text-center font-semibold text-gray-900">Alerts</TableHead>
              <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrucks.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                    No trucks found matching your filters.
                 </TableCell>
               </TableRow>
            ) : filteredTrucks.map((truck) => (
              <TableRow key={truck.id} className="hover:bg-gray-50/50 border-gray-100">
                <TableCell className="font-medium">
                   <div className="flex flex-col">
                      <Link href={`/trucks/${truck.id}`} className="text-blue-600 hover:underline hover:text-blue-800 font-semibold">
                         {truck.plateNumber}
                      </Link>
                      <span className="text-xs text-gray-500">{truck.axleConfig}</span>
                   </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700 font-medium">{truck.make}</span>
                  <span className="text-gray-500 ml-1">{truck.model}</span>
                  <div className="text-xs text-gray-400">{truck.year}</div>
                </TableCell>
                <TableCell>
                  {truck.driver ? (
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {truck.driver.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700">{truck.driver.name}</span>
                     </div>
                  ) : (
                    <span className="text-gray-400 text-sm italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-gray-600">
                  {truck.currentOdometer.toLocaleString()} km
                </TableCell>
                <TableCell className="text-center">
                    {getStatusBadge(truck.status)}
                </TableCell>
                <TableCell className="text-center">
                   {truck.alerts > 0 ? (
                      <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 gap-1 pl-1.5">
                         <AlertCircle className="w-3 h-3" />
                         {truck.alerts}
                      </Badge>
                   ) : (
                      <span className="text-gray-300">-</span>
                   )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onView?.(truck)}>
                        <Eye className="mr-2 h-4 w-4 text-blue-600" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit?.(truck)}>
                        <Edit className="mr-2 h-4 w-4 text-gray-600" />
                        <span>Edit Truck</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <RefreshCw className="mr-2 h-4 w-4 text-orange-600" />
                        <span>Rotate Tyres</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-gray-500 text-center">
         Showing {filteredTrucks.length} of {trucks.length} trucks
      </div>
    </div>
  );
}
