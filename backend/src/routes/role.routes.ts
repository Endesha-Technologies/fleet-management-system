import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const roleController = new RoleController();

// All routes require authentication
router.use(authenticate);

// Role management routes
router.post("/", authorize("role:create"), (req, res) => roleController.createRole(req, res));
router.get("/", authorize("role:read"), (req, res) => roleController.getAllRoles(req, res));
router.get("/:id", authorize("role:read"), (req, res) => roleController.getRoleById(req, res));
router.put("/:id", authorize("role:update"), (req, res) => roleController.updateRole(req, res));
router.delete("/:id", authorize("role:delete"), (req, res) => roleController.deleteRole(req, res));

// Permission management routes
router.get("/permissions", authorize("permission:read"), (req, res) => roleController.getAllPermissions(req, res));

export default router;
