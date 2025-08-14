/**
 * Application Constants
 * Centralized constants for the entire application
 */

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCUMENT_CONTROLLER: 'document-controller',
  DOCUMENT_CREATOR: 'document-creator',
  DOCUMENT_OWNER: 'document-owner',
  REVIEWER: 'reviewer',
  REQUESTER: 'requester',
  DOCUMENT_REQUESTER: 'document-requester',
};

// Document Status
export const DOCUMENT_STATUS = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under-review',
  PENDING_CREATOR_APPROVAL: 'pending-creator-approval',
  PENDING_REQUESTER_APPROVAL: 'pending-requester-approval',
  UNDER_REVISION: 'under-revision',
  PENDING_OWNER_APPROVAL: 'pending-owner-approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  LIVE: 'live',
  LIVE_CR: 'live-cr',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
  QUERIED: 'queried',
  REVIEWED: 'reviewed',
  PENDING_WITH_REQUESTER: 'pending-with-requester',
};

// Document Types
export const DOCUMENT_TYPES = {
  SOP: 'SOP',
  POLICY: 'Policy',
  PROCEDURE: 'Procedure',
  GUIDELINE: 'Guideline',
  MANUAL: 'Manual',
  WORK_INSTRUCTION: 'Work Instruction',
  FORM: 'Form',
};

// Change Request Types
export const CHANGE_REQUEST_TYPES = {
  REVISION: 'revision',
  CORRECTION: 'correction',
  UPDATE: 'update',
  DELETION: 'deletion',
};

// Change Request Status
export const CHANGE_REQUEST_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under-review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Audit Actions
export const AUDIT_ACTIONS = {
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
  FILE_DOWNLOADED: 'file_downloaded',
};

// Email Template Types
export const EMAIL_TEMPLATE_TYPES = {
  REVIEW_REMINDER: 'review_reminder',
  APPROVAL_NOTIFICATION: 'approval_notification',
  CHANGE_REQUEST_NOTIFICATION: 'change_request_notification',
  DOCUMENT_EXPIRATION_WARNING: 'document_expiration_warning',
  WELCOME_EMAIL: 'welcome_email',
  PASSWORD_RESET: 'password_reset',
};

// Email Queue Status
export const EMAIL_QUEUE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  RETRY: 'retry',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
};

  // Error Codes
export const ERROR_CODES = {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  TOKEN_REQUIRED: 'TOKEN_REQUIRED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_DUPLICATE_ENTRY: 'VALIDATION_DUPLICATE_ENTRY',
  
  // File Upload Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  
  // Database Errors
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED: 'DATABASE_QUERY_FAILED',
  DATABASE_CONSTRAINT_VIOLATION: 'DATABASE_CONSTRAINT_VIOLATION',
  
  // Business Logic Errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  OPERATION_NOT_PERMITTED: 'OPERATION_NOT_PERMITTED',
  WORKFLOW_VIOLATION: 'WORKFLOW_VIOLATION',
  
  // External Service Errors
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  STORAGE_SERVICE_UNAVAILABLE: 'STORAGE_SERVICE_UNAVAILABLE',
  
  // Security Errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AUTH_RATE_LIMIT: 'AUTH_RATE_LIMIT',
  UPLOAD_RATE_LIMIT: 'UPLOAD_RATE_LIMIT',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  
  // Input Validation
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_FILENAME: 'INVALID_FILENAME',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  
  // General Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_BUSY: 'DATABASE_BUSY',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  CUSTOM_ERROR: 'CUSTOM_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  
  // Upload specific
  FILE_REQUIRED: 'FILE_REQUIRED',
  TOO_MANY_FILES: 'TOO_MANY_FILES',
  INVALID_FIELD: 'INVALID_FIELD',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_FILES_PER_UPLOAD: 5,
  
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Cache TTL (Time to Live) in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Database Table Names
export const TABLES = {
  USERS: 'users',
  USER_SESSIONS: 'user_sessions',
  DOCUMENTS: 'documents',
  DOCUMENT_OWNERS: 'document_owners',
  DOCUMENT_REVIEWERS: 'document_reviewers',
  DOCUMENT_CREATORS: 'document_creators',
  DOCUMENT_COMMENTS: 'document_comments',
  DOCUMENT_FILES: 'document_files',
  DOCUMENT_LOGS: 'document_logs',
  CHANGE_REQUESTS: 'change_requests',
  COUNTRIES: 'countries',
  DEPARTMENTS: 'departments',
  DOCUMENT_TYPES: 'document_types',
  COMPLIANCE_NAMES: 'compliance_names',
  EMAIL_TEMPLATES: 'email_templates',
  EMAIL_QUEUE: 'email_queue',
  AUDIT_LOGS: 'audit_logs',
};

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  DOCUMENT_CODE: /^[A-Z0-9-]+$/,
  VERSION_NUMBER: /^\d+\.\d+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

// Date Formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm:ss',
};

// Environment Constants
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
  STAGING: 'staging',
};

// Default Values
export const DEFAULTS = {
  USER_ROLE: USER_ROLES.REQUESTER,
  DOCUMENT_STATUS: DOCUMENT_STATUS.DRAFT,
  CHANGE_REQUEST_STATUS: CHANGE_REQUEST_STATUS.PENDING,
  PRIORITY: PRIORITY_LEVELS.MEDIUM,
  PASSWORD: 'password123', // Default password for seeded users
};

// Validation Constraints
export const VALIDATION = {
  USER_NAME: { min: 1, max: 255 },
  EMAIL: { max: 255 },
  PASSWORD: { min: 6, max: 128 },
  DOCUMENT_NAME: { min: 1, max: 500 },
  DOCUMENT_CODE: { min: 3, max: 50 },
  DESCRIPTION: { max: 2000 },
  COMMENT: { min: 1, max: 1000 },
  DEPARTMENT_NAME: { min: 1, max: 100 },
  COUNTRY_NAME: { min: 1, max: 100 },
};

// API Response Messages
export const MESSAGES = {
  // Success Messages
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    PASSWORD_RESET_SENT: 'Password reset link sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  },
  
  // Error Messages
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCESS_DENIED: 'Access denied',
    RESOURCE_NOT_FOUND: 'Resource not found',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    INTERNAL_ERROR: 'Internal server error occurred',
    VALIDATION_FAILED: 'Validation failed',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Insufficient permissions',
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
    TOO_MANY_REQUESTS: 'Too many requests, please try again later',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded, please try again later',
    AUTH_RATE_LIMIT: 'Too many authentication attempts, please try again later',
    FILE_UPLOAD_FAILED: 'File upload failed',
    EMAIL_SEND_FAILED: 'Failed to send email',
    INVALID_INPUT: 'Invalid input provided',
    INVALID_FILENAME: 'Invalid filename',
    FILE_NOT_FOUND: 'File not found',
    FILE_REQUIRED: 'File is required',
    TOKEN_REQUIRED: 'Authentication token is required',
    TOKEN_EXPIRED: 'Authentication token has expired',
    TOKEN_INVALID: 'Invalid authentication token',
    AUTHENTICATION_REQUIRED: 'Authentication is required',
    DATABASE_ERROR: 'Database error occurred',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
    DUPLICATE_ENTRY: 'Duplicate entry found',
    RESOURCE_CONFLICT: 'Resource conflict occurred',
  },
};

export default {
  USER_ROLES,
  DOCUMENT_STATUS,
  DOCUMENT_TYPES,
  CHANGE_REQUEST_TYPES,
  CHANGE_REQUEST_STATUS,
  PRIORITY_LEVELS,
  AUDIT_ACTIONS,
  EMAIL_TEMPLATE_TYPES,
  EMAIL_QUEUE_STATUS,
  HTTP_STATUS,
  ERROR_CODES,
  FILE_UPLOAD,
  PAGINATION,
  CACHE_TTL,
  TABLES,
  REGEX,
  DATE_FORMATS,
  ENVIRONMENTS,
  DEFAULTS,
  VALIDATION,
  MESSAGES,
};
