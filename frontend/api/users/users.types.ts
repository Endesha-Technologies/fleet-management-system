// ---------------------------------------------------------------------------
// Users domain types
// ---------------------------------------------------------------------------
// Derived from the backend contract in users_roles_responses.json.
// ---------------------------------------------------------------------------

import type { ApiResponse, PaginatedData } from '../types';
import type { RoleSummary, RolePermission } from '../roles/roles.types';

// ---- Enums / union types --------------------------------------------------

export type UserType = 'SYSTEM' | 'ADMIN' | 'DRIVER' | 'MANAGER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

// ---- Driver profile -------------------------------------------------------

export interface DriverProfile {
  id: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseClass: string;
  dateOfBirth: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  hireDate: string | null;
  notes: string | null;
}

// ---- User–Role join -------------------------------------------------------

/** Role assignment as it appears nested inside a user object. */
export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  role: RoleSummary & {
    permissions?: RolePermission[];
  };
}

// ---- User -----------------------------------------------------------------

/** User object as returned by list and detail endpoints. */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  type: UserType;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
  driverProfile: DriverProfile | null;
}

/** Abbreviated user returned after an update (no roles array). */
export interface UserUpdateResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  type: UserType;
  status: UserStatus;
  updatedAt: string;
  driverProfile: DriverProfile | null;
}

// ---- Request payloads -----------------------------------------------------

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  type: UserType;
  roleIds: string[];

  // Optional driver profile fields
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseClass?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  hireDate?: string;
  notes?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  type?: UserType;
  roleIds?: string[];

  // Optional driver profile fields
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseClass?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  hireDate?: string;
  notes?: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

// ---- Response aliases -----------------------------------------------------

export type UserListResponse = ApiResponse<PaginatedData<User>>;
export type UserDetailResponse = ApiResponse<User>;
export type CreateUserResponse = ApiResponse<User>;
export type UpdateUserResponse = ApiResponse<UserUpdateResult>;
export type DeleteUserResponse = ApiResponse<null>;
export type ChangePasswordResponse = ApiResponse<null>;
