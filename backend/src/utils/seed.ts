import { AppDataSource } from "../config/data-source";
import { Permission } from "../entities/Permission";
import { Role } from "../entities/Role";
import { User } from "../entities/User";
import { RolePermission } from "../entities/RolePermission";
import { UserRole } from "../entities/UserRole";
import * as bcrypt from "bcrypt";

/**
 * Seed initial permissions, roles, and admin user
 */
export async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established");

    const permissionRepo = AppDataSource.getRepository(Permission);
    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);
    const rolePermissionRepo = AppDataSource.getRepository(RolePermission);
    const userRoleRepo = AppDataSource.getRepository(UserRole);

    // Define permissions
    const permissions = [
      // User permissions
      { code: "user:create", name: "Create Users", description: "Create new users" },
      { code: "user:read", name: "View Users", description: "View user information" },
      { code: "user:update", name: "Update Users", description: "Update user information" },
      { code: "user:delete", name: "Delete Users", description: "Deactivate users" },

      // Role permissions
      { code: "role:create", name: "Create Roles", description: "Create new roles" },
      { code: "role:read", name: "View Roles", description: "View role information" },
      { code: "role:update", name: "Update Roles", description: "Update role information" },
      { code: "role:delete", name: "Delete Roles", description: "Delete roles" },

      // Permission permissions
      { code: "permission:create", name: "Create Permissions", description: "Create new permissions" },
      { code: "permission:read", name: "View Permissions", description: "View permission information" },

      // Truck permissions
      { code: "truck:create", name: "Create Trucks", description: "Add new trucks to the fleet" },
      { code: "truck:read", name: "View Trucks", description: "View truck information" },
      { code: "truck:update", name: "Update Trucks", description: "Update truck information" },
      { code: "truck:delete", name: "Delete Trucks", description: "Remove trucks from the fleet" },

      // Driver permissions
      { code: "driver:create", name: "Create Drivers", description: "Add new drivers" },
      { code: "driver:read", name: "View Drivers", description: "View driver information" },
      { code: "driver:update", name: "Update Drivers", description: "Update driver information" },
      { code: "driver:delete", name: "Delete Drivers", description: "Remove drivers" },

      // Trip permissions
      { code: "trip:create", name: "Create Trips", description: "Create new trips" },
      { code: "trip:read", name: "View Trips", description: "View trip information" },
      { code: "trip:update", name: "Update Trips", description: "Update trip information" },
      { code: "trip:delete", name: "Delete Trips", description: "Delete trips" },

      // Route permissions
      { code: "route:create", name: "Create Routes", description: "Create new routes" },
      { code: "route:read", name: "View Routes", description: "View route information" },
      { code: "route:update", name: "Update Routes", description: "Update route information" },
      { code: "route:delete", name: "Delete Routes", description: "Delete routes" },

      // Maintenance permissions
      { code: "maintenance:create", name: "Create Maintenance", description: "Create maintenance records" },
      { code: "maintenance:read", name: "View Maintenance", description: "View maintenance records" },
      { code: "maintenance:update", name: "Update Maintenance", description: "Update maintenance records" },
      { code: "maintenance:delete", name: "Delete Maintenance", description: "Delete maintenance records" },

      // Part inventory permissions
      { code: "part:create", name: "Create Parts", description: "Add new parts to inventory" },
      { code: "part:read", name: "View Parts", description: "View part inventory" },
      { code: "part:update", name: "Update Parts", description: "Update part information" },
      { code: "part:delete", name: "Delete Parts", description: "Remove parts from inventory" },

      // Tyre permissions
      { code: "tyre:create", name: "Create Tyres", description: "Add new tyres" },
      { code: "tyre:read", name: "View Tyres", description: "View tyre information" },
      { code: "tyre:update", name: "Update Tyres", description: "Update tyre information" },
      { code: "tyre:delete", name: "Delete Tyres", description: "Remove tyres" },

      // Fuel permissions
      { code: "fuel:create", name: "Create Fuel Logs", description: "Create fuel log entries" },
      { code: "fuel:read", name: "View Fuel Logs", description: "View fuel log entries" },
      { code: "fuel:update", name: "Update Fuel Logs", description: "Update fuel log entries" },
      { code: "fuel:delete", name: "Delete Fuel Logs", description: "Delete fuel log entries" },

      // Audit log permissions
      { code: "audit:read", name: "View Audit Logs", description: "View audit logs" },

      // Report permissions
      { code: "report:view", name: "View Reports", description: "View system reports" },
      { code: "report:export", name: "Export Reports", description: "Export reports" }
    ];

    console.log("Creating permissions...");
    const createdPermissions: { [key: string]: Permission } = {};
    for (const perm of permissions) {
      let permission = await permissionRepo.findOne({ where: { code: perm.code } });
      if (!permission) {
        // Parse code to extract resource and action
        const [resource, action] = perm.code.split(":");
        permission = permissionRepo.create({
          ...perm,
          resource,
          action
        });
        await permissionRepo.save(permission);
        console.log(`Created permission: ${perm.code}`);
      }
      createdPermissions[perm.code] = permission;
    }

    // Define roles with their permissions
    const rolesConfig = [
      {
        name: "Super Admin",
        description: "Full system access",
        permissions: Object.keys(createdPermissions) // All permissions
      },
      {
        name: "Fleet Manager",
        description: "Manages fleet operations",
        permissions: [
          "user:read", "driver:create", "driver:read", "driver:update", "driver:delete",
          "truck:create", "truck:read", "truck:update", "truck:delete",
          "trip:create", "trip:read", "trip:update", "trip:delete",
          "route:create", "route:read", "route:update", "route:delete",
          "maintenance:create", "maintenance:read", "maintenance:update",
          "fuel:create", "fuel:read", "fuel:update",
          "part:create", "part:read", "part:update",
          "tyre:create", "tyre:read", "tyre:update",
          "report:view", "report:export"
        ]
      },
      {
        name: "Maintenance Manager",
        description: "Manages maintenance and parts",
        permissions: [
          "truck:read", "maintenance:create", "maintenance:read", "maintenance:update", "maintenance:delete",
          "part:create", "part:read", "part:update", "part:delete",
          "tyre:create", "tyre:read", "tyre:update", "tyre:delete",
          "report:view"
        ]
      },
      {
        name: "Operations Manager",
        description: "Manages daily operations",
        permissions: [
          "driver:read", "truck:read", "trip:create", "trip:read", "trip:update",
          "route:read", "fuel:create", "fuel:read", "report:view"
        ]
      },
      {
        name: "Driver",
        description: "Basic driver access",
        permissions: [
          "trip:read", "route:read", "truck:read", "fuel:create", "fuel:read"
        ]
      },
      {
        name: "Viewer",
        description: "Read-only access",
        permissions: [
          "truck:read", "driver:read", "trip:read", "route:read",
          "maintenance:read", "fuel:read", "part:read", "tyre:read"
        ]
      }
    ];

    console.log("Creating roles...");
    const createdRoles: { [key: string]: Role } = {};
    for (const roleConfig of rolesConfig) {
      let role = await roleRepo.findOne({ where: { name: roleConfig.name } });
      if (!role) {
        role = roleRepo.create({
          name: roleConfig.name,
          description: roleConfig.description
        });
        await roleRepo.save(role);
        console.log(`Created role: ${roleConfig.name}`);
      }
      createdRoles[roleConfig.name] = role;

      // Assign permissions to role
      for (const permCode of roleConfig.permissions) {
        const permission = createdPermissions[permCode];
        if (!permission) continue;

        const existing = await rolePermissionRepo.findOne({
          where: { roleId: role.id, permissionId: permission.id }
        });

        if (!existing) {
          const rolePermission = rolePermissionRepo.create({
            roleId: role.id,
            permissionId: permission.id
          });
          await rolePermissionRepo.save(rolePermission);
        }
      }
    }

    // Create default admin user if not exists
    let adminUser = await userRepo.findOne({ where: { email: "admin@fleetmanagement.com" } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      adminUser = userRepo.create({
        email: "admin@fleetmanagement.com",
        passwordHash: hashedPassword,
        firstName: "System",
        lastName: "Administrator",
        phoneNumber: "+1234567890",
        isActive: true
      });
      await userRepo.save(adminUser);
      console.log("Created admin user: admin@fleetmanagement.com / Admin@123");

      // Assign Super Admin role
      const superAdminRole = createdRoles["Super Admin"];
      if (superAdminRole) {
        const userRole = userRoleRepo.create({
          userId: adminUser.id,
          roleId: superAdminRole.id
        });
        await userRoleRepo.save(userRole);
        console.log("Assigned Super Admin role to admin user");
      }
    }

    console.log("\n✓ Database seeding completed successfully!");
    console.log("\nDefault Admin Credentials:");
    console.log("Email: admin@fleetmanagement.com");
    console.log("Password: Admin@123");
    console.log("\nPlease change the password after first login.");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
