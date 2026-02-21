'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RouteTable } from './_components/RouteTable';
import { RouteCard } from './_components/RouteCard';
import { CreateRouteDrawer } from './_components/CreateRouteDrawer';
import { RouteDetailsDrawer } from './_components/RouteDetailsDrawer';
import { EditRouteDrawer } from './_components/EditRouteDrawer';
import { DeleteRouteDialog } from './_components/DeleteRouteDialog';
import { MOCK_ROUTES } from '@/constants/routes';
import type { Route, RouteFormData } from './_types';

export default function RoutesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredRoutes = MOCK_ROUTES.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.origin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.destination.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewRoute = (route: Route) => {
    setSelectedRoute(route);
    setShowDetailsDrawer(true);
  };

  const handleEditRoute = (route: Route) => {
    setShowDetailsDrawer(false);
    setSelectedRoute(route);
    setShowEditDrawer(true);
  };

  const handleDeleteRoute = (route: Route) => {
    setShowDetailsDrawer(false);
    setSelectedRoute(route);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = (route: Route) => {
    console.log('Deleting route:', route);
    // TODO: Integrate with backend API to delete
    setShowDeleteDialog(false);
    setSelectedRoute(null);
  };

  const handleSaveRoute = (routeData: RouteFormData) => {
    console.log('Route saved:', routeData);
    // TODO: Integrate with backend API
  };

  const handleUpdateRoute = (updatedRoute: Route) => {
    console.log('Route updated:', updatedRoute);
    // TODO: Integrate with backend API to update
    setShowEditDrawer(false);
    setSelectedRoute(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Routes</h1>
          <p className="text-muted-foreground">
            Manage and optimize your fleet routes.
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDrawer(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Route
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search routes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <RouteTable 
        routes={filteredRoutes} 
        onViewRoute={handleViewRoute}
        onEditRoute={handleEditRoute}
        onDeleteRoute={handleDeleteRoute}
      />
      
      <div className="md:hidden">
        {filteredRoutes.map((route) => (
          <RouteCard 
            key={route.id} 
            route={route} 
            onViewRoute={handleViewRoute}
            onEditRoute={handleEditRoute}
            onDeleteRoute={handleDeleteRoute}
          />
        ))}
      </div>

      <CreateRouteDrawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
        onSave={handleSaveRoute}
      />

      <RouteDetailsDrawer
        route={selectedRoute}
        open={showDetailsDrawer}
        onOpenChange={setShowDetailsDrawer}
        onEdit={handleEditRoute}
        onDelete={handleDeleteRoute}
      />

      <EditRouteDrawer
        route={selectedRoute}
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        onSave={handleUpdateRoute}
      />

      <DeleteRouteDialog
        route={selectedRoute}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
