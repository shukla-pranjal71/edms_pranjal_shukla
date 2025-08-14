/**
 * Security Middleware
 * Provides comprehensive security features including rate limiting,
 * security headers, XSS protection, and SQL injection detection
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss';
import config from '../config/index.js';
import { HTTP_STATUS, MESSAGES, ERROR_CODES } from '../constants/index.js';
import { LoggerService } from '../services/LoggerService.js';
import { createError, getClientIP } from '../utils/index.js';

/**
 * Rate limiting configurations
 */
const rateLimitConfigs = {
  // General API rate limiting
  general: rateLimit({
    windowMs: config.security.rateLimiting.windowMs,
    max: config.security.rateLimiting.maxRequests,
    message: {
      error: MESSAGES.ERROR.RATE_LIMIT_EXCEEDED,
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryAfter: Math.ceil(config.security.rateLimiting.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const clientIP = getClientIP(req);
      LoggerService.security('Rate limit exceeded', {
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        severity: 'medium'
      });

      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        error: MESSAGES.ERROR.RATE_LIMIT_EXCEEDED,
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        retryAfter: Math.ceil(config.security.rateLimiting.windowMs / 1000)
      });
    }
  }),

  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: config.security.rateLimiting.authWindowMs,
    max: config.security.rateLimiting.authMaxAttempts,
    message: {
      error: MESSAGES.ERROR.AUTH_RATE_LIMIT,
      code: ERROR_CODES.AUTH_RATE_LIMIT,
      retryAfter: Math.ceil(config.security.rateLimiting.authWindowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      const clientIP = getClientIP(req);
      LoggerService.security('Auth rate limit exceeded', {
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method,
        severity: 'high'
      });

      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        error: MESSAGES.ERROR.AUTH_RATE_LIMIT,
        code: ERROR_CODES.AUTH_RATE_LIMIT,
        retryAfter: Math.ceil(config.security.rateLimiting.authWindowMs / 1000)
      });
    }
  }),

  // Rate limiting for file uploads
  upload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per 15 minutes
    message: {
      error: 'Too many file uploads, please try again later',
      code: ERROR_CODES.UPLOAD_RATE_LIMIT,
      retryAfter: 900 // 15 minutes
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const clientIP = getClientIP(req);
      LoggerService.security('Upload rate limit exceeded', {
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        severity: 'medium'
      });

      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        error: 'Too many file uploads, please try again later',
        code: ERROR_CODES.UPLOAD_RATE_LIMIT,
        retryAfter: 900
      });
    }
  })
};

/**
 * Security headers middleware
 * Applies comprehensive security headers using Helmet
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      workerSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      ...(config.server.nodeEnv === 'production' ? { upgradeInsecureRequests: [] } : {})
    }
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for file uploads
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
});

/**
 * XSS Protection middleware
 * Sanitizes user input to prevent XSS attacks
 */
const preventXSS = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return xss(obj, {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      });
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * SQL Injection Detection middleware
 * Detects and blocks potential SQL injection attempts
 */
const detectSQLInjection = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /w*((\%27)|(\')){1}((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\')){1}((\%75)|u|(\%55))((\%6E)|n|(\%4E))((\%69)|i|(\%49))((\%6F)|o|(\%4F))((\%6E)|n|(\%4E))/i,
    /((\%27)|(\')){1}((\%73)|s|(\%53))((\%65)|e|(\%45))((\%6C)|l|(\%4C))((\%65)|e|(\%45))((\%63)|c|(\%43))((\%74)|t|(\%54))/i,
    /((\%27)|(\')){1}((\%69)|i|(\%49))((\%6E)|n|(\%4E))((\%73)|s|(\%53))((\%65)|e|(\%45))((\%72)|r|(\%52))((\%74)|t|(\%54))/i,
    /((\%27)|(\')){1}((\%64)|d|(\%44))((\%65)|e|(\%45))((\%6C)|l|(\%4C))((\%65)|e|(\%45))((\%74)|t|(\%54))((\%65)|e|(\%45))/i,
    /((\%27)|(\')){1}((\%63)|c|(\%43))((\%72)|r|(\%52))((\%65)|e|(\%45))((\%61)|a|(\%41))((\%74)|t|(\%54))((\%65)|e|(\%45))/i,
    /((\%27)|(\')){1}((\%64)|d|(\%44))((\%72)|r|(\%52))((\%6F)|o|(\%4F))((\%70)|p|(\%50))/i,
    /\b(union|select|insert|delete|update|create|drop|exec|execute|declare|cast|convert)\b/i
  ];

  const checkForSQLInjection = (value) => {
    if (typeof value === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    } else if (Array.isArray(value)) {
      return value.some(checkForSQLInjection);
    } else if (value && typeof value === 'object') {
      return Object.values(value).some(checkForSQLInjection);
    }
    return false;
  };

  const requestData = { ...req.query, ...req.body, ...req.params };
  const hasSQLInjection = checkForSQLInjection(requestData);

  if (hasSQLInjection) {
    const clientIP = getClientIP(req);
    LoggerService.security('SQL injection attempt detected', {
      ip: clientIP,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      data: requestData,
      severity: 'critical'
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: MESSAGES.ERROR.INVALID_INPUT,
      code: ERROR_CODES.SECURITY_VIOLATION
    });
  }

  next();
};

/**
 * Security violation logger
 * Logs security-related events and violations
 */
const logSecurityViolation = (req, violationType, details = {}) => {
  const clientIP = getClientIP(req);
  LoggerService.security(`Security violation: ${violationType}`, {
    ip: clientIP,
    userAgent: req.headers['user-agent'],
    path: req.path,
    method: req.method,
    referer: req.headers.referer,
    timestamp: new Date().toISOString(),
    ...details,
    severity: 'high'
  });
};

/**
 * Suspicious activity detector
 * Detects patterns that might indicate malicious behavior
 */
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    // Directory traversal
    /\.\.\/|\.\.\\|\.\.\%2F|\.\.\%5C/i,
    // Command injection
    /[;&|`${}()]/,
    // Script tags
    /<script|<\/script>/i,
    // PHP/ASP/JSP tags
    /<\?php|\?>/i,
    // Null bytes
    /%00/i,
    // Unicode bypass attempts
    /\u003c\u003e/i
  ];

  const checkSuspiciousActivity = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    } else if (Array.isArray(value)) {
      return value.some(checkSuspiciousActivity);
    } else if (value && typeof value === 'object') {
      return Object.values(value).some(checkSuspiciousActivity);
    }
    return false;
  };

  const requestData = { 
    ...req.query, 
    ...req.body, 
    ...req.params,
    url: req.originalUrl,
    headers: req.headers
  };

  if (checkSuspiciousActivity(requestData)) {
    logSecurityViolation(req, 'Suspicious activity detected', {
      requestData,
      severity: 'high'
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: MESSAGES.ERROR.INVALID_INPUT,
      code: ERROR_CODES.SECURITY_VIOLATION
    });
  }

  next();
};

/**
 * Security middleware collection
 */
export const securityMiddleware = {
  // Rate limiting
  rateLimiter: rateLimitConfigs.general,
  authRateLimiter: rateLimitConfigs.auth,
  uploadRateLimiter: rateLimitConfigs.upload,

  // Security headers
  securityHeaders,

  // Input protection
  preventXSS,
  detectSQLInjection,
  detectSuspiciousActivity,

  // Security logging
  logSecurityViolation,

  // Combined security middleware
  comprehensive: [
    securityHeaders,
    preventXSS,
    detectSQLInjection,
    detectSuspiciousActivity
  ]
};
