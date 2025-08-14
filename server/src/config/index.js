import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomBytes } from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Application Configuration
 * Centralizes all environment variables and provides validation
 */
class Config {
  constructor() {
    this.validateRequiredEnvVars();
  }

  // Server Configuration
  get server() {
    return {
      port: parseInt(process.env.PORT) || 3001,
      host: process.env.HOST || '0.0.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    };
  }

  // Database Configuration
  get database() {
    return {
      path: process.env.DATABASE_PATH || join(__dirname, '../../..', 'data', 'documents.db'),
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      timeout: parseInt(process.env.DB_TIMEOUT) || 30000,
      enableForeignKeys: process.env.DB_FOREIGN_KEYS !== 'false',
    };
  }

  // JWT Configuration
  get jwt() {
    return {
      secret: process.env.JWT_SECRET || this.generateDefaultSecret('jwt'),
      refreshSecret: process.env.JWT_REFRESH_SECRET || this.generateDefaultSecret('refresh'),
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      algorithm: 'HS256',
      issuer: process.env.JWT_ISSUER || 'sop-document-manager',
    };
  }

  // Email Configuration
  get email() {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
      from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
      enabled: !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD),
      queueBatchSize: parseInt(process.env.EMAIL_QUEUE_BATCH_SIZE) || 10,
    };
  }

  // File Upload Configuration
  get upload() {
    return {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE) || 2 * 1024 * 1024, // 2MB
      allowedDocumentTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ],
      allowedImageTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ],
      destination: process.env.UPLOAD_DESTINATION || join(__dirname, '../../..', 'uploads'),
      useS3: process.env.USE_S3_STORAGE === 'true',
    };
  }

  // AWS S3 Configuration
  get aws() {
    return {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      bucketName: process.env.AWS_S3_BUCKET_NAME || 'sop-documents',
      enabled: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    };
  }

  // Security Configuration
  get security() {
    return {
      rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        authWindowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        authMaxAttempts: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS) || 5,
      },
      bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
      },
      passwordReset: {
        tokenLength: parseInt(process.env.PASSWORD_RESET_TOKEN_LENGTH) || 32,
        expirationHours: parseInt(process.env.PASSWORD_RESET_EXPIRATION_HOURS) || 1,
      },
      session: {
        cleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL) || 60 * 60 * 1000, // 1 hour
      },
    };
  }

  // Logging Configuration
  get logging() {
    return {
      level: process.env.LOG_LEVEL || 'info',
      directory: process.env.LOG_DIRECTORY || join(__dirname, '../../..', 'logs'),
      maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 10,
      auditMaxFiles: parseInt(process.env.AUDIT_LOG_MAX_FILES) || 20,
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
      enableFile: process.env.LOG_ENABLE_FILE !== 'false',
      enableDetailedLogging: process.env.ENABLE_DETAILED_LOGGING === 'true',
      retentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 365,
    };
  }

  // Application Features
  get features() {
    return {
      emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
      auditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
      fileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
      rateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
      sessionTracking: process.env.ENABLE_SESSION_TRACKING !== 'false',
    };
  }

  // Development helpers
  get isDevelopment() {
    return this.server.nodeEnv === 'development';
  }

  get isProduction() {
    return this.server.nodeEnv === 'production';
  }

  get isTest() {
    return this.server.nodeEnv === 'test';
  }

  /**
   * Validate required environment variables
   */
  validateRequiredEnvVars() {
    const required = [];

    // Check JWT secrets in production
    if (this.isProduction) {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        required.push('JWT_SECRET (minimum 32 characters)');
      }
      if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
        required.push('JWT_REFRESH_SECRET (minimum 32 characters)');
      }
    }

    if (required.length > 0) {
      throw new Error(
        `Missing required environment variables:\n${required.map(r => `  - ${r}`).join('\n')}\n\n` +
        'Please check your .env file or environment configuration.'
      );
    }
  }

  /**
   * Generate a default secret for development (NOT for production)
   */
  generateDefaultSecret(type) {
    if (this.isProduction) {
      throw new Error(`${type.toUpperCase()} secret must be provided in production`);
    }
    
    return randomBytes(32).toString('hex');
  }

  /**
   * Get full configuration as plain object
   */
  toJSON() {
    return {
      server: this.server,
      database: { ...this.database, path: '[REDACTED]' },
      jwt: { ...this.jwt, secret: '[REDACTED]', refreshSecret: '[REDACTED]' },
      email: { 
        ...this.email, 
        auth: { 
          user: this.email.auth.user ? '[REDACTED]' : '', 
          pass: this.email.auth.pass ? '[REDACTED]' : '' 
        } 
      },
      upload: this.upload,
      aws: { ...this.aws, accessKeyId: '[REDACTED]', secretAccessKey: '[REDACTED]' },
      security: this.security,
      logging: this.logging,
      features: this.features,
    };
  }
}

export default new Config();
