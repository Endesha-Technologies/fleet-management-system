import { Response } from "express";
import { UserService } from "../services/user.service";
import { AuthRequest } from "../middleware/auth.middleware";

const userService = new UserService();

export class UserController {
  /**
   * Create user
   */
  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, roleIds } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: "Email, password, first name, and last name are required" });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
      }

      const user = await userService.createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        roleIds: roleIds || [],
        createdBy: req.user!.userId
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isActive: user.isActive,
          roles: user.roles?.map(ur => ur.role.name) || []
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "User creation failed" });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const user = await userService.getUserById(id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          roles: user.userRoles?.map((ur: any) => ({
            id: ur.role.id,
            name: ur.role.name,
            permissions: ur.role.rolePermissions?.map((rp: any) => rp.permission.code) || []
          })) || []
        }
      });
    } catch (error: any) {
      res.status(404).json({ error: error.message || "User not found" });
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { isActive, roleId, search } = req.query;

      const filters: any = {};
      if (isActive !== undefined) {
        filters.isActive = isActive === "true";
      }
      if (roleId) {
        filters.roleId = roleId as string;
      }
      if (search) {
        filters.search = search as string;
      }

      const users = await userService.getAllUsers(filters);

      res.json({
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          roles: user.roles?.map(ur => ur.role.name) || []
        })),
        total: users.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch users" });
    }
  }

  /**
   * Update user
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { firstName, lastName, phone, email } = req.body;

      const user = await userService.updateUser(
        id,
        { firstName, lastName, phone, email },
        req.user!.userId
      );

      res.json({
        message: "User updated successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "User update failed" });
    }
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        res.status(400).json({ error: "isActive must be a boolean value" });
        return;
      }

      await userService.updateUserStatus(id, isActive, req.user!.userId);

      const message = isActive ? "User activated successfully" : "User deactivated successfully";
      res.json({ message });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "User status update failed" });
    }
  }

  /**
   * Assign roles to user
   */
  async assignRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { roleIds } = req.body;

      if (!roleIds || !Array.isArray(roleIds)) {
        res.status(400).json({ error: "Role IDs array is required" });
        return;
      }

      await userService.assignRolesToUser(id, roleIds);

      res.json({ message: "Roles assigned successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Role assignment failed" });
    }
  }
}
