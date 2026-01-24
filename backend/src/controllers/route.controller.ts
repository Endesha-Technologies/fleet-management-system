import { Request, Response } from "express";
import { RouteService } from "../services/route.service";
import { RouteType } from "../entities/Route";

const routeService = new RouteService();

export class RouteController {
  /**
   * Create a new route
   */
  async createRoute(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const route = await routeService.createRoute(req.body, userId);
      res.status(201).json({
        success: true,
        message: "Route created successfully",
        data: route
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create route"
      });
    }
  }

  /**
   * Get route by ID
   */
  async getRouteById(req: Request, res: Response): Promise<void> {
    try {
      const route = await routeService.getRouteById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: route
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "Route not found"
      });
    }
  }

  /**
   * Get all routes
   */
  async getAllRoutes(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        routeType: req.query.routeType as RouteType,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = await routeService.getAllRoutes(filters);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: filters.limit
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch routes"
      });
    }
  }

  /**
   * Update route
   */
  async updateRoute(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const route = await routeService.updateRoute(
        req.params.id as string,
        req.body,
        userId
      );
      res.status(200).json({
        success: true,
        message: "Route updated successfully",
        data: route
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update route"
      });
    }
  }

  /**
   * Toggle route status (activate/deactivate)
   */
  async toggleRouteStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        res.status(400).json({
          success: false,
          message: "isActive must be a boolean value"
        });
        return;
      }

      const route = await routeService.toggleRouteStatus(
        req.params.id as string,
        isActive,
        userId
      );

      res.status(200).json({
        success: true,
        message: `Route ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: route
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to toggle route status"
      });
    }
  }

}
