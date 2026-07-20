import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import workshopRoutes from './routes/workshop.routes.js';
import userRoutes from './routes/user.routes.js'; // <-- 1. IMPORT

// Load env variables
dotenv.config();

// Connect to database and catch unhandled promise rejections
connectDB().catch(err => {
  console.error("Fatal: connectDB failed in server.js:", err.message);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/', (req, res) => {
  res.send('CampusConnect API is running...');
});

// Use the route files
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/users', userRoutes); // <-- 2. ADD THIS LINE

// Start server only in development or non-Vercel environments
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for serverless environments (Vercel)
export default app;