import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

const authService = new AuthService();

export class AuthController {
  /**
   * Login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const ipAddress = req.ip;
      const userAgent = req.get("user-agent");

      const result = await authService.login(email, password, ipAddress, userAgent);

      res.json({
        message: "Login successful",
        token: result.token,
        sessionId: result.sessionId,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          roles: result.user.userRoles?.map((ur: any) => ur.role.name) || []
        }
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Login failed" });
    }
  }

  /**
   * Logout
   */
  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.body;

      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      await authService.logout(req.user.userId, sessionId);

      res.json({ message: "Logout successful" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Logout failed" });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const token = await authService.requestPasswordReset(email);

      // In production, send this token via email
      // For development, return it in response
      res.json({
        message: "Password reset email sent",
        // Remove this in production:
        resetToken: token
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Password reset request failed" });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: "Token and new password are required" });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
      }

      await authService.resetPassword(token, newPassword);

      res.json({ message: "Password reset successful" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Password reset failed" });
    }
  }

  /**
   * Change password
   */
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: "Current password and new password are required" });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
      }

      await authService.changePassword(req.user.userId, currentPassword, newPassword);

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Password change failed" });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      res.json({ user: req.user });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get profile" });
    }
  }
}
