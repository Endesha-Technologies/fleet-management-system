import { Repository, Not, LessThanOrEqual, MoreThan } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Truck, TruckStatus, FuelType, Ownership } from "../entities/Truck";
import { TruckDocument, DocumentType } from "../entities/TruckDocument";
import { TruckSpecification } from "../entities/TruckSpecification";
import { AuditLog } from "../entities/AuditLog";

export class TruckService {
  private truckRepository: Repository<Truck>;
  private truckDocumentRepository: Repository<TruckDocument>;
  private truckSpecificationRepository: Repository<TruckSpecification>;
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.truckRepository = AppDataSource.getRepository(Truck);
    this.truckDocumentRepository = AppDataSource.getRepository(TruckDocument);
    this.truckSpecificationRepository = AppDataSource.getRepository(TruckSpecification);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create a new truck
   */
  async createTruck(
    data: {
      registrationNumber: string;
      vin: string;
      make: string;
      model: string;
      year: number;
      color?: string;
      fuelType: FuelType;
      fuelCapacityLitres?: number;
      engineNumber?: string;
      chassisNumber?: string;
      purchaseDate?: Date;
      purchasePrice?: number;
      currentOdometer?: number;
      currentEngineHours?: number;
      ownership?: Ownership;
      insurancePolicyNumber?: string;
      insuranceExpiryDate?: Date;
      roadTaxExpiryDate?: Date;
      fitnessExpiryDate?: Date;
      permitExpiryDate?: Date;
      gprsDeviceId?: string;
      notes?: string;
      specification?: {
        grossVehicleWeight?: number;
        cargoCapacityKg?: number;
        cargoVolumeCubicMeters?: number;
        numberOfAxles?: number;
        numberOfWheels?: number;
        tyreSize?: string;
        transmissionType?: string;
        engineCapacityCC?: number;
        horsePower?: number;
        dimensions?: any;
      };
      documents?: Array<{
        documentType: DocumentType;
        documentNumber?: string;
        issueDate?: Date;
        expiryDate?: Date;
        documentUrl: string;
        notes?: string;
      }>;
    },
    createdBy: string
  ): Promise<Truck> {
    // Check if registration number already exists
    const existingReg = await this.truckRepository.findOne({
      where: { registrationNumber: data.registrationNumber }
    });
    if (existingReg) {
      throw new Error("Registration number already exists");
    }

    // Check if VIN already exists
    const existingVin = await this.truckRepository.findOne({
      where: { vin: data.vin }
    });
    if (existingVin) {
      throw new Error("VIN already exists");
    }

    const { specification, documents, ...truckData } = data;

    const truck = this.truckRepository.create({
      ...truckData,
      status: TruckStatus.ACTIVE,
      currentOdometer: truckData.currentOdometer || 0,
      currentEngineHours: truckData.currentEngineHours || 0
    });

    await this.truckRepository.save(truck);

    // Create specification if provided
    if (specification) {
      const spec = this.truckSpecificationRepository.create({
        truckId: truck.id,
        ...specification
      });
      await this.truckSpecificationRepository.save(spec);
    }

    // Create documents if provided
    if (documents && documents.length > 0) {
      for (const docData of documents) {
        const document = this.truckDocumentRepository.create({
          truckId: truck.id,
          ...docData,
          uploadedBy: createdBy
        });
        await this.truckDocumentRepository.save(document);
      }
    }

    // Create audit log
    await this.createAuditLog(
      "TRUCK_CREATED",
      createdBy,
      "Truck",
      truck.id,
      `Truck ${truck.registrationNumber} created`
    );

    return truck;
  }

  /**
   * Get truck by ID with specifications and documents
   */
  async getTruckById(truckId: string): Promise<Truck & { specification?: TruckSpecification; documents?: TruckDocument[] }> {
    const truck = await this.truckRepository.findOne({
      where: { id: truckId }
    });

    if (!truck) {
      throw new Error("Truck not found");
    }

    // Fetch specification
    const specification = await this.truckSpecificationRepository.findOne({
      where: { truckId }
    });

    // Fetch documents
    const documents = await this.truckDocumentRepository.find({
      where: { truckId },
      order: { createdAt: "DESC" }
    });

    return {
      ...truck,
      specification: specification || undefined,
      documents: documents.length > 0 ? documents : undefined
    };
  }

  /**
   * Get all trucks with filters
   */
  async getAllTrucks(filters?: {
    status?: TruckStatus;
    ownership?: Ownership;
    fuelType?: FuelType;
    search?: string;
    expiringDocuments?: boolean; // Within 30 days
  }): Promise<Truck[]> {
    const queryBuilder = this.truckRepository.createQueryBuilder("truck");

    if (filters?.status) {
      queryBuilder.andWhere("truck.status = :status", { status: filters.status });
    }

    if (filters?.ownership) {
      queryBuilder.andWhere("truck.ownership = :ownership", { ownership: filters.ownership });
    }

    if (filters?.fuelType) {
      queryBuilder.andWhere("truck.fuelType = :fuelType", { fuelType: filters.fuelType });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(truck.registrationNumber ILIKE :search OR truck.vin ILIKE :search OR truck.make ILIKE :search OR truck.model ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.expiringDocuments) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      queryBuilder.andWhere(
        "(truck.insuranceExpiryDate <= :expiryDate OR truck.roadTaxExpiryDate <= :expiryDate OR truck.fitnessExpiryDate <= :expiryDate OR truck.permitExpiryDate <= :expiryDate)",
        { expiryDate: thirtyDaysFromNow }
      );
    }

    queryBuilder.orderBy("truck.registrationNumber", "ASC");

    return await queryBuilder.getMany();
  }

  /**
   * Update truck with optional specifications and documents
   */
  async updateTruck(
    truckId: string,
    data: {
      registrationNumber?: string;
      color?: string;
      currentOdometer?: number;
      currentEngineHours?: number;
      insurancePolicyNumber?: string;
      insuranceExpiryDate?: Date;
      roadTaxExpiryDate?: Date;
      fitnessExpiryDate?: Date;
      permitExpiryDate?: Date;
      gprsDeviceId?: string;
      notes?: string;
      specification?: {
        grossVehicleWeight?: number;
        cargoCapacityKg?: number;
        cargoVolumeCubicMeters?: number;
        numberOfAxles?: number;
        numberOfWheels?: number;
        tyreSize?: string;
        transmissionType?: string;
        engineCapacityCC?: number;
        horsePower?: number;
        dimensions?: any;
      };
      documents?: Array<{
        documentType: DocumentType;
        documentNumber?: string;
        issueDate?: Date;
        expiryDate?: Date;
        documentUrl: string;
        notes?: string;
      }>;
    },
    updatedBy: string
  ): Promise<Truck> {
    const truckData = await this.truckRepository.findOne({
      where: { id: truckId }
    });

    if (!truckData) {
      throw new Error("Truck not found");
    }

    const { specification, documents, ...updateData } = data;

    // Check registration number uniqueness if being updated
    if (updateData.registrationNumber && updateData.registrationNumber !== truckData.registrationNumber) {
      const existingReg = await this.truckRepository.findOne({
        where: { registrationNumber: updateData.registrationNumber, id: Not(truckId) }
      });
      if (existingReg) {
        throw new Error("Registration number already exists");
      }
    }

    Object.assign(truckData, updateData);
    await this.truckRepository.save(truckData);

    // Update or create specification if provided
    if (specification) {
      const existingSpec = await this.truckSpecificationRepository.findOne({
        where: { truckId }
      });

      if (existingSpec) {
        Object.assign(existingSpec, specification);
        await this.truckSpecificationRepository.save(existingSpec);
      } else {
        const newSpec = this.truckSpecificationRepository.create({
          truckId,
          ...specification
        });
        await this.truckSpecificationRepository.save(newSpec);
      }
    }

    // Add new documents if provided
    if (documents && documents.length > 0) {
      for (const docData of documents) {
        const document = this.truckDocumentRepository.create({
          truckId,
          ...docData,
          uploadedBy: updatedBy
        });
        await this.truckDocumentRepository.save(document);
      }
    }

    // Create audit log
    await this.createAuditLog(
      "TRUCK_UPDATED",
      updatedBy,
      "Truck",
      truckData.id,
      `Truck ${truckData.registrationNumber} updated`
    );

    return truckData;
  }

  /**
   * Soft delete truck along with specifications and documents
   */
  async deleteTruck(truckId: string, deletedBy: string): Promise<void> {
    const truckData = await this.truckRepository.findOne({
      where: { id: truckId }
    });

    if (!truckData) {
      throw new Error("Truck not found");
    }

    // Delete specifications
    await this.truckSpecificationRepository.delete({ truckId });

    // Delete documents
    await this.truckDocumentRepository.delete({ truckId });

    // Soft delete truck
    await this.truckRepository.softDelete(truckId);

    // Create audit log
    await this.createAuditLog(
      "TRUCK_DELETED",
      deletedBy,
      "Truck",
      truckData.id,
      `Truck ${truckData.registrationNumber} deleted with specifications and documents`
    );
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
