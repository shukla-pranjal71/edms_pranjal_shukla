import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 file uploads per hour
  message: {
    error: 'Too many file uploads, please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input validation middleware
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Document validation rules
export const validateDocument = [
  body('sopName')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('SOP name must be between 1 and 255 characters')
    .escape(),
  body('documentCode')
    .trim()
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Document code must contain only uppercase letters, numbers, and hyphens')
    .isLength({ min: 3, max: 50 })
    .withMessage('Document code must be between 3 and 50 characters'),
  body('versionNumber')
    .trim()
    .matches(/^\d+\.\d+$/)
    .withMessage('Version number must be in format X.Y (e.g., 1.0)'),
  body('uploadDate')
    .isISO8601()
    .withMessage('Upload date must be in ISO 8601 format'),
  body('documentType')
    .trim()
    .isIn(['SOP', 'Policy', 'Procedure', 'Guideline', 'Manual', 'Work Instruction', 'Form'])
    .withMessage('Invalid document type'),
  body('department')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Department must be between 1 and 100 characters')
    .escape(),
  body('country')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .escape()
];

// User validation rules
export const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('role')
    .trim()
    .isIn(['admin', 'document-controller', 'document-creator', 'requester', 'document-requester', 'reviewer', 'document-owner'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters')
    .escape(),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters')
    .escape()
];

// Login validation rules
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Change request validation rules
export const validateChangeRequest = [
  body('documentId')
    .trim()
    .isUUID()
    .withMessage('Valid document ID is required'),
  body('requesterId')
    .trim()
    .isUUID()
    .withMessage('Valid requester ID is required'),
  body('requestType')
    .trim()
    .isIn(['revision', 'correction', 'update', 'deletion'])
    .withMessage('Invalid request type'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .escape(),
  body('priority')
    .trim()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level')
];

// Comment validation rules
export const validateComment = [
  body('userId')
    .trim()
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .escape()
];

// SQL injection prevention patterns
const sqlInjectionPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
  /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"])/i,
  /(;|\||&)/,
  /(-{2}|\/\*|\*\/)/
];

// Middleware to detect potential SQL injection attempts
export const detectSQLInjection = (req, res, next) => {
  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const suspicious = checkValue(req.body) || checkValue(req.query) || checkValue(req.params);
  
  if (suspicious) {
    console.warn('Potential SQL injection attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      body: req.body,
      query: req.query
    });
    
    return res.status(400).json({
      error: 'Invalid request format detected'
    });
  }
  
  next();
};

// XSS prevention middleware
export const preventXSS = (req, res, next) => {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const suspicious = checkValue(req.body) || checkValue(req.query);
  
  if (suspicious) {
    console.warn('Potential XSS attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    return res.status(400).json({
      error: 'Invalid content detected'
    });
  }
  
  next();
};
