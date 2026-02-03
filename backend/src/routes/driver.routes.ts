import { Router } from "express";
import { DriverController } from "../controllers/driver.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const driverController = new DriverController();

// All routes require authentication
router.use(authenticate);

// Driver management routes
router.post("/", authorize("driver:create"), (req, res) => driverController.createDriver(req, res));
router.get("/", authorize("driver:read"), (req, res) => driverController.getAllDrivers(req, res));
router.get("/available", authorize("driver:read"), (req, res) => driverController.getAvailableDrivers(req, res));
router.get("/expiring-licenses", authorize("driver:read"), (req, res) => driverController.getExpiringLicenses(req, res));
router.get("/:id", authorize("driver:read"), (req, res) => driverController.getDriverById(req, res));
router.put("/:id", authorize("driver:update"), (req, res) => driverController.updateDriver(req, res));
router.patch("/:id/status", authorize("driver:update"), (req, res) => driverController.updateDriverStatus(req, res));
router.patch("/:id/deactivate", authorize("driver:update"), (req, res) => driverController.deactivateDriver(req, res));
router.delete("/:id", authorize("driver:delete"), (req, res) => driverController.deleteDriver(req, res));

// Certification routes
router.post("/:id/certifications", authorize("driver:update"), (req, res) => driverController.addCertification(req, res));
router.put("/:id/certifications/:index", authorize("driver:update"), (req, res) => driverController.updateCertification(req, res));
router.delete("/:id/certifications/:index", authorize("driver:update"), (req, res) => driverController.deleteCertification(req, res));

export default router;
