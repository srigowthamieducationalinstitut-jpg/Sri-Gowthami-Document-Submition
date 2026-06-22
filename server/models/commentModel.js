import pool from '../config/db.js';

const CommentModel = {
  /**
   * Insert a new comment or history log entry for an application.
   * @param {object} commentData - { applicationId, staffRole, commentText }
   * @param {object} connection - MySQL connection (optional, for transactions)
   * @returns {Promise<number>} - Inserted comment ID
   */
  async create(commentData, connection = null) {
    const { applicationId, staffRole, commentText } = commentData;
    const query = `
      INSERT INTO comments_history (application_id, staff_role, comment_text)
      VALUES (?, ?, ?)
    `;
    const params = [applicationId, staffRole, commentText];

    const db = connection || pool;
    const [result] = await db.execute(query, params);
    return result.insertId;
  },

  /**
   * Fetch all comments linked to an application in chronological order (oldest first).
   * @param {number} applicationId - The parent application ID
   * @returns {Promise<Array>} - List of comment records
   */
  async findByApplicationId(applicationId) {
    const query = `
      SELECT * FROM comments_history 
      WHERE application_id = ? 
      ORDER BY created_at ASC
    `;
    const [rows] = await pool.execute(query, [applicationId]);
    return rows;
  }
};

export default CommentModel;
