import pool from '../config/db.js';

const DashboardModel = {
  /**
   * Aggregate metrics for total, pending, verified applications,
   * and total pending documents (missing document detection).
   * @returns {Promise<object>} - Aggregated dashboard metrics
   */
  async getStats() {
    // We execute queries in parallel for efficiency
    const queries = {
      totalApplications: 'SELECT COUNT(*) AS count FROM applications',
      pendingApplications: "SELECT COUNT(*) AS count FROM applications WHERE admission_status = 'Pending'",
      verifiedApplications: "SELECT COUNT(*) AS count FROM applications WHERE admission_status = 'Verified'",
      rejectedApplications: "SELECT COUNT(*) AS count FROM applications WHERE admission_status = 'Rejected'",
      pendingDocuments: "SELECT COUNT(*) AS count FROM documents WHERE status = 'Pending'"
    };

    const keys = Object.keys(queries);
    const promises = Object.values(queries).map(query => pool.execute(query));

    const results = await Promise.all(promises);

    const stats = {};
    keys.forEach((key, index) => {
      stats[key] = results[index][0][0].count;
    });

    return stats;
  }
};

export default DashboardModel;
