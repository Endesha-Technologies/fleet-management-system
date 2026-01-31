import { Router } from "express";
import { tyreController } from "../controllers/tyre.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== TYRE INVENTORY ROUTES ====================

/**
 * @route   POST /api/tyres
 * @desc    Create new tyre
 * @access  CREATE_TYRE permission
 */
router.post(
    "/",
    authorize("CREATE_TYRE"),
    tyreController.createTyre.bind(tyreController)
);

/**
 * @route   GET /api/tyres
 * @desc    Get all tyres with filters
 * @access  VIEW_TYRE permission
 */
router.get(
    "/",
    authorize("VIEW_TYRE"),
    tyreController.getAllTyres.bind(tyreController)
);

/**
 * @route   GET /api/tyres/statistics
 * @desc    Get tyre statistics
 * @access  VIEW_TYRE permission
 */
router.get(
    "/statistics",
    authorize("VIEW_TYRE"),
    tyreController.getTyreStatistics.bind(tyreController)
);

/**
 * @route   GET /api/tyres/due-for-inspection
 * @desc    Get tyres due for inspection
 * @access  VIEW_TYRE permission
 */
router.get(
    "/due-for-inspection",
    authorize("VIEW_TYRE"),
    tyreController.getTyresDueForInspection.bind(tyreController)
);

/**
 * @route   GET /api/tyres/low-tread
 * @desc    Get tyres with low tread depth
 * @access  VIEW_TYRE permission
 */
router.get(
    "/low-tread",
    authorize("VIEW_TYRE"),
    tyreController.getLowTreadTyres.bind(tyreController)
);

/**
 * @route   GET /api/tyres/:id
 * @desc    Get tyre by ID
 * @access  VIEW_TYRE permission
 */
router.get(
    "/:id",
    authorize("VIEW_TYRE"),
    tyreController.getTyreById.bind(tyreController)
);

/**
 * @route   PUT /api/tyres/:id
 * @desc    Update tyre
 * @access  UPDATE_TYRE permission
 */
router.put(
    "/:id",
    authorize("UPDATE_TYRE"),
    tyreController.updateTyre.bind(tyreController)
);

/**
 * @route   DELETE /api/tyres/:id
 * @desc    Delete tyre
 * @access  DELETE_TYRE permission
 */
router.delete(
    "/:id",
    authorize("DELETE_TYRE"),
    tyreController.deleteTyre.bind(tyreController)
);

// ==================== TYRE INSTALLATION ROUTES ====================

/**
 * @route   POST /api/tyres/install
 * @desc    Install tyre on truck
 * @access  INSTALL_TYRE permission
 */
router.post(
    "/install",
    authorize("INSTALL_TYRE"),
    tyreController.installTyre.bind(tyreController)
);

/**
 * @route   POST /api/tyres/rotate
 * @desc    Rotate tyre position
 * @access  INSTALL_TYRE permission
 */
router.post(
    "/rotate",
    authorize("INSTALL_TYRE"),
    tyreController.rotateTyre.bind(tyreController)
);

/**
 * @route   POST /api/tyres/remove
 * @desc    Remove tyre from truck
 * @access  INSTALL_TYRE permission
 */
router.post(
    "/remove",
    authorize("INSTALL_TYRE"),
    tyreController.removeTyre.bind(tyreController)
);

/**
 * @route   GET /api/tyres/truck/:truckId/positions
 * @desc    Get all tyre positions on a truck
 * @access  VIEW_TYRE permission
 */
router.get(
    "/truck/:truckId/positions",
    authorize("VIEW_TYRE"),
    tyreController.getTruckTyrePositions.bind(tyreController)
);

/**
 * @route   GET /api/tyres/:tyreId/history
 * @desc    Get tyre installation history
 * @access  VIEW_TYRE permission
 */
router.get(
    "/:tyreId/history",
    authorize("VIEW_TYRE"),
    tyreController.getTyreHistory.bind(tyreController)
);

// ==================== TYRE INSPECTION ROUTES ====================

/**
 * @route   POST /api/tyres/inspections
 * @desc    Create tyre inspection
 * @access  CREATE_INSPECTION permission
 */
router.post(
    "/inspections",
    authorize("CREATE_INSPECTION"),
    tyreController.createInspection.bind(tyreController)
);

/**
 * @route   GET /api/tyres/inspections
 * @desc    Get all inspections with filters
 * @access  VIEW_INSPECTION permission
 */
router.get(
    "/inspections",
    authorize("VIEW_INSPECTION"),
    tyreController.getAllInspections.bind(tyreController)
);

/**
 * @route   GET /api/tyres/:tyreId/inspections
 * @desc    Get inspections for a specific tyre
 * @access  VIEW_INSPECTION permission
 */
router.get(
    "/:tyreId/inspections",
    authorize("VIEW_INSPECTION"),
    tyreController.getTyreInspections.bind(tyreController)
);

// ==================== TYRE DISPOSAL ROUTES ====================

/**
 * @route   POST /api/tyres/:id/dispose
 * @desc    Dispose tyre
 * @access  DISPOSE_TYRE permission
 */
router.post(
    "/:id/dispose",
    authorize("DISPOSE_TYRE"),
    tyreController.disposeTyre.bind(tyreController)
);

export default router;
