import { Response } from "express";
import { DriverService } from "../services/driver.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { DriverStatus, DriverCertificationData, CertificationStatus } from "../entities/Driver";

const driverService = new DriverService();

export class DriverController {
  /**
   * Create driver
   */
  async createDriver(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        employeeNumber,
        firstName,
        lastName,
        email,
        phone,
        address,
        licenseNumber,
        licenseClass,
        licenseIssueDate,
        licenseExpiryDate,
        licenseIssuingCountry,
        certifications,
        dateOfBirth,
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        yearsOfExperience,
        hireDate,
        notes
      } = req.body;

      if (!firstName || !lastName || !email || !phone || !licenseNumber || !licenseClass || !licenseExpiryDate) {
        res.status(400).json({
          error: "First name, last name, email, phone, license number, license class, and license expiry date are required"
        });
        return;
      }

      const driver = await driverService.createDriver(
        {
          employeeNumber,
          firstName,
          lastName,
          email,
          phone,
          address,
          licenseNumber,
          licenseClass,
          licenseIssueDate: licenseIssueDate ? new Date(licenseIssueDate) : undefined,
          licenseExpiryDate: new Date(licenseExpiryDate),
          licenseIssuingCountry,
          certifications,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          bloodGroup,
          emergencyContactName,
          emergencyContactPhone,
          yearsOfExperience,
          hireDate: hireDate ? new Date(hireDate) : undefined,
          notes
        },
        req.user!.userId
      );

      res.status(201).json({
        message: "Driver created successfully",
        driver
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Driver creation failed" });
    }
  }

  /**
   * Get driver by ID
   */
  async getDriverById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const driver = await driverService.getDriverById(id);

      res.json({ driver });
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Driver not found" });
    }
  }

  /**
   * Get all drivers
   */
  async getAllDrivers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, search, licenseExpiring } = req.query;

      const filters: any = {};
      if (status) {
        filters.status = status as DriverStatus;
      }
      if (search) {
        filters.search = search as string;
      }
      if (licenseExpiring === "true") {
        filters.licenseExpiring = true;
      }

      const drivers = await driverService.getAllDrivers(filters);

      res.json({
        drivers,
        total: drivers.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch drivers" });
    }
  }

  /**
   * Update driver
   */
  async updateDriver(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const {
        employeeNumber,
        firstName,
        lastName,
        email,
        phone,
        address,
        licenseNumber,
        licenseClass,
        licenseIssueDate,
        licenseExpiryDate,
        licenseIssuingCountry,
        dateOfBirth,
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        yearsOfExperience,
        hireDate,
        notes
      } = req.body;

      const driver = await driverService.updateDriver(
        id,
        {
          employeeNumber,
          firstName,
          lastName,
          email,
          phone,
          address,
          licenseNumber,
          licenseClass,
          licenseIssueDate: licenseIssueDate ? new Date(licenseIssueDate) : undefined,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : undefined,
          licenseIssuingCountry,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          bloodGroup,
          emergencyContactName,
          emergencyContactPhone,
          yearsOfExperience,
          hireDate: hireDate ? new Date(hireDate) : undefined,
          notes
        },
        req.user!.userId
      );

      res.json({
        message: "Driver updated successfully",
        driver
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Driver update failed" });
    }
  }

  /**
   * Update driver status
   */
  async updateDriverStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status || !Object.values(DriverStatus).includes(status)) {
        res.status(400).json({ error: "Valid status is required" });
        return;
      }

      const driver = await driverService.updateDriverStatus(
        id,
        status,
        req.user!.userId
      );

      res.json({
        message: "Driver status updated successfully",
        driver
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Status update failed" });
    }
  }

  /**
   * Add certification
   */
  async addCertification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const {
        certificationType,
        certificationNumber,
        issueDate,
        expiryDate,
        issuingAuthority,
        documentUrl,
        status
      } = req.body;

      if (!certificationType || !status) {
        res.status(400).json({ error: "Certification type and status are required" });
        return;
      }

      const certification: DriverCertificationData = {
        certificationType,
        certificationNumber,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        issuingAuthority,
        documentUrl,
        status
      };

      const driver = await driverService.addCertification(
        id,
        certification,
        req.user!.userId
      );

      res.json({
        message: "Certification added successfully",
        driver
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to add certification" });
    }
  }

  /**
   * Update certification
   */
  async updateCertification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const index = parseInt(req.params.index as string);
      const {
        certificationType,
        certificationNumber,
        issueDate,
        expiryDate,
        issuingAuthority,
        documentUrl,
        status
      } = req.body;

      if (isNaN(index)) {
        res.status(400).json({ error: "Valid certification index is required" });
        return;
      }

      const certification: Partial<DriverCertificationData> = {
        certificationType,
        certificationNumber,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        issuingAuthority,
        documentUrl,
        status
      };

      const driver = await driverService.updateCertification(
        id,
        index,
        certification,
        req.user!.userId
      );

      res.json({
        message: "Certification updated successfully",
        driver
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update certification" });
    }
  }

  /**
   * Delete certification
   */
  async deleteCertification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const index = parseInt(req.params.index as string);

      if (isNaN(index)) {
        res.status(400).json({ error: "Valid certification index is required" });
        return;
      }

      const driver = await driverService.deleteCertification(
        id,
        index,
        req.user!.userId
      );

      res.json({
        message: "Certification deleted successfully",
        driver
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete certification" });
    }
  }

  /**
   * Delete driver
   */
  async deleteDriver(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      await driverService.deleteDriver(id, req.user!.userId);

      res.json({ message: "Driver deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Driver deletion failed" });
    }
  }

  /**
   * Get drivers with expiring licenses
   */
  async getExpiringLicenses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      const drivers = await driverService.getDriversWithExpiringLicenses(days);

      res.json({
        drivers,
        total: drivers.length,
        daysThreshold: days
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch expiring licenses" });
    }
  }

  /**
   * Get available drivers
   */
  async getAvailableDrivers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const drivers = await driverService.getAvailableDrivers();

      res.json({
        drivers,
        total: drivers.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch available drivers" });
    }
  }
}
