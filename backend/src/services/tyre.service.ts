import { AppDataSource } from "../config/data-source";
import { Tyre, TyreStatus, TyreType, DisposalReason, DisposalType } from "../entities/Tyre";
import { TyreInstallation, TyreInstallationStatus, WheelPosition, RemovalReason, EventType } from "../entities/TyreInstallation";
import { TyreInspection, VisualCondition, PassFail } from "../entities/TyreInspection";
import { AuditLog } from "../entities/AuditLog";
import { Truck } from "../entities/Truck";
import { Repository } from "typeorm";

export class TyreService {
    private tyreRepository: Repository<Tyre>;
    private installationRepository: Repository<TyreInstallation>;
    private inspectionRepository: Repository<TyreInspection>;
    private auditLogRepository: Repository<AuditLog>;
    private truckRepository: Repository<Truck>;

    constructor() {
        this.tyreRepository = AppDataSource.getRepository(Tyre);
        this.installationRepository = AppDataSource.getRepository(TyreInstallation);
        this.inspectionRepository = AppDataSource.getRepository(TyreInspection);
        this.auditLogRepository = AppDataSource.getRepository(AuditLog);
        this.truckRepository = AppDataSource.getRepository(Truck);
    }

    // ==================== TYRE INVENTORY MANAGEMENT ====================

    /**
     * Add new tyre to inventory
     */
    async createTyre(data: {
        tyreNumber: string;
        serialNumber?: string;
        brand: string;
        model: string;
        size: string;
        tyreType: TyreType;
        plyRating?: string;
        loadIndex?: string;
        speedRating?: string;
        purchaseDate: Date;
        purchaseCost: number;
        supplierName?: string;
        warrantyMileage?: number;
        warrantyExpiryDate?: Date;
        originalTreadDepth: number;
        currentTreadDepth?: number;
        notes?: string;
    }, userId: string): Promise<Tyre> {
        // Check for duplicate tyre number
        const existingTyre = await this.tyreRepository.findOne({
            where: { tyreNumber: data.tyreNumber }
        });

        if (existingTyre) {
            throw new Error(`Tyre with number ${data.tyreNumber} already exists`);
        }

        // Check for duplicate serial number if provided
        if (data.serialNumber) {
            const existingSerial = await this.tyreRepository.findOne({
                where: { serialNumber: data.serialNumber }
            });

            if (existingSerial) {
                throw new Error(`Tyre with serial number ${data.serialNumber} already exists`);
            }
        }

        const tyre = this.tyreRepository.create({
            ...data,
            status: TyreStatus.IN_INVENTORY,
            totalAccumulatedMileage: 0,
            currentTreadDepth: data.currentTreadDepth || data.originalTreadDepth
        });

        const savedTyre = await this.tyreRepository.save(tyre);

        // Create audit log
        await this.auditLogRepository.save({
            userId,
            action: "CREATE_TYRE",
            entityType: "Tyre",
            entityId: savedTyre.id,
            description: `Created tyre ${savedTyre.tyreNumber} - ${savedTyre.brand} ${savedTyre.model}`,
            metadata: { tyreNumber: savedTyre.tyreNumber, status: savedTyre.status }
        });

        return savedTyre;
    }

    /**
     * Get tyre by ID
     */
    async getTyreById(id: string): Promise<Tyre> {
        const tyre = await this.tyreRepository.findOne({
            where: { id }
        });

        if (!tyre) {
            throw new Error("Tyre not found");
        }

        return tyre;
    }

    /**
     * Get all tyres with filters and pagination
     */
    async getAllTyres(filters: {
        status?: TyreStatus;
        tyreType?: TyreType;
        brand?: string;
        size?: string;
        minTreadDepth?: number;
        maxTreadDepth?: number;
        warrantyStatus?: "active" | "expired" | "all";
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: Tyre[]; total: number; page: number; totalPages: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const queryBuilder = this.tyreRepository.createQueryBuilder("tyre");

        // Status filter
        if (filters.status) {
            queryBuilder.andWhere("tyre.status = :status", { status: filters.status });
        }

        // Type filter
        if (filters.tyreType) {
            queryBuilder.andWhere("tyre.tyreType = :tyreType", { tyreType: filters.tyreType });
        }

        // Brand filter
        if (filters.brand) {
            queryBuilder.andWhere("LOWER(tyre.brand) = LOWER(:brand)", { brand: filters.brand });
        }

        // Size filter
        if (filters.size) {
            queryBuilder.andWhere("tyre.size = :size", { size: filters.size });
        }

        // Tread depth filters
        if (filters.minTreadDepth !== undefined) {
            queryBuilder.andWhere("tyre.currentTreadDepth >= :minTreadDepth", { minTreadDepth: filters.minTreadDepth });
        }

        if (filters.maxTreadDepth !== undefined) {
            queryBuilder.andWhere("tyre.currentTreadDepth <= :maxTreadDepth", { maxTreadDepth: filters.maxTreadDepth });
        }

        // Warranty status filter
        if (filters.warrantyStatus && filters.warrantyStatus !== "all") {
            const now = new Date();
            if (filters.warrantyStatus === "active") {
                queryBuilder.andWhere("tyre.warrantyExpiryDate > :now", { now });
            } else if (filters.warrantyStatus === "expired") {
                queryBuilder.andWhere("tyre.warrantyExpiryDate <= :now", { now });
            }
        }

        // Search filter (tyreNumber, serialNumber, brand, model)
        if (filters.search) {
            queryBuilder.andWhere(
                "(LOWER(tyre.tyreNumber) LIKE LOWER(:search) OR LOWER(tyre.serialNumber) LIKE LOWER(:search) OR LOWER(tyre.brand) LIKE LOWER(:search) OR LOWER(tyre.model) LIKE LOWER(:search))",
                { search: `%${filters.search}%` }
            );
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated data
        const data = await queryBuilder
            .orderBy("tyre.createdAt", "DESC")
            .skip(skip)
            .take(limit)
            .getMany();

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Update tyre information
     */
    async updateTyre(id: string, data: Partial<Tyre>, userId: string): Promise<Tyre> {
        const tyre = await this.getTyreById(id);

        // Prevent updating certain fields if tyre is installed
        if (tyre.status === TyreStatus.INSTALLED) {
            const restrictedFields = ["tyreNumber", "serialNumber", "size", "tyreType"];
            const hasRestrictedUpdate = restrictedFields.some(field => data[field as keyof Tyre] !== undefined);
            
            if (hasRestrictedUpdate) {
                throw new Error("Cannot update critical fields while tyre is installed");
            }
        }

        // Prevent updating if disposed
        if (tyre.status === TyreStatus.DISPOSED) {
            throw new Error("Cannot update disposed tyre");
        }

        Object.assign(tyre, data);
        const updatedTyre = await this.tyreRepository.save(tyre);

        // Create audit log
        await this.auditLogRepository.save({
            userId,
            action: "UPDATE_TYRE",
            entityType: "Tyre",
            entityId: updatedTyre.id,
            description: `Updated tyre ${updatedTyre.tyreNumber}`,
            metadata: { changes: data }
        });

        return updatedTyre;
    }

    /**
     * Delete tyre (only if in inventory and never installed)
     */
    async deleteTyre(id: string, userId: string): Promise<void> {
        const tyre = await this.getTyreById(id);

        // Check if tyre was ever installed
        const hasInstallations = await this.installationRepository.count({
            where: { tyreId: id }
        });

        if (hasInstallations > 0) {
            throw new Error("Cannot delete tyre with installation history. Consider disposal instead.");
        }

        if (tyre.status !== TyreStatus.IN_INVENTORY) {
            throw new Error("Can only delete tyres that are in inventory and never used");
        }

        await this.tyreRepository.remove(tyre);

        // Create audit log
        await this.auditLogRepository.save({
            userId,
            action: "DELETE_TYRE",
            entityType: "Tyre",
            entityId: id,
            description: `Deleted tyre ${tyre.tyreNumber}`,
            metadata: { tyreNumber: tyre.tyreNumber }
        });
    }

    // ==================== TYRE INSTALLATION ====================

    /**
     * Install tyre on truck
     */
    async installTyre(data: {
        tyreId: string;
        truckId: string;
        axlePosition: string;
        wheelPosition: WheelPosition;
        installationDate: Date;
        odometerAtInstallation: number;
        treadDepthAtInstallation: number;
        pressureAtInstallation?: number;
        installedBy: string;
        workOrderId?: string;
        notes?: string;
    }, userId: string): Promise<TyreInstallation> {
        const tyre = await this.getTyreById(data.tyreId);
        const truck = await this.truckRepository.findOne({ where: { id: data.truckId } });

        if (!truck) {
            throw new Error("Truck not found");
        }

        // Check tyre is available
        if (tyre.status !== TyreStatus.IN_INVENTORY) {
            throw new Error(`Tyre is not available for installation. Current status: ${tyre.status}`);
        }

        // Check position is not occupied
        const existingAtPosition = await this.installationRepository.findOne({
            where: {
                truckId: data.truckId,
                axlePosition: data.axlePosition,
                wheelPosition: data.wheelPosition,
                status: TyreInstallationStatus.ACTIVE
            }
        });

        if (existingAtPosition) {
            throw new Error(`Position ${data.axlePosition} - ${data.wheelPosition} is already occupied`);
        }

        // Create installation record
        const installation = this.installationRepository.create({
            ...data,
            eventType: EventType.INSTALLATION,
            status: TyreInstallationStatus.ACTIVE
        });

        const savedInstallation = await this.installationRepository.save(installation);

        // Update tyre status
        tyre.status = TyreStatus.INSTALLED;
        tyre.currentTreadDepth = data.treadDepthAtInstallation;
        await this.tyreRepository.save(tyre);

        // Create audit log
        await this.auditLogRepository.save({
            userId,
            action: "INSTALL_TYRE",
            entityType: "TyreInstallation",
            entityId: savedInstallation.id,
            description: `Installed tyre ${tyre.tyreNumber} on truck ${truck.registrationNumber} at ${data.axlePosition} - ${data.wheelPosition}`,
            metadata: {
                tyreId: tyre.id,
                tyreNumber: tyre.tyreNumber,
                truckId: truck.id,
                position: `${data.axlePosition} - ${data.wheelPosition}`
            }
        });

        return savedInstallation;
    }

    /**
     * Rotate tyre (change position on same truck)
     */
    async rotateTyre(data: {
        tyreId: string;
        truckId: string;
        newAxlePosition: string;
        newWheelPosition: WheelPosition;
        rotationDate: Date;
        odometerReading: number;
        treadDepth: number;
        pressure?: number;
        installedBy: string;
        reason?: string;
        notes?: string;
    }, userId: string): Promise<TyreInstallation> {
        const tyre = await this.getTyreById(data.tyreId);

        // Get current active installation
        const currentInstallation = await this.installationRepository.findOne({
            where: {
                tyreId: data.tyreId,
                truckId: data.truckId,
                status: TyreInstallationStatus.ACTIVE
            },
            relations: ["truck"]
        });

        if (!currentInstallation) {
            throw new Error("No active installation found for this tyre on this truck");
        }

        // Check new position is not occupied
        if (
            currentInstallation.axlePosition !== data.newAxlePosition ||
            currentInstallation.wheelPosition !== data.newWheelPosition
        ) {
            const existingAtNewPosition = await this.installationRepository.findOne({
                where: {
                    truckId: data.truckId,
                    axlePosition: data.newAxlePosition,
                    wheelPosition: data.newWheelPosition,
                    status: TyreInstallationStatus.ACTIVE
                }
            });

            if (existingAtNewPosition) {
                throw new Error(`Position ${data.newAxlePosition} - ${data.newWheelPosition} is already occupied`);
            }
        }

        // Calculate mileage covered in current position
        const mileageCovered = data.odometerReading - currentInstallation.odometerAtInstallation;

        // Close current installation
        currentInstallation.status = TyreInstallationStatus.REMOVED;
        currentInstallation.removalDate = data.rotationDate;
        currentInstallation.odometerAtRemoval = data.odometerReading;
        currentInstallation.treadDepthAtRemoval = data.treadDepth;
        currentInstallation.mileageCovered = mileageCovered;
        currentInstallation.removalReason = RemovalReason.ROTATION;
        await this.installationRepository.save(currentInstallation);

        // Create new rotation record
        const rotation = this.installationRepository.create({
            tyreId: data.tyreId,
            truckId: data.truckId,
            eventType: EventType.ROTATION,
            previousAxlePosition: currentInstallation.axlePosition,
            previousWheelPosition: currentInstallation.wheelPosition,
            axlePosition: data.newAxlePosition,
            wheelPosition: data.newWheelPosition,
            installationDate: data.rotationDate,
            odometerAtInstallation: data.odometerReading,
            treadDepthAtInstallation: data.treadDepth,
            pressureAtInstallation: data.pressure,
            installedBy: data.installedBy,
            status: TyreInstallationStatus.ACTIVE,
            notes: data.notes
        });

        const savedRotation = await this.installationRepository.save(rotation);

        // Update tyre mileage and tread depth
        tyre.totalAccumulatedMileage = Number(tyre.totalAccumulatedMileage) + mileageCovered;
        tyre.currentTreadDepth = data.treadDepth;
        await this.tyreRepository.save(tyre);

        // Create audit log
        await this.auditLogRepository.save({
            userId,
            action: "ROTATE_TYRE",
            entityType: "TyreInstallation",
            entityId: savedRotation.id,
            description: `Rotated tyre ${tyre.tyreNumber} from ${currentInstallation.axlePosition}-${currentInstallation.wheelPosition} to ${data.newAxlePosition}-${data.newWheelPosition}`,
            metadata: {
                tyreId: tyre.id,
                tyreNumber: tyre.tyreNumber,
                truckId: data.truckId,
                oldPosition: `${currentInstallation.axlePosition}-${currentInstallation.wheelPosition}`,
                newPosition: `${data.newAxlePosition}-${data.newWheelPosition}`,
                mileageCovered
            }
        });

        return savedRotation;
    }

    /**
     * Remove tyre from truck
     */
    async removeTyre(data: {
        tyreId: string;
        truckId: string;
        removalDate: Date;
        odometerReading: number;
        treadDepth: number;
        removalReason: RemovalReason;
        removedBy: string;
        notes?: string;
    }, userId: string): Promise<TyreInstallation> {
        const tyre = await this.getTyreById(data.tyreId);

        // Get current active installation
        const installation = await this.installationRepository.findOne({
            where: {
                tyreId: data.tyreId,
                truckId: data.truckId,
                status: TyreInstallationStatus.ACTIVE
            },
            relations: ["truck"]
        });

        if (!installation) {
            throw new Error("No active installation found for this tyre");
        }

        // Calculate mileage covered
        const mileageCovered = data.odometerReading - installation.odometerAtInstallation;

        // Update installation record
        installation.status = TyreInstallationStatus.REMOVED;
        installation.removalDate = data.removalDate;
        installation.odometerAtRemoval = data.odometerReading;
        installation.treadDepthAtRemoval = data.treadDepth;
        installation.mileageCovered = mileageCovered;
        installation.removalReason = data.removalReason;
        installation.removedBy = data.removedBy;
        if (data.notes) {
            installation.notes = data.notes;
        }

        const updatedInstallation = await this.installationRepository.save(installation);

        // Update tyre status and metrics
        tyre.status = data.removalReason === RemovalReason.END_OF_LIFE ? TyreStatus.DISPOSED : TyreStatus.IN_INVENTORY;
        tyre.totalAccumulatedMileage = Number(tyre.totalAccumulatedMileage) + mileageCovered;
        tyre.currentTreadDepth = data.treadDepth;
        if (data.notes) {
            installation.notes = data.notes;
        }
        await this.tyreRepository.save(tyre);

        // Create audit log
        await this.auditLogRepository.save({
            userId,
            action: "REMOVE_TYRE",
            entityType: "TyreInstallation",
            entityId: updatedInstallation.id,
            description: `Removed tyre ${tyre.tyreNumber} from truck ${installation.truck.registrationNumber}. Reason: ${data.removalReason}`,
            metadata: {
                tyreId: tyre.id,
                tyreNumber: tyre.tyreNumber,
                truckId: data.truckId,
                position: `${installation.axlePosition}-${installation.wheelPosition}`,
                mileageCovered,
                removalReason: data.removalReason
            }
        });

        return updatedInstallation;
    }

    /**
     * Get current tyre positions on a truck
     */
    async getTruckTyrePositions(truckId: string): Promise<TyreInstallation[]> {
        return await this.installationRepository.find({
            where: {
                truckId,
                status: TyreInstallationStatus.ACTIVE
            },
            relations: ["tyre"],
            order: {
                axlePosition: "ASC",
                wheelPosition: "ASC"
            }
        });
    }

    /**
     * Get tyre installation history
     */
    async getTyreHistory(tyreId: string): Promise<TyreInstallation[]> {
        return await this.installationRepository.find({
            where: { tyreId },
            relations: ["truck", "installedByUser", "removedByUser"],
            order: { installationDate: "DESC" }
        });
    }

    // ==================== TYRE INSPECTION ====================

    /**
     * Create tyre inspection
     */
    async createInspection(data: {
        tyreId: string;
        truckId?: string;
        inspectionDate: Date;
        odometerReading?: number;
        inspectedBy: string;
        treadDepth: number;
        pressure: number;
        visualCondition: VisualCondition;
        hasUniformWear?: boolean;
        hasCuts?: boolean;
        hasCracks?: boolean;
        hasBulges?: boolean;
        hasEmbeddedObjects?: boolean;
        alignmentIssues?: boolean;
        passFail: PassFail;
        actionRequired?: string;
        notes?: string;
    }, userId: string): Promise<TyreInspection> {
        const tyre = await this.getTyreById(data.tyreId);

        const inspection = this.inspectionRepository.create(data);
        const savedInspection = await this.inspectionRepository.save(inspection);

        // Update tyre's current tread depth
        tyre.currentTreadDepth = data.treadDepth;
        await this.tyreRepository.save(tyre);

        // Create audit log
        await this.auditLogRepository.save({
            userId,
            action: "CREATE_TYRE_INSPECTION",
            entityType: "TyreInspection",
            entityId: savedInspection.id,
            description: `Inspected tyre ${tyre.tyreNumber} - Result: ${data.passFail}`,
            metadata: {
                tyreId: tyre.id,
                tyreNumber: tyre.tyreNumber,
                treadDepth: data.treadDepth,
                passFail: data.passFail,
                visualCondition: data.visualCondition
            }
        });

        return savedInspection;
    }

    /**
     * Get tyre inspections
     */
    async getTyreInspections(tyreId: string): Promise<TyreInspection[]> {
        return await this.inspectionRepository.find({
            where: { tyreId },
            relations: ["inspectedByUser", "truck"],
            order: { inspectionDate: "DESC" }
        });
    }

    /**
     * Get all inspections with filters
     */
    async getAllInspections(filters: {
        tyreId?: string;
        truckId?: string;
        passFail?: PassFail;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{ data: TyreInspection[]; total: number; page: number; totalPages: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const queryBuilder = this.inspectionRepository
            .createQueryBuilder("inspection")
            .leftJoinAndSelect("inspection.tyre", "tyre")
            .leftJoinAndSelect("inspection.truck", "truck")
            .leftJoinAndSelect("inspection.inspectedByUser", "user");

        if (filters.tyreId) {
            queryBuilder.andWhere("inspection.tyreId = :tyreId", { tyreId: filters.tyreId });
        }

        if (filters.truckId) {
            queryBuilder.andWhere("inspection.truckId = :truckId", { truckId: filters.truckId });
        }

        if (filters.passFail) {
            queryBuilder.andWhere("inspection.passFail = :passFail", { passFail: filters.passFail });
        }

        if (filters.startDate) {
            queryBuilder.andWhere("inspection.inspectionDate >= :startDate", { startDate: filters.startDate });
        }

        if (filters.endDate) {
            queryBuilder.andWhere("inspection.inspectionDate <= :endDate", { endDate: filters.endDate });
        }

        const total = await queryBuilder.getCount();
        const data = await queryBuilder
            .orderBy("inspection.inspectionDate", "DESC")
            .skip(skip)
            .take(limit)
            .getMany();

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // ==================== TYRE DISPOSAL ====================

    /**
     * Dispose tyre
     */
    async disposeTyre(data: {
        tyreId: string;
        disposalDate: Date;
        disposalReason: DisposalReason;
        disposalType: DisposalType;
        notes?: string;
    }, userId: string): Promise<Tyre> {
        const tyre = await this.getTyreById(data.tyreId);

        // Check tyre is not currently installed
        if (tyre.status === TyreStatus.INSTALLED) {
            throw new Error("Cannot dispose tyre that is currently installed. Remove it first.");
        }

        // Already disposed
        if (tyre.status === TyreStatus.DISPOSED) {
            throw new Error("Tyre is already disposed");
        }

        // Update tyre
        tyre.status = TyreStatus.DISPOSED;
        tyre.disposalDate = data.disposalDate;
        tyre.disposalReason = data.disposalReason;
        tyre.disposalType = data.disposalType;
        tyre.notes = data.notes || tyre.notes;

        const disposedTyre = await this.tyreRepository.save(tyre);

        // Create audit log
        await this.auditLogRepository.save({
            userId,
            action: "DISPOSE_TYRE",
            entityType: "Tyre",
            entityId: disposedTyre.id,
            description: `Disposed tyre ${tyre.tyreNumber} - Reason: ${data.disposalReason}, Type: ${data.disposalType}`,
            metadata: {
                tyreNumber: tyre.tyreNumber,
                disposalReason: data.disposalReason,
                disposalType: data.disposalType,
                totalMileage: tyre.totalAccumulatedMileage
            }
        });

        return disposedTyre;
    }

    // ==================== STATISTICS & REPORTS ====================

    /**
     * Get tyre statistics
     */
    async getTyreStatistics(): Promise<{
        totalTyres: number;
        inInventory: number;
        installed: number;
        disposed: number;
        byType: Record<string, number>;
        byBrand: Record<string, number>;
        averageTreadDepth: number;
        averageMileage: number;
        lowTreadCount: number;
    }> {
        const allTyres = await this.tyreRepository.find();

        const stats = {
            totalTyres: allTyres.length,
            inInventory: allTyres.filter(t => t.status === TyreStatus.IN_INVENTORY).length,
            installed: allTyres.filter(t => t.status === TyreStatus.INSTALLED).length,
            disposed: allTyres.filter(t => t.status === TyreStatus.DISPOSED).length,
            byType: {} as Record<string, number>,
            byBrand: {} as Record<string, number>,
            averageTreadDepth: 0,
            averageMileage: 0,
            lowTreadCount: 0
        };

        // Count by type
        allTyres.forEach(tyre => {
            stats.byType[tyre.tyreType] = (stats.byType[tyre.tyreType] || 0) + 1;
            stats.byBrand[tyre.brand] = (stats.byBrand[tyre.brand] || 0) + 1;
        });

        // Calculate averages for active tyres
        const activeTyres = allTyres.filter(t => t.status !== TyreStatus.DISPOSED);
        if (activeTyres.length > 0) {
            const totalTread = activeTyres.reduce((sum, t) => sum + (Number(t.currentTreadDepth) || 0), 0);
            const totalMileage = activeTyres.reduce((sum, t) => sum + (Number(t.totalAccumulatedMileage) || 0), 0);
            
            stats.averageTreadDepth = totalTread / activeTyres.length;
            stats.averageMileage = totalMileage / activeTyres.length;
            stats.lowTreadCount = activeTyres.filter(t => Number(t.currentTreadDepth) < 3).length;
        }

        return stats;
    }

    /**
     * Get tyres due for inspection (based on mileage or time)
     */
    async getTyresDueForInspection(mileageThreshold: number = 10000): Promise<Tyre[]> {
        // Get all installed tyres
        const installedTyres = await this.tyreRepository.find({
            where: { status: TyreStatus.INSTALLED }
        });

        const tyresDue: Tyre[] = [];

        for (const tyre of installedTyres) {
            // Get last inspection
            const lastInspection = await this.inspectionRepository.findOne({
                where: { tyreId: tyre.id },
                order: { inspectionDate: "DESC" }
            });

            // Get current installation
            const installation = await this.installationRepository.findOne({
                where: {
                    tyreId: tyre.id,
                    status: TyreInstallationStatus.ACTIVE
                }
            });

            if (!installation) continue;

            if (!lastInspection) {
                // Never inspected
                tyresDue.push(tyre);
            } else if (lastInspection.odometerReading) {
                // Check mileage since last inspection
                const currentOdometer = installation.odometerAtInstallation;
                const mileageSinceInspection = currentOdometer - (lastInspection.odometerReading || 0);
                
                if (mileageSinceInspection >= mileageThreshold) {
                    tyresDue.push(tyre);
                }
            }
        }

        return tyresDue;
    }

    /**
     * Get tyres with low tread depth
     */
    async getLowTreadTyres(minTreadDepth: number = 3): Promise<Tyre[]> {
        return await this.tyreRepository
            .createQueryBuilder("tyre")
            .where("tyre.status != :disposed", { disposed: TyreStatus.DISPOSED })
            .andWhere("tyre.currentTreadDepth < :minTreadDepth", { minTreadDepth })
            .getMany();
    }
}
