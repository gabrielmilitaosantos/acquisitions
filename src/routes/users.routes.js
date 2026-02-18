import express from 'express';
import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/users.controller.js';
import {
  authenticateToken,
  requireAdmin,
} from '../middleware/auth.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users (admin only)
router.get('/', requireAdmin, fetchAllUsers);

// GET /api/users/:id - Get user by ID (any authenticated user can view profiles)
router.get('/:id', fetchUserById);

// PUT /api/users/:id - Update user (users can update their own, admins can update any)
router.put('/:id', updateUserById);

// DELETE /api/users/:id - Delete user (users can delete their own, admins can delete any)
router.delete('/:id', deleteUserById);

export default router;
