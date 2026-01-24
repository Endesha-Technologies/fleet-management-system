import { Router } from "express";
import { TruckController } from "../controllers/truck.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/auth.middleware";

const router = Router();
const truckController = new TruckController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/trucks
 * @desc    Create a new truck with optional specifications and documents
 * @body    truck details, specification (optional), documents array (optional)
 * @access  Private (requires truck:create permission)
 */
router.post(
  "/",
  authorize("truck:create"),
  truckController.createTruck.bind(truckController)
);

/**
 * @route   GET /api/trucks
 * @desc    Get all trucks with optional filters
 * @query   status - Filter by truck status (ACTIVE, MAINTENANCE, ON_TRIP, OUT_OF_SERVICE, SOLD, SCRAPPED)
 * @query   ownership - Filter by ownership type (OWNED, LEASED, RENTED)
 * @query   fuelType - Filter by fuel type (DIESEL, PETROL, ELECTRIC, HYBRID)
 * @query   search - Search by registration number or VIN
 * @query   expiringDocuments - Filter trucks with expiring documents (true/false)
 * @query   days - Days threshold for expiring documents (default: 30, used with expiringDocuments=true)
 * @access  Private (requires truck:read permission)
 */
router.get(
  "/",
  authorize("truck:read"),
  truckController.getAllTrucks.bind(truckController)
);

/**
 * @route   GET /api/trucks/:id
 * @desc    Get truck by ID including specifications and documents
 * @access  Private (requires truck:read permission)
 */
router.get(
  "/:id",
  authorize("truck:read"),
  truckController.getTruckById.bind(truckController)
);

/**
 * @route   PUT /api/trucks/:id
 * @desc    Update truck with optional specifications and documents
 * @body    truck updates, specification (optional), documents array (optional)
 * @access  Private (requires truck:update permission)
 */
router.put(
  "/:id",
  authorize("truck:update"),
  truckController.updateTruck.bind(truckController)
);

/**
 * @route   DELETE /api/trucks/:id
 * @desc    Delete truck along with specifications and documents
 * @access  Private (requires truck:delete permission)
 */
router.delete(
  "/:id",
  authorize("truck:delete"),
  truckController.deleteTruck.bind(truckController)
);

export default router;
