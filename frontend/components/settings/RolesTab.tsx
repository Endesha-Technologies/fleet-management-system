'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Edit2,
  Trash2,
  Eye,
  Plus,
  Search,
  Check,
  AlertCircle,
  Loader,
  CheckCircle,
} from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { apiClient } from '@/lib/api';

interface Permission {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

interface PermissionGroup {
  resource: string;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  rolePermissions?: Array<{ id: string; permission: Permission }>;
}

export function RolesTab({
  showAddSheet: externalShowAddSheet,
  setShowAddSheet: externalSetShowAddSheet,
  setIsSubmitting: externalSetIsSubmitting,
}: {
  showAddSheet?: boolean;
  setShowAddSheet?: (show: boolean) => void;
  setIsSubmitting?: (submitting: boolean) => void;
} = {}) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSheet, setShowAddSheetLocal] = useState(externalShowAddSheet || false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmittingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (externalShowAddSheet !== undefined) {
      setShowAddSheetLocal(externalShowAddSheet);
    }
  }, [externalShowAddSheet]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        apiClient.getRoles(),
        apiClient.getPermissionsByResource(),
      ]);

      setRoles(rolesResponse.role || []);
      setPermissions(groupPermissions(permissionsResponse.permissions || []));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setRoles([
        {
          id: '1',
          name: 'Administrator',
          description: 'Full system access',
          isActive: true,
        },
        {
          id: '2',
          name: 'Manager',
          description: 'Manage drivers and trips',
          isActive: true,
        },
      ]);
      setPermissions(mockPermissions);
    } finally {
      setLoading(false);
    }
  };

  const groupPermissions = (perms: Permission[]): PermissionGroup[] => {
    const grouped: Record<string, Permission[]> = {};
    perms.forEach(perm => {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = [];
      }
      grouped[perm.resource].push(perm);
    });

    return Object.entries(grouped).map(([resource, permissions]) => ({
      resource,
      permissions,
    }));
  };

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'Role name is required';
    if (formData.name.length > 50) errors.name = 'Role name must be less than 50 characters';
    if (formData.description.length > 200) errors.description = 'Description must be less than 200 characters';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRole = async () => {
    try {
      setError(null);
      
      if (!validateForm()) return;
      if (!selectedPermissions.length) {
        setError('At least one permission must be selected');
        return;
      }

      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      const response = await apiClient.createRole({
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissionIds: selectedPermissions,
      });

      if (response.role) {
        setRoles([...roles, response.role]);
        setShowAddSheetLocal(false);
        externalSetShowAddSheet?.(false);
        setSuccess('Role created successfully');
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to create role';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;

    try {
      setError(null);
      
      if (!validateForm()) return;
      if (!selectedPermissions.length) {
        setError('At least one permission must be selected');
        return;
      }

      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      const response = await apiClient.updateRole(selectedRole.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissionIds: selectedPermissions,
      });

      if (response.role) {
        setRoles(roles.map(r => (r.id === selectedRole.id ? response.role : r)));
        setShowEditSheet(false);
        setSelectedRole(null);
        setSuccess('Role updated successfully');
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to update role';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const handleDeactivateRole = async () => {
    if (!selectedRole) return;

    try {
      setError(null);
      setIsSubmittingLocal(true);
      externalSetIsSubmitting?.(true);
      
      await apiClient.deactivateRole(selectedRole.id);
      setRoles(roles.map(r =>
        r.id === selectedRole.id ? { ...r, isActive: false } : r
      ));
      setShowDeleteDialog(false);
      setSelectedRole(null);
      setSuccess('Role deactivated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to deactivate role';
      setError(errorMessage);
    } finally {
      setIsSubmittingLocal(false);
      externalSetIsSubmitting?.(false);
    }
  };

  const openEditSheet = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setSelectedPermissions(
      role.rolePermissions?.map(rp => rp.permission.id) || []
    );
    setError(null);
    setFormErrors({});
    setShowEditSheet(true);
  };

  const openViewDialog = (role: Role) => {
    setSelectedRole(role);
    setShowViewDialog(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setError(null);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setSelectedPermissions([]);
    setFormErrors({});
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const filteredRoles = roles.filter(
    role =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          placeholder="Search roles..."
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
              <th className="px-4 py-3">Role Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </td>
              </tr>
            ) : filteredRoles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No roles found
                </td>
              </tr>
            ) : (
              filteredRoles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {role.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {role.description || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                      {role.rolePermissions?.length || 0} permissions
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openViewDialog(role)}
                        disabled={isSubmitting}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View permissions"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditSheet(role)}
                        disabled={isSubmitting}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(role)}
                        disabled={isSubmitting || !role.isActive}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Deactivate role"
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

      {/* Add Role Sheet */}
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
        title="Add New Role"
        description="Create a new role with permissions"
      >
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) {
                  setFormErrors({ ...formErrors, name: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="e.g., Manager"
            />
            {formErrors.name && (
              <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description) {
                  setFormErrors({ ...formErrors, description: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.description
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Role description"
              rows={3}
            />
            <p className="text-gray-500 text-xs mt-1">{formData.description.length}/200</p>
            {formErrors.description && (
              <p className="text-red-600 text-xs mt-1">{formErrors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Permissions * (Select at least one)
            </label>
            <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {permissions.map(group => (
                <div key={group.resource} className="border-b pb-4 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                    {group.resource.replace(/_/g, ' ')} Management
                  </h4>
                  <div className="space-y-2">
                    {group.permissions.map(perm => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2">{selectedPermissions.length} permission(s) selected</p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowAddSheetLocal(false);
                externalSetShowAddSheet?.(false);
                resetForm();
                setError(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRole}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Role'
              )}
            </button>
          </div>
        </div>
      </Sheet>

      {/* Edit Role Sheet */}
      <Sheet
        open={showEditSheet}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setError(null);
          }
          setShowEditSheet(open);
        }}
        title="Edit Role"
        description={`Edit ${selectedRole?.name} role and permissions`}
      >
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) {
                  setFormErrors({ ...formErrors, name: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {formErrors.name && (
              <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description) {
                  setFormErrors({ ...formErrors, description: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formErrors.description
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              rows={3}
            />
            <p className="text-gray-500 text-xs mt-1">{formData.description.length}/200</p>
            {formErrors.description && (
              <p className="text-red-600 text-xs mt-1">{formErrors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Permissions * (Select at least one)
            </label>
            <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {permissions.map(group => (
                <div key={group.resource} className="border-b pb-4 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                    {group.resource.replace(/_/g, ' ')} Management
                  </h4>
                  <div className="space-y-2">
                    {group.permissions.map(perm => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2">{selectedPermissions.length} permission(s) selected</p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setShowEditSheet(false);
                setSelectedRole(null);
                resetForm();
                setError(null);
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleEditRole}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </button>
          </div>
        </div>
      </Sheet>

      {/* View Permissions Dialog */}
      {showViewDialog && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md max-h-96 overflow-y-auto shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedRole.name} Permissions
            </h3>
            <div className="space-y-4">
              {selectedRole.rolePermissions && selectedRole.rolePermissions.length > 0 ? (
                permissions.map(group => {
                  const groupPerms = selectedRole.rolePermissions!.filter(
                    rp => rp.permission.resource === group.resource
                  );
                  if (groupPerms.length === 0) return null;
                  return (
                    <div key={group.resource}>
                      <h4 className="font-medium text-gray-900 mb-2 capitalize">
                        {group.resource.replace(/_/g, ' ')}
                      </h4>
                      <ul className="space-y-1">
                        {groupPerms.map(rp => (
                          <li
                            key={rp.id}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                            {rp.permission.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600 text-center py-4">No permissions assigned</p>
              )}
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowViewDialog(false);
                  setSelectedRole(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Deactivate Role
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate the <strong>{selectedRole.name}</strong> role? 
              Users with this role will lose access. This action can be reversed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedRole(null);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateRole}
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

const mockPermissions: PermissionGroup[] = [
  {
    resource: 'user',
    permissions: [
      {
        id: '1',
        code: 'user:create',
        name: 'Create Users',
        resource: 'user',
        action: 'create',
      },
      {
        id: '2',
        code: 'user:read',
        name: 'View Users',
        resource: 'user',
        action: 'read',
      },
      {
        id: '3',
        code: 'user:update',
        name: 'Edit Users',
        resource: 'user',
        action: 'update',
      },
      {
        id: '4',
        code: 'user:delete',
        name: 'Delete Users',
        resource: 'user',
        action: 'delete',
      },
    ],
  },
  {
    resource: 'tyre',
    permissions: [
      {
        id: '5',
        code: 'tyre:create',
        name: 'Create Tyres',
        resource: 'tyre',
        action: 'create',
      },
      {
        id: '6',
        code: 'tyre:read',
        name: 'View Tyres',
        resource: 'tyre',
        action: 'read',
      },
      {
        id: '7',
        code: 'tyre:update',
        name: 'Edit Tyres',
        resource: 'tyre',
        action: 'update',
      },
      {
        id: '8',
        code: 'tyre:delete',
        name: 'Delete Tyres',
        resource: 'tyre',
        action: 'delete',
      },
    ],
  },
  {
    resource: 'truck',
    permissions: [
      {
        id: '9',
        code: 'truck:create',
        name: 'Create Vehicles',
        resource: 'truck',
        action: 'create',
      },
      {
        id: '10',
        code: 'truck:read',
        name: 'View Vehicles',
        resource: 'truck',
        action: 'read',
      },
      {
        id: '11',
        code: 'truck:update',
        name: 'Edit Vehicles',
        resource: 'truck',
        action: 'update',
      },
      {
        id: '12',
        code: 'truck:delete',
        name: 'Delete Vehicles',
        resource: 'truck',
        action: 'delete',
      },
    ],
  },
  {
    resource: 'maintenance',
    permissions: [
      {
        id: '13',
        code: 'maintenance:create',
        name: 'Create Maintenance',
        resource: 'maintenance',
        action: 'create',
      },
      {
        id: '14',
        code: 'maintenance:read',
        name: 'View Maintenance',
        resource: 'maintenance',
        action: 'read',
      },
      {
        id: '15',
        code: 'maintenance:update',
        name: 'Edit Maintenance',
        resource: 'maintenance',
        action: 'update',
      },
    ],
  },
];
