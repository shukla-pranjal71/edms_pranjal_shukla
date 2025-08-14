import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "data", "documents.db");

const db = new Database(dbPath);

console.log("Seeding database with sample data...");

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Begin transaction
const transaction = db.transaction(() => {
  // Insert countries
  const countries = [
    { name: "UAE" },
    { name: "KSA" },
    { name: "Oman" },
    { name: "Bahrain" },
    { name: "Egypt" },
    { name: "China" },
  ];

  const insertCountry = db.prepare(
    "INSERT OR IGNORE INTO countries (name) VALUES (?)"
  );
  countries.forEach((country) => insertCountry.run(country.name));

  // Insert departments
  const departments = [
    {
      name: "Finance",
      approverName: "John Smith",
      approverEmail: "john.smith@finance.com",
    },
    {
      name: "HR",
      approverName: "Sarah Johnson",
      approverEmail: "sarah.johnson@hr.com",
    },
    {
      name: "IT",
      approverName: "Mike Wilson",
      approverEmail: "mike.wilson@it.com",
    },
    {
      name: "Legal",
      approverName: "Emily Davis",
      approverEmail: "emily.davis@legal.com",
    },
    {
      name: "Marketing",
      approverName: "Alex Brown",
      approverEmail: "alex.brown@marketing.com",
    },
    {
      name: "Operations",
      approverName: "David Lee",
      approverEmail: "david.lee@operations.com",
    },
    {
      name: "Quality Assurance",
      approverName: "Lisa Chen",
      approverEmail: "lisa.chen@qa.com",
    },
  ];

  const insertDepartment = db.prepare(
    "INSERT OR IGNORE INTO departments (name, approver_name, approver_email) VALUES (?, ?, ?)"
  );
  departments.forEach((dept) =>
    insertDepartment.run(dept.name, dept.approverName, dept.approverEmail)
  );

  // Insert document types
  const documentTypes = [
    { name: "SOP", department: "General" },
    { name: "Policy", department: "HR" },
    { name: "Procedure", department: "IT" },
    { name: "Guideline", department: "Finance" },
    { name: "Manual", department: "Legal" },
    { name: "Work Instruction", department: "Operations" },
    { name: "Form", department: "General" },
  ];

  const insertDocType = db.prepare(
    "INSERT OR IGNORE INTO document_types (name, department) VALUES (?, ?)"
  );
  documentTypes.forEach((type) =>
    insertDocType.run(type.name, type.department)
  );

  // Insert users
  const users = [
    {
      id: uuidv4(),
      name: "Admin User",
      email: "admin@company.com",
      role: "admin",
      department: "IT",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "Ishaq Sharif Shaikh",
      email: "ishaq@company.com",
      role: "document-owner",
      department: "IT",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "Sudipto Banerjee",
      email: "sudipto@company.com",
      role: "document-controller",
      department: "IT",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "Arvind Gaba",
      email: "arvind@company.com",
      role: "reviewer",
      department: "IT",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "John Doe",
      email: "john@company.com",
      role: "document-creator",
      department: "Finance",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "Jane Smith",
      email: "jane@company.com",
      role: "document-owner",
      department: "HR",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "Mike Johnson",
      email: "mike@company.com",
      role: "reviewer",
      department: "Legal",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "Sarah Wilson",
      email: "sarah@company.com",
      role: "document-creator",
      department: "Marketing",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "David Brown",
      email: "david@company.com",
      role: "requester",
      department: "Operations",
      country: "UAE",
    },
    {
      id: uuidv4(),
      name: "Lisa Davis",
      email: "lisa@company.com",
      role: "document-owner",
      department: "Quality Assurance",
      country: "UAE",
    },
  ];

  const insertUser = db.prepare(
    "INSERT OR IGNORE INTO users (id, name, email, role, department, country) VALUES (?, ?, ?, ?, ?, ?)"
  );
  users.forEach((user) =>
    insertUser.run(
      user.id,
      user.name,
      user.email,
      user.role,
      user.department,
      user.country
    )
  );

  // Insert sample documents
  const sampleDocuments = [
    {
      id: uuidv4(),
      sopName: "Employee Onboarding Process",
      documentCode: "HR-ONB-001",
      documentNumber: "HR-ONB-001",
      versionNumber: "1.0",
      uploadDate: "2024-01-15",
      lastRevisionDate: "2024-01-15",
      nextRevisionDate: "2025-01-15",
      documentType: "SOP",
      department: "HR",
      country: "UAE",
      status: "live",
      isBreached: 0, // Use 0 instead of false for SQLite
      description: "Standard operating procedure for new employee onboarding",
    },
    {
      id: uuidv4(),
      sopName: "IT Security Guidelines",
      documentCode: "IT-SEC-001",
      documentNumber: "IT-SEC-001",
      versionNumber: "2.1",
      uploadDate: "2024-02-20",
      lastRevisionDate: "2024-02-20",
      nextRevisionDate: "2025-02-20",
      documentType: "Policy",
      department: "IT",
      country: "UAE",
      status: "live",
      isBreached: 0,
      description: "Comprehensive IT security policy and guidelines",
    },
    {
      id: uuidv4(),
      sopName: "Financial Reporting Procedures",
      documentCode: "FIN-REP-001",
      documentNumber: "FIN-REP-001",
      versionNumber: "1.5",
      uploadDate: "2024-03-10",
      lastRevisionDate: "2024-03-10",
      nextRevisionDate: "2025-03-10",
      documentType: "Procedure",
      department: "Finance",
      country: "UAE",
      status: "under-review",
      isBreached: 0,
      description: "Standard procedures for financial reporting and compliance",
    },
    {
      id: uuidv4(),
      sopName: "Customer Service Standards",
      documentCode: "MKT-CSS-001",
      documentNumber: "MKT-CSS-001",
      versionNumber: "1.2",
      uploadDate: "2024-01-30",
      lastRevisionDate: "2024-01-30",
      nextRevisionDate: "2025-01-30",
      documentType: "Guideline",
      department: "Marketing",
      country: "UAE",
      status: "approved",
      isBreached: 0,
      description: "Customer service standards and best practices",
    },
    {
      id: uuidv4(),
      sopName: "Quality Control Procedures",
      documentCode: "QA-QC-001",
      documentNumber: "QA-QC-001",
      versionNumber: "2.0",
      uploadDate: "2024-04-05",
      lastRevisionDate: "2024-04-05",
      nextRevisionDate: "2025-04-05",
      documentType: "SOP",
      department: "Quality Assurance",
      country: "UAE",
      status: "live-cr",
      isBreached: 0,
      description: "Quality control procedures for manufacturing processes",
    },
  ];

  const insertDocument = db.prepare(`
    INSERT OR IGNORE INTO documents (
      id, sop_name, document_code, document_number, version_number, upload_date, 
      last_revision_date, next_revision_date, document_type, department, country, 
      status, is_breached, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleDocuments.forEach((doc) => {
    insertDocument.run(
      doc.id,
      doc.sopName,
      doc.documentCode,
      doc.documentNumber || null,
      doc.versionNumber,
      doc.uploadDate,
      doc.lastRevisionDate || null,
      doc.nextRevisionDate || null,
      doc.documentType,
      doc.department,
      doc.country,
      doc.status,
      doc.isBreached,
      doc.description || null
    );
  });

  // Insert document relationships
  const insertDocOwner = db.prepare(
    "INSERT OR IGNORE INTO document_owners (document_id, user_id) VALUES (?, ?)"
  );
  const insertDocReviewer = db.prepare(
    "INSERT OR IGNORE INTO document_reviewers (document_id, user_id) VALUES (?, ?)"
  );
  const insertDocCreator = db.prepare(
    "INSERT OR IGNORE INTO document_creators (document_id, user_id) VALUES (?, ?)"
  );

  // Get user IDs by role
  const adminUser = db
    .prepare("SELECT id FROM users WHERE role = ? LIMIT 1")
    .get("admin");
  const ownerUser = db
    .prepare("SELECT id FROM users WHERE role = ? LIMIT 1")
    .get("document-owner");
  const reviewerUser = db
    .prepare("SELECT id FROM users WHERE role = ? LIMIT 1")
    .get("reviewer");
  const creatorUser = db
    .prepare("SELECT id FROM users WHERE role = ? LIMIT 1")
    .get("document-creator");

  // Get document IDs
  const documents = db.prepare("SELECT id FROM documents").all();

  // Assign relationships
  documents.forEach((doc) => {
    if (ownerUser && ownerUser.id) insertDocOwner.run(doc.id, ownerUser.id);
    if (reviewerUser && reviewerUser.id) insertDocReviewer.run(doc.id, reviewerUser.id);
    if (creatorUser && creatorUser.id) insertDocCreator.run(doc.id, creatorUser.id);
  });

  // Insert sample change requests
  const changeRequests = [
    {
      id: uuidv4(),
      documentId: documents[0]?.id,
      requesterId: db
        .prepare("SELECT id FROM users WHERE role = ? LIMIT 1")
        .get("requester")?.id,
      requestType: "revision",
      status: "pending",
      description:
        "Need to update employee onboarding process to include remote work procedures",
      priority: "high",
    },
  ];

  const insertChangeRequest = db.prepare(`
    INSERT OR IGNORE INTO change_requests (id, document_id, requester_id, request_type, status, description, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  changeRequests.forEach((cr) => {
    if (cr.requesterId && cr.documentId) {
      insertChangeRequest.run(
        cr.id,
        cr.documentId,
        cr.requesterId,
        cr.requestType,
        cr.status,
        cr.description,
        cr.priority
      );
    }
  });

  // Insert email templates
  const emailTemplates = [
    {
      name: "Document Review Reminder",
      subject: "Document Review Required - {document_name}",
      body: "Dear {reviewer_name},\n\nYou have been assigned to review the document '{document_name}'.\n\nPlease complete your review by {deadline}.\n\nBest regards,\nDocument Management System",
      triggerType: "review_reminder",
    },
    {
      name: "Document Approval Notification",
      subject: "Document Approved - {document_name}",
      body: "Dear {owner_name},\n\nThe document '{document_name}' has been approved and is now live.\n\nDocument details:\n- Version: {version}\n- Department: {department}\n- Status: {status}\n\nBest regards,\nDocument Management System",
      triggerType: "approval_notification",
    },
  ];

  const insertEmailTemplate = db.prepare(`
    INSERT OR IGNORE INTO email_templates (name, subject, body, trigger_type)
    VALUES (?, ?, ?, ?)
  `);

  emailTemplates.forEach((template) => {
    insertEmailTemplate.run(
      template.name,
      template.subject,
      template.body,
      template.triggerType
    );
  });

  console.log("Database seeded successfully!");
});

// Execute transaction
transaction();

// Close the database connection
db.close();
