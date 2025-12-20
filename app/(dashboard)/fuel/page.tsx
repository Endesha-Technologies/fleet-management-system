'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_FUEL_LOGS, MOCK_FUEL_ALERTS, getFuelSummary, calculateFuelEfficiency } from '@/constants/fuel';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Droplets,
  Gauge,
  Settings,
  Download,
} from 'lucide-react';

export default function FuelPage() {
  const summary = getFuelSummary(MOCK_FUEL_LOGS);
  const efficiency = calculateFuelEfficiency(MOCK_FUEL_LOGS);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  // Calculate additional metrics
  const monthlyBudget = 10000000; // 10M UGX
  const budgetUsed = (summary.totalCost / monthlyBudget) * 100;
  const previousMonthCost = 5500000; // Mock data
  const costChange = ((summary.totalCost - previousMonthCost) / previousMonthCost) * 100;
  
  // Recent logs (last 5)
  const recentLogs = MOCK_FUEL_LOGS.slice(0, 5);
  
  // Top consumers
  const topConsumers = efficiency
    .sort((a, b) => b.totalFuelUsed - a.totalFuelUsed)
    .slice(0, 3);

  // Anomalies detection
  const anomalies = MOCK_FUEL_LOGS.filter(log => {
    const avgPrice = summary.avgPricePerLiter;
    const priceDiff = Math.abs(log.pricePerLiter - avgPrice);
    return priceDiff > avgPrice * 0.15; // 15% deviation
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fuel Management</h1>
              <p className="text-gray-600 mt-1">Monitor, track, and optimize fuel consumption across your fleet</p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-3 mt-6">
            <Link href="/fuel/create">
              <Button className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Log Fuel
              </Button>
            </Link>
            <Link href="/fuel/reports">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link href="/fuel/export">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </Link>
            <Link href="/fuel/settings">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-4 mt-6">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            <div className="flex gap-2">
              {['7days', '30days', '90days', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period === '7days' && 'Last 7 Days'}
                  {period === '30days' && 'Last 30 Days'}
                  {period === '90days' && 'Last 90 Days'}
                  {period === 'year' && 'This Year'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Cost */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fuel Cost</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  UGX {summary.totalCost.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {costChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`text-sm font-medium ${costChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(costChange).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Fuel Consumed */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fuel Consumed</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {summary.totalLiters.toLocaleString()} L
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Across {summary.totalRefuels} refuels
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Droplets className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Average Efficiency */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Avg Efficiency</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {summary.avgEfficiency.toFixed(1)} km/L
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Target: 5.5 km/L
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Gauge className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Budget Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Monthly Budget</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {budgetUsed.toFixed(0)}%
                </p>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    UGX {(monthlyBudget - summary.totalCost).toLocaleString()} remaining
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerts Section */}
            {MOCK_FUEL_ALERTS.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">Active Alerts ({MOCK_FUEL_ALERTS.length})</h3>
                    <div className="space-y-2">
                      {MOCK_FUEL_ALERTS.map((alert) => (
                        <div key={alert.id} className="flex items-start justify-between bg-white rounded p-3">
                          <div>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <p className="text-sm font-medium text-gray-900 mt-1">{alert.vehiclePlate}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Insights */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Cost per Liter</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    UGX {summary.avgPricePerLiter.toFixed(0)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Cost per Kilometer</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    UGX {summary.costPerKm.toFixed(0)}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Distance</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {summary.totalDistance.toLocaleString()} km
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Price Anomalies</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{anomalies}</p>
                  <p className="text-xs text-gray-500 mt-1">Transactions flagged</p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <Link href="/fuel" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-600">Vehicle</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-600">Station</th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-gray-600">Liters</th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-gray-600">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm text-gray-900">
                          {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-2 text-sm font-medium text-gray-900">{log.vehiclePlate}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{log.fuelStation}</td>
                        <td className="py-3 px-2 text-sm text-right text-gray-900">{log.litersPurchased.toFixed(1)} L</td>
                        <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                          {log.totalCost.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Rankings */}
          <div className="space-y-6">
            {/* Top Consumers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Fuel Consumers</h2>
              <div className="space-y-4">
                {topConsumers.map((vehicle, index) => (
                  <div key={vehicle.vehicleId} className="flex items-start gap-3">
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{vehicle.vehiclePlate}</p>
                      <p className="text-sm text-gray-600">{vehicle.totalFuelUsed.toFixed(1)} L used</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {vehicle.efficiency.toFixed(1)} km/L • UGX {vehicle.totalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Efficient Vehicles</p>
                    <p className="text-xs text-green-700">Above 5 km/L</p>
                  </div>
                  <span className="text-2xl font-bold text-green-900">
                    {efficiency.filter(v => v.efficiency >= 5).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-orange-900">Needs Attention</p>
                    <p className="text-xs text-orange-700">Below 4 km/L</p>
                  </div>
                  <span className="text-2xl font-bold text-orange-900">
                    {efficiency.filter(v => v.efficiency < 4).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Active Vehicles</p>
                    <p className="text-xs text-blue-700">Tracked this period</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-900">
                    {efficiency.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
