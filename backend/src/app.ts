import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import driverRoutes from "./routes/driver.routes";
import truckRoutes from "./routes/truck.routes";
import partRoutes from "./routes/part.routes";
import routeRoutes from "./routes/route.routes";
import tripRoutes from "./routes/trip.routes";

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Fleet Management System API is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/trips", tripRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || "Internal server error"
    });
});

export default app;
