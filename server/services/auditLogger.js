import winston from 'winston';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', '..', 'data', 'documents.db');

// Ensure logs directory exists
const logsDir = join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'document-management' },
  transports: [
    // Write errors to error.log
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    // Write audit logs to audit.log
    new winston.transports.File({
      filename: join(logsDir, 'audit.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 20,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
            type: 'audit'
          });
        })
      )
    })
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Action types for structured logging
export const AuditActions = {
  // Document actions
  DOCUMENT_CREATED: 'document_created',
  DOCUMENT_UPDATED: 'document_updated',
  DOCUMENT_DELETED: 'document_deleted',
  DOCUMENT_VIEWED: 'document_viewed',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_STATUS_CHANGED: 'document_status_changed',
  DOCUMENT_APPROVED: 'document_approved',
  DOCUMENT_REJECTED: 'document_rejected',
  DOCUMENT_ARCHIVED: 'document_archived',
  
  // User actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_LOGIN_FAILED: 'user_login_failed',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_PASSWORD_CHANGED: 'user_password_changed',
  
  // Change request actions
  CHANGE_REQUEST_CREATED: 'change_request_created',
  CHANGE_REQUEST_UPDATED: 'change_request_updated',
  CHANGE_REQUEST_APPROVED: 'change_request_approved',
  CHANGE_REQUEST_REJECTED: 'change_request_rejected',
  
  // System actions
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_RESTORE: 'system_restore',
  SYSTEM_ERROR: 'system_error',
  
  // Security actions
  SECURITY_BREACH_ATTEMPT: 'security_breach_attempt',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  
  // File actions
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',
  FILE_DOWNLOADED: 'file_downloaded'
};

// Enhanced audit logging service
export const AuditLogger = {
  // Log action to both file and database
  logAction: async (action, details = {}) => {
    const logEntry = {
      action,
      timestamp: new Date().toISOString(),
      userId: details.userId || 'system',
      documentId: details.documentId || null,
      ipAddress: details.ipAddress || null,
      userAgent: details.userAgent || null,
      details: typeof details.details === 'object' ? JSON.stringify(details.details) : details.details,
      oldValues: details.oldValues ? JSON.stringify(details.oldValues) : null,
      newValues: details.newValues ? JSON.stringify(details.newValues) : null,
      success: details.success !== undefined ? details.success : true,
      errorMessage: details.errorMessage || null,
      sessionId: details.sessionId || null
    };

    // Log to Winston
    logger.info('Audit Log Entry', logEntry);

    // Log to database
    const db = new Database(dbPath);
    
    try {
      const insertLog = db.prepare(`
        INSERT INTO audit_logs (
          action, user_id, document_id, ip_address, user_agent, details, 
          old_values, new_values, success, error_message, session_id, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertLog.run(
        logEntry.action,
        logEntry.userId,
        logEntry.documentId,
        logEntry.ipAddress,
        logEntry.userAgent,
        logEntry.details,
        logEntry.oldValues,
        logEntry.newValues,
        logEntry.success ? 1 : 0,
        logEntry.errorMessage,
        logEntry.sessionId,
        logEntry.timestamp
      );
      
      console.log(`Audit log recorded: ${action}`);
    } catch (error) {
      logger.error('Failed to write audit log to database', { error: error.message, logEntry });
    } finally {
      db.close();
    }
  },

  // Document-specific logging methods
  documentCreated: async (documentId, userId, documentData, req = null) => {
    await AuditLogger.logAction(AuditActions.DOCUMENT_CREATED, {
      userId,
      documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `Document created: ${documentData.sop_name}`,
      newValues: documentData
    });
  },

  documentUpdated: async (documentId, userId, oldData, newData, req = null) => {
    await AuditLogger.logAction(AuditActions.DOCUMENT_UPDATED, {
      userId,
      documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `Document updated: ${newData.sop_name}`,
      oldValues: oldData,
      newValues: newData
    });
  },

  documentDeleted: async (documentId, userId, documentData, req = null) => {
    await AuditLogger.logAction(AuditActions.DOCUMENT_DELETED, {
      userId,
      documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `Document deleted: ${documentData.sop_name}`,
      oldValues: documentData
    });
  },

  documentViewed: async (documentId, userId, req = null) => {
    await AuditLogger.logAction(AuditActions.DOCUMENT_VIEWED, {
      userId,
      documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: 'Document viewed'
    });
  },

  documentStatusChanged: async (documentId, userId, oldStatus, newStatus, req = null) => {
    await AuditLogger.logAction(AuditActions.DOCUMENT_STATUS_CHANGED, {
      userId,
      documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `Status changed from ${oldStatus} to ${newStatus}`,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus }
    });
  },

  // User-specific logging methods
  userLogin: async (userId, success, req = null, errorMessage = null) => {
    await AuditLogger.logAction(success ? AuditActions.USER_LOGIN : AuditActions.USER_LOGIN_FAILED, {
      userId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: success ? 'User logged in successfully' : 'Login attempt failed',
      success,
      errorMessage,
      sessionId: req?.sessionID
    });
  },

  userLogout: async (userId, req = null) => {
    await AuditLogger.logAction(AuditActions.USER_LOGOUT, {
      userId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: 'User logged out',
      sessionId: req?.sessionID
    });
  },

  userCreated: async (newUserId, creatorId, userData, req = null) => {
    await AuditLogger.logAction(AuditActions.USER_CREATED, {
      userId: creatorId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `User created: ${userData.name} (${userData.email})`,
      newValues: { ...userData, createdUserId: newUserId }
    });
  },

  // Change request logging methods
  changeRequestCreated: async (changeRequestId, userId, requestData, req = null) => {
    await AuditLogger.logAction(AuditActions.CHANGE_REQUEST_CREATED, {
      userId,
      documentId: requestData.documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `Change request created: ${requestData.requestType}`,
      newValues: { ...requestData, changeRequestId }
    });
  },

  changeRequestStatusChanged: async (changeRequestId, userId, oldStatus, newStatus, req = null) => {
    const action = newStatus === 'approved' ? AuditActions.CHANGE_REQUEST_APPROVED : 
                   newStatus === 'rejected' ? AuditActions.CHANGE_REQUEST_REJECTED : 
                   AuditActions.CHANGE_REQUEST_UPDATED;

    await AuditLogger.logAction(action, {
      userId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `Change request status changed from ${oldStatus} to ${newStatus}`,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus, changeRequestId }
    });
  },

  // Security logging methods
  securityBreach: async (req, details) => {
    await AuditLogger.logAction(AuditActions.SECURITY_BREACH_ATTEMPT, {
      userId: req.user?.id || 'anonymous',
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `Security breach attempt: ${details}`,
      success: false
    });
  },

  rateLimitExceeded: async (req) => {
    await AuditLogger.logAction(AuditActions.RATE_LIMIT_EXCEEDED, {
      userId: req.user?.id || 'anonymous',
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: 'Rate limit exceeded',
      success: false
    });
  },

  unauthorizedAccess: async (req, attemptedResource) => {
    await AuditLogger.logAction(AuditActions.UNAUTHORIZED_ACCESS, {
      userId: req.user?.id || 'anonymous',
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `Unauthorized access attempt to: ${attemptedResource}`,
      success: false
    });
  },

  // File logging methods
  fileUploaded: async (fileName, userId, documentId, req = null) => {
    await AuditLogger.logAction(AuditActions.FILE_UPLOADED, {
      userId,
      documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `File uploaded: ${fileName}`
    });
  },

  fileDeleted: async (fileName, userId, documentId, req = null) => {
    await AuditLogger.logAction(AuditActions.FILE_DELETED, {
      userId,
      documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `File deleted: ${fileName}`
    });
  },

  fileDownloaded: async (fileName, userId, documentId, req = null) => {
    await AuditLogger.logAction(AuditActions.FILE_DOWNLOADED, {
      userId,
      documentId,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      details: `File downloaded: ${fileName}`
    });
  },

  // System logging methods
  systemError: async (error, context = {}) => {
    await AuditLogger.logAction(AuditActions.SYSTEM_ERROR, {
      userId: 'system',
      details: `System error: ${error.message}`,
      errorMessage: error.stack,
      success: false,
      ...context
    });
  },

  // Query audit logs
  getAuditLogs: async (filters = {}) => {
    const db = new Database(dbPath);
    
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.userId) {
        whereClause += ' AND user_id = ?';
        params.push(filters.userId);
      }

      if (filters.documentId) {
        whereClause += ' AND document_id = ?';
        params.push(filters.documentId);
      }

      if (filters.action) {
        whereClause += ' AND action = ?';
        params.push(filters.action);
      }

      if (filters.startDate) {
        whereClause += ' AND timestamp >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        whereClause += ' AND timestamp <= ?';
        params.push(filters.endDate);
      }

      if (filters.success !== undefined) {
        whereClause += ' AND success = ?';
        params.push(filters.success ? 1 : 0);
      }

      const limit = filters.limit || 100;
      const offset = filters.offset || 0;

      const query = `
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        ORDER BY al.timestamp DESC
        LIMIT ? OFFSET ?
      `;

      const logs = db.prepare(query).all(...params, limit, offset);
      
      // Parse JSON fields
      return logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
        oldValues: log.old_values ? JSON.parse(log.old_values) : null,
        newValues: log.new_values ? JSON.parse(log.new_values) : null,
        success: Boolean(log.success)
      }));
    } catch (error) {
      logger.error('Error querying audit logs', { error: error.message, filters });
      return [];
    } finally {
      db.close();
    }
  }
};

// Middleware to automatically log requests
export const auditMiddleware = (req, res, next) => {
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to log response
  res.end = function(chunk, encoding) {
    res.end = originalEnd;
    
    // Log the request/response
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      responseTime: Date.now() - req.startTime
    };

    // Only log significant actions (not health checks, static files, etc.)
    if (!req.url.includes('/api/health') && 
        !req.url.includes('/uploads/') && 
        !req.url.includes('/favicon.ico')) {
      
      if (res.statusCode >= 400) {
        logger.warn('HTTP Request Failed', logData);
      } else {
        logger.info('HTTP Request', logData);
      }
    }

    res.end(chunk, encoding);
  };

  // Add start time for response time calculation
  req.startTime = Date.now();
  next();
};

export default AuditLogger;
