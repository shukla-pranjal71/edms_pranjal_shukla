/**
 * Error Middleware
 * Provides centralized error handling, logging, and response formatting
 */

import { LoggerService } from '../services/LoggerService.js';
import { HTTP_STATUS, MESSAGES, ERROR_CODES } from '../constants/index.js';
import { getClientIP, removeSensitiveFields } from '../utils/index.js';
import config from '../config/index.js';

/**
 * Global error handler middleware
 * Catches and handles all errors in the application
 */
const globalErrorHandler = (error, req, res, next) => {
  const clientIP = getClientIP(req);
  const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Default error response
  let status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = MESSAGES.ERROR.INTERNAL_ERROR;
  let code = ERROR_CODES.INTERNAL_ERROR;
  let details = null;

  // Log error with context
  const errorContext = {
    errorId,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: clientIP,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id,
    requestId: req.requestId,
    body: removeSensitiveFields(req.body),
    query: removeSensitiveFields(req.query),
    params: req.params
  };

  // Handle different error types
  if (error.name === 'ValidationError') {
    status = HTTP_STATUS.BAD_REQUEST;
    message = MESSAGES.ERROR.VALIDATION_FAILED;
    code = ERROR_CODES.VALIDATION_ERROR;
    details = error.details || error.message;
  } else if (error.name === 'CastError' || error.name === 'TypeError') {
    status = HTTP_STATUS.BAD_REQUEST;
    message = MESSAGES.ERROR.INVALID_INPUT;
    code = ERROR_CODES.INVALID_INPUT;
  } else if (error.name === 'UnauthorizedError' || error.status === 401) {
    status = HTTP_STATUS.UNAUTHORIZED;
    message = MESSAGES.ERROR.UNAUTHORIZED;
    code = ERROR_CODES.UNAUTHORIZED;
  } else if (error.name === 'ForbiddenError' || error.status === 403) {
    status = HTTP_STATUS.FORBIDDEN;
    message = MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS;
    code = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
  } else if (error.name === 'NotFoundError' || error.status === 404) {
    status = HTTP_STATUS.NOT_FOUND;
    message = MESSAGES.ERROR.RESOURCE_NOT_FOUND;
    code = ERROR_CODES.RESOURCE_NOT_FOUND;
  } else if (error.name === 'ConflictError' || error.status === 409) {
    status = HTTP_STATUS.CONFLICT;
    message = error.message || MESSAGES.ERROR.RESOURCE_CONFLICT;
    code = ERROR_CODES.RESOURCE_CONFLICT;
  } else if (error.code === 'SQLITE_CONSTRAINT') {
    status = HTTP_STATUS.CONFLICT;
    message = MESSAGES.ERROR.DUPLICATE_ENTRY;
    code = ERROR_CODES.DUPLICATE_ENTRY;
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    status = HTTP_STATUS.SERVICE_UNAVAILABLE;
    message = MESSAGES.ERROR.SERVICE_UNAVAILABLE;
    code = ERROR_CODES.SERVICE_UNAVAILABLE;
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    status = HTTP_STATUS.BAD_REQUEST;
    message = 'File size too large';
    code = ERROR_CODES.FILE_TOO_LARGE;
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    status = HTTP_STATUS.BAD_REQUEST;
    message = 'Too many files';
    code = ERROR_CODES.TOO_MANY_FILES;
  } else if (error.code === 'ENOENT') {
    status = HTTP_STATUS.NOT_FOUND;
    message = MESSAGES.ERROR.FILE_NOT_FOUND;
    code = ERROR_CODES.FILE_NOT_FOUND;
  }

  // Custom error handling
  if (error.statusCode && error.message) {
    status = error.statusCode;
    message = error.message;
    code = error.code || ERROR_CODES.CUSTOM_ERROR;
    details = error.details;
  }

  // Log the error
  if (status >= 500) {
    LoggerService.error('Server error occurred', errorContext);
  } else {
    LoggerService.warn('Client error occurred', errorContext);
  }

  // Prepare error response
  const errorResponse = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Add error ID for tracking in production
  if (config.server.nodeEnv === 'production') {
    errorResponse.errorId = errorId;
  }

  // Add details in development or for client errors
  if (config.isDevelopment || status < 500) {
    if (details) {
      errorResponse.details = details;
    }
    
    // Include stack trace in development
    if (config.isDevelopment) {
      errorResponse.stack = error.stack;
    }
  }

  // Security headers for error responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  res.status(status).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  const clientIP = getClientIP(req);
  
  LoggerService.warn('Resource not found', {
    path: req.path,
    method: req.method,
    ip: clientIP,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId
  });

  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: MESSAGES.ERROR.RESOURCE_NOT_FOUND,
    code: ERROR_CODES.RESOURCE_NOT_FOUND,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error boundary for specific routes
 * Creates isolated error handling for specific route groups
 */
const errorBoundary = (boundaryName) => {
  return (error, req, res, next) => {
    LoggerService.error(`Error in ${boundaryName}`, {
      boundaryName,
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      requestId: req.requestId
    });

    // Pass to global error handler
    next(error);
  };
};

/**
 * Validation error formatter
 * Formats validation errors into consistent structure
 */
const formatValidationError = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => ({
      field: error.path || error.field,
      message: error.message,
      value: error.value,
      type: error.type || error.kind
    }));
  }

  if (errors.details) {
    // Joi validation errors
    return errors.details.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      value: error.context?.value,
      type: error.type
    }));
  }

  // Generic validation error
  return [{
    field: 'unknown',
    message: errors.message || 'Validation failed',
    value: null,
    type: 'validation'
  }];
};

/**
 * Database error handler
 * Handles database-specific errors
 */
const handleDatabaseError = (error) => {
  let status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = MESSAGES.ERROR.DATABASE_ERROR;
  let code = ERROR_CODES.DATABASE_ERROR;

  // SQLite specific errors
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    status = HTTP_STATUS.CONFLICT;
    message = MESSAGES.ERROR.DUPLICATE_ENTRY;
    code = ERROR_CODES.DUPLICATE_ENTRY;
  } else if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    status = HTTP_STATUS.BAD_REQUEST;
    message = 'Foreign key constraint violation';
    code = ERROR_CODES.CONSTRAINT_VIOLATION;
  } else if (error.code === 'SQLITE_BUSY') {
    status = HTTP_STATUS.SERVICE_UNAVAILABLE;
    message = 'Database is busy, please try again';
    code = ERROR_CODES.DATABASE_BUSY;
  }

  return { status, message, code };
};

/**
 * Rate limit error handler
 * Formats rate limiting errors
 */
const handleRateLimitError = (error, req, res) => {
  const clientIP = getClientIP(req);
  
  LoggerService.security('Rate limit exceeded', {
    ip: clientIP,
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent'],
    severity: 'medium'
  });

  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    error: MESSAGES.ERROR.RATE_LIMIT_EXCEEDED,
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    retryAfter: error.retryAfter || 60,
    timestamp: new Date().toISOString()
  });
};

/**
 * Create custom error
 * Utility to create standardized errors
 */
const createCustomError = (message, statusCode = 500, code = null, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

/**
 * Error middleware collection
 */
export const errorMiddleware = {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  errorBoundary,
  formatValidationError,
  handleDatabaseError,
  handleRateLimitError,
  createCustomError
};
