import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { UserRole } from "../entities/UserRole";
import { Role } from "../entities/Role";
import { AuditLog } from "../entities/AuditLog";

export class UserService {
  private userRepository: Repository<User>;
  private userRoleRepository: Repository<UserRole>;
  private roleRepository: Repository<Role>;
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleRepository = AppDataSource.getRepository(UserRole);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleIds: string[];
    createdBy: string;
  }): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phone,
      isActive: true
    });

    await this.userRepository.save(user);

    // Assign roles
    if (data.roleIds && data.roleIds.length > 0) {
      await this.assignRolesToUser(user.id, data.roleIds);
    }

    // Create audit log
    await this.createAuditLog(
      "USER_CREATED",
      data.createdBy,
      "User",
      user.id,
      `User ${user.email} created`
    );

    return await this.getUserById(user.id);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["userRoles", "userRoles.role", "userRoles.role.rolePermissions", "userRoles.role.rolePermissions.permission"]
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Get all users
   */
  async getAllUsers(filters?: {
    isActive?: boolean;
    roleId?: string;
    search?: string;
  }): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userRoles", "userRole")
      .leftJoinAndSelect("userRole.role", "role");

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere("user.isActive = :isActive", { isActive: filters.isActive });
    }

    if (filters?.roleId) {
      queryBuilder.andWhere("role.id = :roleId", { roleId: filters.roleId });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    return await queryBuilder.getMany();
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
    },
    updatedBy: string
  ): Promise<User> {
    const user = await this.getUserById(userId);

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error("Email already exists");
      }
    }

    // Update user
    Object.assign(user, data);
    await this.userRepository.save(user);

    // Create audit log
    await this.createAuditLog(
      "USER_UPDATED",
      updatedBy,
      "User",
      userId,
      `User ${user.email} updated`
    );

    return await this.getUserById(userId);
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId: string, isActive: boolean, updatedBy: string): Promise<void> {
    const user = await this.getUserById(userId);

    user.isActive = isActive;
    await this.userRepository.save(user);

    // Create audit log
    const action = isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED";
    const description = isActive ? `User ${user.email} activated` : `User ${user.email} deactivated`;
    
    await this.createAuditLog(
      action,
      updatedBy,
      "User",
      userId,
      description
    );
  }

  /**
   * Assign roles to user
   */
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<void> {
    // Remove existing roles
    await this.userRoleRepository.delete({ userId });

    // Add new roles
    for (const roleId of roleIds) {
      await this.userRoleRepository.save({
        userId,
        roleId
      });
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ["role", "role.rolePermissions", "role.rolePermissions.permission"]
    });

    return userRoles.map(ur => ur.role);
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const roles = await this.getUserRoles(userId);
    const permissions = new Set<string>();

    roles.forEach(role => {
      role.rolePermissions?.forEach(rp => {
        permissions.add(rp.permission.code);
      });
    });

    return Array.from(permissions);
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionCode);
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
