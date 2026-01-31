import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Role } from "../entities/Role";
import { Permission } from "../entities/Permission";
import { RolePermission } from "../entities/RolePermission";
import { AuditLog } from "../entities/AuditLog";

export class RoleService {
  private roleRepository: Repository<Role>;
  private permissionRepository: Repository<Permission>;
  private rolePermissionRepository: Repository<RolePermission>;
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
    this.permissionRepository = AppDataSource.getRepository(Permission);
    this.rolePermissionRepository = AppDataSource.getRepository(RolePermission);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create a new role
   */
  async createRole(
    data: {
      name: string;
      description?: string;
      permissionIds?: string[];
    },
    createdBy: string
  ): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: data.name }
    });

    if (existingRole) {
      throw new Error("Role name already exists");
    }

    // Create role
    const role = this.roleRepository.create({
      name: data.name,
      description: data.description,
      isSystem: false
    });

    await this.roleRepository.save(role);

    // Assign permissions if provided
    if (data.permissionIds && data.permissionIds.length > 0) {
      await this.assignPermissionsToRole(role.id, data.permissionIds);
    }

    // Create audit log
    await this.createAuditLog(
      "ROLE_CREATED",
      createdBy,
      "Role",
      role.id,
      `Role ${role.name} created`
    );

    return await this.getRoleById(role.id);
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ["permissions", "permissions.permission"]
    });

    if (!role) {
      throw new Error("Role not found");
    }

    return role;
  }

  /**
   * Get all roles
   */
  async getAllRoles(filters?: { isActive?: boolean }): Promise<Role[]> {
    const queryBuilder = this.roleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permissions", "rolePermission")
      .leftJoinAndSelect("rolePermission.permission", "permission");

    if (filters?.isActive !== undefined) {
      queryBuilder.where("role.isActive = :isActive", { isActive: filters.isActive });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Update role
   */
  async updateRole(
    roleId: string,
    data: {
      name?: string;
      description?: string;
    },
    updatedBy: string
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);

    // Check if new name already exists
    if (data.name && data.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: data.name }
      });

      if (existingRole) {
        throw new Error("Role name already exists");
      }
    }

    // Update role
    Object.assign(role, data);
    await this.roleRepository.save(role);

    // Create audit log
    await this.createAuditLog(
      "ROLE_UPDATED",
      updatedBy,
      "Role",
      roleId,
      `Role ${role.name} updated`
    );

    return await this.getRoleById(roleId);
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string, deletedBy: string): Promise<void> {
    const role = await this.getRoleById(roleId);

    // Remove role permissions
    await this.rolePermissionRepository.delete({ roleId });

    // Delete role
    await this.roleRepository.remove(role);

    // Create audit log
    await this.createAuditLog(
      "ROLE_DELETED",
      deletedBy,
      "Role",
      roleId,
      `Role ${role.name} deleted`
    );
  }

  /**
   * Assign permissions to role
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    // Remove existing permissions
    await this.rolePermissionRepository.delete({ roleId });

    // Add new permissions
    for (const permissionId of permissionIds) {
      await this.rolePermissionRepository.save({
        roleId,
        permissionId
      });
    }
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ["permission"]
    });

    return rolePermissions.map(rp => rp.permission);
  }

  /**
   * Create permission
   */
  async createPermission(
    data: {
      name: string;
      code: string;
      description?: string;
    },
    createdBy: string
  ): Promise<Permission> {
    // Check if permission code already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: data.code }
    });

    if (existingPermission) {
      throw new Error("Permission code already exists");
    }

    // Parse code to extract resource and action (e.g., "user:create" -> resource="user", action="create")
    const [resource, action] = data.code.split(":");
    if (!resource || !action) {
      throw new Error("Permission code must be in format 'resource:action' (e.g., 'user:create')");
    }

    // Create permission
    const permission = this.permissionRepository.create({
      name: data.name,
      code: data.code,
      resource,
      action,
      description: data.description
    });

    await this.permissionRepository.save(permission);

    // Create audit log
    await this.createAuditLog(
      "PERMISSION_CREATED",
      createdBy,
      "Permission",
      permission.id,
      `Permission ${permission.code} created`
    );

    return permission;
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { code: "ASC" }
    });
  }

  /**
   * Create audit log
   */
  private async createAuditLog(
    action: string,
    performedBy: string,
    entityType: string,
    entityId: string,
    description: string
  ): Promise<void> {
    await this.auditLogRepository.save({
      action,
      performedBy,
      entityType,
      entityId,
      description
    });
  }
}
