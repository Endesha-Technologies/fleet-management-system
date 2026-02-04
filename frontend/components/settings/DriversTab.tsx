'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Edit2,
  Trash2,
  Plus,
  Search,
  AlertCircle,
  Loader,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { apiClient } from '@/lib/api';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  licenseNumber?: string;
  licenseExpiry?: string;
}

export function DriversTab({
  showAddSheet: externalShowAddSheet,
  setShowAddSheet: externalSetShowAddSheet,
  setIsSubmitting: externalSetIsSubmitting,
}: {
  showAddSheet?: boolean;
  setShowAddSheet?: (show: boolean) => void;
  setIsSubmitting?: (submitting: boolean) => void;
} = {}) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSheet, setShowAddSheetLocal] = useState(externalShowAddSheet || false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSubmitting, setIsSubmittingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (externalShowAddSheet !== undefined) {
      setShowAddSheetLocal(externalShowAddSheet);
    }
  }, [externalShowAddSheet]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async (search?: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getDrivers({ search });
      setDrivers(response.driver || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      setDrivers([
        {
          id: '1',
          firstName: 'David',
          lastName: 'Kipchoge',
          email: 'david.kipchoge@example.com',
          phoneNumber: '+254712345678',
          isActive: true,
          licenseNumber: 'DL123456',
          licenseExpiry: '2026-12-31',
        },
        {
          id: '2',
          firstName: 'Mary',
          lastName: 'Wanjiru',
          email: 'mary.wanjiru@example.com',
          phoneNumber: '+254787654321',
          isActive: true,
          licenseNumber: 'DL789012',
          licenseExpiry: '2025-06-30',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const timer = setTimeout(() => {
      fetchDrivers(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (formData.phoneNumber && !/^\+?[0-9]{7,}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number';
    }
    if (!formData.licenseNumber.trim()) errors.licenseNumber = 'License number is required';
    if (!formData.licenseExpiry) errors.licenseExpiry = 'License expiry date is required';
    if (formData.licenseExpiry && new Date(formData.licenseExpiry) < new Date()) {
      errors.licenseExpiry = 'License expiry date cannot be in the past';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDriver = async () => {
    try {
      setError(null);
      
      if (!validateForm()) return;

      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      const response = await apiClient.createDriver({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        licenseExpiry: formData.licenseExpiry,
      });

      if (response.driver) {
        setDrivers([...drivers, response.driver]);
        setShowAddSheetLocal(false);
        externalSetShowAddSheet?.(false);
        setSuccess('Driver added successfully');
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to add driver';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const handleEditDriver = async () => {
    if (!selectedDriver) return;

    try {
      setError(null);
      
      if (!validateForm()) return;

      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      const response = await apiClient.updateDriver(selectedDriver.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        licenseExpiry: formData.licenseExpiry,
      });

      if (response.driver) {
        setDrivers(drivers.map(d => (d.id === selectedDriver.id ? response.driver : d)));
        setShowEditSheet(false);
        setSelectedDriver(null);
        setSuccess('Driver updated successfully');
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to update driver';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const handleDeactivateDriver = async () => {
    if (!selectedDriver) return;

    try {
      setError(null);
      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      
      await apiClient.deactivateDriver(selectedDriver.id);
      setDrivers(drivers.map(d =>
        d.id === selectedDriver.id ? { ...d, isActive: false } : d
      ));
      setShowDeleteDialog(false);
      setSelectedDriver(null);
      setSuccess('Driver deactivated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to deactivate driver';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const openEditSheet = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry || '',
    });
    setError(null);
    setFormErrors({});
    setShowEditSheet(true);
  };

  const openDeleteDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setError(null);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      licenseNumber: '',
      licenseExpiry: '',
    });
    setFormErrors({});
  };

  const getLicenseStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'Expired', color: 'text-red-700 bg-red-50', icon: 'alert' };
    if (daysUntilExpiry < 30) return { status: 'Expiring Soon', color: 'text-orange-700 bg-orange-50', icon: 'warning' };
    return { status: 'Valid', color: 'text-green-700 bg-green-50', icon: 'valid' };
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 max-w-full">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 max-w-full">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="hidden md:block w-full overflow-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
            <tr>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">License Number</th>
              <th className="px-4 py-3">License Status</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map(driver => {
                const licenseStatus = getLicenseStatus(driver.licenseExpiry);

                return (
                  <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {driver.firstName} {driver.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {driver.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {driver.phoneNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {driver.licenseNumber || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {driver.licenseExpiry && licenseStatus ? (
                          <>
                            {licenseStatus.icon === 'alert' && (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                            {licenseStatus.icon === 'warning' && (
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            )}
                            <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium ${licenseStatus.color}`}>
                              {licenseStatus.status}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">Not provided</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          driver.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {driver.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditSheet(driver)}
                          disabled={isSubmitting}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit driver"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(driver)}
                          disabled={isSubmitting || !driver.isActive}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Deactivate driver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Driver Sheet */}
      <Sheet
        open={showAddSheet}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setError(null);
          }
          setShowAddSheetLocal(open);
          externalSetShowAddSheet?.(open);
        }}
        title="Add New Driver"
        description="Register a new driver or turn boy"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (formErrors.firstName) {
                    setFormErrors({ ...formErrors, firstName: '' });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.firstName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="David"
              />
              {formErrors.firstName && (
                <p className="text-red-600 text-xs mt-1">{formErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => {
                  setFormData({ ...formData, lastName: e.target.value });
                  if (formErrors.lastName) {
                    setFormErrors({ ...formErrors, lastName: '' });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.lastName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Kipchoge"
              />
              {formErrors.lastName && (
                <p className="text-red-600 text-xs mt-1">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => {
                setFormData({ ...formData, email: e.target.value });
                if (formErrors.email) {
                  setFormErrors({ ...formErrors, email: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="david@example.com"
            />
            {formErrors.email && (
              <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={e => {
                setFormData({ ...formData, phoneNumber: e.target.value });
                if (formErrors.phoneNumber) {
                  setFormErrors({ ...formErrors, phoneNumber: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.phoneNumber
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="+254712345678"
            />
            {formErrors.phoneNumber && (
              <p className="text-red-600 text-xs mt-1">{formErrors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Number *
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={e => {
                setFormData({ ...formData, licenseNumber: e.target.value });
                if (formErrors.licenseNumber) {
                  setFormErrors({ ...formErrors, licenseNumber: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.licenseNumber
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="DL123456"
            />
            {formErrors.licenseNumber && (
              <p className="text-red-600 text-xs mt-1">{formErrors.licenseNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Expiry Date *
            </label>
            <input
              type="date"
              value={formData.licenseExpiry}
              onChange={e => {
                setFormData({ ...formData, licenseExpiry: e.target.value });
                if (formErrors.licenseExpiry) {
                  setFormErrors({ ...formErrors, licenseExpiry: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.licenseExpiry
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {formErrors.licenseExpiry && (
              <p className="text-red-600 text-xs mt-1">{formErrors.licenseExpiry}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowAddSheet(false);
                resetForm();
                setError(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDriver}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Driver'
              )}
            </button>
          </div>
        </div>
      </Sheet>

      {/* Edit Driver Sheet */}
      <Sheet
        open={showEditSheet}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setError(null);
          }
          setShowEditSheet(open);
        }}
        title="Edit Driver"
        description={`Edit ${selectedDriver?.firstName} ${selectedDriver?.lastName}'s details`}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (formErrors.firstName) {
                    setFormErrors({ ...formErrors, firstName: '' });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.firstName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {formErrors.firstName && (
                <p className="text-red-600 text-xs mt-1">{formErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => {
                  setFormData({ ...formData, lastName: e.target.value });
                  if (formErrors.lastName) {
                    setFormErrors({ ...formErrors, lastName: '' });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.lastName
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {formErrors.lastName && (
                <p className="text-red-600 text-xs mt-1">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => {
                setFormData({ ...formData, email: e.target.value });
                if (formErrors.email) {
                  setFormErrors({ ...formErrors, email: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {formErrors.email && (
              <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={e => {
                setFormData({ ...formData, phoneNumber: e.target.value });
                if (formErrors.phoneNumber) {
                  setFormErrors({ ...formErrors, phoneNumber: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.phoneNumber
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {formErrors.phoneNumber && (
              <p className="text-red-600 text-xs mt-1">{formErrors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Number *
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={e => {
                setFormData({ ...formData, licenseNumber: e.target.value });
                if (formErrors.licenseNumber) {
                  setFormErrors({ ...formErrors, licenseNumber: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.licenseNumber
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {formErrors.licenseNumber && (
              <p className="text-red-600 text-xs mt-1">{formErrors.licenseNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Expiry Date *
            </label>
            <input
              type="date"
              value={formData.licenseExpiry}
              onChange={e => {
                setFormData({ ...formData, licenseExpiry: e.target.value });
                if (formErrors.licenseExpiry) {
                  setFormErrors({ ...formErrors, licenseExpiry: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.licenseExpiry
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {formErrors.licenseExpiry && (
              <p className="text-red-600 text-xs mt-1">{formErrors.licenseExpiry}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowEditSheet(false);
                setSelectedDriver(null);
                resetForm();
                setError(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleEditDriver}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Driver'
              )}
            </button>
          </div>
        </div>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Deactivate Driver
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate{' '}
              <strong>
                {selectedDriver.firstName} {selectedDriver.lastName}
              </strong>
              ? They will no longer be able to log in or access the system. This action can be reversed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedDriver(null);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateDriver}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  'Deactivate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
