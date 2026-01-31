import { Request, Response } from "express";
import { TruckService } from "../services/truck.service";
import { TruckStatus, Ownership, FuelType } from "../entities/Truck";
import { DocumentType } from "../entities/TruckDocument";

const truckService = new TruckService();

export class TruckController {
  /**
   * Create a new truck
   */
  async createTruck(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const truck = await truckService.createTruck(req.body, userId);
      res.status(201).json({
        success: true,
        message: "Truck created successfully",
        data: truck
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create truck"
      });
    }
  }

  /**
   * Get truck by ID
   */
  async getTruckById(req: Request, res: Response): Promise<void> {
    try {
      const truck = await truckService.getTruckById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: truck
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "Truck not found"
      });
    }
  }

  /**
   * Get all trucks
   */
  async getAllTrucks(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as TruckStatus,
        ownership: req.query.ownership as Ownership,
        fuelType: req.query.fuelType as FuelType,
        search: req.query.search as string,
        expiringDocuments: req.query.expiringDocuments === "true"
      };

      const trucks = await truckService.getAllTrucks(filters);
      res.status(200).json({
        success: true,
        data: trucks,
        count: trucks.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch trucks"
      });
    }
  }

  /**
   * Update truck
   */
  async updateTruck(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const truck = await truckService.updateTruck(
        req.params.id as string,
        req.body,
        userId
      );
      res.status(200).json({
        success: true,
        message: "Truck updated successfully",
        data: truck
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update truck"
      });
    }
  }



  /**
   * Delete truck
   */
  async deleteTruck(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      await truckService.deleteTruck(req.params.id as string, userId);
      res.status(200).json({
        success: true,
        message: "Truck deleted successfully"
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete truck"
      });
    }
  }



}
