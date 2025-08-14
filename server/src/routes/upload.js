/**
 * Upload Routes
 * Handles file upload operations
 */

import { Router } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const router = Router();

// POST /api/upload/documents - Upload document files
router.post('/documents', (req, res) => {
  res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'Upload routes not implemented yet',
    endpoint: 'POST /api/upload/documents',
    status: 'Coming soon'
  });
});

// POST /api/upload/avatar - Upload user avatar
router.post('/avatar', (req, res) => {
  res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'Upload routes not implemented yet',
    endpoint: 'POST /api/upload/avatar',
    status: 'Coming soon'
  });
});

// GET /api/upload/download/:filename - Download uploaded file
router.get('/download/:filename', (req, res) => {
  res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'Upload routes not implemented yet',
    endpoint: `GET /api/upload/download/${req.params.filename}`,
    status: 'Coming soon'
  });
});

export default router;
