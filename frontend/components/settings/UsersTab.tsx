'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Edit2,
  Trash2,
  Lock,
  Plus,
  Search,
  AlertCircle,
  Loader,
  CheckCircle,
} from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  roles?: Array<{ id: string; name: string }>;
}

export function UsersTab({
  showAddSheet: externalShowAddSheet,
  setShowAddSheet: externalSetShowAddSheet,
  setIsSubmitting: externalSetIsSubmitting,
}: {
  showAddSheet?: boolean;
  setShowAddSheet?: (show: boolean) => void;
  setIsSubmitting?: (submitting: boolean) => void;
} = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSheet, setShowAddSheetLocal] = useState(externalShowAddSheet || false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmittingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    roleIds: [] as string[],
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (externalShowAddSheet !== undefined) {
      setShowAddSheetLocal(externalShowAddSheet);
    }
  }, [externalShowAddSheet]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search?: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers({ search });
      setUsers(response.user || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      setError(errorMessage);
      // Show mock data as fallback
      setUsers([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+254712345678',
          isActive: true,
          roles: [{ id: '1', name: 'Manager' }],
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '+254787654321',
          isActive: true,
          roles: [{ id: '2', name: 'Driver' }],
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
      fetchUsers(value);
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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (): boolean => {
    if (!formData.password) {
      setFormErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (formData.password.length < 8) {
      setFormErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return false;
    }
    return true;
  };

  const handleAddUser = async () => {
    try {
      setError(null);
      
      if (!validateForm()) return;
      if (!validatePassword()) return;
      if (!formData.roleIds.length) {
        setFormErrors(prev => ({ ...prev, roleIds: 'Role is required' }));
        return;
      }

      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      const response = await apiClient.createUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        roleIds: formData.roleIds,
      });

      if (response.user) {
        setUsers([...users, response.user]);
        setShowAddSheetLocal(false);
        externalSetShowAddSheet?.(false);
        setSuccess('User created successfully');
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to create user';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setError(null);
      
      if (!validateForm()) return;
      if (!formData.roleIds.length) {
        setFormErrors(prev => ({ ...prev, roleIds: 'Role is required' }));
        return;
      }

      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      const response = await apiClient.updateUser(selectedUser.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        roleIds: formData.roleIds,
      });

      if (response.user) {
        setUsers(users.map(u => (u.id === selectedUser.id ? response.user : u)));
        setShowEditSheet(false);
        setSelectedUser(null);
        setSuccess('User updated successfully');
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to update user';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;

    try {
      setError(null);
      const pwErrors: Record<string, string> = {};

      if (!passwordData.newPassword) {
        pwErrors.newPassword = 'Password is required';
      } else if (passwordData.newPassword.length < 8) {
        pwErrors.newPassword = 'Password must be at least 8 characters';
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        pwErrors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(pwErrors).length > 0) {
        setFormErrors(pwErrors);
        return;
      }

      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      await apiClient.changePassword(selectedUser.id, {
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setShowPasswordSheet(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to change password';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser) return;

    try {
      setError(null);
      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      
      await apiClient.deactivateUser(selectedUser.id);
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, isActive: false } : u
      ));
      setShowDeleteDialog(false);
      setSelectedUser(null);
      setSuccess('User deactivated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to deactivate user';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const openEditSheet = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      password: '',
      confirmPassword: '',
      roleIds: user.roles?.map(r => r.id) || [],
    });
    setError(null);
    setFormErrors({});
    setShowEditSheet(true);
  };

  const openPasswordSheet = (user: User) => {
    setSelectedUser(user);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setError(null);
    setFormErrors({});
    setShowPasswordSheet(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setError(null);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      roleIds: [],
    });
    setFormErrors({});
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
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.phoneNumber || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {user.roles?.[0]?.name || 'No Role'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditSheet(user)}
                        disabled={isSubmitting}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPasswordSheet(user)}
                        disabled={isSubmitting}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Change password"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(user)}
                        disabled={isSubmitting || !user.isActive}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Deactivate user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Sheet */}
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
        title="Add New User"
        description="Create a new user account"
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
                placeholder="John"
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
                placeholder="Doe"
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
              placeholder="john.doe@example.com"
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
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={e => {
                setFormData({ ...formData, password: e.target.value });
                if (formErrors.password) {
                  setFormErrors({ ...formErrors, password: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.password
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
            />
            <p className="text-gray-500 text-xs mt-1">Minimum 8 characters</p>
            {formErrors.password && (
              <p className="text-red-600 text-xs mt-1">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={e => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (formErrors.confirmPassword) {
                  setFormErrors({ ...formErrors, confirmPassword: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.confirmPassword
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
            />
            {formErrors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={formData.roleIds[0] || ''}
              onChange={e => {
                setFormData({
                  ...formData,
                  roleIds: e.target.value ? [e.target.value] : [],
                });
                if (formErrors.roleIds) {
                  setFormErrors({ ...formErrors, roleIds: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.roleIds
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select a role</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="driver">Driver</option>
              <option value="support">Support</option>
            </select>
            {formErrors.roleIds && (
              <p className="text-red-600 text-xs mt-1">{formErrors.roleIds}</p>
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
              onClick={handleAddUser}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save User'
              )}
            </button>
          </div>
        </div>
      </Sheet>

      {/* Edit User Sheet */}
      <Sheet
        open={showEditSheet}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setError(null);
          }
          setShowEditSheet(open);
        }}
        title="Edit User"
        description={`Edit ${selectedUser?.firstName} ${selectedUser?.lastName}'s details`}
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
              Role *
            </label>
            <select
              value={formData.roleIds[0] || ''}
              onChange={e => {
                setFormData({
                  ...formData,
                  roleIds: e.target.value ? [e.target.value] : [],
                });
                if (formErrors.roleIds) {
                  setFormErrors({ ...formErrors, roleIds: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.roleIds
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select a role</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="driver">Driver</option>
              <option value="support">Support</option>
            </select>
            {formErrors.roleIds && (
              <p className="text-red-600 text-xs mt-1">{formErrors.roleIds}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowEditSheet(false);
                setSelectedUser(null);
                resetForm();
                setError(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleEditUser}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </button>
          </div>
        </div>
      </Sheet>

      {/* Change Password Sheet */}
      <Sheet
        open={showPasswordSheet}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setFormErrors({});
            setError(null);
          }
          setShowPasswordSheet(open);
        }}
        title="Change Password"
        description={`Change password for ${selectedUser?.firstName} ${selectedUser?.lastName}`}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            Password must be at least 8 characters long.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={e => {
                setPasswordData({ ...passwordData, newPassword: e.target.value });
                if (formErrors.newPassword) {
                  setFormErrors({ ...formErrors, newPassword: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.newPassword
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
            />
            {formErrors.newPassword && (
              <p className="text-red-600 text-xs mt-1">{formErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={e => {
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                });
                if (formErrors.confirmPassword) {
                  setFormErrors({ ...formErrors, confirmPassword: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.confirmPassword
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
            />
            {formErrors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowPasswordSheet(false);
                setSelectedUser(null);
                setPasswordData({ newPassword: '', confirmPassword: '' });
                setFormErrors({});
                setError(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </div>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Deactivate User
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate{' '}
              <strong>
                {selectedUser.firstName} {selectedUser.lastName}
              </strong>
              ? They will no longer be able to access the system. This action can be reversed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedUser(null);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateUser}
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
