import nodemailer from 'nodemailer';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', '..', 'data', 'documents.db');

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || ''
  }
};

// Create transporter
let transporter = null;

const initializeEmailService = () => {
  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    console.warn('Email service not configured. Set SMTP_USER and SMTP_PASSWORD environment variables.');
    return null;
  }

  try {
    transporter = nodemailer.createTransporter(EMAIL_CONFIG);
    console.log('Email service initialized successfully');
    return transporter;
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    return null;
  }
};

// Initialize on module load
initializeEmailService();

// Email template variables replacement
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  
  return result;
};

// Get email template from database
const getEmailTemplate = (triggerType) => {
  const db = new Database(dbPath);
  
  try {
    const template = db.prepare(
      'SELECT * FROM email_templates WHERE trigger_type = ? AND is_active = 1'
    ).get(triggerType);
    
    return template;
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  } finally {
    db.close();
  }
};

// Send email function
const sendEmail = async (to, subject, body, attachments = []) => {
  if (!transporter) {
    console.warn('Email service not available');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || EMAIL_CONFIG.auth.user,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html: body,
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipients: to,
      subject
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// Email service functions
export const EmailService = {
  // Send document review reminder
  sendDocumentReviewReminder: async (documentId, reviewerId) => {
    const db = new Database(dbPath);
    
    try {
      const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);
      const reviewer = db.prepare('SELECT * FROM users WHERE id = ?').get(reviewerId);
      
      if (!document || !reviewer) {
        console.error('Document or reviewer not found');
        return false;
      }

      const template = getEmailTemplate('review_reminder');
      if (!template) {
        console.error('Review reminder template not found');
        return false;
      }

      const variables = {
        reviewer_name: reviewer.name,
        document_name: document.sop_name,
        document_code: document.document_code,
        deadline: document.review_deadline || 'Not specified',
        document_url: `${process.env.APP_URL || 'http://localhost:3000'}/documents/${documentId}`
      };

      const subject = replaceTemplateVariables(template.subject, variables);
      const body = replaceTemplateVariables(template.body, variables);

      return await sendEmail(reviewer.email, subject, body);
    } catch (error) {
      console.error('Error sending review reminder:', error);
      return false;
    } finally {
      db.close();
    }
  },

  // Send document approval notification
  sendDocumentApprovalNotification: async (documentId, ownerId) => {
    const db = new Database(dbPath);
    
    try {
      const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);
      const owner = db.prepare('SELECT * FROM users WHERE id = ?').get(ownerId);
      
      if (!document || !owner) {
        console.error('Document or owner not found');
        return false;
      }

      const template = getEmailTemplate('approval_notification');
      if (!template) {
        console.error('Approval notification template not found');
        return false;
      }

      const variables = {
        owner_name: owner.name,
        document_name: document.sop_name,
        document_code: document.document_code,
        version: document.version_number,
        department: document.department,
        status: document.status,
        document_url: `${process.env.APP_URL || 'http://localhost:3000'}/documents/${documentId}`
      };

      const subject = replaceTemplateVariables(template.subject, variables);
      const body = replaceTemplateVariables(template.body, variables);

      return await sendEmail(owner.email, subject, body);
    } catch (error) {
      console.error('Error sending approval notification:', error);
      return false;
    } finally {
      db.close();
    }
  },

  // Send change request notification
  sendChangeRequestNotification: async (changeRequestId) => {
    const db = new Database(dbPath);
    
    try {
      const changeRequest = db.prepare(`
        SELECT cr.*, d.sop_name, d.document_code, u.name as requester_name, u.email as requester_email
        FROM change_requests cr
        JOIN documents d ON cr.document_id = d.id
        JOIN users u ON cr.requester_id = u.id
        WHERE cr.id = ?
      `).get(changeRequestId);
      
      if (!changeRequest) {
        console.error('Change request not found');
        return false;
      }

      // Get document owners to notify
      const owners = db.prepare(`
        SELECT u.name, u.email
        FROM users u
        JOIN document_owners do ON u.id = do.user_id
        WHERE do.document_id = ?
      `).all(changeRequest.document_id);

      if (owners.length === 0) {
        console.error('No document owners found to notify');
        return false;
      }

      const subject = `Change Request Submitted - ${changeRequest.sop_name}`;
      const body = `
        <h2>New Change Request</h2>
        <p>A new change request has been submitted for document <strong>${changeRequest.sop_name}</strong> (${changeRequest.document_code}).</p>
        
        <h3>Request Details:</h3>
        <ul>
          <li><strong>Type:</strong> ${changeRequest.request_type}</li>
          <li><strong>Priority:</strong> ${changeRequest.priority}</li>
          <li><strong>Requested by:</strong> ${changeRequest.requester_name}</li>
          <li><strong>Description:</strong> ${changeRequest.description}</li>
        </ul>
        
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/change-requests">View Change Request</a></p>
        
        <p>Best regards,<br>Document Management System</p>
      `;

      const emails = owners.map(owner => owner.email);
      return await sendEmail(emails, subject, body);
    } catch (error) {
      console.error('Error sending change request notification:', error);
      return false;
    } finally {
      db.close();
    }
  },

  // Send document expiration warning
  sendDocumentExpirationWarning: async (documentId, daysUntilExpiration) => {
    const db = new Database(dbPath);
    
    try {
      const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);
      
      if (!document) {
        console.error('Document not found');
        return false;
      }

      // Get document owners
      const owners = db.prepare(`
        SELECT u.name, u.email
        FROM users u
        JOIN document_owners do ON u.id = do.user_id
        WHERE do.document_id = ?
      `).all(documentId);

      if (owners.length === 0) {
        console.error('No document owners found');
        return false;
      }

      const subject = `Document Expiration Warning - ${document.sop_name}`;
      const body = `
        <h2>Document Expiration Warning</h2>
        <p>The following document is scheduled for review/revision in ${daysUntilExpiration} days:</p>
        
        <h3>Document Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${document.sop_name}</li>
          <li><strong>Code:</strong> ${document.document_code}</li>
          <li><strong>Version:</strong> ${document.version_number}</li>
          <li><strong>Department:</strong> ${document.department}</li>
          <li><strong>Next Revision Date:</strong> ${document.next_revision_date}</li>
        </ul>
        
        <p>Please plan accordingly to ensure the document is reviewed and updated as needed.</p>
        
        <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/documents/${documentId}">View Document</a></p>
        
        <p>Best regards,<br>Document Management System</p>
      `;

      const emails = owners.map(owner => owner.email);
      return await sendEmail(emails, subject, body);
    } catch (error) {
      console.error('Error sending expiration warning:', error);
      return false;
    } finally {
      db.close();
    }
  },

  // Send welcome email to new users
  sendWelcomeEmail: async (userId) => {
    const db = new Database(dbPath);
    
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      
      if (!user) {
        console.error('User not found');
        return false;
      }

      const subject = 'Welcome to Document Management System';
      const body = `
        <h2>Welcome to Document Management System</h2>
        <p>Dear ${user.name},</p>
        
        <p>Welcome to our Document Management System! Your account has been created with the following details:</p>
        
        <ul>
          <li><strong>Role:</strong> ${user.role}</li>
          <li><strong>Department:</strong> ${user.department || 'Not assigned'}</li>
          <li><strong>Country:</strong> ${user.country || 'Not assigned'}</li>
        </ul>
        
        <p>You can now access the system at: <a href="${process.env.APP_URL || 'http://localhost:3000'}">${process.env.APP_URL || 'http://localhost:3000'}</a></p>
        
        <p>If you have any questions or need assistance, please contact your system administrator.</p>
        
        <p>Best regards,<br>Document Management System</p>
      `;

      return await sendEmail(user.email, subject, body);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    } finally {
      db.close();
    }
  },

  // Send custom email
  sendCustomEmail: async (to, subject, body, attachments = []) => {
    return await sendEmail(to, subject, body, attachments);
  }
};

// Scheduled tasks
const scheduleEmailTasks = () => {
  // Daily task to check for document expiration warnings (runs at 9:00 AM)
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily document expiration check...');
    
    const db = new Database(dbPath);
    
    try {
      const today = new Date();
      const warningDays = [30, 14, 7, 1]; // Send warnings at 30, 14, 7, and 1 days before expiration

      for (const days of warningDays) {
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + days);
        const dateString = warningDate.toISOString().split('T')[0];

        const expiringDocuments = db.prepare(`
          SELECT id FROM documents 
          WHERE next_revision_date = ? 
          AND status = 'live'
        `).all(dateString);

        for (const doc of expiringDocuments) {
          await EmailService.sendDocumentExpirationWarning(doc.id, days);
        }
      }
    } catch (error) {
      console.error('Error in document expiration check:', error);
    } finally {
      db.close();
    }
  });

  // Weekly reminder for pending reviews (runs on Monday at 10:00 AM)
  cron.schedule('0 10 * * 1', async () => {
    console.log('Running weekly review reminder check...');
    
    const db = new Database(dbPath);
    
    try {
      const pendingReviews = db.prepare(`
        SELECT d.id, dr.user_id
        FROM documents d
        JOIN document_reviewers dr ON d.id = dr.document_id
        WHERE d.status = 'under-review'
      `).all();

      for (const review of pendingReviews) {
        await EmailService.sendDocumentReviewReminder(review.id, review.user_id);
      }
    } catch (error) {
      console.error('Error in weekly review reminder:', error);
    } finally {
      db.close();
    }
  });

  console.log('Email scheduler initialized');
};

// Initialize scheduler
scheduleEmailTasks();

export default EmailService;
