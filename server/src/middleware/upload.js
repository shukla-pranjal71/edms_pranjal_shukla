/**
 * Upload Middleware
 * Handles file uploads, validation, and serving static files
 */

import multer from 'multer';
import { join, extname } from 'path';
import fs from 'fs';
import express from 'express';
import config from '../config/index.js';
import { HTTP_STATUS, MESSAGES, ERROR_CODES } from '../constants/index.js';
import { LoggerService } from '../services/LoggerService.js';
import { generateUUID, createError } from '../utils/index.js';

// Ensure upload directory exists
const uploadDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories
const subdirs = ['documents', 'temp', 'avatars'];
subdirs.forEach(dir => {
  const path = join(uploadDir, dir);
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
});

/**
 * File filter for allowed file types
 */
const fileFilter = (req, file, cb) => {
  const allowedMimes = config.upload.allowedMimeTypes;
  const allowedExtensions = config.upload.allowedExtensions;
  
  const isAllowedMime = allowedMimes.includes(file.mimetype);
  const fileExtension = extname(file.originalname).toLowerCase();
  const isAllowedExtension = allowedExtensions.includes(fileExtension);
  
  if (isAllowedMime && isAllowedExtension) {
    cb(null, true);
  } else {
    const error = new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
    error.code = 'FILETYPE_NOT_ALLOWED';
    cb(error, false);
  }
};

/**
 * Storage configuration for documents
 */
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = join(uploadDir, 'documents');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueId = generateUUID();
    const timestamp = Date.now();
    const extension = extname(file.originalname);
    const filename = `${timestamp}-${uniqueId}${extension}`;
    
    // Store original filename in request for later use
    req.originalFilename = file.originalname;
    req.generatedFilename = filename;
    
    cb(null, filename);
  }
});

/**
 * Storage configuration for temporary uploads
 */
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = join(uploadDir, 'temp');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueId = generateUUID();
    const timestamp = Date.now();
    const extension = extname(file.originalname);
    const filename = `temp-${timestamp}-${uniqueId}${extension}`;
    cb(null, filename);
  }
});

/**
 * Storage configuration for avatar uploads
 */
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = join(uploadDir, 'avatars');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const extension = extname(file.originalname);
    const filename = `avatar-${userId}-${timestamp}${extension}`;
    cb(null, filename);
  }
});

/**
 * Document upload configuration
 */
const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles
  },
  fileFilter
});

/**
 * Temporary upload configuration
 */
const tempUpload = multer({
  storage: tempStorage,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1
  },
  fileFilter
});

/**
 * Avatar upload configuration
 */
const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const isAllowedMime = allowedMimes.includes(file.mimetype);
    const fileExtension = extname(file.originalname).toLowerCase();
    const isAllowedExtension = allowedExtensions.includes(fileExtension);
    
    if (isAllowedMime && isAllowedExtension) {
      cb(null, true);
    } else {
      const error = new Error('Only image files are allowed for avatars');
      error.code = 'INVALID_IMAGE_TYPE';
      cb(error, false);
    }
  }
});

/**
 * File validation middleware
 */
const validateFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: MESSAGES.ERROR.FILE_REQUIRED,
      code: ERROR_CODES.FILE_REQUIRED
    });
  }

  // Log file upload attempt
  const files = req.files || [req.file];
  files.forEach(file => {
    if (file) {
      LoggerService.fileOperation('upload', file.originalname, {
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        userId: req.user?.id,
        ip: req.clientIP
      });
    }
  });

  next();
};

/**
 * Virus scanning middleware (placeholder)
 * In production, integrate with antivirus scanning service
 */
const virusCheck = (req, res, next) => {
  // Placeholder for virus scanning
  // In production, you would integrate with services like:
  // - ClamAV
  // - VirusTotal API
  // - AWS GuardDuty
  // - Microsoft Defender
  
  const files = req.files || [req.file];
  files.forEach(file => {
    if (file) {
      LoggerService.security('File virus scan', {
        filename: file.filename,
        size: file.size,
        status: 'clean', // Would be actual scan result
        userId: req.user?.id
      });
    }
  });

  next();
};

/**
 * File size validation middleware
 */
const validateFileSize = (req, res, next) => {
  const files = req.files || [req.file];
  const oversizedFiles = files.filter(file => 
    file && file.size > config.upload.maxFileSize
  );

  if (oversizedFiles.length > 0) {
    // Clean up uploaded files
    oversizedFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: `File size exceeds limit of ${Math.round(config.upload.maxFileSize / (1024 * 1024))}MB`,
      code: ERROR_CODES.FILE_TOO_LARGE
    });
  }

  next();
};

/**
 * Static file serving middleware with security
 */
const serveStaticFiles = express.static(uploadDir, {
  dotfiles: 'deny',
  index: false,
  setHeaders: (res, path) => {
    // Security headers for static files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Cache control
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Content disposition for downloads
    if (path.includes('/documents/')) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
});

/**
 * Secure file download middleware
 */
const secureDownload = (req, res, next) => {
  const filename = req.params.filename;
  const filePath = join(uploadDir, 'documents', filename);

  // Validate filename to prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: MESSAGES.ERROR.INVALID_FILENAME,
      code: ERROR_CODES.INVALID_INPUT
    });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: MESSAGES.ERROR.FILE_NOT_FOUND,
      code: ERROR_CODES.RESOURCE_NOT_FOUND
    });
  }

  // Log download attempt
  LoggerService.fileOperation('download', filename, {
    userId: req.user?.id,
    ip: req.clientIP
  });

  // Set security headers and serve file
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  res.sendFile(filePath);
};

/**
 * File cleanup utility
 */
const cleanupTempFiles = () => {
  const tempDir = join(uploadDir, 'temp');
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (!fs.existsSync(tempDir)) return;

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      LoggerService.error('Failed to read temp directory', { error: err.message });
      return;
    }

    files.forEach(file => {
      const filePath = join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        const age = Date.now() - stats.mtime.getTime();
        if (age > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              LoggerService.error('Failed to delete temp file', { 
                file: filePath, 
                error: err.message 
              });
            } else {
              LoggerService.info('Cleaned up temp file', { file: filePath });
            }
          });
        }
      });
    });
  });
};

// Schedule temp file cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

/**
 * Error handling for multer
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = MESSAGES.ERROR.UPLOAD_FAILED;
    let code = ERROR_CODES.UPLOAD_FAILED;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File size exceeds limit of ${Math.round(config.upload.maxFileSize / (1024 * 1024))}MB`;
        code = ERROR_CODES.FILE_TOO_LARGE;
        break;
      case 'LIMIT_FILE_COUNT':
        message = `Too many files. Maximum ${config.upload.maxFiles} files allowed`;
        code = ERROR_CODES.TOO_MANY_FILES;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name in file upload';
        code = ERROR_CODES.INVALID_FIELD;
        break;
    }

    LoggerService.error('Upload error', {
      error: error.message,
      code: error.code,
      userId: req.user?.id,
      ip: req.clientIP
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: message,
      code
    });
  }

  if (error.code === 'FILETYPE_NOT_ALLOWED' || error.code === 'INVALID_IMAGE_TYPE') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: error.message,
      code: ERROR_CODES.INVALID_FILE_TYPE
    });
  }

  next(error);
};

/**
 * Upload middleware collection
 */
export const uploadMiddleware = {
  // Multer instances
  documentUpload,
  tempUpload,
  avatarUpload,

  // Validation middleware
  validateFile,
  validateFileSize,
  virusCheck,

  // Static file serving
  serveStaticFiles,
  secureDownload,

  // Error handling
  handleUploadError,

  // Utilities
  cleanupTempFiles
};
