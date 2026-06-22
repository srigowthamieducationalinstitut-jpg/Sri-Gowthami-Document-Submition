import pool from '../config/db.js';
import DocumentModel from '../models/documentModel.js';
import ApplicationModel from '../models/applicationModel.js';
import CommentModel from '../models/commentModel.js';

const DocumentController = {
  /**
   * Update an individual document's status and automatically update the parent application status.
   * Runs inside a database transaction to ensure updates to parent and document are atomic.
   */
  async updateDocumentStatus(req, res, next) {
    const { id } = req.params;
    const { status } = req.body;

    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID format. ID must be an integer.'
      });
    }

    // Validate incoming status values
    const validStatuses = ['Submitted', 'Pending', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 1. Retrieve the existing document to find the parent application ID
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Document with ID ${documentId} not found.`
        });
      }

      const applicationId = document.application_id;

      // 2. Perform the status update on the document
      const docUpdated = await DocumentModel.updateStatus(documentId, status, connection);
      if (!docUpdated) {
        throw new Error('Failed to update document status in database.');
      }

      // Log the document change as a system log entry
      await CommentModel.create({
        applicationId,
        staffRole: 'System',
        commentText: `Document '${document.document_type}' status updated from '${document.status}' to '${status}'.`
      }, connection);

      // 3. Retrieve all documents for this application to apply status workflow rules
      const allDocs = await DocumentModel.findByApplicationId(applicationId);

      // Determine parent application status based on rules:
      // - If ANY document is 'Rejected', the parent application status is 'Rejected'.
      // - If ALL 5 (or all existing) documents are 'Submitted', parent status is 'Verified'.
      // - Otherwise, parent status is 'Pending'.
      let newApplicationStatus = 'Pending';
      const hasRejected = allDocs.some(doc => {
        // Use the updated status for the current document since we queried the DB after the update,
        // but double check to be safe.
        const currentDocStatus = doc.id === documentId ? status : doc.status;
        return currentDocStatus === 'Rejected';
      });

      const allSubmitted = allDocs.length > 0 && allDocs.every(doc => {
        const currentDocStatus = doc.id === documentId ? status : doc.status;
        return currentDocStatus === 'Submitted';
      });

      if (hasRejected) {
        newApplicationStatus = 'Rejected';
      } else if (allSubmitted) {
        newApplicationStatus = 'Verified';
      }

      // Retrieve previous parent application status to see if it changed
      const parentApplication = await ApplicationModel.findById(applicationId);
      const oldApplicationStatus = parentApplication ? parentApplication.admission_status : null;

      // 4. Update the parent application's admission status if it changed
      if (oldApplicationStatus !== newApplicationStatus) {
        await ApplicationModel.updateStatus(applicationId, newApplicationStatus, connection);
        
        // Log status change in comments history
        await CommentModel.create({
          applicationId,
          staffRole: 'System',
          commentText: `Application admission status automatically shifted from '${oldApplicationStatus}' to '${newApplicationStatus}' due to checklist updates.`
        }, connection);
      }

      // Commit transaction
      await connection.commit();

      res.status(200).json({
        success: true,
        message: `Document status updated to '${status}'. Parent application status updated to '${newApplicationStatus}'.`,
        data: {
          documentId,
          documentStatus: status,
          applicationId,
          applicationStatus: newApplicationStatus
        }
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
  }
};

export default DocumentController;
