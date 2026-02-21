'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Bell, DollarSign, Gauge, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FormInput,
  FormCheckbox,
  FormSection,
} from '@/components/ui/form';

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
            <FormSection
              title="Budget Settings"
              description="Set monthly fuel budget and alert thresholds"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Monthly Budget (UGX)"
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => handleChange('monthlyBudget', e.target.value)}
                  placeholder="10000000"
                  description="Total fuel budget per month"
                />
                <FormInput
                  label="Warning Threshold (%)"
                  type="number"
                  value={settings.budgetWarningThreshold}
                  onChange={(e) => handleChange('budgetWarningThreshold', e.target.value)}
                  placeholder="80"
                  description="Alert when budget usage exceeds this"
                />
                <FormInput
                  label="Critical Threshold (%)"
                  type="number"
                  value={settings.budgetCriticalThreshold}
                  onChange={(e) => handleChange('budgetCriticalThreshold', e.target.value)}
                  placeholder="95"
                  description="Critical alert threshold"
                />
              </div>
            </FormSection>
          </div>

          {/* Efficiency Targets */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <FormSection
              title="Efficiency Targets"
              description="Set fleet fuel efficiency targets and alerts"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Fleet Target (km/L)"
                  type="number"
                  step="0.1"
                  value={settings.fleetEfficiencyTarget}
                  onChange={(e) => handleChange('fleetEfficiencyTarget', e.target.value)}
                  placeholder="5.5"
                  description="Target efficiency for the fleet"
                />
                <FormInput
                  label="Low Efficiency Alert (km/L)"
                  type="number"
                  step="0.1"
                  value={settings.lowEfficiencyThreshold}
                  onChange={(e) => handleChange('lowEfficiencyThreshold', e.target.value)}
                  placeholder="4.0"
                  description="Alert when vehicle drops below this"
                />
                <FormInput
                  label="High Consumption Alert (%)"
                  type="number"
                  value={settings.highConsumptionThreshold}
                  onChange={(e) => handleChange('highConsumptionThreshold', e.target.value)}
                  placeholder="15"
                  description="% increase vs previous period"
                />
              </div>
            </FormSection>
          </div>

          {/* Price Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <FormSection
              title="Price Alerts"
              description="Configure fuel price anomaly detection"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Price Anomaly Threshold (%)"
                  type="number"
                  value={settings.priceAnomalyThreshold}
                  onChange={(e) => handleChange('priceAnomalyThreshold', e.target.value)}
                  placeholder="15"
                  description="Deviation from average price"
                />
                <FormInput
                  label="Maximum Price per Liter (UGX)"
                  type="number"
                  value={settings.maxPricePerLiter}
                  onChange={(e) => handleChange('maxPricePerLiter', e.target.value)}
                  placeholder="6000"
                  description="Alert when price exceeds this"
                />
                <div className="md:col-span-2">
                  <FormCheckbox
                    label="Enable price alerts"
                    checked={settings.enablePriceAlerts}
                    onCheckedChange={(val) => handleChange('enablePriceAlerts', val)}
                  />
                </div>
              </div>
            </FormSection>
          </div>

          {/* Refuel Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <FormSection
              title="Refuel Alerts"
              description="Configure low fuel level alerts"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Low Fuel Threshold (Liters)"
                  type="number"
                  value={settings.lowFuelThreshold}
                  onChange={(e) => handleChange('lowFuelThreshold', e.target.value)}
                  placeholder="25"
                  description="Alert when fuel level drops below"
                />
                <div className="flex items-end">
                  <FormCheckbox
                    label="Enable low fuel alerts"
                    checked={settings.enableLowFuelAlerts}
                    onCheckedChange={(val) => handleChange('enableLowFuelAlerts', val)}
                  />
                </div>
              </div>
            </FormSection>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <FormSection title="Notification Settings">
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
                  <FormInput
                    label="Alert Email"
                    type="email"
                    value={settings.alertEmail}
                    onChange={(e) => handleChange('alertEmail', e.target.value)}
                    placeholder="manager@endeasha.com"
                  />
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
                  <FormInput
                    label="Alert Phone Number"
                    type="tel"
                    value={settings.alertPhone}
                    onChange={(e) => handleChange('alertPhone', e.target.value)}
                    placeholder="+256700000000"
                  />
                )}
              </div>
            </FormSection>
          </div>

          {/* Data Retention */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <FormSection title="Data Retention">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Retention Period (Days)"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => handleChange('dataRetentionDays', e.target.value)}
                  placeholder="365"
                  description="Keep data for this many days"
                />
                <div className="flex items-end">
                  <FormCheckbox
                    label="Auto-archive old data"
                    checked={settings.autoArchive}
                    onCheckedChange={(val) => handleChange('autoArchive', val)}
                  />
                </div>
              </div>
            </FormSection>
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
