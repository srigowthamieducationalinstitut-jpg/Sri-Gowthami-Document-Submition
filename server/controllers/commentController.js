import CommentModel from '../models/commentModel.js';
import ApplicationModel from '../models/applicationModel.js';

const CommentController = {
  /**
   * Append a new verification comment or history log entry for a specific application.
   */
  async createComment(req, res, next) {
    try {
      const { id } = req.params;
      const { staffRole, commentText } = req.body;

      const applicationId = parseInt(id, 10);
      if (isNaN(applicationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid application ID format. ID must be an integer.'
        });
      }

      // Validate required inputs
      if (!staffRole || !commentText) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields. staffRole and commentText are both required.'
        });
      }

      // Check if application exists
      const application = await ApplicationModel.findById(applicationId);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: `Application with ID ${applicationId} not found.`
        });
      }

      // Insert comment
      const commentId = await CommentModel.create({
        applicationId,
        staffRole,
        commentText
      });

      res.status(201).json({
        success: true,
        message: 'Comment appended successfully.',
        data: {
          id: commentId,
          application_id: applicationId,
          staff_role: staffRole,
          comment_text: commentText,
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default CommentController;
