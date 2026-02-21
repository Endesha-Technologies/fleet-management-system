// ---------------------------------------------------------------------------
// Users service
// ---------------------------------------------------------------------------

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { PaginatedData, PaginationParams } from '../types';
import type {
  User,
  UserUpdateResult,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
} from './users.types';

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

/** Fetch a paginated list of users. */
async function getUsers(
  params?: PaginationParams,
): Promise<PaginatedData<User>> {
  const res = await apiClient.get<PaginatedData<User>>(ENDPOINTS.USERS.LIST, {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  return res.data;
}

/** Fetch a single user by ID (includes full role + permission tree). */
async function getUserById(id: string): Promise<User> {
  const res = await apiClient.get<User>(ENDPOINTS.USERS.DETAIL(id));
  return res.data;
}

/** Create a new user. */
async function createUser(data: CreateUserRequest): Promise<User> {
  const res = await apiClient.post<User>(ENDPOINTS.USERS.CREATE, data);
  return res.data;
}

/** Update an existing user. */
async function updateUser(
  id: string,
  data: UpdateUserRequest,
): Promise<UserUpdateResult> {
  const res = await apiClient.put<UserUpdateResult>(
    ENDPOINTS.USERS.UPDATE(id),
    data,
  );
  return res.data;
}

/** Delete a user by ID. */
async function deleteUser(id: string): Promise<void> {
  await apiClient.delete<null>(ENDPOINTS.USERS.DELETE(id));
}

/** Change a user's password (admin action – no current password required). */
async function changePassword(
  id: string,
  data: ChangePasswordRequest,
): Promise<void> {
  await apiClient.put<null>(ENDPOINTS.USERS.CHANGE_PASSWORD(id), data);
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const usersService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} as const;
