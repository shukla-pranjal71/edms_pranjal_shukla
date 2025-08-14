/**
 * Authentication Middleware
 * Handles JWT verification, session management, and user authentication
 */

import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { HTTP_STATUS, MESSAGES, ERROR_CODES } from '../constants/index.js';
import { LoggerService } from '../services/LoggerService.js';
import { createError } from '../utils/index.js';

/**
 * JWT Token Verification Middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: MESSAGES.ERROR.TOKEN_REQUIRED,
        code: ERROR_CODES.AUTHENTICATION_REQUIRED
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
      req.userId = decoded.id;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: MESSAGES.ERROR.TOKEN_EXPIRED,
          code: ERROR_CODES.TOKEN_EXPIRED
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: MESSAGES.ERROR.TOKEN_INVALID,
          code: ERROR_CODES.TOKEN_INVALID
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    LoggerService.error('Token verification failed', {
      error: error.message,
      path: req.path,
      method: req.method
    });
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: MESSAGES.ERROR.TOKEN_INVALID,
      code: ERROR_CODES.TOKEN_INVALID
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user info if token is present but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        req.userId = decoded.id;
      } catch (error) {
        // Ignore token errors in optional auth
        req.user = null;
        req.userId = null;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: MESSAGES.ERROR.AUTHENTICATION_REQUIRED,
        code: ERROR_CODES.AUTHENTICATION_REQUIRED
      });
    }

    const userRole = req.user.role;
    const hasRequiredRole = Array.isArray(allowedRoles) 
      ? allowedRoles.includes(userRole)
      : allowedRoles === userRole;

    if (!hasRequiredRole) {
      LoggerService.security('Unauthorized role access attempt', {
        userId: req.user.id,
        userRole,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method
      });

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: MESSAGES.ERROR.INSUFFICIENT_PERMISSIONS,
        code: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const requireAdmin = requireRole(['admin']);

/**
 * Manager or Admin middleware
 */
const requireManager = requireRole(['admin', 'manager']);

/**
 * Authentication middleware collection
 */
export const authenticationMiddleware = {
  verifyToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireManager
};
