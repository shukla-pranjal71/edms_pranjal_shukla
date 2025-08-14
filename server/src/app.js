import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import configuration and utilities
import config from './config/index.js';
import { HTTP_STATUS, MESSAGES } from './constants/index.js';
import { getClientIP, removeSensitiveFields } from './utils/index.js';

// Import database connection
import databaseConnection from './models/Database.js';

// Import middleware
import { securityMiddleware } from './middleware/security.js';
import { authenticationMiddleware } from './middleware/authentication.js';
import { uploadMiddleware } from './middleware/upload.js';
import { auditMiddleware } from './middleware/audit.js';
import { errorMiddleware } from './middleware/error.js';

// Import routes
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import systemRoutes from './routes/system.js';

// Import services
import { LoggerService } from './services/LoggerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Express Application Factory
 * Creates and configures the Express application with all middleware and routes
 */
class Application {
  constructor() {
    this.app = express();
    this.logger = LoggerService;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log('🚀 Initializing SOP Document Manager Plus...');
      
      // Log configuration (redacted)
      if (config.isDevelopment) {
        this.logger.info('Configuration loaded', config.toJSON());
      }

      // Connect to database
      await this.connectDatabase();

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      this.isInitialized = true;
      console.log('✅ Application initialized successfully');
      
      return this.app;
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      process.exit(1);
    }
  }

  /**
   * Connect to database
   */
  async connectDatabase() {
    try {
      await databaseConnection.connect();
      
      // Perform health check
      const isHealthy = await databaseConnection.healthCheck();
      if (!isHealthy) {
        throw new Error('Database health check failed');
      }
      
      this.logger.info('Database connected and healthy');
    } catch (error) {
      this.logger.error('Database connection failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Setup application middleware
   */
  setupMiddleware() {
    // Trust proxy (for proper IP detection behind reverse proxy)
    this.app.set('trust proxy', 1);

    // Security middleware (must be first)
    if (config.features.rateLimiting) {
      this.app.use(securityMiddleware.rateLimiter);
    }
    this.app.use(securityMiddleware.securityHeaders);
    this.app.use(securityMiddleware.preventXSS);
    this.app.use(securityMiddleware.detectSQLInjection);

    // CORS configuration
    this.app.use(cors({
      origin: config.server.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve static files
    this.app.use('/uploads', uploadMiddleware.serveStaticFiles);
    this.app.use(express.static(join(__dirname, '..', '..', 'dist')));

    // Request logging and audit middleware
    if (config.features.auditLogging) {
      this.app.use(auditMiddleware.requestLogger);
    }

    // Add request metadata
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      req.clientIP = getClientIP(req);
      next();
    });

    this.logger.info('Middleware configured');
  }

  /**
   * Setup application routes
   */
  setupRoutes() {
    // Health check endpoint (no auth required)
    this.app.get('/api/health', (req, res) => {
      const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.server.nodeEnv,
        database: databaseConnection.isConnected,
        features: {
          authentication: true,
          fileUploads: config.features.fileUploads,
          emailNotifications: config.features.emailNotifications,
          auditLogging: config.features.auditLogging,
        }
      };

      res.json(healthData);
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/documents', documentRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/upload', uploadRoutes);
    this.app.use('/api/system', systemRoutes);

    // Catch-all route for SPA (must be last)
    this.app.get('*', (req, res) => {
      // Don't serve SPA for API routes that don't exist
      if (req.path.startsWith('/api/')) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: MESSAGES.ERROR.RESOURCE_NOT_FOUND,
          path: req.path,
          method: req.method
        });
      }

      res.sendFile(join(__dirname, '..', '..', 'dist', 'index.html'));
    });

    this.logger.info('Routes configured');
  }

  /**
   * Setup error handling middleware
   */
  setupErrorHandling() {
    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        error: MESSAGES.ERROR.RESOURCE_NOT_FOUND,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use(errorMiddleware.globalErrorHandler);

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Promise Rejection', {
        reason: reason.toString(),
        promise: promise.toString()
      });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
      
      // Graceful shutdown
      this.shutdown();
    });

    this.logger.info('Error handling configured');
  }

  /**
   * Start the server
   */
  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const server = this.app.listen(config.server.port, config.server.host, (error) => {
        if (error) {
          this.logger.error('Failed to start server', { error: error.message });
          reject(error);
          return;
        }

        const address = server.address();
        const host = address.address === '::' ? 'localhost' : address.address;
        const url = `http://${host}:${address.port}`;

        console.log(`\n🚀 Server running on ${url}`);
        console.log(`📊 Environment: ${config.server.nodeEnv}`);
        console.log(`💾 Database: ${config.database.path.split('/').pop()}`);
        console.log(`📧 Email: ${config.email.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`☁️  Storage: ${config.upload.useS3 ? '✅ AWS S3' : '📁 Local'}`);
        console.log(`🔒 Security: Rate limiting, JWT, Audit logging`);
        console.log(`📚 API Documentation: ${url}/api`);

        this.logger.info('Server started successfully', {
          port: address.port,
          host: address.address,
          environment: config.server.nodeEnv
        });

        resolve(server);
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', () => this.shutdown(server));
      process.on('SIGINT', () => this.shutdown(server));
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(server = null) {
    console.log('\n🛑 Shutting down server...');
    
    try {
      // Close server
      if (server) {
        await new Promise((resolve) => {
          server.close(resolve);
        });
        console.log('✅ Server closed');
      }

      // Close database connection
      await databaseConnection.close();
      console.log('✅ Database connection closed');

      this.logger.info('Application shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      this.logger.error('Shutdown error', { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Get Express app instance
   */
  getApp() {
    return this.app;
  }
}

// Create and export application instance
const application = new Application();
export default application;

// Export app factory for testing
export { Application };
