// ---------------------------------------------------------------------------
// Roles & Permissions service
// ---------------------------------------------------------------------------

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  Permission,
  Role,
  RoleDetail,
  CreateRoleRequest,
  UpdateRoleRequest,
} from './roles.types';

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

/** Fetch the full list of available permissions. */
async function getPermissions(): Promise<Permission[]> {
  const res = await apiClient.get<Permission[]>(ENDPOINTS.ROLES.PERMISSIONS);
  return res.data;
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

/** Fetch all roles (including embedded permissions and user count). */
async function getRoles(): Promise<Role[]> {
  const res = await apiClient.get<Role[]>(ENDPOINTS.ROLES.LIST);
  return res.data;
}

/** Fetch a single role by ID (including users assigned to it). */
async function getRoleById(id: string): Promise<RoleDetail> {
  const res = await apiClient.get<RoleDetail>(ENDPOINTS.ROLES.DETAIL(id));
  return res.data;
}

/** Create a new role with a set of permission IDs. */
async function createRole(data: CreateRoleRequest): Promise<Role> {
  const res = await apiClient.post<Role>(ENDPOINTS.ROLES.CREATE, data);
  return res.data;
}

/** Update an existing role's name, description, or permissions. */
async function updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
  const res = await apiClient.put<Role>(ENDPOINTS.ROLES.UPDATE(id), data);
  return res.data;
}

/** Delete a role by ID. Only non-system roles can be deleted. */
async function deleteRole(id: string): Promise<void> {
  await apiClient.delete<null>(ENDPOINTS.ROLES.DELETE(id));
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const rolesService = {
  getPermissions,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} as const;
