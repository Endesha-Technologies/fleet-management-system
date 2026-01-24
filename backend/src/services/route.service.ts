import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Route, RouteType, RouteStopData } from "../entities/Route";
import { AuditLog } from "../entities/AuditLog";

export class RouteService {
  private routeRepository: Repository<Route>;
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.routeRepository = AppDataSource.getRepository(Route);
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create a new route
   */
  async createRoute(
    data: {
      routeCode: string;
      name: string;
      description?: string;
      startLocationName: string;
      startLocationCoords?: { latitude: number; longitude: number };
      endLocationName: string;
      endLocationCoords?: { latitude: number; longitude: number };
      stops?: RouteStopData[];
      routeType: RouteType;
      estimatedDistanceKm: number;
      estimatedDurationHours: number;
      notes?: string;
    },
    createdBy: string
  ): Promise<Route> {
    // Check if route code already exists
    const existingRoute = await this.routeRepository.findOne({
      where: { routeCode: data.routeCode }
    });
    if (existingRoute) {
      throw new Error("Route code already exists");
    }

    // Validate stops sequence if provided
    if (data.stops && data.stops.length > 0) {
      const sequences = data.stops.map(s => s.stopSequence);
      const uniqueSequences = new Set(sequences);
      if (uniqueSequences.size !== sequences.length) {
        throw new Error("Duplicate stop sequence numbers found");
      }
    }

    const route = this.routeRepository.create({
      routeCode: data.routeCode,
      name: data.name,
      description: data.description,
      startLocationName: data.startLocationName,
      endLocationName: data.endLocationName,
      stops: data.stops || [],
      routeType: data.routeType,
      estimatedDistanceKm: data.estimatedDistanceKm,
      estimatedDurationHours: data.estimatedDurationHours,
      notes: data.notes,
      isActive: true,
      createdBy
    });

    await this.routeRepository.save(route);

    // Create audit log
    await this.createAuditLog(
      "ROUTE_CREATED",
      createdBy,
      "Route",
      route.id,
      `Route ${route.routeCode} - ${route.name} created`
    );

    return route;
  }

  /**
   * Get route by ID
   */
  async getRouteById(routeId: string): Promise<Route> {
    const route = await this.routeRepository.findOne({
      where: { id: routeId },
      relations: ["createdByUser"]
    });

    if (!route) {
      throw new Error("Route not found");
    }

    return route;
  }

  /**
   * Get all routes with filters and pagination
   */
  async getAllRoutes(filters?: {
    routeType?: RouteType;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Route[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.routeRepository.createQueryBuilder("route");

    if (filters?.routeType) {
      queryBuilder.andWhere("route.routeType = :routeType", { routeType: filters.routeType });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere("route.isActive = :isActive", { isActive: filters.isActive });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(route.routeCode ILIKE :search OR route.name ILIKE :search OR route.startLocationName ILIKE :search OR route.endLocationName ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    queryBuilder.orderBy("route.name", "ASC");

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update route
   */
  async updateRoute(
    routeId: string,
    data: {
      name?: string;
      description?: string;
      startLocationName?: string;
      startLocationCoords?: { latitude: number; longitude: number };
      endLocationName?: string;
      endLocationCoords?: { latitude: number; longitude: number };
      stops?: RouteStopData[];
      routeType?: RouteType;
      estimatedDistanceKm?: number;
      estimatedDurationHours?: number;
      notes?: string;
    },
    updatedBy: string
  ): Promise<Route> {
    const route = await this.getRouteById(routeId);

    // Validate stops sequence if provided
    if (data.stops && data.stops.length > 0) {
      const sequences = data.stops.map(s => s.stopSequence);
      const uniqueSequences = new Set(sequences);
      if (uniqueSequences.size !== sequences.length) {
        throw new Error("Duplicate stop sequence numbers found");
      }
    }

    Object.assign(route, data);
    await this.routeRepository.save(route);

    // Create audit log
    await this.createAuditLog(
      "ROUTE_UPDATED",
      updatedBy,
      "Route",
      route.id,
      `Route ${route.routeCode} - ${route.name} updated`
    );

    return route;
  }

  /**
   * Activate or deactivate route
   */
  async toggleRouteStatus(
    routeId: string,
    isActive: boolean,
    updatedBy: string
  ): Promise<Route> {
    const route = await this.getRouteById(routeId);

    route.isActive = isActive;
    await this.routeRepository.save(route);

    // Create audit log
    await this.createAuditLog(
      "ROUTE_STATUS_CHANGED",
      updatedBy,
      "Route",
      route.id,
      `Route ${route.routeCode} ${isActive ? 'activated' : 'deactivated'}`
    );

    return route;
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
