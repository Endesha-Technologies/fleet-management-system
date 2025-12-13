import React from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Active Trips</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Vehicles in Maintenance</h3>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Low Stock Items</h3>
          <p className="text-2xl font-bold">5</p>
        </div>
      </div>
    </div>
  );
}
