import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

const authService = new AuthService();
const userService = new UserService();

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Authorization middleware
 * Checks if user has required permission
 */
export const authorize = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      // Check if user has the required permission
      const hasPermission = await userService.hasPermission(req.user.userId, requiredPermission);

      if (!hasPermission) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
};

/**
 * Role-based authorization middleware
 * Checks if user has one of the required roles
 */
export const authorizeRoles = (...requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const hasRole = req.user.roles.some(role => requiredRoles.includes(role));

      if (!hasRole) {
        res.status(403).json({ error: "Insufficient role permissions" });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
};
