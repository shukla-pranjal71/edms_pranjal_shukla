import Database from 'better-sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config/index.js';
import { createError } from '../utils/index.js';
import { ERROR_CODES, HTTP_STATUS } from '../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Database Connection Manager
 * Manages SQLite database connections with proper error handling and connection pooling
 */
class DatabaseConnection {
  constructor() {
    this.db = null;
    this.connectionPool = new Map();
    this.maxConnections = config.database.connectionLimit;
    this.activeConnections = 0;
    this.isConnected = false;
  }

  /**
   * Initialize database connection
   */
  async connect() {
    try {
      // Ensure database directory exists
      const dbDir = dirname(config.database.path);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create database connection
      this.db = new Database(config.database.path, {
        timeout: config.database.timeout,
        verbose: config.isDevelopment ? console.log : null,
      });

      // Configure database settings
      if (config.database.enableForeignKeys) {
        this.db.pragma('foreign_keys = ON');
      }
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = -16384'); // 16MB cache
      this.db.pragma('temp_store = MEMORY');

      this.isConnected = true;
      console.log('✅ Database connected successfully');
      
      return this.db;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw createError(
        'Failed to connect to database',
        ERROR_CODES.DATABASE_CONNECTION_FAILED,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get database instance
   */
  getInstance() {
    if (!this.isConnected || !this.db) {
      throw createError(
        'Database not connected',
        ERROR_CODES.DATABASE_CONNECTION_FAILED,
        HTTP_STATUS.SERVICE_UNAVAILABLE
      );
    }
    return this.db;
  }

  /**
   * Execute query with error handling
   */
  executeQuery(query, params = []) {
    try {
      const db = this.getInstance();
      const statement = db.prepare(query);
      
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        return statement.all(...params);
      } else {
        return statement.run(...params);
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw createError(
        'Database query failed',
        ERROR_CODES.DATABASE_QUERY_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { 
          query: query.substring(0, 100), // Truncate query for logging
          error: error.message 
        }
      );
    }
  }

  /**
   * Execute transaction
   */
  executeTransaction(operations) {
    const db = this.getInstance();
    const transaction = db.transaction(() => {
      const results = [];
      for (const operation of operations) {
        const result = this.executeQuery(operation.query, operation.params);
        results.push(result);
      }
      return results;
    });

    return transaction();
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db && this.isConnected) {
      this.db.close();
      this.isConnected = false;
      console.log('📴 Database connection closed');
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const db = this.getInstance();
      const result = db.prepare('SELECT 1 as health').get();
      return result && result.health === 1;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
const databaseConnection = new DatabaseConnection();

/**
 * Base Model Class
 * Provides common database operations for all models
 */
export class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = databaseConnection;
  }

  /**
   * Get database connection
   */
  getConnection() {
    return this.db.getInstance();
  }

  /**
   * Find record by ID
   */
  findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      return this.getConnection().prepare(query).get(id);
    } catch (error) {
      throw createError(`Failed to find ${this.tableName} by ID`, ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Find records by criteria
   */
  findBy(criteria, options = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params = [];
      const conditions = [];

      // Build WHERE clause
      if (criteria && typeof criteria === 'object') {
        for (const [key, value] of Object.entries(criteria)) {
          if (value !== undefined && value !== null) {
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        }
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Add ORDER BY
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
        if (options.orderDirection) {
          query += ` ${options.orderDirection}`;
        }
      }

      // Add LIMIT and OFFSET
      if (options.limit) {
        query += ` LIMIT ?`;
        params.push(options.limit);
      }

      if (options.offset) {
        query += ` OFFSET ?`;
        params.push(options.offset);
      }

      return this.getConnection().prepare(query).all(...params);
    } catch (error) {
      throw createError(`Failed to find ${this.tableName} records`, ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Find single record by criteria
   */
  findOneBy(criteria) {
    const results = this.findBy(criteria, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get all records
   */
  findAll(options = {}) {
    return this.findBy({}, options);
  }

  /**
   * Create new record
   */
  create(data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      
      const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = this.getConnection().prepare(query).run(...values);
      
      // Return the created record if it has an ID
      if (result.lastInsertRowid) {
        return this.findById(result.lastInsertRowid);
      } else if (data.id) {
        return this.findById(data.id);
      }
      
      return result;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw createError(
          `Duplicate entry for ${this.tableName}`,
          ERROR_CODES.VALIDATION_DUPLICATE_ENTRY,
          HTTP_STATUS.CONFLICT
        );
      }
      throw createError(`Failed to create ${this.tableName} record`, ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Update record by ID
   */
  updateById(id, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      
      const query = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      const result = this.getConnection().prepare(query).run(...values, id);
      
      if (result.changes === 0) {
        throw createError(
          `${this.tableName} record not found`,
          ERROR_CODES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }
      
      return this.findById(id);
    } catch (error) {
      if (error.statusCode) throw error; // Re-throw our custom errors
      throw createError(`Failed to update ${this.tableName} record`, ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Delete record by ID (soft delete if column exists)
   */
  deleteById(id) {
    try {
      // Check if the table has a 'deleted_at' or 'active' column for soft delete
      const tableInfo = this.getConnection().pragma(`table_info(${this.tableName})`);
      const hasDeletedAt = tableInfo.some(col => col.name === 'deleted_at');
      const hasActive = tableInfo.some(col => col.name === 'active');

      let query;
      let result;

      if (hasDeletedAt) {
        // Soft delete using deleted_at
        query = `UPDATE ${this.tableName} SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`;
        result = this.getConnection().prepare(query).run(id);
      } else if (hasActive) {
        // Soft delete using active flag
        query = `UPDATE ${this.tableName} SET active = 0 WHERE id = ?`;
        result = this.getConnection().prepare(query).run(id);
      } else {
        // Hard delete
        query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        result = this.getConnection().prepare(query).run(id);
      }

      if (result.changes === 0) {
        throw createError(
          `${this.tableName} record not found`,
          ERROR_CODES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      return result;
    } catch (error) {
      if (error.statusCode) throw error; // Re-throw our custom errors
      throw createError(`Failed to delete ${this.tableName} record`, ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Count records
   */
  count(criteria = {}) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const params = [];
      const conditions = [];

      if (criteria && typeof criteria === 'object') {
        for (const [key, value] of Object.entries(criteria)) {
          if (value !== undefined && value !== null) {
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        }
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const result = this.getConnection().prepare(query).get(...params);
      return result.count;
    } catch (error) {
      throw createError(`Failed to count ${this.tableName} records`, ERROR_CODES.DATABASE_QUERY_FAILED);
    }
  }

  /**
   * Check if record exists
   */
  exists(criteria) {
    return this.count(criteria) > 0;
  }

  /**
   * Execute raw query
   */
  raw(query, params = []) {
    return this.db.executeQuery(query, params);
  }

  /**
   * Begin transaction
   */
  beginTransaction() {
    return this.getConnection().prepare('BEGIN TRANSACTION').run();
  }

  /**
   * Commit transaction
   */
  commitTransaction() {
    return this.getConnection().prepare('COMMIT').run();
  }

  /**
   * Rollback transaction
   */
  rollbackTransaction() {
    return this.getConnection().prepare('ROLLBACK').run();
  }
}

// Export database connection instance
export default databaseConnection;
