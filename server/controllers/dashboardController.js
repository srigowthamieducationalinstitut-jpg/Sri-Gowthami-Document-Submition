import DashboardModel from '../models/dashboardModel.js';

const DashboardController = {
  /**
   * Retrieve aggregated metrics for the dashboard.
   */
  async getStats(req, res, next) {
    try {
      const stats = await DashboardModel.getStats();

      res.status(200).json({
        success: true,
        data: {
          totalApplications: stats.totalApplications,
          pendingApplications: stats.pendingApplications,
          verifiedApplications: stats.verifiedApplications,
          rejectedApplications: stats.rejectedApplications,
          pendingDocuments: stats.pendingDocuments
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default DashboardController;
