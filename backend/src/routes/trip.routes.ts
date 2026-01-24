import { Router } from "express";
import { TripController } from "../controllers/trip.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const tripController = new TripController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/trips
 * @desc    Create a new trip
 * @access  Private (requires trip:create permission)
 */
router.post(
  "/",
  authorize("trip:create"),
  tripController.createTrip.bind(tripController)
);

/**
 * @route   GET /api/trips
 * @desc    Get all trips with filters and pagination
 *          Query params: status, truckId, driverId, routeId, startDate, endDate, search, page, limit
 *          Example: /api/trips?status=in_progress&page=1&limit=10
 * @access  Private (requires trip:read permission)
 */
router.get(
  "/",
  authorize("trip:read"),
  tripController.getAllTrips.bind(tripController)
);

/**
 * @route   GET /api/trips/statistics
 * @desc    Get trip statistics
 * @access  Private (requires trip:read permission)
 */
router.get(
  "/statistics",
  authorize("trip:read"),
  tripController.getTripStatistics.bind(tripController)
);

/**
 * @route   GET /api/trips/:id
 * @desc    Get trip by ID
 * @access  Private (requires trip:read permission)
 */
router.get(
  "/:id",
  authorize("trip:read"),
  tripController.getTripById.bind(tripController)
);

/**
 * @route   PUT /api/trips/:id
 * @desc    Update trip
 * @access  Private (requires trip:update permission)
 */
router.put(
  "/:id",
  authorize("trip:update"),
  tripController.updateTrip.bind(tripController)
);

/**
 * @route   POST /api/trips/:id/start
 * @desc    Start trip
 * @access  Private (requires trip:update permission)
 */
router.post(
  "/:id/start",
  authorize("trip:update"),
  tripController.startTrip.bind(tripController)
);

/**
 * @route   POST /api/trips/:id/complete
 * @desc    Complete trip
 * @access  Private (requires trip:update permission)
 */
router.post(
  "/:id/complete",
  authorize("trip:update"),
  tripController.completeTrip.bind(tripController)
);

/**
 * @route   PATCH /api/trips/:id/delay
 * @desc    Mark trip as delayed
 * @access  Private (requires trip:update permission)
 */
router.patch(
  "/:id/delay",
  authorize("trip:update"),
  tripController.markTripDelayed.bind(tripController)
);

/**
 * @route   PATCH /api/trips/:id/cancel
 * @desc    Cancel trip
 * @access  Private (requires trip:update permission)
 */
router.patch(
  "/:id/cancel",
  authorize("trip:update"),
  tripController.cancelTrip.bind(tripController)
);

/**
 * @route   POST /api/trips/:id/stops
 * @desc    Add trip stop
 * @access  Private (requires trip:update permission)
 */
router.post(
  "/:id/stops",
  authorize("trip:update"),
  tripController.addTripStop.bind(tripController)
);

/**
 * @route   GET /api/trips/:id/stops
 * @desc    Get trip stops
 * @access  Private (requires trip:read permission)
 */
router.get(
  "/:id/stops",
  authorize("trip:read"),
  tripController.getTripStops.bind(tripController)
);

/**
 * @route   PATCH /api/trips/stops/:stopId/departure
 * @desc    Update trip stop departure time
 * @access  Private (requires trip:update permission)
 */
router.patch(
  "/stops/:stopId/departure",
  authorize("trip:update"),
  tripController.updateTripStopDeparture.bind(tripController)
);

/**
 * @route   POST /api/trips/:id/incidents
 * @desc    Add trip incident
 * @access  Private (requires trip:update permission)
 */
router.post(
  "/:id/incidents",
  authorize("trip:update"),
  tripController.addTripIncident.bind(tripController)
);

/**
 * @route   GET /api/trips/:id/incidents
 * @desc    Get trip incidents
 * @access  Private (requires trip:read permission)
 */
router.get(
  "/:id/incidents",
  authorize("trip:read"),
  tripController.getTripIncidents.bind(tripController)
);

/**
 * @route   PATCH /api/trips/incidents/:incidentId/resolve
 * @desc    Resolve trip incident
 * @access  Private (requires trip:update permission)
 */
router.patch(
  "/incidents/:incidentId/resolve",
  authorize("trip:update"),
  tripController.resolveTripIncident.bind(tripController)
);

/**
 * @route   POST /api/trips/:id/tracking
 * @desc    Add GPS tracking point
 * @access  Private (requires trip:update permission)
 */
router.post(
  "/:id/tracking",
  authorize("trip:update"),
  tripController.addTrackingPoint.bind(tripController)
);

/**
 * @route   GET /api/trips/:id/tracking
 * @desc    Get trip tracking data
 * @access  Private (requires trip:read permission)
 */
router.get(
  "/:id/tracking",
  authorize("trip:read"),
  tripController.getTripTracking.bind(tripController)
);

export default router;
