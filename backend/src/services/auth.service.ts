import { Repository, IsNull } from "typeorm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { LoginHistory } from "../entities/LoginHistory";
import { PasswordResetToken } from "../entities/PasswordResetToken";
import { AuditLog } from "../entities/AuditLog";
import * as crypto from "crypto";

export class AuthService {
  private userRepository: Repository<User>;
  private loginHistoryRepository: Repository<LoginHistory>;
  private passwordResetTokenRepository: Repository<PasswordResetToken>;
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.loginHistoryRepository = AppDataSource.getRepository(LoginHistory);
    this.passwordResetTokenRepository = AppDataSource.getRepository(PasswordResetToken);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * User login
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User; token: string; sessionId: string }> {
    const sessionId = crypto.randomUUID();

    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ["userRoles", "userRoles.role", "userRoles.role.rolePermissions", "userRoles.role.rolePermissions.permission"],
        select: { id: true, email: true, firstName: true, lastName: true, passwordHash: true, isActive: true, lastLoginAt: true }
      });

      if (!user) {
        await this.logLoginAttempt(null, email, false, "User not found", ipAddress, userAgent);
        throw new Error("Invalid credentials");
      }

      // Check if user is active
      if (!user.isActive) {
        await this.logLoginAttempt(user.id, email, false, "Account inactive", ipAddress, userAgent, sessionId);
        throw new Error("Account is inactive");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        await this.logLoginAttempt(user.id, email, false, "Invalid password", ipAddress, userAgent, sessionId);
        throw new Error("Invalid credentials");
      }

      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      // Generate JWT token
      const token = this.generateToken(user);

      // Log successful login
      await this.logLoginAttempt(user.id, email, true, null, ipAddress, userAgent, sessionId);

      // Create audit log
      await this.createAuditLog("USER_LOGIN", user.id, "User", user.id, `User ${user.email} logged in`);

      return { user, token, sessionId };
    } catch (error) {
      throw error;
    }
  }

  /**
   * User logout
   */
  async logout(userId: string, sessionId: string): Promise<void> {
    // Update login history with logout time
    const loginHistory = await this.loginHistoryRepository.findOne({
      where: { userId, sessionId, success: true },
      order: { attemptedAt: "DESC" }
    });

    if (loginHistory) {
      loginHistory.loggedOutAt = new Date();
      await this.loginHistoryRepository.save(loginHistory);
    }

    // Create audit log
    await this.createAuditLog("USER_LOGOUT", userId, "User", userId, `User logged out`);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      throw new Error("If the email exists, a reset link will be sent");
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Invalidate old tokens
    await this.passwordResetTokenRepository.update(
      { userId: user.id, usedAt: IsNull() },
      { usedAt: new Date() }
    );

    // Create new token
    await this.passwordResetTokenRepository.save({
      userId: user.id,
      token: hashedToken,
      expiresAt
    });

    // Create audit log
    await this.createAuditLog("PASSWORD_RESET_REQUESTED", user.id, "User", user.id, `Password reset requested`);

    // Return plain token (to be sent via email)
    return token;
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token: hashedToken, usedAt: IsNull() },
      relations: ["user"]
    });

    if (!resetToken) {
      throw new Error("Invalid or expired token");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error("Token has expired");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.userRepository.update(resetToken.userId, {
      passwordHash,
      passwordChangedAt: new Date()
    });

    // Mark token as used
    resetToken.usedAt = new Date();
    await this.passwordResetTokenRepository.save(resetToken);

    // Create audit log
    await this.createAuditLog(
      "PASSWORD_RESET_COMPLETED",
      resetToken.userId,
      "User",
      resetToken.userId,
      `Password was reset`
    );
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    user.passwordHash = passwordHash;
    user.passwordChangedAt = new Date();
    await this.userRepository.save(user);

    // Create audit log
    await this.createAuditLog("PASSWORD_CHANGED", userId, "User", userId, `Password was changed`);
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.userRoles?.map((ur: any) => ur.role.name) || []
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const options: jwt.SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as jwt.SignOptions["expiresIn"]
    };
    
    return jwt.sign(payload, secret, options);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  /**
   * Log login attempt
   */
  private async logLoginAttempt(
    userId: string | null,
    email: string,
    success: boolean,
    failureReason: string | null,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<void> {
    const loginHistory = this.loginHistoryRepository.create({
      userId: userId || undefined,
      email,
      success,
      failureReason: failureReason || undefined,
      ipAddress,
      userAgent,
      sessionId
    });
    await this.loginHistoryRepository.save(loginHistory);
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
