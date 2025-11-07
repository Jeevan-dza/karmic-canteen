// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import "./jobs/cronJobs.js";
// Schedules all jobs automatically

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// 🧠 Routes (temporarily commented out if you don’t have routes folder yet)
// import authRoutes from './routes/auth.js';
// import orderRoutes from './routes/order.js';
// import feedbackRoutes from './routes/feedback.js';
// import broadcastRoutes from './routes/broadcast.js';

// app.use('/api/auth', authRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/feedback', feedbackRoutes);
// app.use('/api/broadcasts', broadcastRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("✅ Karmic Canteen Backend is Running Successfully!");
});

// Dynamic port for deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
