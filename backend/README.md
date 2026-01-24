# Fleet Management System - Backend API

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Required environment variables:
- `PORT`: Server port (default: 5000)
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name
- `JWT_SECRET`: Secret key for JWT tokens (use a strong random string in production)
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., "24h", "7d")

### 3. Create Database
Create a PostgreSQL database:
```bash
createdb fleet_management
```

### 4. Run Database Migrations
TypeORM will automatically sync the schema when the server starts (in development mode).

### 5. Seed Initial Data
Seed the database with initial permissions, roles, and admin user:
```bash
npm run seed
```

This will create:
- All system permissions (user, role, truck, driver, trip, etc.)
- Default roles: Super Admin, Fleet Manager, Maintenance Manager, Operations Manager, Driver, Viewer
- Admin user with credentials:
  - Email: `admin@fleetmanagement.com`
  - Password: `Admin@123`

**⚠️ Change the admin password after first login!**

### 6. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "admin@fleetmanagement.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@fleetmanagement.com",
    "firstName": "System",
    "lastName": "Administrator",
    "roles": ["Super Admin"]
  }
}
```

#### POST /api/auth/logout
Logout the current user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /api/auth/password/reset-request
Request a password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/password/reset
Reset password with token.

**Request:**
```json
{
  "token": "reset-token",
  "newPassword": "NewPassword123"
}
```

#### POST /api/auth/password/change
Change password (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

### User Management Endpoints

All user endpoints require authentication and appropriate permissions.

#### POST /api/users
Create a new user (requires `user:create` permission).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

#### GET /api/users
Get all users (requires `user:read` permission).

**Query Parameters:**
- `isActive` (optional): Filter by active status (true/false)
- `roleId` (optional): Filter by role ID
- `search` (optional): Search by name or email

#### GET /api/users/:id
Get user by ID (requires `user:read` permission).

#### PUT /api/users/:id
Update user (requires `user:update` permission).

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "email": "newemail@example.com"
}
```

#### POST /api/users/:id/deactivate
Deactivate user (requires `user:delete` permission).

#### POST /api/users/:id/activate
Activate user (requires `user:update` permission).

#### POST /api/users/:id/roles
Assign roles to user (requires `user:update` permission).

**Request:**
```json
{
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

#### GET /api/users/:id/permissions
Get user permissions (requires `user:read` permission).

### Role Management Endpoints

All role endpoints require authentication and appropriate permissions.

#### POST /api/roles
Create a new role (requires `role:create` permission).

**Request:**
```json
{
  "name": "Custom Role",
  "description": "Description of the role",
  "permissionIds": ["perm-uuid-1", "perm-uuid-2"]
}
```

#### GET /api/roles
Get all roles (requires `role:read` permission).

#### GET /api/roles/:id
Get role by ID (requires `role:read` permission).

#### PUT /api/roles/:id
Update role (requires `role:update` permission).

**Request:**
```json
{
  "name": "Updated Role Name",
  "description": "Updated description"
}
```

#### DELETE /api/roles/:id
Delete role (requires `role:delete` permission).

#### POST /api/roles/:id/permissions
Assign permissions to role (requires `role:update` permission).

**Request:**
```json
{
  "permissionIds": ["perm-uuid-1", "perm-uuid-2"]
}
```

#### GET /api/roles/:id/permissions
Get role permissions (requires `role:read` permission).

#### POST /api/roles/permissions
Create a new permission (requires `permission:create` permission).

**Request:**
```json
{
  "code": "custom:action",
  "name": "Custom Action",
  "description": "Description of the permission"
}
```

#### GET /api/roles/permissions
Get all permissions (requires `permission:read` permission).

## Default Roles & Permissions

### Super Admin
Full system access - all permissions

### Fleet Manager
- User management (read)
- Driver management (full CRUD)
- Truck management (full CRUD)
- Trip management (full CRUD)
- Route management (full CRUD)
- Maintenance management (create, read, update)
- Fuel management (create, read, update)
- Part inventory (create, read, update)
- Tyre management (create, read, update)
- Reports (view, export)

### Maintenance Manager
- Truck information (read)
- Maintenance management (full CRUD)
- Part inventory (full CRUD)
- Tyre management (full CRUD)
- Reports (view)

### Operations Manager
- Driver information (read)
- Truck information (read)
- Trip management (create, read, update)
- Route information (read)
- Fuel management (create, read)
- Reports (view)

### Driver
- Trip information (read)
- Route information (read)
- Truck information (read)
- Fuel management (create, read)

### Viewer
- Read-only access to trucks, drivers, trips, routes, maintenance, fuel, parts, and tyres

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Token-based authentication
- **Permission-Based Authorization**: Fine-grained access control
- **Role-Based Authorization**: Role membership checks
- **Login History**: Track all login attempts
- **Password Reset**: Secure token-based password recovery (30-minute expiry)
- **Audit Logging**: All CRUD operations logged with user context
- **Account Deactivation**: Soft delete for user accounts

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Run Database Seed
```bash
npm run seed
```

## Architecture

```
backend/
├── src/
│   ├── config/           # Database configuration
│   ├── entities/         # TypeORM entities
│   ├── services/         # Business logic layer
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation middleware
│   ├── utils/            # Helper functions & seed script
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
```

## Error Handling

All API endpoints return errors in the following format:
```json
{
  "error": "Error message description"
}
```

HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error
