import "dotenv/config";
import { AppDataSource } from "./config/data-source";
import app from "./app";

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
    .then(() => {
        console.log("✓ Database connection established");
        app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
        });
    })
    .catch((err) => {
        console.error("✗ Error during Data Source initialization:", err);
        process.exit(1);
    });
