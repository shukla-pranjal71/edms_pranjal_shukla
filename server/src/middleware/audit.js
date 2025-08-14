/**
 * Audit Middleware
 * Provides comprehensive request logging and security auditing
 */

import { LoggerService } from '../services/LoggerService.js';
import { getClientIP, removeSensitiveFields } from '../utils/index.js';
import config from '../config/index.js';

/**
 * Request logger middleware
 * Logs all HTTP requests with timing and metadata
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Skip logging for static assets and health checks if configured
  const skipPaths = ['/favicon.ico', '/robots.txt'];
  if (config.isDevelopment && req.path === '/api/health') {
    skipPaths.push('/api/health');
  }

  if (skipPaths.some(path => req.path.includes(path))) {
    return next();
  }

  // Override res.json to capture response data
  const originalJson = res.json;
  let responseData = null;

  res.json = function(data) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Log request completion
  const logRequest = () => {
    const duration = Date.now() - start;
    const clientIP = getClientIP(req);

    // Prepare request metadata
    const requestMeta = {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: clientIP,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      requestId: req.requestId,
      userId: req.user?.id,
      userRole: req.user?.role,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString()
    };

    // Add query parameters (sanitized)
    if (Object.keys(req.query).length > 0) {
      requestMeta.query = removeSensitiveFields(req.query);
    }

    // Add request body for POST/PUT/PATCH (sanitized)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      requestMeta.body = removeSensitiveFields(req.body);
    }

    // Add response data for errors or in debug mode
    if (res.statusCode >= 400 || config.logging.includeResponseData) {
      if (responseData && typeof responseData === 'object') {
        requestMeta.response = removeSensitiveFields(responseData);
      }
    }

    // Use appropriate log level based on status code
    if (res.statusCode >= 500) {
      LoggerService.error(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, requestMeta);
    } else if (res.statusCode >= 400) {
      LoggerService.warn(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, requestMeta);
    } else {
      LoggerService.info(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, requestMeta);
    }

    // Performance warning for slow requests
    if (duration > config.logging.slowRequestThreshold) {
      LoggerService.warn(`Slow request detected`, {
        ...requestMeta,
        performance: true,
        threshold: config.logging.slowRequestThreshold
      });
    }
  };

  // Log when response finishes
  res.on('finish', logRequest);
  res.on('close', () => {
    if (!res.finished) {
      LoggerService.warn('Request closed before completion', {
        method: req.method,
        url: req.originalUrl,
        ip: getClientIP(req),
        duration: `${Date.now() - start}ms`,
        requestId: req.requestId
      });
    }
  });

  next();
};

/**
 * Authentication audit middleware
 * Logs authentication-related events
 */
const authenticationAudit = (eventType) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const clientIP = getClientIP(req);
      const success = res.statusCode < 400;
      
      const auditData = {
        event: eventType,
        success,
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      };

      // Add user information if available
      if (req.body?.email) {
        auditData.email = req.body.email;
      }
      if (req.user?.id) {
        auditData.userId = req.user.id;
        auditData.userRole = req.user.role;
      }

      // Add failure reason for unsuccessful attempts
      if (!success && data?.error) {
        auditData.failureReason = data.error;
        auditData.errorCode = data.code;
      }

      // Log the audit event
      LoggerService.authEvent(eventType, auditData);

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Data access audit middleware
 * Logs data access and modification events
 */
const dataAccessAudit = (resource, action) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const clientIP = getClientIP(req);
      const success = res.statusCode < 400;
      
      const auditData = {
        resource,
        action,
        success,
        ip: clientIP,
        userId: req.user?.id,
        userRole: req.user?.role,
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      };

      // Add resource identifiers
      if (req.params.id) {
        auditData.resourceId = req.params.id;
      }

      // Add affected data for modifications
      if (['create', 'update', 'delete'].includes(action) && success) {
        if (data?.id) auditData.affectedId = data.id;
        if (req.body) auditData.changes = removeSensitiveFields(req.body);
      }

      // Add failure information
      if (!success && data?.error) {
        auditData.failureReason = data.error;
        auditData.errorCode = data.code;
      }

      // Log the audit event
      LoggerService.audit(`Data ${action}: ${resource}`, auditData);

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Security event audit middleware
 * Logs security-related events and violations
 */
const securityAudit = (eventType, severity = 'medium') => {
  return (req, res, next) => {
    const clientIP = getClientIP(req);
    
    const auditData = {
      event: eventType,
      severity,
      ip: clientIP,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    };

    // Add request data for security analysis
    if (req.body && Object.keys(req.body).length > 0) {
      auditData.requestData = removeSensitiveFields(req.body);
    }
    if (req.query && Object.keys(req.query).length > 0) {
      auditData.queryData = removeSensitiveFields(req.query);
    }

    LoggerService.security(eventType, auditData);
    next();
  };
};

/**
 * File operation audit middleware
 * Logs file upload, download, and deletion events
 */
const fileOperationAudit = (operation) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const clientIP = getClientIP(req);
      const success = res.statusCode < 400;
      
      const auditData = {
        operation,
        success,
        ip: clientIP,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      };

      // Add file information
      if (req.file) {
        auditData.filename = req.file.originalname;
        auditData.fileSize = req.file.size;
        auditData.mimeType = req.file.mimetype;
        auditData.storedFilename = req.file.filename;
      }

      if (req.files && req.files.length > 0) {
        auditData.files = req.files.map(file => ({
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          storedFilename: file.filename
        }));
      }

      // Add filename for downloads
      if (req.params.filename) {
        auditData.filename = req.params.filename;
      }

      // Add failure information
      if (!success && data?.error) {
        auditData.failureReason = data.error;
        auditData.errorCode = data.code;
      }

      LoggerService.fileOperation(operation, auditData.filename || 'multiple', auditData);

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Admin action audit middleware
 * Logs administrative actions with high detail
 */
const adminActionAudit = (action) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const clientIP = getClientIP(req);
      const success = res.statusCode < 400;
      
      const auditData = {
        action,
        success,
        ip: clientIP,
        adminId: req.user?.id,
        adminRole: req.user?.role,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        severity: 'high'
      };

      // Add target user information
      if (req.params.userId || req.body?.userId) {
        auditData.targetUserId = req.params.userId || req.body.userId;
      }

      // Add changes made
      if (req.body && Object.keys(req.body).length > 0) {
        auditData.changes = removeSensitiveFields(req.body);
      }

      // Add result information
      if (success && data) {
        auditData.result = removeSensitiveFields(data);
      }

      // Add failure information
      if (!success && data?.error) {
        auditData.failureReason = data.error;
        auditData.errorCode = data.code;
      }

      LoggerService.audit(`Admin ${action}`, auditData);

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Audit middleware collection
 */
export const auditMiddleware = {
  requestLogger,
  authenticationAudit,
  dataAccessAudit,
  securityAudit,
  fileOperationAudit,
  adminActionAudit
};
