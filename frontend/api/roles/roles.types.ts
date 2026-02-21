// ---------------------------------------------------------------------------
// Roles & Permissions domain types
// ---------------------------------------------------------------------------
// Derived from the backend contract in users_roles_responses.json.
// ---------------------------------------------------------------------------

import type { ApiResponse } from '../types';

// ---- Permission -----------------------------------------------------------

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
  createdAt: string;
}

// ---- Role-Permission join (nested in role responses) ----------------------

export interface RolePermission {
  roleId: string;
  permissionId: string;
  permission: Permission;
}

// ---- Role -----------------------------------------------------------------

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermission[];
  /** User count – only present in list responses. */
  _count?: { users: number };
}

/** Lightweight role detail returned when nested inside a user. */
export interface RoleSummary {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: RolePermission[];
}

/** Role detail including the list of assigned users. */
export interface RoleDetail extends Role {
  users?: Array<{ id: string; email: string }>;
}

// ---- Request payloads -----------------------------------------------------

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ---- Response aliases -----------------------------------------------------

export type PermissionListResponse = ApiResponse<Permission[]>;
export type RoleListResponse = ApiResponse<Role[]>;
export type RoleDetailResponse = ApiResponse<RoleDetail>;
export type CreateRoleResponse = ApiResponse<Role>;
export type UpdateRoleResponse = ApiResponse<Role>;
export type DeleteRoleResponse = ApiResponse<null>;
