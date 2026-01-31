import { Router } from "express";
import { RouteController } from "../controllers/route.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const routeController = new RouteController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/routes
 * @desc    Create a new route
 * @access  Private (requires route:create permission)
 */
router.post(
  "/",
  authorize("route:create"),
  routeController.createRoute.bind(routeController)
);

/**
 * @route   GET /api/routes
 * @desc    Get all routes with filters and pagination
 * @access  Private (requires route:read permission)
 * @query   routeType - Filter by route type (short_haul, long_haul, regional, international)
 * @query   isActive - Filter by active status (true/false)
 * @query   search - Search by code, name, or locations
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 */
router.get(
  "/",
  authorize("route:read"),
  routeController.getAllRoutes.bind(routeController)
);

/**
 * @route   GET /api/routes/:id
 * @desc    Get route by ID
 * @access  Private (requires route:read permission)
 */
router.get(
  "/:id",
  authorize("route:read"),
  routeController.getRouteById.bind(routeController)
);

/**
 * @route   PUT /api/routes/:id
 * @desc    Update route
 * @access  Private (requires route:update permission)
 */
router.put(
  "/:id",
  authorize("route:update"),
  routeController.updateRoute.bind(routeController)
);

/**
 * @route   PATCH /api/routes/:id/status
 * @desc    Toggle route status (activate/deactivate)
 * @access  Private (requires route:update permission)
 */
router.patch(
  "/:id/status",
  authorize("route:update"),
  routeController.toggleRouteStatus.bind(routeController)
);

export default router;
