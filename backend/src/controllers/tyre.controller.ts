import { Request, Response } from "express";
import { TyreService } from "../services/tyre.service";
import { TyreStatus, TyreType } from "../entities/Tyre";
import { PassFail } from "../entities/TyreInspection";

const tyreService = new TyreService();

export class TyreController {
    // ==================== TYRE INVENTORY ====================

    /**
     * Create new tyre
     */
    async createTyre(req: Request, res: Response): Promise<void> {
        try {
            const {
                tyreNumber,
                serialNumber,
                brand,
                model,
                size,
                tyreType,
                plyRating,
                loadIndex,
                speedRating,
                purchaseDate,
                purchaseCost,
                supplierName,
                warrantyMileage,
                warrantyExpiryDate,
                originalTreadDepth,
                currentTreadDepth,
                notes
            } = req.body;

            // Validate required fields
            if (!tyreNumber || !brand || !model || !size || !tyreType || !purchaseDate || 
                purchaseCost === undefined || originalTreadDepth === undefined) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
                return;
            }

            const userId = (req as any).user.id;

            const tyre = await tyreService.createTyre({
                tyreNumber,
                serialNumber,
                brand,
                model,
                size,
                tyreType,
                plyRating,
                loadIndex,
                speedRating,
                purchaseDate: new Date(purchaseDate),
                purchaseCost,
                supplierName,
                warrantyMileage,
                warrantyExpiryDate: warrantyExpiryDate ? new Date(warrantyExpiryDate) : undefined,
                originalTreadDepth,
                currentTreadDepth,
                notes
            }, userId);

            res.status(201).json({
                success: true,
                message: "Tyre created successfully",
                data: tyre
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to create tyre"
            });
        }
    }

    /**
     * Get tyre by ID
     */
    async getTyreById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tyreId = Array.isArray(id) ? id[0] : id;
            const tyre = await tyreService.getTyreById(tyreId);

            res.status(200).json({
                success: true,
                data: tyre
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message || "Tyre not found"
            });
        }
    }

    /**
     * Get all tyres with filters
     */
    async getAllTyres(req: Request, res: Response): Promise<void> {
        try {
            const {
                status,
                tyreType,
                brand,
                size,
                minTreadDepth,
                maxTreadDepth,
                warrantyStatus,
                search,
                page,
                limit
            } = req.query;

            const result = await tyreService.getAllTyres({
                status: status as TyreStatus,
                tyreType: tyreType as TyreType,
                brand: brand as string,
                size: size as string,
                minTreadDepth: minTreadDepth ? Number(minTreadDepth) : undefined,
                maxTreadDepth: maxTreadDepth ? Number(maxTreadDepth) : undefined,
                warrantyStatus: warrantyStatus as "active" | "expired" | "all",
                search: search as string,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined
            });

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to retrieve tyres"
            });
        }
    }

    /**
     * Update tyre
     */
    async updateTyre(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tyreId = Array.isArray(id) ? id[0] : id;
            const userId = (req as any).user.id;

            const tyre = await tyreService.updateTyre(tyreId, req.body, userId);

            res.status(200).json({
                success: true,
                message: "Tyre updated successfully",
                data: tyre
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to update tyre"
            });
        }
    }

    /**
     * Delete tyre
     */
    async deleteTyre(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tyreId = Array.isArray(id) ? id[0] : id;
            const userId = (req as any).user.id;

            await tyreService.deleteTyre(tyreId, userId);

            res.status(200).json({
                success: true,
                message: "Tyre deleted successfully"
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to delete tyre"
            });
        }
    }

    // ==================== TYRE INSTALLATION ====================

    /**
     * Install tyre on truck
     */
    async installTyre(req: Request, res: Response): Promise<void> {
        try {
            const {
                tyreId,
                truckId,
                axlePosition,
                wheelPosition,
                installationDate,
                odometerAtInstallation,
                treadDepthAtInstallation,
                pressureAtInstallation,
                workOrderId,
                notes
            } = req.body;

            if (!tyreId || !truckId || !axlePosition || !wheelPosition || !installationDate || 
                odometerAtInstallation === undefined || treadDepthAtInstallation === undefined) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
                return;
            }

            const userId = (req as any).user.id;

            const installation = await tyreService.installTyre({
                tyreId,
                truckId,
                axlePosition,
                wheelPosition,
                installationDate: new Date(installationDate),
                odometerAtInstallation,
                treadDepthAtInstallation,
                pressureAtInstallation,
                installedBy: userId,
                workOrderId,
                notes
            }, userId);

            res.status(201).json({
                success: true,
                message: "Tyre installed successfully",
                data: installation
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to install tyre"
            });
        }
    }

    /**
     * Rotate tyre
     */
    async rotateTyre(req: Request, res: Response): Promise<void> {
        try {
            const {
                tyreId,
                truckId,
                newAxlePosition,
                newWheelPosition,
                rotationDate,
                odometerReading,
                treadDepth,
                pressure,
                reason,
                notes
            } = req.body;

            if (!tyreId || !truckId || !newAxlePosition || !newWheelPosition || !rotationDate || 
                odometerReading === undefined || treadDepth === undefined) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
                return;
            }

            const userId = (req as any).user.id;

            const rotation = await tyreService.rotateTyre({
                tyreId,
                truckId,
                newAxlePosition,
                newWheelPosition,
                rotationDate: new Date(rotationDate),
                odometerReading,
                treadDepth,
                pressure,
                installedBy: userId,
                reason,
                notes
            }, userId);

            res.status(200).json({
                success: true,
                message: "Tyre rotated successfully",
                data: rotation
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to rotate tyre"
            });
        }
    }

    /**
     * Remove tyre from truck
     */
    async removeTyre(req: Request, res: Response): Promise<void> {
        try {
            const {
                tyreId,
                truckId,
                removalDate,
                odometerReading,
                treadDepth,
                removalReason,
                notes
            } = req.body;

            if (!tyreId || !truckId || !removalDate || odometerReading === undefined || 
                treadDepth === undefined || !removalReason) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
                return;
            }

            const userId = (req as any).user.id;

            const removal = await tyreService.removeTyre({
                tyreId,
                truckId,
                removalDate: new Date(removalDate),
                odometerReading,
                treadDepth,
                removalReason,
                removedBy: userId,
                notes
            }, userId);

            res.status(200).json({
                success: true,
                message: "Tyre removed successfully",
                data: removal
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to remove tyre"
            });
        }
    }

    /**
     * Get truck tyre positions
     */
    async getTruckTyrePositions(req: Request, res: Response): Promise<void> {
        try {
            const { truckId } = req.params;
            const id = Array.isArray(truckId) ? truckId[0] : truckId;
            const positions = await tyreService.getTruckTyrePositions(id);

            res.status(200).json({
                success: true,
                data: positions
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to retrieve tyre positions"
            });
        }
    }

    /**
     * Get tyre history
     */
    async getTyreHistory(req: Request, res: Response): Promise<void> {
        try {
            const { tyreId } = req.params;
            const id = Array.isArray(tyreId) ? tyreId[0] : tyreId;
            const history = await tyreService.getTyreHistory(id);

            res.status(200).json({
                success: true,
                data: history
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to retrieve tyre history"
            });
        }
    }

    // ==================== TYRE INSPECTION ====================

    /**
     * Create tyre inspection
     */
    async createInspection(req: Request, res: Response): Promise<void> {
        try {
            const {
                tyreId,
                truckId,
                inspectionDate,
                odometerReading,
                treadDepth,
                pressure,
                visualCondition,
                hasUniformWear,
                hasCuts,
                hasCracks,
                hasBulges,
                hasEmbeddedObjects,
                alignmentIssues,
                passFail,
                actionRequired,
                notes
            } = req.body;

            if (!tyreId || !inspectionDate || treadDepth === undefined || pressure === undefined || 
                !visualCondition || !passFail) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
                return;
            }

            const userId = (req as any).user.id;

            const inspection = await tyreService.createInspection({
                tyreId,
                truckId,
                inspectionDate: new Date(inspectionDate),
                odometerReading,
                inspectedBy: userId,
                treadDepth,
                pressure,
                visualCondition,
                hasUniformWear,
                hasCuts,
                hasCracks,
                hasBulges,
                hasEmbeddedObjects,
                alignmentIssues,
                passFail,
                actionRequired,
                notes
            }, userId);

            res.status(201).json({
                success: true,
                message: "Tyre inspection created successfully",
                data: inspection
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to create inspection"
            });
        }
    }

    /**
     * Get tyre inspections
     */
    async getTyreInspections(req: Request, res: Response): Promise<void> {
        try {
            const { tyreId } = req.params;
            const id = Array.isArray(tyreId) ? tyreId[0] : tyreId;
            const inspections = await tyreService.getTyreInspections(id);

            res.status(200).json({
                success: true,
                data: inspections
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to retrieve inspections"
            });
        }
    }

    /**
     * Get all inspections with filters
     */
    async getAllInspections(req: Request, res: Response): Promise<void> {
        try {
            const {
                tyreId,
                truckId,
                passFail,
                startDate,
                endDate,
                page,
                limit
            } = req.query;

            const result = await tyreService.getAllInspections({
                tyreId: tyreId as string,
                truckId: truckId as string,
                passFail: passFail as PassFail,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined
            });

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to retrieve inspections"
            });
        }
    }

    // ==================== TYRE DISPOSAL ====================

    /**
     * Dispose tyre
     */
    async disposeTyre(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const tyreId = Array.isArray(id) ? id[0] : id;
            const { disposalDate, disposalReason, disposalType, notes } = req.body;

            if (!disposalDate || !disposalReason || !disposalType) {
                res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
                return;
            }

            const userId = (req as any).user.id;

            const tyre = await tyreService.disposeTyre({
                tyreId,
                disposalDate: new Date(disposalDate),
                disposalReason,
                disposalType,
                notes
            }, userId);

            res.status(200).json({
                success: true,
                message: "Tyre disposed successfully",
                data: tyre
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to dispose tyre"
            });
        }
    }

    // ==================== STATISTICS & REPORTS ====================

    /**
     * Get tyre statistics
     */
    async getTyreStatistics(req: Request, res: Response): Promise<void> {
        try {
            const stats = await tyreService.getTyreStatistics();

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to retrieve statistics"
            });
        }
    }

    /**
     * Get tyres due for inspection
     */
    async getTyresDueForInspection(req: Request, res: Response): Promise<void> {
        try {
            const { mileageThreshold } = req.query;
            const threshold = mileageThreshold ? Number(mileageThreshold) : 10000;

            const tyres = await tyreService.getTyresDueForInspection(threshold);

            res.status(200).json({
                success: true,
                data: tyres
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to retrieve tyres due for inspection"
            });
        }
    }

    /**
     * Get tyres with low tread depth
     */
    async getLowTreadTyres(req: Request, res: Response): Promise<void> {
        try {
            const { minTreadDepth } = req.query;
            const threshold = minTreadDepth ? Number(minTreadDepth) : 3;

            const tyres = await tyreService.getLowTreadTyres(threshold);

            res.status(200).json({
                success: true,
                data: tyres
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to retrieve low tread tyres"
            });
        }
    }
}

export const tyreController = new TyreController();
