import express from 'express';
import ApplicationController from '../controllers/applicationController.js';
import CommentController from '../controllers/commentController.js';

const router = express.Router();

// Route: POST /api/applications -> Creates a new student application
router.post('/', ApplicationController.createApplication);

// Route: GET /api/applications -> Lists all applications with filtering/search
router.get('/', ApplicationController.getApplications);

// Route: GET /api/applications/:id -> Retrieves full application profile details
router.get('/:id', ApplicationController.getApplicationById);

// Route: POST /api/applications/:id/comments -> Appends comment to application history
router.post('/:id/comments', CommentController.createComment);

export default router;
