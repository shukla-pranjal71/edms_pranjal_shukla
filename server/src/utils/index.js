import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { REGEX, HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import config from '../config/index.js';

/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Generate a unique UUID v4
 */
export const generateUUID = () => uuidv4();

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the random string
 * @param {string} charset - Character set to use
 * @returns {string} Random string
 */
export const generateRandomString = (
  length = 32,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Generate a secure random token using crypto
 * @param {number} bytes - Number of bytes for the token
 * @returns {string} Hex encoded token
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = config.security.bcrypt.saltRounds;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against its hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Whether the password matches
 */
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate a unique filename to prevent collisions
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = generateRandomString(8);
  const extension = getFileExtension(originalName);
  const baseName = getFileBaseName(originalName);
  
  return `${baseName}_${timestamp}_${randomString}${extension}`;
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension with dot
 */
export const getFileExtension = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot) : '';
};

/**
 * Get file base name without extension
 * @param {string} filename - Filename
 * @returns {string} Base name without extension
 */
export const getFileBaseName = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
};

/**
 * Sanitize filename by removing/replacing unsafe characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Whether email is valid
 */
export const isValidEmail = (email) => {
  return typeof email === 'string' && REGEX.EMAIL.test(email.trim().toLowerCase());
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID string
 * @returns {boolean} Whether UUID is valid
 */
export const isValidUUID = (uuid) => {
  return typeof uuid === 'string' && REGEX.UUID.test(uuid);
};

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {object} Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: [],
    strength: 'weak',
  };

  if (!password || typeof password !== 'string') {
    result.feedback.push('Password is required');
    return result;
  }

  // Length check
  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters long');
  } else {
    result.score += 1;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) result.score += 1;
  if (/[A-Z]/.test(password)) result.score += 1;
  if (/\d/.test(password)) result.score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) result.score += 1;

  // Length bonus
  if (password.length >= 12) result.score += 1;

  // Determine strength
  if (result.score >= 5) {
    result.strength = 'strong';
    result.isValid = true;
  } else if (result.score >= 3) {
    result.strength = 'medium';
    result.isValid = true;
  } else {
    result.strength = 'weak';
    result.feedback.push('Password should contain uppercase, lowercase, numbers, and special characters');
  }

  return result;
};

/**
 * Sanitize string for SQL queries (additional layer of protection)
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeForSQL = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/"/g, '""') // Escape double quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\x00/g, '\\0') // Escape null bytes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\x1a/g, '\\Z'); // Escape ctrl+Z
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
};

/**
 * Pagination helper
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination info
 */
export const getPaginationInfo = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    offset,
  };
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
export const calculatePagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
  };
};

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Get client IP address from request
 * @param {object} req - Express request object
 * @returns {string} Client IP address
 */
export const getClientIP = (req) => {
  return req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    '127.0.0.1';
};

/**
 * Get user agent from request
 * @param {object} req - Express request object
 * @returns {string} User agent string
 */
export const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

/**
 * Format date to ISO string
 * @param {Date|string|number} date - Date to format
 * @returns {string} ISO date string
 */
export const formatDateISO = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Check if date is expired
 * @param {Date|string} date - Date to check
 * @returns {boolean} Whether date is expired
 */
export const isExpired = (date) => {
  if (!date) return true;
  return new Date(date) < new Date();
};

/**
 * Add time to current date
 * @param {number} hours - Hours to add
 * @returns {Date} New date with added time
 */
export const addHours = (hours) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};

/**
 * Mask sensitive data for logging
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of visible characters at start/end
 * @returns {string} Masked data
 */
export const maskSensitiveData = (data, visibleChars = 2) => {
  if (!data || typeof data !== 'string') return data;
  if (data.length <= visibleChars * 2) return '*'.repeat(data.length);
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(data.length - visibleChars * 2);
  
  return start + masked + end;
};

/**
 * Create error object with consistent structure
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 * @param {object} details - Additional error details
 * @returns {Error} Structured error object
 */
export const createError = (message, code = ERROR_CODES.INTERNAL_SERVER_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = {}) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  error.details = details;
  error.timestamp = new Date().toISOString();
  
  return error;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} Whether value is empty
 */
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Remove sensitive fields from object for logging/response
 * @param {object} obj - Object to clean
 * @param {string[]} sensitiveFields - Fields to remove
 * @returns {object} Cleaned object
 */
export const removeSensitiveFields = (obj, sensitiveFields = ['password', 'passwordHash', 'token', 'secret']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = deepClone(obj);
  
  const removeSensitive = (target) => {
    if (Array.isArray(target)) {
      return target.map(item => removeSensitive(item));
    } else if (target && typeof target === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(target)) {
        if (sensitiveFields.includes(key.toLowerCase())) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = removeSensitive(value);
        }
      }
      return result;
    }
    return target;
  };
  
  return removeSensitive(cleaned);
};

export default {
  generateUUID,
  generateRandomString,
  generateSecureToken,
  hashPassword,
  verifyPassword,
  generateUniqueFilename,
  getFileExtension,
  getFileBaseName,
  sanitizeFilename,
  formatFileSize,
  isValidEmail,
  isValidUUID,
  validatePasswordStrength,
  sanitizeForSQL,
  deepClone,
  getPaginationInfo,
  calculatePagination,
  delay,
  retryWithBackoff,
  getClientIP,
  getUserAgent,
  formatDateISO,
  isExpired,
  addHours,
  maskSensitiveData,
  createError,
  isEmpty,
  removeSensitiveFields,
};
