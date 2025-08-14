import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";

// Import Phase 1 enhancements
import { authenticateToken, authorizeRoles } from "./middleware/auth.js";
import { generalLimiter, securityHeaders, detectSQLInjection, preventXSS, validateDocument, validateChangeRequest, validateComment, validateRequest } from "./middleware/security.js";
import { uploadDocument, processUploadedFiles, validateFileUpload, handleUploadError, serveUploadedFile } from "./middleware/upload.js";
import { AuditLogger, auditMiddleware } from "./services/auditLogger.js";
import EmailService from "./services/emailService.js";
import authRoutes from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Apply security middleware first
app.use(securityHeaders);
app.use(generalLimiter);
app.use(detectSQLInjection);
app.use(preventXSS);
app.use(auditMiddleware);

// Standard middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, "..", "dist")));

// File upload routes (serve uploaded files)
app.use('/uploads/*', serveUploadedFile);

// Authentication routes
app.use('/api/auth', authRoutes);

// Handle upload errors
app.use(handleUploadError);

// Database connection
const dbPath = join(__dirname, "..", "data", "documents.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Helper function to get document with relationships
const getDocumentWithRelationships = (documentId) => {
  const document = db
    .prepare("SELECT * FROM documents WHERE id = ?")
    .get(documentId);
  if (!document) return null;

  const owners = db
    .prepare(
      `
    SELECT u.id, u.name, u.email 
    FROM users u 
    JOIN document_owners do ON u.id = do.user_id 
    WHERE do.document_id = ?
  `
    )
    .all(documentId);

  const reviewers = db
    .prepare(
      `
    SELECT u.id, u.name, u.email 
    FROM users u 
    JOIN document_reviewers dr ON u.id = dr.user_id 
    WHERE dr.document_id = ?
  `
    )
    .all(documentId);

  const creators = db
    .prepare(
      `
    SELECT u.id, u.name, u.email 
    FROM users u 
    JOIN document_creators dc ON u.id = dc.user_id 
    WHERE dc.document_id = ?
  `
    )
    .all(documentId);

  const complianceNames = db
    .prepare(
      `
    SELECT name, email FROM compliance_names WHERE document_id = ?
  `
    )
    .all(documentId);

  const comments = db
    .prepare(
      `
    SELECT c.comment, c.created_at, u.name as user_name 
    FROM document_comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.document_id = ? 
    ORDER BY c.created_at DESC
  `
    )
    .all(documentId);

  return {
    ...document,
    documentOwners: owners,
    reviewers,
    documentCreators: creators,
    complianceNames,
    comments,
  };
};

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Get all documents with pagination and filtering
app.get("/api/documents", (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      department,
      country,
      search,
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (department) {
      whereClause += " AND department = ?";
      params.push(department);
    }

    if (country) {
      whereClause += " AND country = ?";
      params.push(country);
    }

    if (search) {
      whereClause +=
        " AND (sop_name LIKE ? OR document_code LIKE ? OR description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM documents ${whereClause}`;
    const total = db.prepare(countQuery).get(...params).total;

    // Get documents
    const documentsQuery = `
      SELECT * FROM documents 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const documents = db.prepare(documentsQuery).all(...params, limit, offset);

    // Get relationships for each document
    const documentsWithRelations = documents.map((doc) => {
      const owners = db
        .prepare(
          `
        SELECT u.id, u.name, u.email 
        FROM users u 
        JOIN document_owners do ON u.id = do.user_id 
        WHERE do.document_id = ?
      `
        )
        .all(doc.id);

      const reviewers = db
        .prepare(
          `
        SELECT u.id, u.name, u.email 
        FROM users u 
        JOIN document_reviewers dr ON u.id = dr.user_id 
        WHERE dr.document_id = ?
      `
        )
        .all(doc.id);

      const creators = db
        .prepare(
          `
        SELECT u.id, u.name, u.email 
        FROM users u 
        JOIN document_creators dc ON u.id = dc.user_id 
        WHERE dc.document_id = ?
      `
        )
        .all(doc.id);

      return {
        ...doc,
        documentOwners: owners,
        reviewers,
        documentCreators: creators,
      };
    });

    res.json({
      documents: documentsWithRelations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single document by ID
app.get("/api/documents/:id", (req, res) => {
  try {
    const { id } = req.params;
    const document = getDocumentWithRelationships(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new document (with authentication and file upload)
app.post("/api/documents", 
  authenticateToken, 
  uploadDocument, 
  processUploadedFiles,
  validateFileUpload,
  validateDocument, 
  validateRequest, 
  async (req, res) => {
  try {
    const {
      sopName,
      documentCode,
      documentNumber,
      versionNumber,
      uploadDate,
      lastRevisionDate,
      nextRevisionDate,
      documentType,
      department,
      country,
      description,
      documentOwners,
      reviewers,
      documentCreators,
    } = req.body;

    const documentId = uuidv4();

    // Insert document
    const insertDocument = db.prepare(`
      INSERT INTO documents (
        id, sop_name, document_code, document_number, version_number, upload_date,
        last_revision_date, next_revision_date, document_type, department, country,
        status, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDocument.run(
      documentId,
      sopName,
      documentCode,
      documentNumber,
      versionNumber,
      uploadDate,
      lastRevisionDate,
      nextRevisionDate,
      documentType,
      department,
      country,
      "draft",
      description
    );

    // Insert relationships
    if (documentOwners && documentOwners.length > 0) {
      const insertOwner = db.prepare(
        "INSERT INTO document_owners (document_id, user_id) VALUES (?, ?)"
      );
      documentOwners.forEach((owner) => insertOwner.run(documentId, owner.id));
    }

    if (reviewers && reviewers.length > 0) {
      const insertReviewer = db.prepare(
        "INSERT INTO document_reviewers (document_id, user_id) VALUES (?, ?)"
      );
      reviewers.forEach((reviewer) =>
        insertReviewer.run(documentId, reviewer.id)
      );
    }

    if (documentCreators && documentCreators.length > 0) {
      const insertCreator = db.prepare(
        "INSERT INTO document_creators (document_id, user_id) VALUES (?, ?)"
      );
      documentCreators.forEach((creator) =>
        insertCreator.run(documentId, creator.id)
      );
    }

    // Log the action
    const insertLog = db.prepare(`
      INSERT INTO document_logs (document_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `);
    insertLog.run(documentId, "system", "created", "Document created");

    res.status(201).json({
      message: "Document created successfully",
      documentId,
      document: getDocumentWithRelationships(documentId),
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update document
app.put("/api/documents/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if document exists
    const existingDoc = db
      .prepare("SELECT * FROM documents WHERE id = ?")
      .get(id);
    if (!existingDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Update document
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach((key) => {
      if (
        key !== "id" &&
        key !== "documentOwners" &&
        key !== "reviewers" &&
        key !== "documentCreators"
      ) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length > 0) {
      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      const updateQuery = `UPDATE documents SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;
      db.prepare(updateQuery).run(...updateValues, id);
    }

    // Update relationships if provided
    if (updateData.documentOwners) {
      db.prepare("DELETE FROM document_owners WHERE document_id = ?").run(id);
      const insertOwner = db.prepare(
        "INSERT INTO document_owners (document_id, user_id) VALUES (?, ?)"
      );
      updateData.documentOwners.forEach((owner) =>
        insertOwner.run(id, owner.id)
      );
    }

    if (updateData.reviewers) {
      db.prepare("DELETE FROM document_reviewers WHERE document_id = ?").run(
        id
      );
      const insertReviewer = db.prepare(
        "INSERT INTO document_reviewers (document_id, user_id) VALUES (?, ?)"
      );
      updateData.reviewers.forEach((reviewer) =>
        insertReviewer.run(id, reviewer.id)
      );
    }

    if (updateData.documentCreators) {
      db.prepare("DELETE FROM document_creators WHERE document_id = ?").run(id);
      const insertCreator = db.prepare(
        "INSERT INTO document_creators (document_id, user_id) VALUES (?, ?)"
      );
      updateData.documentCreators.forEach((creator) =>
        insertCreator.run(id, creator.id)
      );
    }

    // Log the action
    const insertLog = db.prepare(`
      INSERT INTO document_logs (document_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `);
    insertLog.run(id, "system", "updated", "Document updated");

    res.json({
      message: "Document updated successfully",
      document: getDocumentWithRelationships(id),
    });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete document
app.delete("/api/documents/:id", (req, res) => {
  try {
    const { id } = req.params;

    // Check if document exists
    const existingDoc = db
      .prepare("SELECT * FROM documents WHERE id = ?")
      .get(id);
    if (!existingDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Soft delete - update status to deleted
    db.prepare(
      "UPDATE documents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run("deleted", id);

    // Log the action
    const insertLog = db.prepare(`
      INSERT INTO document_logs (document_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `);
    insertLog.run(id, "system", "deleted", "Document deleted");

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get users
app.get("/api/users", (req, res) => {
  try {
    const { role, department } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (role) {
      whereClause += " AND role = ?";
      params.push(role);
    }

    if (department) {
      whereClause += " AND department = ?";
      params.push(department);
    }

    const users = db
      .prepare(`SELECT * FROM users ${whereClause} ORDER BY name`)
      .all(...params);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get countries
app.get("/api/countries", (req, res) => {
  try {
    const countries = db.prepare("SELECT * FROM countries ORDER BY name").all();
    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get departments
app.get("/api/departments", (req, res) => {
  try {
    const departments = db
      .prepare("SELECT * FROM departments ORDER BY name")
      .all();
    res.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get document types
app.get("/api/document-types", (req, res) => {
  try {
    const documentTypes = db
      .prepare("SELECT * FROM document_types ORDER BY name")
      .all();
    res.json(documentTypes);
  } catch (error) {
    console.error("Error fetching document types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get change requests
app.get("/api/change-requests", (req, res) => {
  try {
    const { status, documentId } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (documentId) {
      whereClause += " AND document_id = ?";
      params.push(documentId);
    }

    const changeRequests = db
      .prepare(
        `
      SELECT cr.*, d.sop_name as document_name, u.name as requester_name
      FROM change_requests cr
      JOIN documents d ON cr.document_id = d.id
      JOIN users u ON cr.requester_id = u.id
      ${whereClause}
      ORDER BY cr.created_at DESC
    `
      )
      .all(...params);

    res.json(changeRequests);
  } catch (error) {
    console.error("Error fetching change requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create change request
app.post("/api/change-requests", (req, res) => {
  try {
    const { documentId, requesterId, requestType, description, priority } =
      req.body;

    const changeRequestId = uuidv4();

    const insertChangeRequest = db.prepare(`
      INSERT INTO change_requests (id, document_id, requester_id, request_type, status, description, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertChangeRequest.run(
      changeRequestId,
      documentId,
      requesterId,
      requestType,
      "pending",
      description,
      priority
    );

    res.status(201).json({
      message: "Change request created successfully",
      changeRequestId,
    });
  } catch (error) {
    console.error("Error creating change request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update change request status
app.put("/api/change-requests/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    db.prepare(
      "UPDATE change_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(status, id);

    res.json({ message: "Change request status updated successfully" });
  } catch (error) {
    console.error("Error updating change request status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get document logs
app.get("/api/documents/:id/logs", (req, res) => {
  try {
    const { id } = req.params;

    const logs = db
      .prepare(
        `
      SELECT l.*, u.name as user_name
      FROM document_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.document_id = ?
      ORDER BY l.timestamp DESC
    `
      )
      .all(id);

    res.json(logs);
  } catch (error) {
    console.error("Error fetching document logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add comment to document
app.post("/api/documents/:id/comments", (req, res) => {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;

    const insertComment = db.prepare(`
      INSERT INTO document_comments (document_id, user_id, comment)
      VALUES (?, ?, ?)
    `);

    insertComment.run(id, userId, comment);

    // Log the action
    const insertLog = db.prepare(`
      INSERT INTO document_logs (document_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `);
    insertLog.run(id, userId, "commented", "Comment added");

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get dashboard statistics
app.get("/api/dashboard/stats", (req, res) => {
  try {
    const stats = {
      totalDocuments: db
        .prepare("SELECT COUNT(*) as count FROM documents")
        .get().count,
      liveDocuments: db
        .prepare("SELECT COUNT(*) as count FROM documents WHERE status = ?")
        .get("live").count,
      underReview: db
        .prepare("SELECT COUNT(*) as count FROM documents WHERE status = ?")
        .get("under-review").count,
      pendingApproval: db
        .prepare(
          "SELECT COUNT(*) as count FROM documents WHERE status IN (?, ?, ?)"
        )
        .get(
          "pending-creator-approval",
          "pending-requester-approval",
          "pending-owner-approval"
        ).count,
      archivedDocuments: db
        .prepare("SELECT COUNT(*) as count FROM documents WHERE status = ?")
        .get("archived").count,
      totalUsers: db.prepare("SELECT COUNT(*) as count FROM users").get().count,
      pendingChangeRequests: db
        .prepare(
          "SELECT COUNT(*) as count FROM change_requests WHERE status = ?"
        )
        .get("pending").count,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "..", "dist", "index.html"));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${dbPath}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  db.close();
  process.exit(0);
});
