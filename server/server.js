import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import custom configurations, routes, and middlewares
import { testConnection } from './config/db.js';
import applicationRoutes from './routes/applicationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configurations
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middlewares
app.use(cors());
app.use(express.json()); // Parses application/json content types

// Simple base status check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sri Gowthami Application Tracker API is healthy and operational.'
  });
});

// REST API Endpoints Routing mapping
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch-all route for unhandled endpoint requests (404)
app.use((req, res, next) => {
  const err = new Error(`Resource not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

// Attach the Global Error Handler Middleware
app.use(errorHandler);

// Start the Express server
app.listen(PORT, () => {
  console.log(`[Server] Express application started successfully.`);
  console.log(`[Server] Listening at http://localhost:${PORT}`);
  console.log(`[Server] Press Ctrl+C to stop`);
});
