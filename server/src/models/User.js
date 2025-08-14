import { BaseModel } from './Database.js';
import { TABLES, USER_ROLES } from '../constants/index.js';
import { hashPassword, verifyPassword, createError, ERROR_CODES, HTTP_STATUS } from '../utils/index.js';

/**
 * User Model
 * Handles user-related database operations
 */
export class UserModel extends BaseModel {
  constructor() {
    super(TABLES.USERS);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {object|null} User record or null
   */
  findByEmail(email) {
    try {
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE email = ? AND (active = 1 OR active IS NULL)
      `;
      return this.getConnection().prepare(query).get(email.toLowerCase().trim());
    } catch (error) {
      throw createError('Failed to find user by email', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Find active users by role
   * @param {string} role - User role
   * @returns {Array} Array of user records
   */
  findByRole(role) {
    return this.findBy({ 
      role, 
      active: 1 
    }, { 
      orderBy: 'name', 
      orderDirection: 'ASC' 
    });
  }

  /**
   * Find users by department
   * @param {string} department - Department name
   * @returns {Array} Array of user records
   */
  findByDepartment(department) {
    return this.findBy({ 
      department, 
      active: 1 
    }, { 
      orderBy: 'name', 
      orderDirection: 'ASC' 
    });
  }

  /**
   * Create new user with password hashing
   * @param {object} userData - User data
   * @returns {object} Created user record (without password)
   */
  async createUser(userData) {
    try {
      const { password, ...userInfo } = userData;
      
      // Hash password if provided
      let passwordHash = null;
      if (password) {
        passwordHash = await hashPassword(password);
      }

      // Prepare user data
      const newUser = {
        ...userInfo,
        email: userInfo.email.toLowerCase().trim(),
        password_hash: passwordHash,
        active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = this.create(newUser);
      
      // Return user without sensitive data
      return this.sanitizeUser(result);
    } catch (error) {
      if (error.code === ERROR_CODES.VALIDATION_DUPLICATE_ENTRY) {
        throw createError(
          'User with this email already exists',
          ERROR_CODES.VALIDATION_DUPLICATE_ENTRY,
          HTTP_STATUS.CONFLICT
        );
      }
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {object} Updated user record
   */
  async updatePassword(userId, newPassword) {
    try {
      const passwordHash = await hashPassword(newPassword);
      
      const result = this.updateById(userId, {
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null,
      });

      return this.sanitizeUser(result);
    } catch (error) {
      throw createError('Failed to update password', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Verify user password
   * @param {string} userId - User ID
   * @param {string} password - Password to verify
   * @returns {boolean} Whether password is correct
   */
  async verifyUserPassword(userId, password) {
    try {
      const user = this.findById(userId);
      if (!user || !user.password_hash) {
        return false;
      }
      
      return await verifyPassword(password, user.password_hash);
    } catch (error) {
      throw createError('Failed to verify password', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Set password reset token
   * @param {string} email - User email
   * @param {string} token - Reset token
   * @param {Date} expires - Token expiration
   * @returns {object} Updated user record
   */
  setPasswordResetToken(email, token, expires) {
    try {
      const user = this.findByEmail(email);
      if (!user) {
        throw createError('User not found', ERROR_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const result = this.updateById(user.id, {
        password_reset_token: token,
        password_reset_expires: expires.toISOString()
      });

      return this.sanitizeUser(result);
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError('Failed to set password reset token', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Find user by password reset token
   * @param {string} token - Reset token
   * @returns {object|null} User record or null
   */
  findByPasswordResetToken(token) {
    try {
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE password_reset_token = ? 
        AND password_reset_expires > datetime('now')
        AND (active = 1 OR active IS NULL)
      `;
      return this.getConnection().prepare(query).get(token);
    } catch (error) {
      throw createError('Failed to find user by reset token', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Update last login time
   * @param {string} userId - User ID
   * @returns {void}
   */
  updateLastLogin(userId) {
    try {
      const query = `
        UPDATE ${this.tableName} 
        SET last_login = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `;
      this.getConnection().prepare(query).run(userId);
    } catch (error) {
      // Don't throw error for last login update failure
      console.error('Failed to update last login:', error);
    }
  }

  /**
   * Deactivate user (soft delete)
   * @param {string} userId - User ID
   * @returns {object} Updated user record
   */
  deactivateUser(userId) {
    try {
      const result = this.updateById(userId, { active: 0 });
      return this.sanitizeUser(result);
    } catch (error) {
      throw createError('Failed to deactivate user', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Activate user
   * @param {string} userId - User ID
   * @returns {object} Updated user record
   */
  activateUser(userId) {
    try {
      const result = this.updateById(userId, { active: 1 });
      return this.sanitizeUser(result);
    } catch (error) {
      throw createError('Failed to activate user', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Get users with pagination and filters
   * @param {object} filters - Filter criteria
   * @param {object} pagination - Pagination info
   * @returns {object} Users and pagination info
   */
  getUsersWithPagination(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      // Build query conditions
      let whereClause = 'WHERE (active = 1 OR active IS NULL)';
      const params = [];

      if (filters.role) {
        whereClause += ' AND role = ?';
        params.push(filters.role);
      }

      if (filters.department) {
        whereClause += ' AND department = ?';
        params.push(filters.department);
      }

      if (filters.country) {
        whereClause += ' AND country = ?';
        params.push(filters.country);
      }

      if (filters.search) {
        whereClause += ' AND (name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
      const total = this.getConnection().prepare(countQuery).get(...params).count;

      // Get users
      const usersQuery = `
        SELECT id, name, email, role, department, country, created_at, last_login
        FROM ${this.tableName} 
        ${whereClause}
        ORDER BY name ASC 
        LIMIT ? OFFSET ?
      `;
      const users = this.getConnection().prepare(usersQuery).all(...params, limit, offset);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw createError('Failed to get users with pagination', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Get user statistics
   * @returns {object} User statistics
   */
  getUserStatistics() {
    try {
      const stats = {};

      // Total users
      stats.totalUsers = this.count({ active: 1 });

      // Users by role
      const roleQuery = `
        SELECT role, COUNT(*) as count 
        FROM ${this.tableName} 
        WHERE (active = 1 OR active IS NULL)
        GROUP BY role
      `;
      stats.usersByRole = this.getConnection().prepare(roleQuery).all();

      // Users by department
      const deptQuery = `
        SELECT department, COUNT(*) as count 
        FROM ${this.tableName} 
        WHERE (active = 1 OR active IS NULL) AND department IS NOT NULL
        GROUP BY department
      `;
      stats.usersByDepartment = this.getConnection().prepare(deptQuery).all();

      // Recent logins (last 7 days)
      const recentLoginsQuery = `
        SELECT COUNT(*) as count 
        FROM ${this.tableName} 
        WHERE last_login > datetime('now', '-7 days')
        AND (active = 1 OR active IS NULL)
      `;
      stats.recentLogins = this.getConnection().prepare(recentLoginsQuery).get().count;

      return stats;
    } catch (error) {
      throw createError('Failed to get user statistics', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Remove sensitive data from user object
   * @param {object} user - User record
   * @returns {object} Sanitized user record
   */
  sanitizeUser(user) {
    if (!user) return null;
    
    const { password_hash, password_reset_token, password_reset_expires, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Validate user role
   * @param {string} role - Role to validate
   * @returns {boolean} Whether role is valid
   */
  isValidRole(role) {
    return Object.values(USER_ROLES).includes(role);
  }

  /**
   * Check if user has permission for action
   * @param {object} user - User record
   * @param {string} action - Action to check
   * @param {string} resource - Resource being accessed
   * @returns {boolean} Whether user has permission
   */
  hasPermission(user, action, resource = null) {
    if (!user || !user.role) return false;

    // Admin has all permissions
    if (user.role === USER_ROLES.ADMIN) return true;

    // Role-based permissions
    switch (user.role) {
      case USER_ROLES.DOCUMENT_CONTROLLER:
        return ['read', 'create', 'update', 'approve'].includes(action);
      
      case USER_ROLES.DOCUMENT_OWNER:
        return ['read', 'create', 'update', 'approve', 'archive'].includes(action);
      
      case USER_ROLES.DOCUMENT_CREATOR:
        return ['read', 'create', 'update'].includes(action);
      
      case USER_ROLES.REVIEWER:
        return ['read', 'review', 'comment'].includes(action);
      
      case USER_ROLES.REQUESTER:
      case USER_ROLES.DOCUMENT_REQUESTER:
        return ['read', 'request_change'].includes(action);
      
      default:
        return false;
    }
  }
}

export default new UserModel();
