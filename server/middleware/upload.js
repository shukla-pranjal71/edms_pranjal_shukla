import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// AWS S3 Configuration
const s3Client = process.env.AWS_ACCESS_KEY_ID ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}) : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'sop-documents';
const USE_S3 = process.env.USE_S3_STORAGE === 'true' && s3Client;

// Local storage configuration
const UPLOAD_PATH = join(__dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default

// Ensure upload directory exists
if (!USE_S3 && !fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Allowed file types for document uploads
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

// Generate unique filename
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${baseName}_${timestamp}_${randomString}${extension}`;
};

// File filter function
const fileFilter = (allowedTypes) => (req, file, cb) => {
  console.log('File upload attempt:', {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  });

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(UPLOAD_PATH, 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = generateFileName(file.originalname);
    cb(null, fileName);
  }
});

// Memory storage for S3 uploads
const memoryStorage = multer.memoryStorage();

// Document upload middleware
export const uploadDocument = multer({
  storage: USE_S3 ? memoryStorage : localStorage,
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Maximum 5 files per upload
    fields: 20 // Maximum 20 form fields
  }
}).array('documents', 5);

// Image upload middleware (for user avatars, etc.)
export const uploadImage = multer({
  storage: USE_S3 ? memoryStorage : localStorage,
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for images
    files: 1
  }
}).single('image');

// S3 upload function
const uploadToS3 = async (file, folder = 'documents') => {
  const fileName = generateFileName(file.originalname);
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: 'inline',
    Metadata: {
      originalName: file.originalname,
      uploadDate: new Date().toISOString()
    }
  });

  try {
    await s3Client.send(command);
    return {
      key,
      fileName,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Get file from S3
export const getFileFromS3 = async (key) => {
  if (!USE_S3) {
    throw new Error('S3 is not configured');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return signedUrl;
  } catch (error) {
    console.error('S3 get file error:', error);
    throw new Error('Failed to get file from S3');
  }
};

// Delete file from S3
export const deleteFileFromS3 = async (key) => {
  if (!USE_S3) {
    return;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete file error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

// Delete local file
const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
};

// Process uploaded files middleware
export const processUploadedFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const processedFiles = [];

    for (const file of req.files) {
      let fileData;

      if (USE_S3) {
        // Upload to S3
        fileData = await uploadToS3(file);
      } else {
        // Use local file
        fileData = {
          fileName: file.filename,
          url: `/uploads/documents/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          originalName: file.originalname,
          path: file.path
        };
      }

      processedFiles.push(fileData);
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('File processing error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (file.path) {
          deleteLocalFile(file.path);
        }
      });
    }
    
    res.status(500).json({
      error: 'File processing failed',
      message: error.message
    });
  }
};

// File validation middleware
export const validateFileUpload = (req, res, next) => {
  // Check if files are present when required
  if (req.body.requireFiles === 'true' && (!req.files || req.files.length === 0)) {
    return res.status(400).json({
      error: 'At least one file is required'
    });
  }

  // Validate file count
  if (req.files && req.files.length > 5) {
    return res.status(400).json({
      error: 'Maximum 5 files allowed per upload'
    });
  }

  // Additional validation can be added here
  next();
};

// Get file URL (works for both local and S3)
export const getFileUrl = async (filePath, isS3 = USE_S3) => {
  if (isS3 && filePath.startsWith('documents/')) {
    return await getFileFromS3(filePath);
  } else if (!isS3) {
    return `/uploads/${filePath}`;
  } else {
    return filePath; // Assume it's already a full URL
  }
};

// Delete file (works for both local and S3)
export const deleteFile = async (filePath, isS3 = USE_S3) => {
  if (isS3 && filePath.startsWith('documents/')) {
    await deleteFileFromS3(filePath);
  } else if (!isS3) {
    const fullPath = join(UPLOAD_PATH, filePath);
    deleteLocalFile(fullPath);
  }
};

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File size too large. Maximum allowed size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = error.message;
    }
    
    return res.status(400).json({
      error: 'Upload failed',
      message
    });
  }
  
  if (error.message.includes('File type not allowed')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  next(error);
};

// Serve uploaded files (for local storage)
export const serveUploadedFile = (req, res) => {
  const filePath = join(UPLOAD_PATH, req.params[0]);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
};

export { USE_S3, UPLOAD_PATH, MAX_FILE_SIZE, ALLOWED_DOCUMENT_TYPES };
