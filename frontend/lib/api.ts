const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  [key: string]: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Users
  async getUsers(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request<any>(
      `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
  }

  async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deactivateUser(id: string) {
    return this.request<any>(`/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  async changePassword(id: string, data: { newPassword: string; confirmPassword: string }) {
    return this.request<any>(`/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Roles
  async getRoles(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request<any>(
      `/roles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
  }

  async getRoleById(id: string) {
    return this.request<any>(`/roles/${id}`);
  }

  async createRole(data: any) {
    return this.request<any>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: any) {
    return this.request<any>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deactivateRole(id: string) {
    return this.request<any>(`/roles/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // Permissions
  async getPermissions() {
    return this.request<any>('/permissions');
  }

  async getPermissionsByResource() {
    return this.request<any>('/permissions/by-resource');
  }

  // Drivers
  async getDrivers(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request<any>(
      `/drivers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
  }

  async getDriverById(id: string) {
    return this.request<any>(`/drivers/${id}`);
  }

  async createDriver(data: any) {
    return this.request<any>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDriver(id: string, data: any) {
    return this.request<any>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deactivateDriver(id: string) {
    return this.request<any>(`/drivers/${id}/deactivate`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();
