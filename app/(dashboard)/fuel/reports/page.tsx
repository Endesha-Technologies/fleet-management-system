'use client';

import React, { useState } from 'react';
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Gauge,
  Calendar,
  Download,
  ArrowLeft,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MOCK_FUEL_LOGS, calculateFuelEfficiency, getFuelSummary, formatCurrency } from '@/constants/fuel';

export default function FuelReportsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Get summary statistics
  const summary = getFuelSummary(MOCK_FUEL_LOGS);
  
  // Get efficiency data per vehicle
  const efficiencyData = calculateFuelEfficiency(MOCK_FUEL_LOGS);
  
  // Sort by various metrics
  const topConsumers = [...efficiencyData]
    .sort((a, b) => b.totalFuelUsed - a.totalFuelUsed)
    .slice(0, 3);
  
  const leastEfficient = [...efficiencyData]
    .sort((a, b) => a.efficiency - b.efficiency)
    .slice(0, 3);
  
  const highestCost = [...efficiencyData]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 3);

  // Calculate monthly comparison (mock data - in production would compare with previous months)
  const previousMonthCost = summary.totalCost * 0.92; // Mock 8% increase
  const costChange = ((summary.totalCost - previousMonthCost) / previousMonthCost) * 100;
  
  const previousMonthEfficiency = summary.avgEfficiency * 1.05; // Mock 5% decrease
  const efficiencyChange = ((summary.avgEfficiency - previousMonthEfficiency) / previousMonthEfficiency) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/fuel">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fuel Reports & Analytics</h1>
            <p className="text-gray-500 mt-1">Comprehensive fuel consumption analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Fuel Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(summary.totalCost)}</div>
            <div className="flex items-center gap-1 mt-2">
              {costChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <span className={`text-sm font-medium ${costChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(costChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.avgEfficiency.toFixed(2)} km/L</div>
            <div className="flex items-center gap-1 mt-2">
              {efficiencyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${efficiencyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(efficiencyChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalDistance.toFixed(0)} km</div>
            <p className="text-sm text-gray-500 mt-2">
              Across {efficiencyData.length} vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Cost per KM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.costPerKm.toFixed(0)} UGX</div>
            <p className="text-sm text-gray-500 mt-2">
              Average operating cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Fuel Consumers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-gray-600" />
              Top Fuel Consumers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topConsumers.map((vehicle, index) => (
                <div key={vehicle.vehicleId} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{vehicle.vehiclePlate}</span>
                      <span className="font-semibold text-sm">{vehicle.totalFuelUsed.toFixed(1)}L</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(vehicle.totalFuelUsed / topConsumers[0].totalFuelUsed) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{formatCurrency(vehicle.totalCost)}</span>
                      <span className="text-xs text-gray-500">{vehicle.efficiency.toFixed(1)} km/L</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fuel Efficiency Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-gray-600" />
              Fuel Efficiency Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {efficiencyData
                .sort((a, b) => b.efficiency - a.efficiency)
                .map((vehicle, index) => (
                  <div key={vehicle.vehicleId} className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                        index === 0
                          ? 'bg-green-100 text-green-700'
                          : index === efficiencyData.length - 1
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{vehicle.vehiclePlate}</span>
                        <span className="font-semibold text-sm">{vehicle.efficiency.toFixed(2)} km/L</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {vehicle.totalDistance.toFixed(0)} km • {vehicle.totalFuelUsed.toFixed(0)}L
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              Highest Fuel Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highestCost.map((vehicle, index) => (
                <div key={vehicle.vehicleId} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{vehicle.vehiclePlate}</span>
                      <span className="font-semibold text-sm">{formatCurrency(vehicle.totalCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{vehicle.costPerKm.toFixed(0)} UGX/km</span>
                      <span>{vehicle.totalFuelUsed.toFixed(0)}L used</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-gray-600" />
              Performance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-400 pl-3 py-2">
                <div className="font-medium text-sm text-gray-900">Low Efficiency Alert</div>
                <div className="text-sm text-gray-600 mt-1">
                  {leastEfficient[0]?.vehiclePlate} averaging {leastEfficient[0]?.efficiency.toFixed(2)} km/L
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Recommend maintenance check
                </div>
              </div>

              <div className="border-l-4 border-red-400 pl-3 py-2">
                <div className="font-medium text-sm text-gray-900">High Cost per KM</div>
                <div className="text-sm text-gray-600 mt-1">
                  {highestCost[0]?.vehiclePlate} at {highestCost[0]?.costPerKm.toFixed(0)} UGX/km
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((highestCost[0]?.costPerKm - summary.costPerKm) / summary.costPerKm * 100).toFixed(0)}% above average
                </div>
              </div>

              <div className="border-l-4 border-yellow-400 pl-3 py-2">
                <div className="font-medium text-sm text-gray-900">Fuel Cost Increase</div>
                <div className="text-sm text-gray-600 mt-1">
                  Overall costs up {costChange.toFixed(1)}% this month
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Consider reviewing routes and fuel stations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Vehicle Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vehicle</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Distance (km)</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Fuel Used (L)</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Efficiency (km/L)</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Total Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Cost/km</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Rating</th>
                </tr>
              </thead>
              <tbody>
                {efficiencyData
                  .sort((a, b) => b.efficiency - a.efficiency)
                  .map((vehicle, index) => {
                    const efficiencyRating =
                      vehicle.efficiency >= summary.avgEfficiency * 1.1
                        ? 'Excellent'
                        : vehicle.efficiency >= summary.avgEfficiency
                        ? 'Good'
                        : vehicle.efficiency >= summary.avgEfficiency * 0.9
                        ? 'Average'
                        : 'Poor';

                    const ratingColor =
                      efficiencyRating === 'Excellent'
                        ? 'bg-green-100 text-green-800'
                        : efficiencyRating === 'Good'
                        ? 'bg-blue-100 text-blue-800'
                        : efficiencyRating === 'Average'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800';

                    return (
                      <tr key={vehicle.vehicleId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{vehicle.vehiclePlate}</td>
                        <td className="py-3 px-4 text-right">{vehicle.totalDistance.toFixed(0)}</td>
                        <td className="py-3 px-4 text-right">{vehicle.totalFuelUsed.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right font-semibold">{vehicle.efficiency.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(vehicle.totalCost)}</td>
                        <td className="py-3 px-4 text-right">{vehicle.costPerKm.toFixed(0)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${ratingColor}`}>
                            {efficiencyRating}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
