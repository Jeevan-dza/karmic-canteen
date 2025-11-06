import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js';
import cors from 'cors'; // <-- 1. IMPORT CORS

// Import cron jobs to ensure they are scheduled
import './cronJobs.js'; 

// Import routes
import authRoutes from './routes/auths.js';
import orderRoutes from './routes/orders.js';
import feedbackRoutes from './routes/feedback.js';
import broadcastRoutes from './routes/broadcast.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Init middleware
app.use(express.json());
app.use(cors()); // <-- 2. ENABLE CORS FOR ALL REQUESTS

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/broadcasts', broadcastRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));