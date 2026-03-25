import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { rateLimit } from 'express-rate-limit';
import connectDB from './db.js';
import { init } from './socket.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import workshopRoutes from './routes/workshop.routes.js';
import userRoutes from './routes/user.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.set("trust proxy", 1);

// Middleware
app.use(cors());
// Global Rate Limiter (Protects against brute force and scraping)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
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
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Create HTTP server and integrate Socket.io
const httpServer = createServer(app);
init(httpServer);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`CampusConnect Engineering Core running on port ${PORT}`);
});