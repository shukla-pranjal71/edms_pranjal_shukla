/**
 * Logger Service
 * Provides structured logging using Winston with multiple transports
 */

import winston from 'winston';
import { join } from 'path';
import fs from 'fs';
import config from '../config/index.js';

// Ensure logs directory exists
const logsDir = join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logLine = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logLine += ` ${JSON.stringify(meta)}`;
    }
    
    return logLine;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let logLine = `${level}: ${message}`;
    
    // Add metadata in development
    if (config.isDevelopment && Object.keys(meta).length > 0) {
      logLine += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return logLine;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'sop-document-manager',
    environment: config.server.nodeEnv,
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: join(logsDir, 'combined.log'),
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // File transport for errors only
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // File transport for audit logs
    new winston.transports.File({
      filename: join(logsDir, 'audit.log'),
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
      // Custom filter for audit logs
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          return info.audit ? info : false;
        })()
      )
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: join(logsDir, 'exceptions.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 3
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: join(logsDir, 'rejections.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 3
    })
  ]
});

// Add console transport in development or when specified
if (config.isDevelopment || config.logging.enableConsole) {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: config.logging.level
  }));
}

/**
 * Logger Service Class
 * Provides structured logging methods with context
 */
export class LoggerService {
  constructor() {
    this.logger = logger;
  }

  /**
   * Info level logging
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   */
  static info(message, meta = {}) {
    logger.info(message, meta);
  }

  /**
   * Error level logging
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata (should include error)
   */
  static error(message, meta = {}) {
    logger.error(message, meta);
  }

  /**
   * Warning level logging
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   */
  static warn(message, meta = {}) {
    logger.warn(message, meta);
  }

  /**
   * Debug level logging
   * @param {string} message - Log message
   * @param {object} meta - Additional metadata
   */
  static debug(message, meta = {}) {
    logger.debug(message, meta);
  }

  /**
   * Audit logging for security events
   * @param {string} message - Audit message
   * @param {object} meta - Audit metadata
   */
  static audit(message, meta = {}) {
    logger.info(message, {
      ...meta,
      audit: true,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * HTTP request logging
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  static httpRequest(req, res, responseTime) {
    const { method, originalUrl, ip, headers } = req;
    const { statusCode } = res;
    
    const meta = {
      method,
      url: originalUrl,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent: headers['user-agent'],
      requestId: req.requestId,
      userId: req.user?.id
    };

    // Log as info for successful requests, warn for client errors, error for server errors
    if (statusCode >= 500) {
      this.error(`HTTP ${statusCode} ${method} ${originalUrl}`, meta);
    } else if (statusCode >= 400) {
      this.warn(`HTTP ${statusCode} ${method} ${originalUrl}`, meta);
    } else {
      this.info(`HTTP ${statusCode} ${method} ${originalUrl}`, meta);
    }
  }

  /**
   * Database operation logging
   * @param {string} operation - Database operation type
   * @param {string} table - Database table
   * @param {object} meta - Additional metadata
   */
  static dbOperation(operation, table, meta = {}) {
    this.debug(`DB ${operation} on ${table}`, meta);
  }

  /**
   * Authentication event logging
   * @param {string} event - Auth event type (login, logout, failed_login, etc.)
   * @param {object} meta - Auth metadata
   */
  static authEvent(event, meta = {}) {
    this.audit(`Auth: ${event}`, {
      ...meta,
      event: 'authentication',
      action: event
    });
  }

  /**
   * File operation logging
   * @param {string} operation - File operation type
   * @param {string} filename - File name
   * @param {object} meta - Additional metadata
   */
  static fileOperation(operation, filename, meta = {}) {
    this.info(`File ${operation}: ${filename}`, meta);
  }

  /**
   * Performance logging
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   * @param {object} meta - Additional metadata
   */
  static performance(operation, duration, meta = {}) {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...meta,
      performance: true,
      operation,
      duration
    });
  }

  /**
   * Security event logging
   * @param {string} event - Security event type
   * @param {object} meta - Security metadata
   */
  static security(event, meta = {}) {
    this.audit(`Security: ${event}`, {
      ...meta,
      event: 'security',
      severity: meta.severity || 'medium'
    });
  }

  /**
   * Get underlying Winston logger instance
   * @returns {winston.Logger} Winston logger instance
   */
  static getLogger() {
    return logger;
  }

  /**
   * Create child logger with context
   * @param {object} context - Context to add to all logs
   * @returns {winston.Logger} Child logger with context
   */
  static child(context) {
    return logger.child(context);
  }

  /**
   * Flush all transports
   * @returns {Promise} Promise that resolves when all transports are flushed
   */
  static async flush() {
    return new Promise((resolve) => {
      logger.on('finish', resolve);
      logger.end();
    });
  }
}

// Export singleton instance
export { LoggerService as default };

// Also export the raw logger for advanced use cases
export { logger };
