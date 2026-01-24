import { Repository, Like, In, IsNull, Not } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Driver, DriverStatus, DriverCertificationData } from "../entities/Driver";
import { AuditLog } from "../entities/AuditLog";

export class DriverService {
  private driverRepository: Repository<Driver>;
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.driverRepository = AppDataSource.getRepository(Driver);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create a new driver
   */
  async createDriver(
    data: {
      employeeNumber?: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address?: string;
      licenseNumber: string;
      licenseClass: string;
      licenseIssueDate?: Date;
      licenseExpiryDate: Date;
      licenseIssuingCountry?: string;
      certifications?: DriverCertificationData[];
      dateOfBirth?: Date;
      bloodGroup?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      yearsOfExperience?: number;
      hireDate?: Date;
      notes?: string;
    },
    createdBy: string
  ): Promise<Driver> {
    // Check if email already exists
    const existingEmail = await this.driverRepository.findOne({
      where: { email: data.email }
    });
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Check if license number already exists
    const existingLicense = await this.driverRepository.findOne({
      where: { licenseNumber: data.licenseNumber }
    });
    if (existingLicense) {
      throw new Error("License number already exists");
    }

    // Check if employee number already exists (if provided)
    if (data.employeeNumber) {
      const existingEmployee = await this.driverRepository.findOne({
        where: { employeeNumber: data.employeeNumber }
      });
      if (existingEmployee) {
        throw new Error("Employee number already exists");
      }
    }

    const driver = this.driverRepository.create({
      ...data,
      status: DriverStatus.ACTIVE,
      certifications: data.certifications || []
    });

    await this.driverRepository.save(driver);

    // Create audit log
    await this.createAuditLog(
      "DRIVER_CREATED",
      createdBy,
      "Driver",
      driver.id,
      `Driver ${driver.firstName} ${driver.lastName} created`
    );

    return driver;
  }

  /**
   * Get driver by ID
   */
  async getDriverById(driverId: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId }
    });

    if (!driver) {
      throw new Error("Driver not found");
    }

    return driver;
  }

  /**
   * Get all drivers with optional filters
   */
  async getAllDrivers(filters?: {
    status?: DriverStatus;
    search?: string;
    licenseExpiring?: boolean; // Expiring within 30 days
  }): Promise<Driver[]> {
    const queryBuilder = this.driverRepository.createQueryBuilder("driver");

    if (filters?.status) {
      queryBuilder.andWhere("driver.status = :status", { status: filters.status });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(driver.firstName ILIKE :search OR driver.lastName ILIKE :search OR driver.email ILIKE :search OR driver.employeeNumber ILIKE :search OR driver.licenseNumber ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.licenseExpiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      queryBuilder.andWhere("driver.licenseExpiryDate <= :expiryDate", {
        expiryDate: thirtyDaysFromNow
      });
    }

    queryBuilder.orderBy("driver.firstName", "ASC");

    return await queryBuilder.getMany();
  }

  /**
   * Update driver
   */
  async updateDriver(
    driverId: string,
    data: {
      employeeNumber?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      address?: string;
      licenseNumber?: string;
      licenseClass?: string;
      licenseIssueDate?: Date;
      licenseExpiryDate?: Date;
      licenseIssuingCountry?: string;
      dateOfBirth?: Date;
      bloodGroup?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      yearsOfExperience?: number;
      hireDate?: Date;
      notes?: string;
    },
    updatedBy: string
  ): Promise<Driver> {
    const driver = await this.getDriverById(driverId);

    // Check email uniqueness if being updated
    if (data.email && data.email !== driver.email) {
      const existingEmail = await this.driverRepository.findOne({
        where: { email: data.email, id: Not(driverId) }
      });
      if (existingEmail) {
        throw new Error("Email already exists");
      }
    }

    // Check license number uniqueness if being updated
    if (data.licenseNumber && data.licenseNumber !== driver.licenseNumber) {
      const existingLicense = await this.driverRepository.findOne({
        where: { licenseNumber: data.licenseNumber, id: Not(driverId) }
      });
      if (existingLicense) {
        throw new Error("License number already exists");
      }
    }

    // Check employee number uniqueness if being updated
    if (data.employeeNumber && data.employeeNumber !== driver.employeeNumber) {
      const existingEmployee = await this.driverRepository.findOne({
        where: { employeeNumber: data.employeeNumber, id: Not(driverId) }
      });
      if (existingEmployee) {
        throw new Error("Employee number already exists");
      }
    }

    Object.assign(driver, data);
    await this.driverRepository.save(driver);

    // Create audit log
    await this.createAuditLog(
      "DRIVER_UPDATED",
      updatedBy,
      "Driver",
      driver.id,
      `Driver ${driver.firstName} ${driver.lastName} updated`
    );

    return driver;
  }

  /**
   * Update driver status
   */
  async updateDriverStatus(
    driverId: string,
    status: DriverStatus,
    updatedBy: string
  ): Promise<Driver> {
    const driver = await this.getDriverById(driverId);

    const oldStatus = driver.status;
    driver.status = status;

    // If terminating, set termination date
    if (status === DriverStatus.TERMINATED && !driver.terminationDate) {
      driver.terminationDate = new Date();
    }

    await this.driverRepository.save(driver);

    // Create audit log
    await this.createAuditLog(
      "DRIVER_STATUS_CHANGED",
      updatedBy,
      "Driver",
      driver.id,
      `Driver ${driver.firstName} ${driver.lastName} status changed from ${oldStatus} to ${status}`
    );

    return driver;
  }

  /**
   * Add certification to driver
   */
  async addCertification(
    driverId: string,
    certification: DriverCertificationData,
    updatedBy: string
  ): Promise<Driver> {
    const driver = await this.getDriverById(driverId);

    driver.certifications = driver.certifications || [];
    driver.certifications.push(certification);

    await this.driverRepository.save(driver);

    // Create audit log
    await this.createAuditLog(
      "DRIVER_CERTIFICATION_ADDED",
      updatedBy,
      "Driver",
      driver.id,
      `Certification ${certification.certificationType} added to driver ${driver.firstName} ${driver.lastName}`
    );

    return driver;
  }

  /**
   * Update certification
   */
  async updateCertification(
    driverId: string,
    certificationIndex: number,
    certification: Partial<DriverCertificationData>,
    updatedBy: string
  ): Promise<Driver> {
    const driver = await this.getDriverById(driverId);

    if (!driver.certifications || !driver.certifications[certificationIndex]) {
      throw new Error("Certification not found");
    }

    driver.certifications[certificationIndex] = {
      ...driver.certifications[certificationIndex],
      ...certification
    };

    await this.driverRepository.save(driver);

    // Create audit log
    await this.createAuditLog(
      "DRIVER_CERTIFICATION_UPDATED",
      updatedBy,
      "Driver",
      driver.id,
      `Certification updated for driver ${driver.firstName} ${driver.lastName}`
    );

    return driver;
  }

  /**
   * Delete certification
   */
  async deleteCertification(
    driverId: string,
    certificationIndex: number,
    updatedBy: string
  ): Promise<Driver> {
    const driver = await this.getDriverById(driverId);

    if (!driver.certifications || !driver.certifications[certificationIndex]) {
      throw new Error("Certification not found");
    }

    driver.certifications.splice(certificationIndex, 1);
    await this.driverRepository.save(driver);

    // Create audit log
    await this.createAuditLog(
      "DRIVER_CERTIFICATION_DELETED",
      updatedBy,
      "Driver",
      driver.id,
      `Certification deleted for driver ${driver.firstName} ${driver.lastName}`
    );

    return driver;
  }

  /**
   * Soft delete driver
   */
  async deleteDriver(driverId: string, deletedBy: string): Promise<void> {
    const driver = await this.getDriverById(driverId);

    await this.driverRepository.softDelete(driverId);

    // Create audit log
    await this.createAuditLog(
      "DRIVER_DELETED",
      deletedBy,
      "Driver",
      driver.id,
      `Driver ${driver.firstName} ${driver.lastName} deleted`
    );
  }

  /**
   * Get drivers with expiring licenses
   */
  async getDriversWithExpiringLicenses(daysThreshold: number = 30): Promise<Driver[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return await this.driverRepository
      .createQueryBuilder("driver")
      .where("driver.licenseExpiryDate <= :thresholdDate", { thresholdDate })
      .andWhere("driver.licenseExpiryDate >= :today", { today: new Date() })
      .orderBy("driver.licenseExpiryDate", "ASC")
      .getMany();
  }

  /**
   * Get available drivers (active and off-duty)
   */
  async getAvailableDrivers(): Promise<Driver[]> {
    return await this.driverRepository.find({
      where: [
        { status: DriverStatus.ACTIVE },
        { status: DriverStatus.OFF_DUTY }
      ],
      order: { firstName: "ASC" }
    });
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
