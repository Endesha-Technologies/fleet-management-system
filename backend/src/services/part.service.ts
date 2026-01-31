import { Repository, Not, LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Part, PartStatus, PartCategory } from "../entities/Part";
import { PartTransaction, TransactionType } from "../entities/PartHistory";
import { PartInstallation, InstallationStatus } from "../entities/PartInstallation";
import { AuditLog } from "../entities/AuditLog";

export class PartService {
  private partRepository: Repository<Part>;
  private partHistoryRepository: Repository<PartTransaction>;
  private partInstallationRepository: Repository<PartInstallation>;
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.partRepository = AppDataSource.getRepository(Part);
    this.partHistoryRepository = AppDataSource.getRepository(PartTransaction);
    this.partInstallationRepository = AppDataSource.getRepository(PartInstallation);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create a new part
   */
  async createPart(
    data: {
      partNumber: string;
      name: string;
      description?: string;
      category: PartCategory;
      manufacturer?: string;
      supplierPartNumber?: string;
      isSerializedAsset?: boolean;
      serialNumber?: string;
      unitOfMeasure?: string;
      minStockLevel?: number;
      maxStockLevel?: number;
      reorderPoint?: number;
      quantityInStock?: number;
      unitCost?: number;
      location?: string;
      notes?: string;
    },
    createdBy: string
  ): Promise<Part> {
    // Check if part number already exists
    const existingPart = await this.partRepository.findOne({
      where: { partNumber: data.partNumber }
    });
    if (existingPart) {
      throw new Error("Part number already exists");
    }

    // Check serial number uniqueness if provided
    if (data.serialNumber) {
      const existingSerial = await this.partRepository.findOne({
        where: { serialNumber: data.serialNumber }
      });
      if (existingSerial) {
        throw new Error("Serial number already exists");
      }
    }

    const part = this.partRepository.create({
      ...data,
      status: PartStatus.ACTIVE,
      quantityInStock: data.quantityInStock || 0,
      quantityReserved: 0,
      unitCost: data.unitCost || 0,
      averageCost: data.unitCost || 0
    });

    await this.partRepository.save(part);

    // Create initial inventory transaction if quantity > 0
    if (part.quantityInStock > 0) {
      await this.createTransaction({
        partId: part.id,
        transactionType: TransactionType.PURCHASE,
        quantityChange: part.quantityInStock,
        unitPrice: part.unitCost,
        totalCost: part.unitCost * part.quantityInStock,
        toLocation: part.location,
        performedBy: createdBy,
        notes: "Initial stock"
      });
    }

    // Create audit log
    await this.createAuditLog(
      "PART_CREATED",
      createdBy,
      "Part",
      part.id,
      `Part ${part.partNumber} - ${part.name} created`
    );

    return part;
  }

  /**
   * Get part by ID
   */
  async getPartById(partId: string): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { id: partId }
    });

    if (!part) {
      throw new Error("Part not found");
    }

    return part;
  }

  /**
   * Get all parts with filters
   */
  async getAllParts(filters?: {
    category?: PartCategory;
    status?: PartStatus;
    search?: string;
    lowStock?: boolean;
  }): Promise<Part[]> {
    const queryBuilder = this.partRepository.createQueryBuilder("part");

    if (filters?.category) {
      queryBuilder.andWhere("part.category = :category", { category: filters.category });
    }

    if (filters?.status) {
      queryBuilder.andWhere("part.status = :status", { status: filters.status });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(part.partNumber ILIKE :search OR part.name ILIKE :search OR part.manufacturer ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.lowStock) {
      queryBuilder.andWhere("part.quantityInStock <= part.reorderPoint");
    }

    queryBuilder.orderBy("part.name", "ASC");

    return await queryBuilder.getMany();
  }

  /**
   * Update part
   */
  async updatePart(
    partId: string,
    data: {
      name?: string;
      description?: string;
      manufacturer?: string;
      supplierPartNumber?: string;
      minStockLevel?: number;
      maxStockLevel?: number;
      reorderPoint?: number;
      unitCost?: number;
      location?: string;
      status?: PartStatus;
      notes?: string;
    },
    updatedBy: string
  ): Promise<Part> {
    const part = await this.getPartById(partId);

    const oldStatus = part.status;
    Object.assign(part, data);
    await this.partRepository.save(part);

    // Create audit log
    let auditMessage = `Part ${part.partNumber} - ${part.name} updated`;
    if (data.status && data.status !== oldStatus) {
      auditMessage += `. Status changed from ${oldStatus} to ${data.status}`;
    }

    await this.createAuditLog(
      "PART_UPDATED",
      updatedBy,
      "Part",
      part.id,
      auditMessage
    );

    return part;
  }

  /**
   * Adjust stock quantity (supports adjustment, sale, disposal, return, transfer)
   */
  async adjustStock(
    partId: string,
    quantityChange: number,
    transactionType: TransactionType,
    reason: string,
    performedBy: string,
    additionalData?: {
      unitPrice?: number;
      buyerName?: string;
      disposalReason?: string;
      referenceNumber?: string;
    }
  ): Promise<Part> {
    const part = await this.getPartById(partId);

    const newQuantity = part.quantityInStock + quantityChange;
    if (newQuantity < 0) {
      throw new Error("Insufficient stock");
    }

    part.quantityInStock = newQuantity;

    // Update status based on stock level
    if (newQuantity === 0) {
      part.status = PartStatus.OUT_OF_STOCK;
    } else if (part.status === PartStatus.OUT_OF_STOCK) {
      part.status = PartStatus.ACTIVE;
    }

    await this.partRepository.save(part);

    // Calculate total cost for sale transactions
    const totalCost = additionalData?.unitPrice ? Math.abs(quantityChange) * additionalData.unitPrice : undefined;

    // Create transaction record
    await this.createTransaction({
      partId: part.id,
      transactionType,
      quantityChange,
      unitPrice: additionalData?.unitPrice,
      totalCost,
      buyerName: additionalData?.buyerName,
      disposalReason: additionalData?.disposalReason,
      referenceNumber: additionalData?.referenceNumber,
      performedBy,
      notes: reason
    });

    // Create audit log with appropriate message
    let auditMessage = `Part ${part.partNumber} stock adjusted by ${quantityChange}. New quantity: ${newQuantity}`;
    if (transactionType === TransactionType.SALE && additionalData?.buyerName) {
      auditMessage = `Sold ${Math.abs(quantityChange)} units of ${part.partNumber} to ${additionalData.buyerName}`;
    } else if (transactionType === TransactionType.DISPOSAL && additionalData?.disposalReason) {
      auditMessage = `Disposed ${Math.abs(quantityChange)} units of ${part.partNumber}. Reason: ${additionalData.disposalReason}`;
    }

    await this.createAuditLog(
      "PART_STOCK_ADJUSTED",
      performedBy,
      "Part",
      part.id,
      auditMessage
    );

    return part;
  }

  /**
   * Record part purchase
   */
  async recordPurchase(
    partId: string,
    quantity: number,
    unitPrice: number,
    referenceNumber: string,
    performedBy: string,
    notes?: string
  ): Promise<Part> {
    const part = await this.getPartById(partId);

    part.quantityInStock += quantity;
    part.lastPurchasePrice = unitPrice;
    part.lastPurchaseDate = new Date();

    // Update average cost
    const totalValue = (part.averageCost * (part.quantityInStock - quantity)) + (unitPrice * quantity);
    part.averageCost = totalValue / part.quantityInStock;

    if (part.status === PartStatus.OUT_OF_STOCK) {
      part.status = PartStatus.ACTIVE;
    }

    await this.partRepository.save(part);

    // Create transaction record
    await this.createTransaction({
      partId: part.id,
      transactionType: TransactionType.PURCHASE,
      quantityChange: quantity,
      unitPrice,
      totalCost: unitPrice * quantity,
      referenceNumber,
      performedBy,
      notes
    });

    // Create audit log
    await this.createAuditLog(
      "PART_PURCHASED",
      performedBy,
      "Part",
      part.id,
      `Purchased ${quantity} units of ${part.partNumber} at ${unitPrice} each`
    );

    return part;
  }

  /**
   * Install part on truck
   */
  async installPart(
    data: {
      partId: string;
      truckId: string;
      installationDate: Date;
      odometerAtInstallation: number;
      engineHoursAtInstallation?: number;
      installedBy: string;
      workOrderId?: string;
      expectedReplacementMileage?: number;
      notes?: string;
    }
  ): Promise<PartInstallation> {
    const part = await this.getPartById(data.partId);

    // Check if part is available
    if (part.quantityInStock < 1) {
      throw new Error("Part not in stock");
    }

    // Reduce stock
    part.quantityInStock -= 1;
    if (part.quantityInStock === 0) {
      part.status = PartStatus.OUT_OF_STOCK;
    }
    await this.partRepository.save(part);

    // Create installation record
    const installation = this.partInstallationRepository.create({
      ...data,
      status: InstallationStatus.INSTALLED
    });

    await this.partInstallationRepository.save(installation);

    // Create transaction record
    await this.createTransaction({
      partId: data.partId,
      transactionType: TransactionType.INSTALL,
      quantityChange: -1,
      truckId: data.truckId,
      workOrderId: data.workOrderId,
      performedBy: data.installedBy,
      notes: data.notes || "Part installed on truck"
    });

    // Create audit log
    await this.createAuditLog(
      "PART_INSTALLED",
      data.installedBy,
      "PartInstallation",
      installation.id,
      `Part ${part.partNumber} installed on truck`
    );

    return installation;
  }

  /**
   * Remove part from truck
   */
  async removePart(
    installationId: string,
    data: {
      removalDate: Date;
      odometerAtRemoval: number;
      engineHoursAtRemoval?: number;
      removalReason: string;
      removedBy: string;
      returnToInventory: boolean;
    }
  ): Promise<PartInstallation> {
    const installation = await this.partInstallationRepository.findOne({
      where: { id: installationId },
      relations: ["part"]
    });

    if (!installation) {
      throw new Error("Part installation not found");
    }

    if (installation.status === InstallationStatus.REMOVED) {
      throw new Error("Part already removed");
    }

    installation.removalDate = data.removalDate;
    installation.odometerAtRemoval = data.odometerAtRemoval;
    if (data.engineHoursAtRemoval !== undefined) {
      installation.engineHoursAtRemoval = data.engineHoursAtRemoval;
    }
    installation.removalReason = data.removalReason;
    installation.removedBy = data.removedBy;
    installation.status = InstallationStatus.REMOVED;

    await this.partInstallationRepository.save(installation);

    // Return to inventory if specified
    if (data.returnToInventory) {
      const part = await this.getPartById(installation.partId);
      part.quantityInStock += 1;
      if (part.status === PartStatus.OUT_OF_STOCK) {
        part.status = PartStatus.ACTIVE;
      }
      await this.partRepository.save(part);

      // Create transaction record
      await this.createTransaction({
        partId: installation.partId,
        transactionType: TransactionType.REMOVE,
        quantityChange: 1,
        truckId: installation.truckId,
        performedBy: data.removedBy,
        notes: `Part removed from truck: ${data.removalReason}`
      });
    }

    // Create audit log
    await this.createAuditLog(
      "PART_REMOVED",
      data.removedBy,
      "PartInstallation",
      installation.id,
      `Part removed from truck. Reason: ${data.removalReason}`
    );

    return installation;
  }

  /**
   * Get part installations for a truck
   */
  async getPartInstallations(
    truckId: string,
    status?: InstallationStatus
  ): Promise<PartInstallation[]> {
    const where: any = { truckId };
    if (status) {
      where.status = status;
    }

    return await this.partInstallationRepository.find({
      where,
      relations: ["part"],
      order: { installationDate: "DESC" }
    });
  }

  /**
   * Get part transaction history
   */
  async getPartHistory(
    partId: string,
    transactionType?: TransactionType
  ): Promise<PartTransaction[]> {
    const where: any = { partId };
    if (transactionType) {
      where.transactionType = transactionType;
    }

    return await this.partHistoryRepository.find({
      where,
      relations: ["truck", "performedByUser"],
      order: { transactionDate: "DESC" }
    });
  }

  /**
   * Soft delete part
   */
  async deletePart(partId: string, deletedBy: string): Promise<void> {
    const part = await this.getPartById(partId);

    // Check if part is currently installed
    const activeInstallations = await this.partInstallationRepository.count({
      where: { partId, status: InstallationStatus.INSTALLED }
    });

    if (activeInstallations > 0) {
      throw new Error("Cannot delete part with active installations");
    }

    await this.partRepository.softDelete(partId);

    // Create audit log
    await this.createAuditLog(
      "PART_DELETED",
      deletedBy,
      "Part",
      part.id,
      `Part ${part.partNumber} - ${part.name} deleted`
    );
  }

  /**
   * Create transaction record
   */
  private async createTransaction(data: {
    partId: string;
    transactionType: TransactionType;
    quantityChange: number;
    unitPrice?: number;
    totalCost?: number;
    fromLocation?: string;
    toLocation?: string;
    truckId?: string;
    workOrderId?: string;
    referenceNumber?: string;
    buyerName?: string;
    disposalReason?: string;
    performedBy: string;
    notes?: string;
  }): Promise<PartTransaction> {
    const transaction = this.partHistoryRepository.create({
      ...data,
      transactionDate: new Date()
    });

    return await this.partHistoryRepository.save(transaction);
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
