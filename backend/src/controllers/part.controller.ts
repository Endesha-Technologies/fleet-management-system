import { Request, Response } from "express";
import { PartService } from "../services/part.service";
import { PartStatus, PartCategory } from "../entities/Part";
import { TransactionType } from "../entities/PartHistory";
import { InstallationStatus } from "../entities/PartInstallation";

const partService = new PartService();

export class PartController {
  /**
   * Create a new part
   */
  async createPart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const part = await partService.createPart(req.body, userId);
      res.status(201).json({
        success: true,
        message: "Part created successfully",
        data: part
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create part"
      });
    }
  }

  /**
   * Get part by ID
   */
  async getPartById(req: Request, res: Response): Promise<void> {
    try {
      const part = await partService.getPartById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: part
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "Part not found"
      });
    }
  }

  /**
   * Get all parts
   */
  async getAllParts(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        category: req.query.category as PartCategory,
        status: req.query.status as PartStatus,
        search: req.query.search as string,
        lowStock: req.query.lowStock === "true"
      };

      const parts = await partService.getAllParts(filters);
      res.status(200).json({
        success: true,
        data: parts,
        count: parts.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch parts"
      });
    }
  }

  /**
   * Update part
   */
  async updatePart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const part = await partService.updatePart(
        req.params.id as string,
        req.body,
        userId
      );
      res.status(200).json({
        success: true,
        message: "Part updated successfully",
        data: part
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update part"
      });
    }
  }

  /**
   * Adjust stock quantity (supports adjustment, sale, disposal, return, transfer)
   */
  async adjustStock(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { quantityChange, transactionType, reason, unitPrice, buyerName, disposalReason, referenceNumber } = req.body;

      if (typeof quantityChange !== "number") {
        res.status(400).json({
          success: false,
          message: "Invalid quantity change value"
        });
        return;
      }

      if (!transactionType || !Object.values(TransactionType).includes(transactionType)) {
        res.status(400).json({
          success: false,
          message: "Valid transaction type is required (adjustment, sale, disposal, return, transfer)"
        });
        return;
      }

      if (!reason || reason.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Reason is required for stock adjustment"
        });
        return;
      }

      // Validate required fields for specific transaction types
      if (transactionType === TransactionType.SALE) {
        if (!buyerName || buyerName.trim() === "") {
          res.status(400).json({
            success: false,
            message: "Buyer name is required for sales"
          });
          return;
        }
        if (typeof unitPrice !== "number" || unitPrice < 0) {
          res.status(400).json({
            success: false,
            message: "Valid unit price is required for sales"
          });
          return;
        }
      }

      if (transactionType === TransactionType.DISPOSAL) {
        if (!disposalReason || disposalReason.trim() === "") {
          res.status(400).json({
            success: false,
            message: "Disposal reason is required for disposals"
          });
          return;
        }
      }

      const part = await partService.adjustStock(
        req.params.id as string,
        quantityChange,
        transactionType,
        reason,
        userId,
        {
          unitPrice,
          buyerName,
          disposalReason,
          referenceNumber
        }
      );

      res.status(200).json({
        success: true,
        message: "Stock adjusted successfully",
        data: part
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to adjust stock"
      });
    }
  }

  /**
   * Record part purchase
   */
  async recordPurchase(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { quantity, unitPrice, referenceNumber, notes } = req.body;

      if (typeof quantity !== "number" || quantity <= 0) {
        res.status(400).json({
          success: false,
          message: "Invalid quantity value"
        });
        return;
      }

      if (typeof unitPrice !== "number" || unitPrice < 0) {
        res.status(400).json({
          success: false,
          message: "Invalid unit price value"
        });
        return;
      }

      if (!referenceNumber || referenceNumber.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Reference number is required"
        });
        return;
      }

      const part = await partService.recordPurchase(
        req.params.id as string,
        quantity,
        unitPrice,
        referenceNumber,
        userId,
        notes
      );

      res.status(200).json({
        success: true,
        message: "Purchase recorded successfully",
        data: part
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to record purchase"
      });
    }
  }

  /**
   * Install part on truck
   */
  async installPart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const installation = await partService.installPart({
        ...req.body,
        installedBy: userId
      });

      res.status(201).json({
        success: true,
        message: "Part installed successfully",
        data: installation
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to install part"
      });
    }
  }

  /**
   * Remove part from truck
   */
  async removePart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const installation = await partService.removePart(req.params.installationId as string, {
        ...req.body,
        removedBy: userId
      });

      res.status(200).json({
        success: true,
        message: "Part removed successfully",
        data: installation
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to remove part"
      });
    }
  }

  /**
   * Get part installations for a truck
   */
  async getPartInstallations(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as InstallationStatus;
      const installations = await partService.getPartInstallations(
        req.params.truckId as string,
        status
      );

      res.status(200).json({
        success: true,
        data: installations,
        count: installations.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch part installations"
      });
    }
  }

  /**
   * Get part transaction history
   */
  async getPartHistory(req: Request, res: Response): Promise<void> {
    try {
      const transactionType = req.query.type as TransactionType;
      const history = await partService.getPartHistory(
        req.params.id as string,
        transactionType
      );

      res.status(200).json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch part history"
      });
    }
  }

  /**
   * Delete part (soft delete)
   */
  async deletePart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      await partService.deletePart(req.params.id as string, userId);
      res.status(200).json({
        success: true,
        message: "Part deleted successfully"
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete part"
      });
    }
  }
}
