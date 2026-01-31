import { Router } from "express";
import { FuelLogController } from "../controllers/fuelLog.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const fuelLogController = new FuelLogController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/fuel-logs
 * @desc    Create fuel log(s) - supports single or batch creation
 *          Single: pass object with fuel log data
 *          Batch: pass array of fuel log objects
 * @access  Private (CREATE_FUEL_LOG permission)
 * @example Single: { "logNumber": "FL001", "truckId": "...", ... }
 * @example Batch: [{ "logNumber": "FL001", ... }, { "logNumber": "FL002", ... }]
 */
router.post(
  "/",
  authorize("CREATE_FUEL_LOG"),
  (req, res) => fuelLogController.createFuelLog(req, res)
);

/**
 * @route   GET /api/fuel-logs
 * @desc    Get all fuel logs with filters and pagination
 * @access  Private (VIEW_FUEL_LOG permission)
 * @query   truckId, driverId, tripId, fuelType, paymentMethod, startDate, endDate, search, page, limit
 */
router.get(
  "/",
  authorize("VIEW_FUEL_LOG"),
  (req, res) => fuelLogController.getAllFuelLogs(req, res)
);

/**
 * @route   GET /api/fuel-logs/statistics
 * @desc    Get fuel statistics and metrics
 * @access  Private (VIEW_FUEL_LOG permission)
 * @query   truckId, driverId, startDate, endDate
 */
router.get(
  "/statistics",
  authorize("VIEW_FUEL_LOG"),
  (req, res) => fuelLogController.getFuelStatistics(req, res)
);

/**
 * @route   GET /api/fuel-logs/:id
 * @desc    Get fuel log by ID
 * @access  Private (VIEW_FUEL_LOG permission)
 */
router.get(
  "/:id",
  authorize("VIEW_FUEL_LOG"),
  (req, res) => fuelLogController.getFuelLogById(req, res)
);

/**
 * @route   PUT /api/fuel-logs/:id
 * @desc    Update fuel log
 * @access  Private (UPDATE_FUEL_LOG permission)
 */
router.put(
  "/:id",
  authorize("UPDATE_FUEL_LOG"),
  (req, res) => fuelLogController.updateFuelLog(req, res)
);

/**
 * @route   DELETE /api/fuel-logs/:id
 * @desc    Delete fuel log
 * @access  Private (DELETE_FUEL_LOG permission)
 */
router.delete(
  "/:id",
  authorize("DELETE_FUEL_LOG"),
  (req, res) => fuelLogController.deleteFuelLog(req, res)
);

export default router;
