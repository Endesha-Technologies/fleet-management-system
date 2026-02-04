import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/login", (req, res) => authController.login(req, res));
router.post("/password/reset-request", (req, res) => authController.requestPasswordReset(req, res));
router.post("/password/reset", (req, res) => authController.resetPassword(req, res));

// Protected routes (require authentication)
router.post("/logout", (req, res) => authController.logout(req, res));
router.post("/password/change", (req, res) => authController.changePassword(req, res));
router.get("/profile", (req, res) => authController.getProfile(req, res));

export default router;
