import { Router } from "express";
import { PartController } from "../controllers/part.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/auth.middleware";

const router = Router();
const partController = new PartController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/parts
 * @desc    Create a new part
 * @access  Private (requires part:create permission)
 */
router.post(
  "/",
  authorize("part:create"),
  partController.createPart.bind(partController)
);

/**
 * @route   GET /api/parts
 * @desc    Get all parts with filters
 *          Query params: category, status, search, lowStock
 *          Example: /api/parts?category=engine&lowStock=true
 * @access  Private (requires part:read permission)
 */
router.get(
  "/",
  authorize("part:read"),
  partController.getAllParts.bind(partController)
);

/**
 * @route   GET /api/parts/:id
 * @desc    Get part by ID
 * @access  Private (requires part:read permission)
 */
router.get(
  "/:id",
  authorize("part:read"),
  partController.getPartById.bind(partController)
);

/**
 * @route   PUT /api/parts/:id
 * @desc    Update part (including status for discontinuation, etc.)
 * @access  Private (requires part:update permission)
 */
router.put(
  "/:id",
  authorize("part:update"),
  partController.updatePart.bind(partController)
);

/**
 * @route   PATCH /api/parts/:id/stock
 * @desc    Adjust stock quantity (supports adjustment, sale, disposal, return, transfer)
 *          Required fields: quantityChange, transactionType, reason
 *          For sales: also requires unitPrice, buyerName
 *          For disposal: also requires disposalReason
 * @access  Private (requires part:update permission)
 */
router.patch(
  "/:id/stock",
  authorize("part:update"),
  partController.adjustStock.bind(partController)
);

/**
 * @route   POST /api/parts/:id/purchase
 * @desc    Record part purchase
 * @access  Private (requires part:create permission)
 */
router.get(
  "/:id/history",
  authorize("part:read"),
  partController.getPartHistory.bind(partController)
);

/**
 * @route   DELETE /api/parts/:id
 * @desc    Delete part
 * @access  Private (requires part:delete permission)
 */
router.delete(
  "/:id",
  authorize("part:delete"),
  partController.deletePart.bind(partController)
);

/**
 * @route   POST /api/parts/install
 * @desc    Install part on truck
 * @access  Private (requires part:update permission)
 */
router.post(
  "/install",
  authorize("part:update"),
  partController.installPart.bind(partController)
);

/**
 * @route   PATCH /api/parts/installation/:installationId/remove
 * @desc    Remove part from truck
 * @access  Private (requires part:update permission)
 */
router.patch(
  "/installation/:installationId/remove",
  authorize("part:update"),
  partController.removePart.bind(partController)
);

/**
 * @route   GET /api/parts/truck/:truckId/installations
 * @desc    Get part installations for a truck
 * @access  Private (requires part:read permission)
 */
router.get(
  "/truck/:truckId/installations",
  authorize("part:read"),
  partController.getPartInstallations.bind(partController)
);

export default router;
