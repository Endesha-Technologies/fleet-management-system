'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Bell, DollarSign, Gauge, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FuelSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    // Budget Settings
    monthlyBudget: '10000000',
    budgetWarningThreshold: '80',
    budgetCriticalThreshold: '95',

    // Efficiency Targets
    fleetEfficiencyTarget: '5.5',
    lowEfficiencyThreshold: '4.0',
    highConsumptionThreshold: '15',

    // Price Alerts
    priceAnomalyThreshold: '15',
    maxPricePerLiter: '6000',
    enablePriceAlerts: true,

    // Refuel Alerts
    lowFuelThreshold: '25',
    enableLowFuelAlerts: true,

    // Notifications
    emailAlerts: true,
    smsAlerts: false,
    alertEmail: 'manager@endeasha.com',
    alertPhone: '+256700000000',

    // Data Retention
    dataRetentionDays: '365',
    autoArchive: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving fuel settings:', settings);
    alert('Settings saved successfully!');
    router.push('/fuel');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/fuel')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Fuel Management Settings</h1>
                <p className="text-gray-600 mt-1">Configure budgets, targets, and alerts</p>
              </div>
            </div>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Budget Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="monthlyBudget">Monthly Budget (UGX)</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => handleChange('monthlyBudget', e.target.value)}
                  placeholder="10000000"
                />
                <p className="text-xs text-gray-500 mt-1">Total fuel budget per month</p>
              </div>
              <div>
                <Label htmlFor="budgetWarningThreshold">Warning Threshold (%)</Label>
                <Input
                  id="budgetWarningThreshold"
                  type="number"
                  value={settings.budgetWarningThreshold}
                  onChange={(e) => handleChange('budgetWarningThreshold', e.target.value)}
                  placeholder="80"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when budget usage exceeds this</p>
              </div>
              <div>
                <Label htmlFor="budgetCriticalThreshold">Critical Threshold (%)</Label>
                <Input
                  id="budgetCriticalThreshold"
                  type="number"
                  value={settings.budgetCriticalThreshold}
                  onChange={(e) => handleChange('budgetCriticalThreshold', e.target.value)}
                  placeholder="95"
                />
                <p className="text-xs text-gray-500 mt-1">Critical alert threshold</p>
              </div>
            </div>
          </div>

          {/* Efficiency Targets */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Efficiency Targets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fleetEfficiencyTarget">Fleet Target (km/L)</Label>
                <Input
                  id="fleetEfficiencyTarget"
                  type="number"
                  step="0.1"
                  value={settings.fleetEfficiencyTarget}
                  onChange={(e) => handleChange('fleetEfficiencyTarget', e.target.value)}
                  placeholder="5.5"
                />
                <p className="text-xs text-gray-500 mt-1">Target efficiency for the fleet</p>
              </div>
              <div>
                <Label htmlFor="lowEfficiencyThreshold">Low Efficiency Alert (km/L)</Label>
                <Input
                  id="lowEfficiencyThreshold"
                  type="number"
                  step="0.1"
                  value={settings.lowEfficiencyThreshold}
                  onChange={(e) => handleChange('lowEfficiencyThreshold', e.target.value)}
                  placeholder="4.0"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when vehicle drops below this</p>
              </div>
              <div>
                <Label htmlFor="highConsumptionThreshold">High Consumption Alert (%)</Label>
                <Input
                  id="highConsumptionThreshold"
                  type="number"
                  value={settings.highConsumptionThreshold}
                  onChange={(e) => handleChange('highConsumptionThreshold', e.target.value)}
                  placeholder="15"
                />
                <p className="text-xs text-gray-500 mt-1">% increase vs previous period</p>
              </div>
            </div>
          </div>

          {/* Price Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Price Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="priceAnomalyThreshold">Price Anomaly Threshold (%)</Label>
                <Input
                  id="priceAnomalyThreshold"
                  type="number"
                  value={settings.priceAnomalyThreshold}
                  onChange={(e) => handleChange('priceAnomalyThreshold', e.target.value)}
                  placeholder="15"
                />
                <p className="text-xs text-gray-500 mt-1">Deviation from average price</p>
              </div>
              <div>
                <Label htmlFor="maxPricePerLiter">Maximum Price per Liter (UGX)</Label>
                <Input
                  id="maxPricePerLiter"
                  type="number"
                  value={settings.maxPricePerLiter}
                  onChange={(e) => handleChange('maxPricePerLiter', e.target.value)}
                  placeholder="6000"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when price exceeds this</p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enablePriceAlerts}
                    onChange={(e) => handleChange('enablePriceAlerts', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">Enable price alerts</span>
                </label>
              </div>
            </div>
          </div>

          {/* Refuel Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Refuel Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="lowFuelThreshold">Low Fuel Threshold (Liters)</Label>
                <Input
                  id="lowFuelThreshold"
                  type="number"
                  value={settings.lowFuelThreshold}
                  onChange={(e) => handleChange('lowFuelThreshold', e.target.value)}
                  placeholder="25"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when fuel level drops below</p>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableLowFuelAlerts}
                    onChange={(e) => handleChange('enableLowFuelAlerts', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">Enable low fuel alerts</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Alerts</p>
                  <p className="text-sm text-gray-600">Receive alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {settings.emailAlerts && (
                <div>
                  <Label htmlFor="alertEmail">Alert Email</Label>
                  <Input
                    id="alertEmail"
                    type="email"
                    value={settings.alertEmail}
                    onChange={(e) => handleChange('alertEmail', e.target.value)}
                    placeholder="manager@endeasha.com"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Alerts</p>
                  <p className="text-sm text-gray-600">Receive alerts via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsAlerts}
                    onChange={(e) => handleChange('smsAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {settings.smsAlerts && (
                <div>
                  <Label htmlFor="alertPhone">Alert Phone Number</Label>
                  <Input
                    id="alertPhone"
                    type="tel"
                    value={settings.alertPhone}
                    onChange={(e) => handleChange('alertPhone', e.target.value)}
                    placeholder="+256700000000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Retention</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dataRetentionDays">Retention Period (Days)</Label>
                <Input
                  id="dataRetentionDays"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => handleChange('dataRetentionDays', e.target.value)}
                  placeholder="365"
                />
                <p className="text-xs text-gray-500 mt-1">Keep data for this many days</p>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoArchive}
                    onChange={(e) => handleChange('autoArchive', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">Auto-archive old data</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => router.push('/fuel')}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
