import logger from '../config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '../validations/users.validation.js';
import { formatValidationError } from '../utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting all users...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully getting all users.',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error('Error getting users', error);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    const user = await getUserById(id);

    logger.info(`User ${user.email} retrieved successfully!`);
    res.json({
      message: 'Successfully retrieved user.',
      user,
    });
  } catch (error) {
    logger.error('Error getting user by ID:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate parameters
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    const updates = bodyValidation.data;

    // Authorization: Users can only update their own information, except admins
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admins can change roles
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles',
      });
    }

    logger.info(`Updating user ID: ${id}`, { updates, updatedBy: req.user.id });

    const updatedUser = await updateUser(id, updates);

    res.json({
      message: 'User updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // Authorization: Users can only delete their own account, except admins
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    // Prevent admins from deleting themselves unless there are other admins
    if (req.user.role === 'admin' && req.user.id === id) {
      const allUsers = await getAllUsers();
      const adminCount = allUsers.filter(user => user.role === 'admin').length;

      if (adminCount <= 1) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Cannot delete the last admin account',
        });
      }
    }

    logger.info(`Deleting user ID: ${id}`, { deletedBy: req.user.id });

    const deletedUser = await deleteUser(id);

    res.json({
      message: 'User deleted successfully.',
      user: deletedUser,
    });
  } catch (error) {
    logger.error('Error deleting user:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(error);
  }
};
