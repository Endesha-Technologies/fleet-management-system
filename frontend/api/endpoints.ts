// ---------------------------------------------------------------------------
// Central endpoint registry
// ---------------------------------------------------------------------------
// Every API path lives here. Services reference these constants instead of
// hard-coding strings, so a URL change only touches one place.
//
// Convention:
//   • Group by domain (AUTH, ROLES, USERS, TRUCKS, …)
//   • Use UPPER_SNAKE_CASE for the keys
//   • Paths are relative to the base URL configured in `api/client.ts`
//   • Dynamic segments are expressed as functions returning the full path
// ---------------------------------------------------------------------------

export const ENDPOINTS = {
  // ---- Auth ---------------------------------------------------------------
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // ---- Roles & Permissions ------------------------------------------------
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    DETAIL: (id: string) => `/roles/${id}` as const,
    UPDATE: (id: string) => `/roles/${id}` as const,
    DELETE: (id: string) => `/roles/${id}` as const,
    PERMISSIONS: '/roles/permissions',
  },

  // ---- Users --------------------------------------------------------------
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    DETAIL: (id: string) => `/users/${id}` as const,
    UPDATE: (id: string) => `/users/${id}` as const,
    DELETE: (id: string) => `/users/${id}` as const,
    CHANGE_PASSWORD: (id: string) => `/users/${id}/password` as const,
  },

  // ---- Trucks & Fleet ------------------------------------------------------
  TRUCKS: {
    LIST: '/trucks',
    CREATE: '/trucks',
    DETAIL: (id: string) => `/trucks/${id}` as const,
    UPDATE: (id: string) => `/trucks/${id}` as const,
    DELETE: (id: string) => `/trucks/${id}` as const,
    STATUS: (id: string) => `/trucks/${id}/status` as const,
    FLEET_OVERVIEW: '/fleet/overview',
    COMPLIANCE_ALERTS: '/trucks/compliance-alerts',
  },

  // ---- Tyres --------------------------------------------------------------
  TYRES: {
    TRUCK_POSITIONS: (truckId: string) => `/tyres/trucks/${truckId}/positions` as const,
    MOUNT: '/tyres/mount',
    DISMOUNT: '/tyres/dismount',
    ROTATE: '/tyres/rotate',
    INSPECT: (id: string) => `/tyres/${id}/inspect` as const,
    HISTORY: (id: string) => `/tyres/${id}/history` as const,
    MILEAGE: (id: string) => `/tyres/${id}/mileage` as const,
    POSITION_HISTORY: (positionId: string) => `/tyres/positions/${positionId}/history` as const,
  },

  // ---- Assets & Inventory -------------------------------------------------
  ASSETS: {
    LIST: '/assets',
    CREATE: '/assets',
    DETAIL: (id: string) => `/assets/${id}` as const,
    UPDATE: (id: string) => `/assets/${id}` as const,
    SUPPLIERS_LIST: '/assets/suppliers',
    SUPPLIERS_CREATE: '/assets/suppliers',
    PURCHASES_LIST: '/assets/purchases',
    PURCHASES_CREATE: '/assets/purchases',
    INSTALL: '/assets/install',
    REMOVE: (installationId: string) =>
      `/assets/installations/${installationId}/remove` as const,
    TRANSACTIONS: (id: string) => `/assets/${id}/transactions` as const,
    STOCK_SUMMARY: (id: string) => `/assets/${id}/stock-summary` as const,
    DISPOSE: (id: string) => `/assets/${id}/dispose` as const,
    LOW_STOCK: '/assets/low-stock',
    TOOLS_CHECKOUT: '/assets/tools/checkout',
    TOOLS_RETURN: '/assets/tools/return',
  },

  // ---- Maintenance --------------------------------------------------------
  MAINTENANCE: {
    SCHEDULES_LIST: '/maintenance/schedules',
    SCHEDULES_DETAIL: (id: string) => `/maintenance/schedules/${id}` as const,
    PLANS_LIST: '/maintenance/plans',
    PLANS_DETAIL: (id: string) => `/maintenance/plans/${id}` as const,
    PLANS_COMPLETE: (id: string) => `/maintenance/plans/${id}/complete` as const,
    LOGS_LIST: '/maintenance/logs',
    LOGS_DETAIL: (id: string) => `/maintenance/logs/${id}` as const,
    ALERTS: '/maintenance/alerts',
    TRUCK_HISTORY: (truckId: string) =>
      `/maintenance/trucks/${truckId}/history` as const,
  },

  // ---- Future domains (uncomment / add as the backend ships them) ---------
  // DRIVERS: { … },
  // TRIPS:   { … },
  // ROUTES:  { … },
  // FUEL:    { … },
} as const;
