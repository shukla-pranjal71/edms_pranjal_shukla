/**
 * User Routes
 * Handles user management operations
 */

import { Router } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const router = Router();

// GET /api/users - List all users
router.get('/', (req, res) => {
  res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'User routes not implemented yet',
    endpoint: 'GET /api/users',
    status: 'Coming soon'
  });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'User routes not implemented yet',
    endpoint: `GET /api/users/${req.params.id}`,
    status: 'Coming soon'
  });
});

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => {
  res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'User routes not implemented yet',
    endpoint: `PUT /api/users/${req.params.id}`,
    status: 'Coming soon'
  });
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
    message: 'User routes not implemented yet',
    endpoint: `DELETE /api/users/${req.params.id}`,
    status: 'Coming soon'
  });
});

export default router;
