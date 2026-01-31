import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { FuelLog, FuelTypeEnum, PaymentMethod } from "../entities/FuelLog";
import { Truck } from "../entities/Truck";
import { AuditLog } from "../entities/AuditLog";
import { Trip } from "../entities/Trip";

export class FuelLogService {
  private fuelLogRepository: Repository<FuelLog>;
  private truckRepository: Repository<Truck>;
  private auditLogRepository: Repository<AuditLog>;
  private tripRepository: Repository<Trip>;

  constructor() {
    this.fuelLogRepository = AppDataSource.getRepository(FuelLog);
    this.truckRepository = AppDataSource.getRepository(Truck);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
    this.tripRepository = AppDataSource.getRepository(Trip);
  }

  /**
   * Create a new fuel log
   */
  async createFuelLog(
    data: {
      logNumber: string;
      truckId: string;
      driverId: string;
      tripId?: string;
      fuelType: FuelTypeEnum;
      amountLitres: number;
      costPerLitre: number;
      odometerReading: number;
      filledAt: Date;
      locationName: string;
      fuelStationName?: string;
      receiptNumber?: string;
      paymentMethod: PaymentMethod;
      isFullTank?: boolean;
      notes?: string;
    },
    recordedBy: string
  ): Promise<FuelLog> {
    // Check if log number already exists
    const existingLog = await this.fuelLogRepository.findOne({
      where: { logNumber: data.logNumber }
    });
    if (existingLog) {
      throw new Error("Fuel log number already exists");
    }

    // Calculate total cost
    const totalCost = data.amountLitres * data.costPerLitre;

    // Get truck's previous fuel log for efficiency calculation
    const previousLog = await this.fuelLogRepository.findOne({
      where: { truckId: data.truckId },
      order: { filledAt: "DESC" }
    });

    let distanceSinceLastFill: number | undefined;
    let fuelEfficiency: number | undefined;
    let previousOdometerReading: number | undefined;

    if (previousLog) {
      previousOdometerReading = previousLog.odometerReading;
      distanceSinceLastFill = data.odometerReading - previousLog.odometerReading;
      
      // Calculate fuel efficiency only if it's a full tank and previous was also full
      if (data.isFullTank && previousLog.isFullTank && distanceSinceLastFill > 0) {
        fuelEfficiency = distanceSinceLastFill / data.amountLitres; // km/l
      }
    }

    const fuelLog = this.fuelLogRepository.create({
      ...data,
      totalCost,
      previousOdometerReading,
      distanceSinceLastFill,
      fuelEfficiency,
      recordedBy
    });

    await this.fuelLogRepository.save(fuelLog);

    // If fuel log is linked to a trip, update trip's fuel consumption
    if (data.tripId) {
      await this.updateTripFuelConsumption(data.tripId);
    }

    // Create audit log
    await this.createAuditLog(
      "FUEL_LOG_CREATED",
      recordedBy,
      "FuelLog",
      fuelLog.id,
      `Fuel log ${fuelLog.logNumber} created: ${data.amountLitres}L at ${data.locationName}`
    );

    return await this.getFuelLogById(fuelLog.id);
  }

  /**
   * Get fuel log by ID
   */
  async getFuelLogById(fuelLogId: string): Promise<FuelLog> {
    const fuelLog = await this.fuelLogRepository.findOne({
      where: { id: fuelLogId },
      relations: ["truck", "driver", "trip", "recordedByUser"]
    });

    if (!fuelLog) {
      throw new Error("Fuel log not found");
    }

    return fuelLog;
  }

  /**
   * Create multiple fuel logs at once (e.g., multiple refills for a trip)
   */
  async createMultipleFuelLogs(
    logsData: Array<{
      logNumber: string;
      truckId: string;
      driverId: string;
      tripId?: string;
      fuelType: FuelTypeEnum;
      amountLitres: number;
      costPerLitre: number;
      odometerReading: number;
      filledAt: Date;
      locationName: string;
      fuelStationName?: string;
      receiptNumber?: string;
      paymentMethod: PaymentMethod;
      isFullTank?: boolean;
      notes?: string;
    }>,
    recordedBy: string
  ): Promise<FuelLog[]> {
    // Validate all log numbers are unique
    const logNumbers = logsData.map(log => log.logNumber);
    const duplicates = logNumbers.filter((num, idx) => logNumbers.indexOf(num) !== idx);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate log numbers in request: ${duplicates.join(", ")}`);
    }

    // Check if any log numbers already exist
    const existingLogs = await this.fuelLogRepository.find({
      where: logNumbers.map(logNumber => ({ logNumber }))
    });
    if (existingLogs.length > 0) {
      const existing = existingLogs.map(log => log.logNumber).join(", ");
      throw new Error(`Fuel log numbers already exist: ${existing}`);
    }

    // Sort by odometer reading to ensure proper sequence
    const sortedLogs = [...logsData].sort((a, b) => a.odometerReading - b.odometerReading);

    const createdLogs: FuelLog[] = [];

    // Create each fuel log
    for (const logData of sortedLogs) {
      const fuelLog = await this.createFuelLog(logData, recordedBy);
      createdLogs.push(fuelLog);
    }

    // Create audit log for batch creation
    const tripId = logsData[0]?.tripId;
    const totalLitres = logsData.reduce((sum, log) => sum + log.amountLitres, 0);
    await this.createAuditLog(
      "FUEL_LOGS_BATCH_CREATED",
      recordedBy,
      "FuelLog",
      tripId || "N/A",
      `Created ${createdLogs.length} fuel logs. Total: ${totalLitres}L${tripId ? ` for trip ${tripId}` : ""}`
    );

    return createdLogs;
  }

  /**
   * Get all fuel logs with filters and pagination
   */
  async getAllFuelLogs(
    filters?: {
      truckId?: string;
      driverId?: string;
      tripId?: string;
      fuelType?: FuelTypeEnum;
      paymentMethod?: PaymentMethod;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: FuelLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.fuelLogRepository
      .createQueryBuilder("fuelLog")
      .leftJoinAndSelect("fuelLog.truck", "truck")
      .leftJoinAndSelect("fuelLog.driver", "driver")
      .leftJoinAndSelect("fuelLog.trip", "trip");

    if (filters?.truckId) {
      queryBuilder.andWhere("fuelLog.truckId = :truckId", { truckId: filters.truckId });
    }

    if (filters?.driverId) {
      queryBuilder.andWhere("fuelLog.driverId = :driverId", { driverId: filters.driverId });
    }

    if (filters?.tripId) {
      queryBuilder.andWhere("fuelLog.tripId = :tripId", { tripId: filters.tripId });
    }

    if (filters?.fuelType) {
      queryBuilder.andWhere("fuelLog.fuelType = :fuelType", { fuelType: filters.fuelType });
    }

    if (filters?.paymentMethod) {
      queryBuilder.andWhere("fuelLog.paymentMethod = :paymentMethod", { paymentMethod: filters.paymentMethod });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere("fuelLog.filledAt >= :startDate", { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("fuelLog.filledAt <= :endDate", { endDate: filters.endDate });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(fuelLog.logNumber ILIKE :search OR fuelLog.locationName ILIKE :search OR fuelLog.fuelStationName ILIKE :search OR fuelLog.receiptNumber ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    queryBuilder.orderBy("fuelLog.filledAt", "DESC");

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages
    };
  }

  /**
   * Update fuel log
   */
  async updateFuelLog(
    fuelLogId: string,
    data: {
      costPerLitre?: number;
      odometerReading?: number;
      locationName?: string;
      fuelStationName?: string;
      receiptNumber?: string;
      paymentMethod?: PaymentMethod;
      isFullTank?: boolean;
      notes?: string;
    },
    updatedBy: string
  ): Promise<FuelLog> {
    const fuelLog = await this.getFuelLogById(fuelLogId);

    // Recalculate total cost if amount or cost per litre changed
    if (data.costPerLitre !== undefined) {
      fuelLog.totalCost = fuelLog.amountLitres * data.costPerLitre;
    }

    Object.assign(fuelLog, data);
    await this.fuelLogRepository.save(fuelLog);

    // Create audit log
    await this.createAuditLog(
      "FUEL_LOG_UPDATED",
      updatedBy,
      "FuelLog",
      fuelLog.id,
      `Fuel log ${fuelLog.logNumber} updated`
    );

    return await this.getFuelLogById(fuelLogId);
  }

  /**
   * Delete fuel log
   */
  async deleteFuelLog(fuelLogId: string, deletedBy: string): Promise<void> {
    const fuelLog = await this.getFuelLogById(fuelLogId);
    const tripId = fuelLog.tripId;

    await this.fuelLogRepository.remove(fuelLog);

    // If fuel log was linked to a trip, update trip's fuel consumption
    if (tripId) {
      await this.updateTripFuelConsumption(tripId);
    }

    // Create audit log
    await this.createAuditLog(
      "FUEL_LOG_DELETED",
      deletedBy,
      "FuelLog",
      fuelLogId,
      `Fuel log ${fuelLog.logNumber} deleted`
    );
  }

  /**
   * Get all fuel logs for a specific trip
   */
  async getFuelLogsByTripId(tripId: string): Promise<FuelLog[]> {
    return await this.fuelLogRepository.find({
      where: { tripId },
      relations: ["truck", "driver"],
      order: { filledAt: "ASC" }
    });
  }

  /**
   * Get fuel summary for a specific trip
   */
  async getTripFuelSummary(tripId: string): Promise<{
    totalLitres: number;
    totalCost: number;
    refillCount: number;
    averageCostPerLitre: number;
    fuelLogs: FuelLog[];
  }> {
    const fuelLogs = await this.getFuelLogsByTripId(tripId);

    const totalLitres = fuelLogs.reduce((sum, log) => sum + Number(log.amountLitres), 0);
    const totalCost = fuelLogs.reduce((sum, log) => sum + Number(log.totalCost), 0);
    const refillCount = fuelLogs.length;
    const averageCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;

    return {
      totalLitres,
      totalCost,
      refillCount,
      averageCostPerLitre,
      fuelLogs
    };
  }

  /**
   * Get fuel statistics
   */
  async getFuelStatistics(filters?: {
    truckId?: string;
    driverId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalFuelLogs: number;
    totalLitres: number;
    totalCost: number;
    averageCostPerLitre: number;
    averageFuelEfficiency: number;
    totalDistance: number;
    fuelByType: Record<string, { litres: number; cost: number }>;
    fuelByPaymentMethod: Record<string, { litres: number; cost: number }>;
  }> {
    const queryBuilder = this.fuelLogRepository.createQueryBuilder("fuelLog");

    if (filters?.truckId) {
      queryBuilder.andWhere("fuelLog.truckId = :truckId", { truckId: filters.truckId });
    }

    if (filters?.driverId) {
      queryBuilder.andWhere("fuelLog.driverId = :driverId", { driverId: filters.driverId });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere("fuelLog.filledAt >= :startDate", { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("fuelLog.filledAt <= :endDate", { endDate: filters.endDate });
    }

    const fuelLogs = await queryBuilder.getMany();

    const totalFuelLogs = fuelLogs.length;
    const totalLitres = fuelLogs.reduce((sum, log) => sum + Number(log.amountLitres), 0);
    const totalCost = fuelLogs.reduce((sum, log) => sum + Number(log.totalCost), 0);
    const averageCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;

    // Calculate average fuel efficiency from logs that have efficiency calculated
    const logsWithEfficiency = fuelLogs.filter(log => log.fuelEfficiency);
    const averageFuelEfficiency = logsWithEfficiency.length > 0
      ? logsWithEfficiency.reduce((sum, log) => sum + Number(log.fuelEfficiency), 0) / logsWithEfficiency.length
      : 0;

    const totalDistance = fuelLogs
      .filter(log => log.distanceSinceLastFill)
      .reduce((sum, log) => sum + Number(log.distanceSinceLastFill), 0);

    // Group by fuel type
    const fuelByType: Record<string, { litres: number; cost: number }> = {};
    fuelLogs.forEach(log => {
      if (!fuelByType[log.fuelType]) {
        fuelByType[log.fuelType] = { litres: 0, cost: 0 };
      }
      fuelByType[log.fuelType].litres += Number(log.amountLitres);
      fuelByType[log.fuelType].cost += Number(log.totalCost);
    });

    // Group by payment method
    const fuelByPaymentMethod: Record<string, { litres: number; cost: number }> = {};
    fuelLogs.forEach(log => {
      if (!fuelByPaymentMethod[log.paymentMethod]) {
        fuelByPaymentMethod[log.paymentMethod] = { litres: 0, cost: 0 };
      }
      fuelByPaymentMethod[log.paymentMethod].litres += Number(log.amountLitres);
      fuelByPaymentMethod[log.paymentMethod].cost += Number(log.totalCost);
    });

    return {
      totalFuelLogs,
      totalLitres,
      totalCost,
      averageCostPerLitre,
      averageFuelEfficiency,
      totalDistance,
      fuelByType,
      fuelByPaymentMethod
    };
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

  /**
   * Update trip's fuel consumption when fuel logs are added/deleted
   */
  private async updateTripFuelConsumption(tripId: string): Promise<void> {
    // Get trip
    const trip = await this.tripRepository.findOne({
      where: { id: tripId }
    });

    if (!trip) {
      return; // Trip not found, skip update
    }

    // Only update if trip is completed
    if (trip.status !== "completed") {
      return; // Don't update fuel for ongoing trips
    }

    // Calculate total fuel from logs
    const fuelSummary = await this.getTripFuelSummary(tripId);
    
    // Update trip's fuel consumed
    await this.tripRepository.update(
      { id: tripId },
      { fuelConsumedLitres: fuelSummary.totalLitres }
    );
  }
}
