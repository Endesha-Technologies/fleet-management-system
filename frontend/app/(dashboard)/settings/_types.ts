// ---------------------------------------------------------------------------
// Settings domain types (redesigned)
// ---------------------------------------------------------------------------
// Co-located types for the settings pages. These are UI-level "view-model"
// types used by the settings landing page, users page, and roles page.
// ---------------------------------------------------------------------------

import type React from 'react';

// ---------------------------------------------------------------------------
// Settings Category Card (landing page)
// ---------------------------------------------------------------------------
export interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name reference
  href: string;
  count?: number; // e.g., "12 users", "5 roles"
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// User types (unified — includes drivers, turnboys, admins, etc.)
// ---------------------------------------------------------------------------
export type UserType = 'SYSTEM' | 'ADMIN' | 'MANAGER' | 'DRIVER' | 'TURN_BOY';

export const USER_TYPE_LABELS: Record<UserType, string> = {
  SYSTEM: 'System',
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  DRIVER: 'Driver',
  TURN_BOY: 'Turn Boy',
};

export const USER_TYPE_OPTIONS: { value: UserType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'TURN_BOY', label: 'Turn Boy' },
];

export interface SettingsUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  type: UserType;
  roles: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  // Driver-specific fields
  licenseNumber?: string;
  licenseExpiry?: string;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  type: UserType;
  roleIds: string[];
  password: string;
  confirmPassword: string;
  // Driver-specific
  licenseNumber: string;
  licenseExpiry: string;
}

export interface UserFormErrors {
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Role types
// ---------------------------------------------------------------------------
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string; // e.g., 'USERS', 'TRUCKS', 'ROLES'
  action: string; // e.g., 'CREATE', 'READ', 'UPDATE', 'DELETE'
}

export interface PermissionGroup {
  resource: string;
  permissions: Permission[];
}

export interface SettingsRole {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  userCount: number;
  isSystem: boolean; // system roles can't be deleted
  createdAt: string;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface RoleFormErrors {
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Page header
// ---------------------------------------------------------------------------
export interface SettingsPageHeaderProps {
  title: string;
  description: string;
  backHref?: string;
  action?: React.ReactNode;
}
