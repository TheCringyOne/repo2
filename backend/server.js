// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import adminRoutes from "./routes/admin.route.js";
import projectRoutes from "./routes/project.route.js";
import { connectDB } from "./lib/db.js";
import { cleanupExpiredProjects } from "./jobs/projectCleanup.js";
import announcementRoutes from "./routes/announcement.route.js";
import jobPostRoutes from "./routes/jobPost.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Configuración CORS para todos los entornos
// Esta configuración reemplaza la condicional anterior y maneja tanto desarrollo como producción
app.use(
    cors({
        origin: process.env.NODE_ENV === "production"
            ? [process.env.CLIENT_URL, "https://egresados-ittg.onrender.com"] // Agrega el dominio de tu aplicación en Render
            : ["http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Update these lines
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/jobs", jobPostRoutes);

// Configuración para que el frontend y el backend funcionen en el mismo lugar
if (process.env.NODE_ENV === "production") {
    // El dirname es donde se inicia la página una vez que empieza todo
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    
    // Esto hace que en caso de que metan otra dirección se reenvie al usuario al index
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
} else {
    // Ruta básica para verificar que el servidor está funcionando en desarrollo
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

// Optional: Set up automatic cleanup of expired projects
// This will run the cleanup job every day at midnight
if (process.env.NODE_ENV === "production") {
    setInterval(async () => {
        try {
            await cleanupExpiredProjects();
            console.log("Completed expired projects cleanup job");
        } catch (error) {
            console.error("Error in expired projects cleanup job:", error);
        }
    }, 24 * 60 * 60 * 1000); // Run every 24 hours
}

app.listen(PORT, () => {
    console.log(Server running on port ${PORT});  // Corregido: se agregaron backticks
    connectDB();
});
