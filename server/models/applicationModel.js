import pool from '../config/db.js';

const ApplicationModel = {
  /**
   * Creates a new application.
   * Note: This is usually run inside a transaction to create document checklists together.
   * @param {object} connection - MySQL connection (optional, for transactions)
   * @param {object} applicationData - { studentName, studentEmail, phone, courseApplied }
   * @returns {Promise<number>} - The inserted application ID
   */
  async create(applicationData, connection = null) {
    const { studentName, studentEmail, phone, courseApplied } = applicationData;
    const query = `
      INSERT INTO applications (student_name, student_email, phone, course_applied, admission_status)
      VALUES (?, ?, ?, ?, 'Pending')
    `;
    const params = [studentName, studentEmail, phone, courseApplied];

    const db = connection || pool;
    const [result] = await db.execute(query, params);
    return result.insertId;
  },

  /**
   * List applications with filters and search.
   * @param {object} filters - { admissionStatus, courseApplied, searchQuery }
   * @returns {Promise<Array>} - List of applications
   */
  async findAll(filters = {}) {
    const { admissionStatus, courseApplied, searchQuery } = filters;
    let query = 'SELECT * FROM applications WHERE 1=1';
    const params = [];

    if (admissionStatus) {
      query += ' AND admission_status = ?';
      params.push(admissionStatus);
    }

    if (courseApplied) {
      query += ' AND course_applied = ?';
      params.push(courseApplied);
    }

    if (searchQuery) {
      query += ' AND (student_name LIKE ? OR student_email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * Find a specific application profile by ID.
   * @param {number} id - Application ID
   * @returns {Promise<object|null>} - The application profile or null
   */
  async findById(id) {
    const query = 'SELECT * FROM applications WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Update the status of an application.
   * @param {number} id - Application ID
   * @param {string} status - 'Pending' | 'Verified' | 'Rejected'
   * @param {object} connection - MySQL connection (optional, for transactions)
   * @returns {Promise<boolean>} - True if updated, false otherwise
   */
  async updateStatus(id, status, connection = null) {
    const query = 'UPDATE applications SET admission_status = ? WHERE id = ?';
    const params = [status, id];

    const db = connection || pool;
    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  }
};

export default ApplicationModel;
