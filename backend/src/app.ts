import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Fleet Management System API is running" });
});

export default app;
