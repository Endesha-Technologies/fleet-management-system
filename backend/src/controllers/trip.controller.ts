import { Request, Response } from "express";
import { TripService } from "../services/trip.service";
import { TripStatus } from "../entities/Trip";
import { TripStopType } from "../entities/TripStop";
import { IncidentType, Severity } from "../entities/TripIncident";

const tripService = new TripService();

export class TripController {
  /**
   * Create a new trip
   */
  async createTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const trip = await tripService.createTrip(req.body, userId);
      res.status(201).json({
        success: true,
        message: "Trip created successfully",
        data: trip
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create trip"
      });
    }
  }

  /**
   * Get trip by ID
   */
  async getTripById(req: Request, res: Response): Promise<void> {
    try {
      const trip = await tripService.getTripById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: trip
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "Trip not found"
      });
    }
  }

  /**
   * Get all trips with filters and pagination
   * Query params: status, truckId, driverId, routeId, startDate, endDate, search, page, limit
   */
  async getAllTrips(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as TripStatus,
        truckId: req.query.truckId as string,
        driverId: req.query.driverId as string,
        routeId: req.query.routeId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        search: req.query.search as string
      };

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await tripService.getAllTrips(filters, page, limit);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch trips"
      });
    }
  }

  /**
   * Update trip
   */
  async updateTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const trip = await tripService.updateTrip(
        req.params.id as string,
        req.body,
        userId
      );
      res.status(200).json({
        success: true,
        message: "Trip updated successfully",
        data: trip
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update trip"
      });
    }
  }

  /**
   * Start trip
   */
  async startTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { odometerStart, engineHoursStart, actualDeparture } = req.body;

      if (!odometerStart || !engineHoursStart || !actualDeparture) {
        res.status(400).json({
          success: false,
          message: "odometerStart, engineHoursStart, and actualDeparture are required"
        });
        return;
      }

      const trip = await tripService.startTrip(
        req.params.id as string,
        odometerStart,
        engineHoursStart,
        new Date(actualDeparture),
        userId
      );

      res.status(200).json({
        success: true,
        message: "Trip started successfully",
        data: trip
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to start trip"
      });
    }
  }

  /**
   * Complete trip
   */
  async completeTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { odometerEnd, engineHoursEnd, actualArrival, fuelConsumedLitres, notes } = req.body;

      if (!odometerEnd || !engineHoursEnd || !actualArrival) {
        res.status(400).json({
          success: false,
          message: "odometerEnd, engineHoursEnd, and actualArrival are required"
        });
        return;
      }

      const trip = await tripService.completeTrip(
        req.params.id as string,
        {
          odometerEnd,
          engineHoursEnd,
          actualArrival: new Date(actualArrival),
          fuelConsumedLitres,
          notes
        },
        userId
      );

      res.status(200).json({
        success: true,
        message: "Trip completed successfully",
        data: trip
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to complete trip"
      });
    }
  }

  /**
   * Mark trip as delayed
   */
  async markTripDelayed(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { delayReason } = req.body;

      if (!delayReason || delayReason.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Delay reason is required"
        });
        return;
      }

      const trip = await tripService.markTripDelayed(
        req.params.id as string,
        delayReason,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Trip marked as delayed",
        data: trip
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to mark trip as delayed"
      });
    }
  }

  /**
   * Cancel trip
   */
  async cancelTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { cancellationReason } = req.body;

      if (!cancellationReason || cancellationReason.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Cancellation reason is required"
        });
        return;
      }

      const trip = await tripService.cancelTrip(
        req.params.id as string,
        cancellationReason,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Trip cancelled successfully",
        data: trip
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to cancel trip"
      });
    }
  }

  /**
   * Add trip stop
   */
  async addTripStop(req: Request, res: Response): Promise<void> {
    try {
      const stop = await tripService.addTripStop({
        ...req.body,
        tripId: req.params.id as string
      });

      res.status(201).json({
        success: true,
        message: "Trip stop added successfully",
        data: stop
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add trip stop"
      });
    }
  }

  /**
   * Update trip stop departure
   */
  async updateTripStopDeparture(req: Request, res: Response): Promise<void> {
    try {
      const { departureTime } = req.body;

      if (!departureTime) {
        res.status(400).json({
          success: false,
          message: "departureTime is required"
        });
        return;
      }

      const stop = await tripService.updateTripStopDeparture(
        req.params.stopId as string,
        new Date(departureTime)
      );

      res.status(200).json({
        success: true,
        message: "Trip stop updated successfully",
        data: stop
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update trip stop"
      });
    }
  }

  /**
   * Get trip stops
   */
  async getTripStops(req: Request, res: Response): Promise<void> {
    try {
      const stops = await tripService.getTripStops(req.params.id as string);
      res.status(200).json({
        success: true,
        data: stops,
        count: stops.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch trip stops"
      });
    }
  }

  /**
   * Add trip incident
   */
  async addTripIncident(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const incident = await tripService.addTripIncident(
        {
          ...req.body,
          tripId: req.params.id as string
        },
        userId
      );

      res.status(201).json({
        success: true,
        message: "Trip incident reported successfully",
        data: incident
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to report trip incident"
      });
    }
  }

  /**
   * Resolve trip incident
   */
  async resolveTripIncident(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { actualCost } = req.body;

      const incident = await tripService.resolveTripIncident(
        req.params.incidentId as string,
        actualCost,
        userId
      );

      res.status(200).json({
        success: true,
        message: "Trip incident resolved successfully",
        data: incident
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to resolve trip incident"
      });
    }
  }

  /**
   * Get trip incidents
   */
  async getTripIncidents(req: Request, res: Response): Promise<void> {
    try {
      const resolved = req.query.resolved === "true" ? true : req.query.resolved === "false" ? false : undefined;
      const incidents = await tripService.getTripIncidents(
        req.params.id as string,
        resolved
      );

      res.status(200).json({
        success: true,
        data: incidents,
        count: incidents.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch trip incidents"
      });
    }
  }

  /**
   * Add GPS tracking point
   */
  async addTrackingPoint(req: Request, res: Response): Promise<void> {
    try {
      const tracking = await tripService.addTrackingPoint({
        ...req.body,
        tripId: req.params.id as string
      });

      res.status(201).json({
        success: true,
        data: tracking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add tracking point"
      });
    }
  }

  /**
   * Get trip tracking data
   */
  async getTripTracking(req: Request, res: Response): Promise<void> {
    try {
      const startTime = req.query.startTime ? new Date(req.query.startTime as string) : undefined;
      const endTime = req.query.endTime ? new Date(req.query.endTime as string) : undefined;

      const tracking = await tripService.getTripTracking(
        req.params.id as string,
        startTime,
        endTime
      );

      res.status(200).json({
        success: true,
        data: tracking,
        count: tracking.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch trip tracking"
      });
    }
  }

  /**
   * Get trip statistics
   */
  async getTripStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        truckId: req.query.truckId as string,
        driverId: req.query.driverId as string
      };

      const stats = await tripService.getTripStatistics(filters);
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch trip statistics"
      });
    }
  }
}
