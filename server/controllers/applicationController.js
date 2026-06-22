import pool from '../config/db.js';
import ApplicationModel from '../models/applicationModel.js';
import DocumentModel from '../models/documentModel.js';
import CommentModel from '../models/commentModel.js';

const ApplicationController = {
  /**
   * Create a new student application and auto-populate its document checklist.
   * Runs in a relational database transaction for atomicity.
   */
  async createApplication(req, res, next) {
    const { studentName, studentEmail, phone, courseApplied } = req.body;

    // Validate required fields
    if (!studentName || !studentEmail || !phone || !courseApplied) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. studentName, studentEmail, phone, and courseApplied are all required.'
      });
    }

    let connection;
    try {
      // Get connection for transaction
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 1. Create application record
      const applicationId = await ApplicationModel.create(
        { studentName, studentEmail, phone, courseApplied },
        connection
      );

      // 2. Insert the 5 required documents checklist (default status is 'Pending')
      await DocumentModel.createDefaultChecklist(applicationId, connection);

      // 3. Insert initial log/comment indicating application creation
      await CommentModel.create({
        applicationId,
        staffRole: 'System',
        commentText: 'Application created successfully. Document checklist initialized.'
      }, connection);

      // Commit transaction
      await connection.commit();

      // Retrieve full created profile to return
      const [application] = await connection.execute('SELECT * FROM applications WHERE id = ?', [applicationId]);

      res.status(201).json({
        success: true,
        message: 'Student application created successfully, and document checklist has been initialized.',
        data: application[0]
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      next(error);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  /**
   * List all applications with optional search and filter parameters.
   */
  async getApplications(req, res, next) {
    try {
      const { admission_status, course_applied, search } = req.query;

      // Extract filters
      const filters = {
        admissionStatus: admission_status || null,
        courseApplied: course_applied || null,
        searchQuery: search || null
      };

      const applications = await ApplicationModel.findAll(filters);

      res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve a detailed application profile including the checklist of documents
   * and chronological comments history.
   */
  async getApplicationById(req, res, next) {
    try {
      const { id } = req.params;
      const applicationId = parseInt(id, 10);

      if (isNaN(applicationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid application ID format. ID must be an integer.'
        });
      }

      // 1. Fetch application details
      const application = await ApplicationModel.findById(applicationId);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: `Application with ID ${applicationId} not found.`
        });
      }

      // 2. Fetch associated documents and comments in parallel
      const [documents, comments] = await Promise.all([
        DocumentModel.findByApplicationId(applicationId),
        CommentModel.findByApplicationId(applicationId)
      ]);

      res.status(200).json({
        success: true,
        data: {
          ...application,
          documents,
          comments_history: comments
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default ApplicationController;
