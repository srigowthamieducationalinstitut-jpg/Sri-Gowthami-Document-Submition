import express from 'express';
import DashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// Route: GET /api/dashboard/stats -> Retrieve aggregated dashboard metrics
router.get('/stats', DashboardController.getStats);

export default router;
