const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const userRoutes = require("./routes/userRoutes");
const forumRoutes = require("./routes/forumRoutes");

// Initialize app
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://scholar-camp-client.onrender.com", // ✅ Use deployed frontend URL
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/forum", forumRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("🎓 ScholarCamp API is running!");
});

// MongoDB connection + Start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
   console.log("✅ Routes mounted");
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Access it via: ${process.env.CLIENT_URL || "http://localhost:" + PORT}`);
});


  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
