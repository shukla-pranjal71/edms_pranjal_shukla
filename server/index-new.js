#!/usr/bin/env node

/**
 * SOP Document Manager Plus Server
 * Enterprise-grade backend with proper architecture
 */

import application from './src/app.js';
import config from './src/config/index.js';

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 SOP Document Manager Plus - Enterprise Edition      ║
║                                                            ║
║     • JWT Authentication & Session Management              ║
║     • Role-Based Access Control                           ║
║     • File Upload & Storage (Local/AWS S3)                ║
║     • Email Notifications & Scheduling                    ║
║     • Comprehensive Audit Logging                         ║
║     • Enterprise Security Features                        ║
║     • RESTful API with OpenAPI Documentation              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);

    // Start the application
    const server = await application.start();

    console.log(`
📋 Available Endpoints:
   • 🏥 Health Check:    GET  /api/health
   • 🔐 Authentication:  POST /api/auth/login
   • 📄 Documents:       GET  /api/documents
   • 👥 Users:           GET  /api/users  
   • 📤 File Upload:     POST /api/upload
   • ⚙️  System:         GET  /api/system/stats

🔧 Configuration:
   • Port: ${config.server.port}
   • Environment: ${config.server.nodeEnv}
   • Database: SQLite (${config.database.path.split('/').pop()})
   • Email: ${config.email.enabled ? 'Enabled' : 'Disabled'}
   • File Storage: ${config.upload.useS3 ? 'AWS S3' : 'Local'}
   • Rate Limiting: ${config.features.rateLimiting ? 'Enabled' : 'Disabled'}
   • Audit Logging: ${config.features.auditLogging ? 'Enabled' : 'Disabled'}

🛡️ Security Features:
   ✅ JWT Access & Refresh Tokens
   ✅ Password Hashing (bcrypt)
   ✅ Rate Limiting & DDoS Protection
   ✅ SQL Injection Prevention
   ✅ XSS Protection
   ✅ Security Headers (HSTS, CSP)
   ✅ Input Validation & Sanitization
   ✅ Comprehensive Audit Trail

📊 Monitoring:
   • Request/Response Logging
   • Performance Metrics
   • Error Tracking
   • Health Checks

Ready for production! 🎉
    `);

    return server;
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
