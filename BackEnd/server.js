// Environment configuration
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const recommendRoute = require("./routes/recommendCrop");
const cropHealthRoute = require("./routes/cropHealth");
const harvestRoute = require("./routes/harvest");
const sellingRoute = require("./routes/selling");
const authRoute = require("./routes/auth");
const historyRoute = require("./routes/history");

const schemesRoute = require("./routes/schemes");
const profileRoute = require("./routes/profile");
const connectDB = require("./Config/db");
const verifyToken = require("./utils/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Set HTTP headers
app.use(helmet());

// Security: Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Increase JSON limit to support Base64 profile pictures
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Routes
app.use("/api/auth", authRoute); // Public

// Protected Routes
app.use("/api/recommend-crop", verifyToken, recommendRoute);
app.use("/api/crop-health", verifyToken, cropHealthRoute);
app.use("/api/harvest", verifyToken, harvestRoute);
app.use("/api/selling", verifyToken, sellingRoute);

app.use("/api/history", verifyToken, historyRoute);
app.use("/api/schemes", verifyToken, schemesRoute);
app.use("/api/profile", verifyToken, profileRoute);

// Database connection and startup
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Database connection failed:", err.message);
  // Start server anyway to allow logic to work with fallbacks
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Database Offline)`);
  });
});

