import { Request, Response } from "express";
import { FuelLogService } from "../services/fuelLog.service";
import { FuelTypeEnum, PaymentMethod } from "../entities/FuelLog";

const fuelLogService = new FuelLogService();

export class FuelLogController {
  /**
   * Create fuel log(s) - supports single or multiple creation
   * If body is an array, creates multiple logs
   * If body is an object, creates a single log
   */
  async createFuelLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      // Check if request body is an array (batch creation)
      if (Array.isArray(req.body)) {
        // Batch creation
        const logsData = req.body.map((log: any) => ({
          ...log,
          filledAt: new Date(log.filledAt)
        }));

        // Validate at least one log
        if (logsData.length === 0) {
          res.status(400).json({
            success: false,
            message: "At least one fuel log is required"
          });
          return;
        }

        // Validate required fields for each log
        for (let i = 0; i < logsData.length; i++) {
          const log = logsData[i];
          if (!log.logNumber || !log.truckId || !log.driverId || !log.fuelType || !log.amountLitres || 
              !log.costPerLitre || !log.odometerReading || !log.filledAt || !log.locationName || !log.paymentMethod) {
            res.status(400).json({
              success: false,
              message: `Log at index ${i}: Required fields: logNumber, truckId, driverId, fuelType, amountLitres, costPerLitre, odometerReading, filledAt, locationName, paymentMethod`
            });
            return;
          }
        }

        const fuelLogs = await fuelLogService.createMultipleFuelLogs(logsData, userId);

        res.status(201).json({
          success: true,
          message: `${fuelLogs.length} fuel logs created successfully`,
          data: fuelLogs
        });
      } else {
        // Single creation
        const {
          logNumber,
          truckId,
          driverId,
          tripId,
          fuelType,
          amountLitres,
          costPerLitre,
          odometerReading,
          filledAt,
          locationName,
          fuelStationName,
          receiptNumber,
          paymentMethod,
          isFullTank,
          notes
        } = req.body;

        if (!logNumber || !truckId || !driverId || !fuelType || !amountLitres || !costPerLitre || !odometerReading || !filledAt || !locationName || !paymentMethod) {
          res.status(400).json({
            success: false,
            message: "Required fields: logNumber, truckId, driverId, fuelType, amountLitres, costPerLitre, odometerReading, filledAt, locationName, paymentMethod"
          });
          return;
        }

        const fuelLog = await fuelLogService.createFuelLog(
          {
            logNumber,
            truckId,
            driverId,
            tripId,
            fuelType,
            amountLitres,
            costPerLitre,
            odometerReading,
            filledAt: new Date(filledAt),
            locationName,
            fuelStationName,
            receiptNumber,
            paymentMethod,
            isFullTank,
            notes
          },
          userId
        );

        res.status(201).json({
          success: true,
          message: "Fuel log created successfully",
          data: fuelLog
        });
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create fuel log(s)"
      });
    }
  }

  /**
   * Get fuel log by ID
   */
  async getFuelLogById(req: Request, res: Response): Promise<void> {
    try {
      const fuelLog = await fuelLogService.getFuelLogById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: fuelLog
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "Fuel log not found"
      });
    }
  }

  /**
   * Get all fuel logs with filters and pagination
   */
  async getAllFuelLogs(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        truckId: req.query.truckId as string,
        driverId: req.query.driverId as string,
        tripId: req.query.tripId as string,
        fuelType: req.query.fuelType as FuelTypeEnum,
        paymentMethod: req.query.paymentMethod as PaymentMethod,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        search: req.query.search as string
      };

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await fuelLogService.getAllFuelLogs(filters, page, limit);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch fuel logs"
      });
    }
  }

  /**
   * Update fuel log
   */
  async updateFuelLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const fuelLog = await fuelLogService.updateFuelLog(
        req.params.id as string,
        req.body,
        userId
      );
      res.status(200).json({
        success: true,
        message: "Fuel log updated successfully",
        data: fuelLog
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update fuel log"
      });
    }
  }

  /**
   * Delete fuel log
   */
  async deleteFuelLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      await fuelLogService.deleteFuelLog(req.params.id as string, userId);
      res.status(200).json({
        success: true,
        message: "Fuel log deleted successfully"
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete fuel log"
      });
    }
  }

  /**
   * Get fuel statistics
   */
  async getFuelStatistics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        truckId: req.query.truckId as string,
        driverId: req.query.driverId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const stats = await fuelLogService.getFuelStatistics(filters);
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch fuel statistics"
      });
    }
  }
}
