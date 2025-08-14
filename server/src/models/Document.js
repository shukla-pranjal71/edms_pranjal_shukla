import { BaseModel } from './Database.js';
import { TABLES, DOCUMENT_STATUS } from '../constants/index.js';
import { createError, ERROR_CODES, HTTP_STATUS, getPaginationInfo, calculatePagination } from '../utils/index.js';

/**
 * Document Model
 * Handles document-related database operations and relationships
 */
export class DocumentModel extends BaseModel {
  constructor() {
    super(TABLES.DOCUMENTS);
  }

  /**
   * Get document with all relationships
   * @param {string} documentId - Document ID
   * @returns {object|null} Document with relationships
   */
  getDocumentWithRelationships(documentId) {
    try {
      // Get base document
      const document = this.findById(documentId);
      if (!document) return null;

      // Get relationships
      const relationships = this.getDocumentRelationships(documentId);
      
      return {
        ...document,
        ...relationships
      };
    } catch (error) {
      throw createError('Failed to get document with relationships', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Get document relationships
   * @param {string} documentId - Document ID
   * @returns {object} Document relationships
   */
  getDocumentRelationships(documentId) {
    try {
      const db = this.getConnection();

      // Get document owners
      const owners = db.prepare(`
        SELECT u.id, u.name, u.email 
        FROM users u 
        JOIN document_owners do ON u.id = do.user_id 
        WHERE do.document_id = ? AND (u.active = 1 OR u.active IS NULL)
      `).all(documentId);

      // Get reviewers
      const reviewers = db.prepare(`
        SELECT u.id, u.name, u.email 
        FROM users u 
        JOIN document_reviewers dr ON u.id = dr.user_id 
        WHERE dr.document_id = ? AND (u.active = 1 OR u.active IS NULL)
      `).all(documentId);

      // Get creators
      const creators = db.prepare(`
        SELECT u.id, u.name, u.email 
        FROM users u 
        JOIN document_creators dc ON u.id = dc.user_id 
        WHERE dc.document_id = ? AND (u.active = 1 OR u.active IS NULL)
      `).all(documentId);

      // Get compliance names
      const complianceNames = db.prepare(`
        SELECT name, email FROM compliance_names WHERE document_id = ?
      `).all(documentId);

      // Get comments
      const comments = db.prepare(`
        SELECT c.id, c.comment, c.created_at, u.name as user_name, u.id as user_id
        FROM document_comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.document_id = ? 
        ORDER BY c.created_at DESC
      `).all(documentId);

      // Get files
      const files = db.prepare(`
        SELECT id, file_name, original_name, file_size, mime_type, created_at, uploaded_by
        FROM document_files 
        WHERE document_id = ?
        ORDER BY created_at DESC
      `).all(documentId);

      return {
        documentOwners: owners,
        reviewers,
        documentCreators: creators,
        complianceNames,
        comments,
        files
      };
    } catch (error) {
      throw createError('Failed to get document relationships', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Create document with relationships
   * @param {object} documentData - Document data
   * @param {object} relationships - Document relationships
   * @returns {object} Created document with relationships
   */
  createDocumentWithRelationships(documentData, relationships = {}) {
    const db = this.getConnection();
    
    // Start transaction
    const transaction = db.transaction(() => {
      try {
        // Create document
        const document = this.create(documentData);
        
        // Add relationships
        if (relationships.documentOwners?.length) {
          this.addDocumentOwners(document.id, relationships.documentOwners);
        }
        
        if (relationships.reviewers?.length) {
          this.addDocumentReviewers(document.id, relationships.reviewers);
        }
        
        if (relationships.documentCreators?.length) {
          this.addDocumentCreators(document.id, relationships.documentCreators);
        }
        
        if (relationships.complianceNames?.length) {
          this.addComplianceNames(document.id, relationships.complianceNames);
        }

        return document;
      } catch (error) {
        throw error;
      }
    });

    const result = transaction();
    
    // Return document with relationships
    return this.getDocumentWithRelationships(result.id);
  }

  /**
   * Update document with relationships
   * @param {string} documentId - Document ID
   * @param {object} documentData - Document data
   * @param {object} relationships - Document relationships
   * @returns {object} Updated document with relationships
   */
  updateDocumentWithRelationships(documentId, documentData, relationships = {}) {
    const db = this.getConnection();
    
    const transaction = db.transaction(() => {
      try {
        // Update document
        if (Object.keys(documentData).length > 0) {
          this.updateById(documentId, documentData);
        }
        
        // Update relationships if provided
        if (relationships.documentOwners !== undefined) {
          this.replaceDocumentOwners(documentId, relationships.documentOwners);
        }
        
        if (relationships.reviewers !== undefined) {
          this.replaceDocumentReviewers(documentId, relationships.reviewers);
        }
        
        if (relationships.documentCreators !== undefined) {
          this.replaceDocumentCreators(documentId, relationships.documentCreators);
        }
        
        if (relationships.complianceNames !== undefined) {
          this.replaceComplianceNames(documentId, relationships.complianceNames);
        }

        return true;
      } catch (error) {
        throw error;
      }
    });

    transaction();
    
    // Return updated document with relationships
    return this.getDocumentWithRelationships(documentId);
  }

  /**
   * Get documents with pagination and filters
   * @param {object} filters - Filter criteria
   * @param {object} pagination - Pagination info
   * @returns {object} Documents and pagination info
   */
  getDocumentsWithPagination(filters = {}, pagination = {}) {
    try {
      const { page, limit, offset } = getPaginationInfo(pagination.page, pagination.limit);

      // Build query conditions
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.department) {
        whereClause += ' AND department = ?';
        params.push(filters.department);
      }

      if (filters.country) {
        whereClause += ' AND country = ?';
        params.push(filters.country);
      }

      if (filters.documentType) {
        whereClause += ' AND document_type = ?';
        params.push(filters.documentType);
      }

      if (filters.search) {
        whereClause += ' AND (sop_name LIKE ? OR document_code LIKE ? OR description LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.createdBy) {
        whereClause += ` AND EXISTS (
          SELECT 1 FROM document_creators dc 
          WHERE dc.document_id = ${this.tableName}.id AND dc.user_id = ?
        )`;
        params.push(filters.createdBy);
      }

      if (filters.ownedBy) {
        whereClause += ` AND EXISTS (
          SELECT 1 FROM document_owners do 
          WHERE do.document_id = ${this.tableName}.id AND do.user_id = ?
        )`;
        params.push(filters.ownedBy);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
      const total = this.getConnection().prepare(countQuery).get(...params).count;

      // Get documents
      const documentsQuery = `
        SELECT * FROM ${this.tableName} 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      const documents = this.getConnection().prepare(documentsQuery).all(...params, limit, offset);

      // Add basic relationships to each document
      const documentsWithRelations = documents.map(doc => {
        const relations = this.getDocumentRelationships(doc.id);
        return { ...doc, ...relations };
      });

      return {
        documents: documentsWithRelations,
        pagination: calculatePagination(total, page, limit)
      };
    } catch (error) {
      throw createError('Failed to get documents with pagination', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Get document statistics
   * @returns {object} Document statistics
   */
  getDocumentStatistics() {
    try {
      const db = this.getConnection();
      const stats = {};

      // Total documents
      stats.totalDocuments = this.count();

      // Documents by status
      const statusQuery = `
        SELECT status, COUNT(*) as count 
        FROM ${this.tableName} 
        GROUP BY status
      `;
      stats.documentsByStatus = db.prepare(statusQuery).all();

      // Documents by type
      const typeQuery = `
        SELECT document_type, COUNT(*) as count 
        FROM ${this.tableName} 
        GROUP BY document_type
      `;
      stats.documentsByType = db.prepare(typeQuery).all();

      // Documents by department
      const deptQuery = `
        SELECT department, COUNT(*) as count 
        FROM ${this.tableName} 
        GROUP BY department
      `;
      stats.documentsByDepartment = db.prepare(deptQuery).all();

      // Recent documents (last 30 days)
      const recentQuery = `
        SELECT COUNT(*) as count 
        FROM ${this.tableName} 
        WHERE created_at > datetime('now', '-30 days')
      `;
      stats.recentDocuments = db.prepare(recentQuery).get().count;

      // Documents needing review
      stats.pendingReview = this.count({ status: DOCUMENT_STATUS.UNDER_REVIEW });
      stats.pendingApproval = this.count({ status: DOCUMENT_STATUS.PENDING_OWNER_APPROVAL });
      stats.liveDocuments = this.count({ status: DOCUMENT_STATUS.LIVE });

      return stats;
    } catch (error) {
      throw createError('Failed to get document statistics', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Add document owners
   * @param {string} documentId - Document ID
   * @param {Array} owners - Array of user IDs
   */
  addDocumentOwners(documentId, owners) {
    const db = this.getConnection();
    const insertOwner = db.prepare('INSERT INTO document_owners (document_id, user_id) VALUES (?, ?)');
    
    owners.forEach(owner => {
      const userId = typeof owner === 'object' ? owner.id : owner;
      insertOwner.run(documentId, userId);
    });
  }

  /**
   * Replace document owners
   * @param {string} documentId - Document ID
   * @param {Array} owners - Array of user IDs
   */
  replaceDocumentOwners(documentId, owners) {
    const db = this.getConnection();
    
    // Delete existing owners
    db.prepare('DELETE FROM document_owners WHERE document_id = ?').run(documentId);
    
    // Add new owners
    if (owners.length > 0) {
      this.addDocumentOwners(documentId, owners);
    }
  }

  /**
   * Add document reviewers
   * @param {string} documentId - Document ID
   * @param {Array} reviewers - Array of user IDs
   */
  addDocumentReviewers(documentId, reviewers) {
    const db = this.getConnection();
    const insertReviewer = db.prepare('INSERT INTO document_reviewers (document_id, user_id) VALUES (?, ?)');
    
    reviewers.forEach(reviewer => {
      const userId = typeof reviewer === 'object' ? reviewer.id : reviewer;
      insertReviewer.run(documentId, userId);
    });
  }

  /**
   * Replace document reviewers
   * @param {string} documentId - Document ID
   * @param {Array} reviewers - Array of user IDs
   */
  replaceDocumentReviewers(documentId, reviewers) {
    const db = this.getConnection();
    
    // Delete existing reviewers
    db.prepare('DELETE FROM document_reviewers WHERE document_id = ?').run(documentId);
    
    // Add new reviewers
    if (reviewers.length > 0) {
      this.addDocumentReviewers(documentId, reviewers);
    }
  }

  /**
   * Add document creators
   * @param {string} documentId - Document ID
   * @param {Array} creators - Array of user IDs
   */
  addDocumentCreators(documentId, creators) {
    const db = this.getConnection();
    const insertCreator = db.prepare('INSERT INTO document_creators (document_id, user_id) VALUES (?, ?)');
    
    creators.forEach(creator => {
      const userId = typeof creator === 'object' ? creator.id : creator;
      insertCreator.run(documentId, userId);
    });
  }

  /**
   * Replace document creators
   * @param {string} documentId - Document ID
   * @param {Array} creators - Array of user IDs
   */
  replaceDocumentCreators(documentId, creators) {
    const db = this.getConnection();
    
    // Delete existing creators
    db.prepare('DELETE FROM document_creators WHERE document_id = ?').run(documentId);
    
    // Add new creators
    if (creators.length > 0) {
      this.addDocumentCreators(documentId, creators);
    }
  }

  /**
   * Add compliance names
   * @param {string} documentId - Document ID
   * @param {Array} complianceNames - Array of compliance name objects
   */
  addComplianceNames(documentId, complianceNames) {
    const db = this.getConnection();
    const insertCompliance = db.prepare('INSERT INTO compliance_names (document_id, name, email) VALUES (?, ?, ?)');
    
    complianceNames.forEach(compliance => {
      insertCompliance.run(documentId, compliance.name, compliance.email || null);
    });
  }

  /**
   * Replace compliance names
   * @param {string} documentId - Document ID
   * @param {Array} complianceNames - Array of compliance name objects
   */
  replaceComplianceNames(documentId, complianceNames) {
    const db = this.getConnection();
    
    // Delete existing compliance names
    db.prepare('DELETE FROM compliance_names WHERE document_id = ?').run(documentId);
    
    // Add new compliance names
    if (complianceNames.length > 0) {
      this.addComplianceNames(documentId, complianceNames);
    }
  }

  /**
   * Add comment to document
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID
   * @param {string} comment - Comment text
   * @returns {object} Created comment
   */
  addComment(documentId, userId, comment) {
    try {
      const db = this.getConnection();
      const insertComment = db.prepare(`
        INSERT INTO document_comments (document_id, user_id, comment, created_at) 
        VALUES (?, ?, ?, datetime('now'))
      `);
      
      const result = insertComment.run(documentId, userId, comment);
      
      // Return the created comment with user info
      const commentQuery = `
        SELECT c.id, c.comment, c.created_at, u.name as user_name, u.id as user_id
        FROM document_comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
      `;
      return db.prepare(commentQuery).get(result.lastInsertRowid);
    } catch (error) {
      throw createError('Failed to add comment', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Update document status
   * @param {string} documentId - Document ID
   * @param {string} status - New status
   * @param {string} userId - User making the change
   * @returns {object} Updated document
   */
  updateDocumentStatus(documentId, status, userId) {
    try {
      // Verify document exists
      const document = this.findById(documentId);
      if (!document) {
        throw createError('Document not found', ERROR_CODES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Update status
      const updatedDocument = this.updateById(documentId, { 
        status,
        pending_with: null // Clear pending_with when status changes
      });

      return updatedDocument;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError('Failed to update document status', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Get documents by user role
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @param {object} filters - Additional filters
   * @returns {Array} Array of documents
   */
  getDocumentsByUserRole(userId, role, filters = {}) {
    try {
      const db = this.getConnection();
      let query;
      const params = [userId];

      switch (role) {
        case 'document-owner':
          query = `
            SELECT d.* FROM ${this.tableName} d
            JOIN document_owners do ON d.id = do.document_id
            WHERE do.user_id = ?
          `;
          break;
        
        case 'document-creator':
          query = `
            SELECT d.* FROM ${this.tableName} d
            JOIN document_creators dc ON d.id = dc.document_id
            WHERE dc.user_id = ?
          `;
          break;
        
        case 'reviewer':
          query = `
            SELECT d.* FROM ${this.tableName} d
            JOIN document_reviewers dr ON d.id = dr.document_id
            WHERE dr.user_id = ?
          `;
          break;
        
        default:
          // For other roles, return all documents
          query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
          params.pop(); // Remove userId param
          break;
      }

      // Add additional filters
      if (filters.status) {
        query += ' AND d.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY d.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      return db.prepare(query).all(...params);
    } catch (error) {
      throw createError('Failed to get documents by user role', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Check if document code is unique
   * @param {string} documentCode - Document code to check
   * @param {string} excludeId - Document ID to exclude from check
   * @returns {boolean} Whether code is unique
   */
  isDocumentCodeUnique(documentCode, excludeId = null) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE document_code = ?`;
      const params = [documentCode];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const result = this.getConnection().prepare(query).get(...params);
      return result.count === 0;
    } catch (error) {
      throw createError('Failed to check document code uniqueness', ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }
}

export default new DocumentModel();
