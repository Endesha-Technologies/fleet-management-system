import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Trip, TripStatus } from "../entities/Trip";
import { TripStop, TripStopType } from "../entities/TripStop";
import { TripIncident, IncidentType, Severity } from "../entities/TripIncident";
import { TripTracking } from "../entities/TripTracking";
import { Truck } from "../entities/Truck";
import { AuditLog } from "../entities/AuditLog";
import { FuelLogService } from "./fuelLog.service";

export class TripService {
  private tripRepository: Repository<Trip>;
  private tripStopRepository: Repository<TripStop>;
  private tripIncidentRepository: Repository<TripIncident>;
  private tripTrackingRepository: Repository<TripTracking>;
  private auditLogRepository: Repository<AuditLog>;
  private fuelLogService: FuelLogService;

  constructor() {
    this.tripRepository = AppDataSource.getRepository(Trip);
    this.tripStopRepository = AppDataSource.getRepository(TripStop);
    this.tripIncidentRepository = AppDataSource.getRepository(TripIncident);
    this.tripTrackingRepository = AppDataSource.getRepository(TripTracking);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
    this.fuelLogService = new FuelLogService();
  }

  /**
   * Create a new trip
   */
  async createTrip(
    data: {
      tripNumber: string;
      routeId: string;
      truckId: string;
      driverId: string;
      coDriverId?: string;
      scheduledDeparture: Date;
      scheduledArrival?: Date;
      cargoWeight?: number;
      cargoDescription?: string;
      clientName?: string;
      deliveryNoteNumber?: string;
      notes?: string;
    },
    createdBy: string
  ): Promise<Trip> {
    // Check if trip number already exists
    const existingTrip = await this.tripRepository.findOne({
      where: { tripNumber: data.tripNumber }
    });
    if (existingTrip) {
      throw new Error("Trip number already exists");
    }

    // Validate that driver and co-driver are different
    if (data.coDriverId && data.driverId === data.coDriverId) {
      throw new Error("Driver and co-driver cannot be the same person");
    }

    // Check for driver/truck conflicts (overlapping trips)
    await this.checkTripConflicts(
      data.truckId,
      data.driverId,
      data.scheduledDeparture,
      data.scheduledArrival
    );

    const trip = this.tripRepository.create({
      ...data,
      status: TripStatus.SCHEDULED,
      createdBy
    });

    await this.tripRepository.save(trip);

    // Create audit log
    await this.createAuditLog(
      "TRIP_CREATED",
      createdBy,
      "Trip",
      trip.id,
      `Trip ${trip.tripNumber} created and scheduled`
    );

    return trip;
  }

  /**
   * Check for trip conflicts
   */
  private async checkTripConflicts(
    truckId: string,
    driverId: string,
    scheduledDeparture: Date,
    scheduledArrival?: Date
  ): Promise<void> {
    const endTime = scheduledArrival || new Date(scheduledDeparture.getTime() + 24 * 60 * 60 * 1000); // Default 24h

    // Check truck conflicts
    const truckConflicts = await this.tripRepository
      .createQueryBuilder("trip")
      .where("trip.truckId = :truckId", { truckId })
      .andWhere("trip.status IN (:...statuses)", { 
        statuses: [TripStatus.SCHEDULED, TripStatus.IN_PROGRESS, TripStatus.DELAYED] 
      })
      .andWhere(
        "(trip.scheduledDeparture <= :endTime AND " +
        "(trip.scheduledArrival >= :startTime OR trip.scheduledArrival IS NULL))"
      , { startTime: scheduledDeparture, endTime })
      .getCount();

    if (truckConflicts > 0) {
      throw new Error("Truck is already assigned to another trip during this time period");
    }

    // Check driver conflicts
    const driverConflicts = await this.tripRepository
      .createQueryBuilder("trip")
      .where("(trip.driverId = :driverId OR trip.coDriverId = :driverId)", { driverId })
      .andWhere("trip.status IN (:...statuses)", { 
        statuses: [TripStatus.SCHEDULED, TripStatus.IN_PROGRESS, TripStatus.DELAYED] 
      })
      .andWhere(
        "(trip.scheduledDeparture <= :endTime AND " +
        "(trip.scheduledArrival >= :startTime OR trip.scheduledArrival IS NULL))"
      , { startTime: scheduledDeparture, endTime })
      .getCount();

    if (driverConflicts > 0) {
      throw new Error("Driver is already assigned to another trip during this time period");
    }
  }

  /**
   * Get trip by ID
   */
  async getTripById(tripId: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ["route", "truck", "driver", "coDriver", "createdByUser"]
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    return trip;
  }

  /**
   * Get all trips with filters and pagination
   */
  async getAllTrips(
    filters?: {
      status?: TripStatus;
      truckId?: string;
      driverId?: string;
      routeId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Trip[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.tripRepository
      .createQueryBuilder("trip")
      .leftJoinAndSelect("trip.route", "route")
      .leftJoinAndSelect("trip.truck", "truck")
      .leftJoinAndSelect("trip.driver", "driver")
      .leftJoinAndSelect("trip.coDriver", "coDriver");

    if (filters?.status) {
      queryBuilder.andWhere("trip.status = :status", { status: filters.status });
    }

    if (filters?.truckId) {
      queryBuilder.andWhere("trip.truckId = :truckId", { truckId: filters.truckId });
    }

    if (filters?.driverId) {
      queryBuilder.andWhere(
        "(trip.driverId = :driverId OR trip.coDriverId = :driverId)", 
        { driverId: filters.driverId }
      );
    }

    if (filters?.routeId) {
      queryBuilder.andWhere("trip.routeId = :routeId", { routeId: filters.routeId });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere("trip.scheduledDeparture >= :startDate", { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("trip.scheduledDeparture <= :endDate", { endDate: filters.endDate });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(trip.tripNumber ILIKE :search OR trip.clientName ILIKE :search OR trip.deliveryNoteNumber ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    queryBuilder.orderBy("trip.scheduledDeparture", "DESC");

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
   * Update trip (only if not started)
   */
  async updateTrip(
    tripId: string,
    data: {
      scheduledDeparture?: Date;
      scheduledArrival?: Date;
      cargoWeight?: number;
      cargoDescription?: string;
      clientName?: string;
      deliveryNoteNumber?: string;
      notes?: string;
    },
    updatedBy: string
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId);

    // Can only update trips that haven't started
    if (trip.status !== TripStatus.SCHEDULED) {
      throw new Error("Cannot update trip that has already started or completed");
    }

    Object.assign(trip, data);
    await this.tripRepository.save(trip);

    // Create audit log
    await this.createAuditLog(
      "TRIP_UPDATED",
      updatedBy,
      "Trip",
      trip.id,
      `Trip ${trip.tripNumber} updated`
    );

    return trip;
  }

  /**
   * Start trip
   */
  async startTrip(
    tripId: string,
    odometerStart: number,
    engineHoursStart: number,
    actualDeparture: Date,
    startedBy: string
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId);

    if (trip.status !== TripStatus.SCHEDULED) {
      throw new Error("Only scheduled trips can be started");
    }

    trip.status = TripStatus.IN_PROGRESS;
    trip.actualDeparture = actualDeparture;
    trip.odometerStart = odometerStart;
    trip.engineHoursStart = engineHoursStart;

    await this.tripRepository.save(trip);

    // Create audit log
    await this.createAuditLog(
      "TRIP_STARTED",
      startedBy,
      "Trip",
      trip.id,
      `Trip ${trip.tripNumber} started. Odometer: ${odometerStart}, Engine Hours: ${engineHoursStart}`
    );

    return trip;
  }

  /**
   * Complete trip
   */
  async completeTrip(
    tripId: string,
    data: {
      odometerEnd: number;
      engineHoursEnd: number;
      actualArrival: Date;
      fuelConsumedLitres?: number;
      notes?: string;
    },
    completedBy: string
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId);

    if (trip.status !== TripStatus.IN_PROGRESS && trip.status !== TripStatus.DELAYED) {
      throw new Error("Only in-progress or delayed trips can be completed");
    }

    if (!trip.odometerStart) {
      throw new Error("Trip was not properly started (missing odometer start)");
    }

    if (!trip.engineHoursStart) {
      throw new Error("Trip was not properly started (missing engine hours start)");
    }

    if (data.odometerEnd < trip.odometerStart) {
      throw new Error("Odometer end cannot be less than odometer start");
    }

    if (data.engineHoursEnd < trip.engineHoursStart) {
      throw new Error("Engine hours end cannot be less than engine hours start");
    }

    trip.status = TripStatus.COMPLETED;
    trip.actualArrival = data.actualArrival;
    trip.odometerEnd = data.odometerEnd;
    trip.engineHoursEnd = data.engineHoursEnd;
    
    // Calculate fuel consumed from fuel logs linked to this trip
    const fuelSummary = await this.fuelLogService.getTripFuelSummary(tripId);
    if (fuelSummary.refillCount > 0) {
      trip.fuelConsumedLitres = fuelSummary.totalLitres;
    } else if (data.fuelConsumedLitres !== undefined) {
      // Use manual input if no fuel logs exist
      trip.fuelConsumedLitres = data.fuelConsumedLitres;
    }

    const actual_odometer = data.odometerEnd - trip.odometerStart;
    const actual_engine_hours = data.engineHoursEnd - trip.engineHoursStart;

    // Calculate metrics
    trip.actualDistanceKm = actual_odometer;
    trip.actualEngineHours = actual_engine_hours;
    if (trip.actualDeparture) {
      const durationHours = (data.actualArrival.getTime() - trip.actualDeparture.getTime()) / (1000 * 60 * 60);
      trip.averageSpeedKmh = durationHours > 0 ? trip.actualDistanceKm / durationHours : 0;
    }

    if (data.notes) {
      trip.notes = trip.notes ? `${trip.notes}\n${data.notes}` : data.notes;
    }

    await this.tripRepository.save(trip);

    // Update truck's current odometer and engine hours
    const truckRepository = AppDataSource.getRepository(Truck);
    await truckRepository.update(
      { id: trip.truckId },
      {
        currentOdometer: actual_odometer,
        currentEngineHours: actual_engine_hours
      }
    );

    // Create audit log with fuel consumption info
    let auditDescription = `Trip ${trip.tripNumber} completed. Distance: ${trip.actualDistanceKm} km, Engine Hours Used: ${actual_engine_hours}`;
    if (trip.fuelConsumedLitres) {
      const fuelEfficiency = trip.actualDistanceKm / trip.fuelConsumedLitres;
      auditDescription += `, Fuel Consumed: ${trip.fuelConsumedLitres}L (${fuelEfficiency.toFixed(2)} km/l)`;
      if (fuelSummary.refillCount > 0) {
        auditDescription += ` from ${fuelSummary.refillCount} refill(s)`;
      }
    }
    
    await this.createAuditLog(
      "TRIP_COMPLETED",
      completedBy,
      "Trip",
      trip.id,
      auditDescription
    );

    return trip;
  }

  /**
   * Mark trip as delayed
   */
  async markTripDelayed(
    tripId: string,
    delayReason: string,
    updatedBy: string
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId);

    if (trip.status !== TripStatus.SCHEDULED && trip.status !== TripStatus.IN_PROGRESS) {
      throw new Error("Only scheduled or in-progress trips can be marked as delayed");
    }

    const previousStatus = trip.status;
    trip.status = TripStatus.DELAYED;
    trip.delayReason = delayReason;

    await this.tripRepository.save(trip);

    // Create audit log
    await this.createAuditLog(
      "TRIP_DELAYED",
      updatedBy,
      "Trip",
      trip.id,
      `Trip ${trip.tripNumber} marked as delayed. Reason: ${delayReason}`
    );

    return trip;
  }

  /**
   * Cancel trip
   */
  async cancelTrip(
    tripId: string,
    cancellationReason: string,
    cancelledBy: string
  ): Promise<Trip> {
    const trip = await this.getTripById(tripId);

    if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
      throw new Error("Cannot cancel completed or already cancelled trips");
    }

    trip.status = TripStatus.CANCELLED;
    trip.cancellationReason = cancellationReason;

    await this.tripRepository.save(trip);

    // Create audit log
    await this.createAuditLog(
      "TRIP_CANCELLED",
      cancelledBy,
      "Trip",
      trip.id,
      `Trip ${trip.tripNumber} cancelled. Reason: ${cancellationReason}`
    );

    return trip;
  }

  /**
   * Add trip stop
   */
  async addTripStop(
    data: {
      tripId: string;
      locationName: string;
      locationCoords?: { latitude: number; longitude: number };
      arrivalTime: Date;
      departureTime?: Date;
      stopType: TripStopType;
      notes?: string;
    }
  ): Promise<TripStop> {
    const trip = await this.getTripById(data.tripId);

    if (trip.status !== TripStatus.IN_PROGRESS && trip.status !== TripStatus.DELAYED) {
      throw new Error("Can only add stops to in-progress or delayed trips");
    }

    const stop = this.tripStopRepository.create({
      tripId: data.tripId,
      locationName: data.locationName,
      arrivalTime: data.arrivalTime,
      departureTime: data.departureTime,
      stopType: data.stopType,
      notes: data.notes
    });

    // Calculate duration if departure time is provided
    if (data.departureTime) {
      const durationMs = data.departureTime.getTime() - data.arrivalTime.getTime();
      stop.durationMinutes = Math.round(durationMs / (1000 * 60));
    }

    await this.tripStopRepository.save(stop);

    return stop;
  }

  /**
   * Update trip stop departure
   */
  async updateTripStopDeparture(
    stopId: string,
    departureTime: Date
  ): Promise<TripStop> {
    const stop = await this.tripStopRepository.findOne({
      where: { id: stopId }
    });

    if (!stop) {
      throw new Error("Trip stop not found");
    }

    stop.departureTime = departureTime;
    const durationMs = departureTime.getTime() - stop.arrivalTime.getTime();
    stop.durationMinutes = Math.round(durationMs / (1000 * 60));

    await this.tripStopRepository.save(stop);

    return stop;
  }

  /**
   * Get trip stops
   */
  async getTripStops(tripId: string): Promise<TripStop[]> {
    return await this.tripStopRepository.find({
      where: { tripId },
      order: { arrivalTime: "ASC" }
    });
  }

  /**
   * Add trip incident
   */
  async addTripIncident(
    data: {
      tripId: string;
      incidentType: IncidentType;
      severity: Severity;
      locationName?: string;
      locationCoords?: { latitude: number; longitude: number };
      occurredAt: Date;
      description: string;
      actionTaken?: string;
      policeReportNumber?: string;
      insuranceClaimNumber?: string;
      estimatedCost?: number;
      notes?: string;
    },
    reportedBy: string
  ): Promise<TripIncident> {
    const trip = await this.getTripById(data.tripId);

    const incident = this.tripIncidentRepository.create({
      tripId: data.tripId,
      incidentType: data.incidentType,
      severity: data.severity,
      locationName: data.locationName,
      occurredAt: data.occurredAt,
      description: data.description,
      actionTaken: data.actionTaken,
      policeReportNumber: data.policeReportNumber,
      insuranceClaimNumber: data.insuranceClaimNumber,
      estimatedCost: data.estimatedCost,
      notes: data.notes,
      reportedBy,
      resolved: false
    });

    await this.tripIncidentRepository.save(incident);

    // If severe incident, mark trip as delayed
    if (data.severity === Severity.HIGH || data.severity === Severity.CRITICAL) {
      if (trip.status === TripStatus.IN_PROGRESS) {
        await this.markTripDelayed(
          data.tripId,
          `${data.incidentType} incident: ${data.description}`,
          reportedBy
        );
      }
    }

    // Create audit log
    await this.createAuditLog(
      "TRIP_INCIDENT_REPORTED",
      reportedBy,
      "TripIncident",
      incident.id,
      `Incident reported for trip ${trip.tripNumber}: ${data.incidentType} - ${data.severity}`
    );

    return incident;
  }

  /**
   * Resolve trip incident
   */
  async resolveTripIncident(
    incidentId: string,
    actualCost?: number,
    resolvedBy?: string
  ): Promise<TripIncident> {
    const incident = await this.tripIncidentRepository.findOne({
      where: { id: incidentId }
    });

    if (!incident) {
      throw new Error("Trip incident not found");
    }

    if (incident.resolved) {
      throw new Error("Incident is already resolved");
    }

    incident.resolved = true;
    incident.resolvedAt = new Date();
    if (actualCost !== undefined) {
      incident.actualCost = actualCost;
    }

    await this.tripIncidentRepository.save(incident);

    return incident;
  }

  /**
   * Get trip incidents
   */
  async getTripIncidents(
    tripId: string,
    resolved?: boolean
  ): Promise<TripIncident[]> {
    const where: any = { tripId };
    if (resolved !== undefined) {
      where.resolved = resolved;
    }

    return await this.tripIncidentRepository.find({
      where,
      relations: ["reportedByUser"],
      order: { occurredAt: "DESC" }
    });
  }

  /**
   * Add GPS tracking point
   */
  async addTrackingPoint(data: {
    tripId: string;
    latitude: number;
    longitude: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    recordedAt: Date;
  }): Promise<TripTracking> {
    const tracking = this.tripTrackingRepository.create(data);
    await this.tripTrackingRepository.save(tracking);
    return tracking;
  }

  /**
   * Get trip tracking data
   */
  async getTripTracking(
    tripId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<TripTracking[]> {
    const queryBuilder = this.tripTrackingRepository
      .createQueryBuilder("tracking")
      .where("tracking.tripId = :tripId", { tripId });

    if (startTime) {
      queryBuilder.andWhere("tracking.recordedAt >= :startTime", { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere("tracking.recordedAt <= :endTime", { endTime });
    }

    queryBuilder.orderBy("tracking.recordedAt", "ASC");

    return await queryBuilder.getMany();
  }

  /**
   * Get trip statistics
   */
  async getTripStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    truckId?: string;
    driverId?: string;
  }): Promise<{
    totalTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    delayedTrips: number;
    totalDistanceKm: number;
    totalFuelConsumed: number;
    averageFuelEfficiency: number;
  }> {
    const queryBuilder = this.tripRepository.createQueryBuilder("trip");

    if (filters?.startDate) {
      queryBuilder.andWhere("trip.scheduledDeparture >= :startDate", { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("trip.scheduledDeparture <= :endDate", { endDate: filters.endDate });
    }

    if (filters?.truckId) {
      queryBuilder.andWhere("trip.truckId = :truckId", { truckId: filters.truckId });
    }

    if (filters?.driverId) {
      queryBuilder.andWhere(
        "(trip.driverId = :driverId OR trip.coDriverId = :driverId)",
        { driverId: filters.driverId }
      );
    }

    const allTrips = await queryBuilder.getMany();

    const totalTrips = allTrips.length;
    const completedTrips = allTrips.filter(t => t.status === TripStatus.COMPLETED).length;
    const cancelledTrips = allTrips.filter(t => t.status === TripStatus.CANCELLED).length;
    const delayedTrips = allTrips.filter(t => t.status === TripStatus.DELAYED).length;

    const totalDistanceKm = allTrips
      .filter(t => t.actualDistanceKm)
      .reduce((sum, t) => sum + Number(t.actualDistanceKm), 0);

    const totalFuelConsumed = allTrips
      .filter(t => t.fuelConsumedLitres)
      .reduce((sum, t) => sum + Number(t.fuelConsumedLitres), 0);

    const averageFuelEfficiency = totalFuelConsumed > 0 
      ? totalDistanceKm / totalFuelConsumed 
      : 0;

    return {
      totalTrips,
      completedTrips,
      cancelledTrips,
      delayedTrips,
      totalDistanceKm,
      totalFuelConsumed,
      averageFuelEfficiency
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
}
