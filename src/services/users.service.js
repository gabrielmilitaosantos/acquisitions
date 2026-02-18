import logger from '../config/logger.js';
import { db } from '../config/database.js';
import { users } from '../models/users.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (error) {
    logger.error('Error getting users', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error(`Error getting user by ID ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check if new email already exists
    if (updates.email) {
      const [emailUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);

      if (emailUser && emailUser.id !== id) {
        throw new Error('Email already exists');
      }
    }

    // Update the user
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    logger.info(`User updated successfully: ${id}`);
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Delete the user
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    if (!deletedUser) {
      throw new Error('Failed to delete user');
    }

    logger.info(`User deleted successfully: ${id}`);
    return deletedUser;
  } catch (error) {
    logger.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};
