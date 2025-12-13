# Fleet Management System

This is a [Next.js](https://nextjs.org) project designed for comprehensive fleet management.

## Features

- **User Management**: Setup users with roles (Admin, Driver, Manager, etc.).
- **Route Management**: Create and manage routes.
- **Trip Tracking**: Assign trips to routes and track them.
- **Inventory Management**: Track spare parts.
- **Maintenance**: Schedule and track vehicle maintenance.
- **Tyre Management**: Manage tyre lifecycle and inventory.

## Project Structure

The project follows a feature-based directory structure for scalability and maintainability.

```
app/
  (auth)/           # Authentication routes (Login, Register, etc.)
  (dashboard)/      # Protected dashboard routes
    dashboard/      # Main dashboard view
    users/          # User management
    routes/         # Route management
    trips/          # Trip management
    inventory/      # Spare parts inventory
    maintenance/    # Maintenance tracking
    tyres/          # Tyre management
  api/              # API routes (if needed)

components/
  ui/               # Reusable UI components (Buttons, Inputs, etc.)
  layout/           # Layout components (Sidebar, Header, Footer)
  features/         # Feature-specific components
    auth/
    users/
    routes/
    trips/
    inventory/
    maintenance/
    tyres/

lib/                # Utility functions and libraries
hooks/              # Custom React hooks
types/              # TypeScript type definitions
constants/          # Global constants
services/           # External service integrations
```

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
