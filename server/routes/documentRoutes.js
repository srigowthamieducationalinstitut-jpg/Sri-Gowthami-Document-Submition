import express from 'express';
import DocumentController from '../controllers/documentController.js';

const router = express.Router();

// Route: PUT /api/documents/:id -> Updates verification state of a document
router.put('/:id', DocumentController.updateDocumentStatus);

export default router;
