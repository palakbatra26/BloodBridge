const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./db");

// Import routes
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const campRoutes = require("./routes/campRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const donorRoutes = require("./routes/donorRoutes");
const alertRoutes = require("./routes/alertRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const twofaRoutes = require("./routes/twofaRoutes");

const app = express();
const PORT = 5002;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:5173" // Added Vite default port
    ],
    credentials: true,
  })
);

app.use(express.json());

// Connect to MongoDB
connectDB();

// Default route
app.get("/", (req, res) => {
  res.json({ message: "🩸 BloodBridge Backend API is running" });
});

// Use routes
app.use("/api", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", donorRoutes);
app.use("/api", alertRoutes);
app.use("/api", notificationRoutes);
app.use("/api", twofaRoutes);

// Health check route
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    dbStatus: dbStatus,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
