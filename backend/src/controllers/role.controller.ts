import { Response } from "express";
import { RoleService } from "../services/role.service";
import { AuthRequest } from "../middleware/auth.middleware";

const roleService = new RoleService();

export class RoleController {
  /**
   * Create role
   */
  async createRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, permissionIds } = req.body;

      if (!name) {
        res.status(400).json({ error: "Role name is required" });
        return;
      }

      const role = await roleService.createRole(
        { name, description, permissionIds: permissionIds || [] },
        req.user!.userId
      );

      res.status(201).json({
        message: "Role created successfully",
        role: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.rolePermissions?.map((rp: any) => rp.permission.code) || []
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Role creation failed" });
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const role = await roleService.getRoleById(id);

      res.json({
        role: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.rolePermissions?.map((rp: any) => ({
            id: rp.permission.id,
            code: rp.permission.code,
            name: rp.permission.name,
            description: rp.permission.description
          })) || []
        }
      });
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Role not found" });
    }
  }

  /**
   * Get all roles
   */
  async getAllRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roles = await roleService.getAllRoles();

      res.json({
        roles: roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissionCount: role.rolePermissions?.length || 0
        })),
        total: roles.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch roles" });
    }
  }

  /**
   * Update role
   */
  async updateRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { name, description } = req.body;

      const role = await roleService.updateRole(
        id,
        { name, description },
        req.user!.userId
      );

      res.json({
        message: "Role updated successfully",
        role: {
          id: role.id,
          name: role.name,
          description: role.description
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Role update failed" });
    }
  }

  /**
   * Delete role
   */
  async deleteRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      await roleService.deleteRole(id, req.user!.userId);

      res.json({ message: "Role deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Role deletion failed" });
    }
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = await roleService.getAllPermissions();

      res.json({
        permissions: permissions.map((p: any) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          description: p.description
        })),
        total: permissions.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch permissions" });
    }
  }
}
