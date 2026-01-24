import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// User management routes
router.post("/", authorize("user:create"), (req, res) => userController.createUser(req, res));
router.get("/", authorize("user:read"), (req, res) => userController.getAllUsers(req, res));
router.get("/:id", authorize("user:read"), (req, res) => userController.getUserById(req, res));
router.put("/:id", authorize("user:update"), (req, res) => userController.updateUser(req, res));
router.patch("/:id/status", authorize("user:update"), (req, res) => userController.updateUserStatus(req, res));

// Role assignment routes
router.post("/:id/roles", authorize("user:update"), (req, res) => userController.assignRoles(req, res));

export default router;
