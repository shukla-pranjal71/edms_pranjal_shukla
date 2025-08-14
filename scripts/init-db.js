import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure database directory exists
const dbDir = join(__dirname, "..", "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, "documents.db");
const db = new Database(dbPath);

console.log("Initializing database...");

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'document-controller', 'document-creator', 'requester', 'document-requester', 'reviewer', 'document-owner')),
    department TEXT,
    country TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Countries table
  CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Departments table
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    approver_name TEXT,
    approver_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Document types table
  CREATE TABLE IF NOT EXISTS document_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Document names table
  CREATE TABLE IF NOT EXISTS document_names (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    document_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Documents table
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    sop_name TEXT NOT NULL,
    document_code TEXT UNIQUE NOT NULL,
    document_number TEXT,
    version_number TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    last_revision_date TEXT,
    next_revision_date TEXT,
    document_type TEXT NOT NULL,
    department TEXT NOT NULL,
    country TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'under-review', 'pending-creator-approval', 'pending-requester-approval', 'under-revision', 'pending-owner-approval', 'approved', 'rejected', 'live', 'live-cr', 'archived', 'deleted', 'queried', 'reviewed', 'pending-with-requester')),
    is_breached BOOLEAN DEFAULT FALSE,
    file_url TEXT,
    document_url TEXT,
    description TEXT,
    review_deadline TEXT,
    review_due BOOLEAN DEFAULT FALSE,
    needs_review BOOLEAN DEFAULT FALSE,
    pending_with TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Document owners relationship table
  CREATE TABLE IF NOT EXISTS document_owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(document_id, user_id)
  );

  -- Document reviewers relationship table
  CREATE TABLE IF NOT EXISTS document_reviewers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(document_id, user_id)
  );

  -- Document creators relationship table
  CREATE TABLE IF NOT EXISTS document_creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(document_id, user_id)
  );

  -- Compliance names relationship table
  CREATE TABLE IF NOT EXISTS compliance_names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
  );

  -- Compliance contacts relationship table
  CREATE TABLE IF NOT EXISTS compliance_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(document_id, user_id)
  );

  -- Document comments table
  CREATE TABLE IF NOT EXISTS document_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Change requests table
  CREATE TABLE IF NOT EXISTS change_requests (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('revision', 'correction', 'update', 'deletion')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'under-review', 'approved', 'rejected')),
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Document logs table
  CREATE TABLE IF NOT EXISTS document_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Email templates table
  CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- User sessions table for JWT token management
  CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Document files table for file upload management
  CREATE TABLE IF NOT EXISTS document_files (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT,
    is_s3 BOOLEAN DEFAULT FALSE,
    uploaded_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
  );

  -- Enhanced audit logs table
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_id TEXT NOT NULL,
    document_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    old_values TEXT,
    new_values TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    session_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (document_id) REFERENCES documents(id)
  );

  -- Email queue table for email processing
  CREATE TABLE IF NOT EXISTS email_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    template_id INTEGER,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'retry')) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_at DATETIME,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES email_templates(id)
  );

  -- Add active field to users table if not exists
  ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE;
  ALTER TABLE users ADD COLUMN password_hash TEXT;
  ALTER TABLE users ADD COLUMN last_login DATETIME;
  ALTER TABLE users ADD COLUMN password_reset_token TEXT;
  ALTER TABLE users ADD COLUMN password_reset_expires DATETIME;

  -- Add file-related fields to documents table
  ALTER TABLE documents ADD COLUMN file_hash TEXT;
  ALTER TABLE documents ADD COLUMN file_size INTEGER;
  ALTER TABLE documents ADD COLUMN mime_type TEXT;

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
  CREATE INDEX IF NOT EXISTS idx_documents_department ON documents(department);
  CREATE INDEX IF NOT EXISTS idx_documents_country ON documents(country);
  CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
  CREATE INDEX IF NOT EXISTS idx_documents_document_code ON documents(document_code);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
  CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);
  CREATE INDEX IF NOT EXISTS idx_change_requests_document_id ON change_requests(document_id);
  CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_document_files_document_id ON document_files(document_id);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_document_id ON audit_logs(document_id);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
  CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
`);

console.log("Database initialized successfully!");
console.log(`Database file created at: ${dbPath}`);

// Close the database connection
db.close();
