import pool from '../config/db.js';

const DocumentModel = {
  // The 5 standard required documents for any student application
  REQUIRED_DOCUMENTS: [
    'Marks Memo',
    'Aadhaar',
    'Transfer Certificate',
    'Photos',
    'Caste Certificate'
  ],

  /**
   * Bulk inserts the 5 required documents for a newly created application.
   * Runs under a transaction connection to ensure integrity.
   * @param {number} applicationId - The parent application ID
   * @param {object} connection - MySQL connection
   */
  async createDefaultChecklist(applicationId, connection) {
    const query = `
      INSERT INTO documents (application_id, document_type, status)
      VALUES 
        (?, 'Marks Memo', 'Pending'),
        (?, 'Aadhaar', 'Pending'),
        (?, 'Transfer Certificate', 'Pending'),
        (?, 'Photos', 'Pending'),
        (?, 'Caste Certificate', 'Pending')
    `;
    const params = [
      applicationId,
      applicationId,
      applicationId,
      applicationId,
      applicationId
    ];

    await connection.execute(query, params);
  },

  /**
   * Fetch a single document by its primary key.
   * @param {number} id - The document ID
   * @returns {Promise<object|null>} - The document record or null
   */
  async findById(id) {
    const query = 'SELECT * FROM documents WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Fetch all documents linked to an application.
   * @param {number} applicationId - The parent application ID
   * @returns {Promise<Array>} - List of documents
   */
  async findByApplicationId(applicationId) {
    const query = 'SELECT * FROM documents WHERE application_id = ?';
    const [rows] = await pool.execute(query, [applicationId]);
    return rows;
  },

  /**
   * Update a specific document's status.
   * @param {number} id - The document ID
   * @param {string} status - 'Submitted' | 'Pending' | 'Rejected'
   * @param {object} connection - MySQL connection (optional, for transactions)
   * @returns {Promise<boolean>} - True if updated, false otherwise
   */
  async updateStatus(id, status, connection = null) {
    const query = 'UPDATE documents SET status = ? WHERE id = ?';
    const params = [status, id];

    const db = connection || pool;
    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  },

  /**
   * Count the total number of documents across the system that are flagged as 'Pending'.
   * Used for missing document detection.
   * @returns {Promise<number>} - Count of pending documents
   */
  async countPending() {
    const query = "SELECT COUNT(*) AS count FROM documents WHERE status = 'Pending'";
    const [rows] = await pool.execute(query);
    return rows[0].count;
  }
};

export default DocumentModel;
