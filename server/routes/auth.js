import express from 'express';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

import { generateTokens, verifyRefreshToken, authenticateToken } from '../middleware/auth.js';
import { validateLogin, validateRequest, authLimiter } from '../middleware/security.js';
import { AuditLogger } from '../services/auditLogger.js';
import { EmailService } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', '..', 'data', 'documents.db');

const router = express.Router();

// Hash password utility
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password utility
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Store refresh token in database
const storeRefreshToken = (userId, refreshToken, req) => {
  const db = new Database(dbPath);
  
  try {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const insertSession = db.prepare(`
      INSERT INTO user_sessions (id, user_id, refresh_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertSession.run(
      sessionId,
      userId,
      refreshToken,
      expiresAt.toISOString(),
      req.ip,
      req.get('User-Agent')
    );

    return sessionId;
  } catch (error) {
    console.error('Error storing refresh token:', error);
    return null;
  } finally {
    db.close();
  }
};

// Clean up expired sessions
const cleanupExpiredSessions = () => {
  const db = new Database(dbPath);
  
  try {
    const deleteExpired = db.prepare(`
      DELETE FROM user_sessions 
      WHERE expires_at < datetime('now') OR is_active = 0
    `);
    
    const result = deleteExpired.run();
    if (result.changes > 0) {
      console.log(`Cleaned up ${result.changes} expired sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  } finally {
    db.close();
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Login route
router.post('/login', authLimiter, validateLogin, validateRequest, async (req, res) => {
  const { email, password } = req.body;
  const db = new Database(dbPath);

  try {
    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);

    if (!user) {
      await AuditLogger.userLogin(email, false, req, 'User not found or inactive');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For existing users without password hash, create default password
    if (!user.password_hash) {
      // Set default password as 'password123' for demo purposes
      const defaultPassword = 'password123';
      const hashedPassword = await hashPassword(defaultPassword);
      
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedPassword, user.id);
      user.password_hash = hashedPassword;
      
      console.log(`Default password set for user: ${user.email}`);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      await AuditLogger.userLogin(user.id, false, req, 'Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    const sessionId = storeRefreshToken(user.id, refreshToken, req);

    // Update last login
    db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(user.id);

    // Log successful login
    await AuditLogger.userLogin(user.id, true, req);

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      country: user.country
    };

    res.json({
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken,
      sessionId
    });

  } catch (error) {
    console.error('Login error:', error);
    await AuditLogger.systemError(error, { context: 'login', email });
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    db.close();
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  const db = new Database(dbPath);

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if session exists and is active
    const session = db.prepare(`
      SELECT * FROM user_sessions 
      WHERE refresh_token = ? AND is_active = 1 AND expires_at > datetime('now')
    `).get(refreshToken);

    if (!session) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Get user data
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND active = 1').get(decoded.id);

    if (!user) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update session with new refresh token
    db.prepare(`
      UPDATE user_sessions 
      SET refresh_token = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newRefreshToken, session.id);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      country: user.country
    };

    res.json({
      message: 'Token refreshed successfully',
      user: userData,
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ error: 'Invalid refresh token' });
  } finally {
    db.close();
  }
});

// Logout route
router.post('/logout', authenticateToken, async (req, res) => {
  const { refreshToken } = req.body;
  const db = new Database(dbPath);

  try {
    if (refreshToken) {
      // Deactivate specific session
      db.prepare(`
        UPDATE user_sessions 
        SET is_active = 0, updated_at = datetime('now')
        WHERE refresh_token = ?
      `).run(refreshToken);
    } else {
      // Deactivate all user sessions
      db.prepare(`
        UPDATE user_sessions 
        SET is_active = 0, updated_at = datetime('now')
        WHERE user_id = ?
      `).run(req.user.id);
    }

    await AuditLogger.userLogout(req.user.id, req);

    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    db.close();
  }
});

// Change password route
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const db = new Database(dbPath);

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password (handle case where no password is set)
    if (user.password_hash) {
      const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        await AuditLogger.logAction('password_change_failed', {
          userId: req.user.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: 'Invalid current password',
          success: false
        });
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    } else {
      // If no password hash exists, treat any current password as valid for first-time setup
      console.log(`Setting password for user ${user.email} for the first time`);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?')
      .run(newPasswordHash, req.user.id);

    // Invalidate all user sessions (force re-login)
    db.prepare('UPDATE user_sessions SET is_active = 0 WHERE user_id = ?').run(req.user.id);

    await AuditLogger.logAction('password_changed', {
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: 'Password changed successfully'
    });

    res.json({ message: 'Password changed successfully. Please log in again.' });

  } catch (error) {
    console.error('Change password error:', error);
    await AuditLogger.systemError(error, { context: 'change_password', userId: req.user.id });
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    db.close();
  }
});

// Forgot password route
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const db = new Database(dbPath);

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link will be sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    // Store reset token
    db.prepare(`
      UPDATE users 
      SET password_reset_token = ?, password_reset_expires = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(resetToken, resetExpires.toISOString(), user.id);

    // Send reset email
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const body = `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested a password reset for your account. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Document Management System</p>
    `;

    await EmailService.sendCustomEmail(user.email, subject, body);

    await AuditLogger.logAction('password_reset_requested', {
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: 'Password reset token generated and sent'
    });

    res.json({ message: 'If the email exists, a reset link will be sent' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    db.close();
  }
});

// Reset password route
router.post('/reset-password', authLimiter, async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const db = new Database(dbPath);

  try {
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE password_reset_token = ? 
      AND password_reset_expires > datetime('now')
      AND active = 1
    `).get(token);

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    db.prepare(`
      UPDATE users 
      SET password_hash = ?, 
          password_reset_token = NULL, 
          password_reset_expires = NULL,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(newPasswordHash, user.id);

    // Invalidate all user sessions
    db.prepare('UPDATE user_sessions SET is_active = 0 WHERE user_id = ?').run(user.id);

    await AuditLogger.logAction('password_reset_completed', {
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: 'Password reset using token'
    });

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    db.close();
  }
});

// Get current user route
router.get('/me', authenticateToken, async (req, res) => {
  const db = new Database(dbPath);

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND active = 1').get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      country: user.country,
      lastLogin: user.last_login,
      createdAt: user.created_at
    };

    res.json(userData);

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    db.close();
  }
});

// Get user sessions route
router.get('/sessions', authenticateToken, async (req, res) => {
  const db = new Database(dbPath);

  try {
    const sessions = db.prepare(`
      SELECT id, ip_address, user_agent, created_at, expires_at, is_active
      FROM user_sessions 
      WHERE user_id = ? AND is_active = 1 
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json(sessions);

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    db.close();
  }
});

// Revoke session route
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const db = new Database(dbPath);

  try {
    const result = db.prepare(`
      UPDATE user_sessions 
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(sessionId, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await AuditLogger.logAction('session_revoked', {
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: `Session ${sessionId} revoked`
    });

    res.json({ message: 'Session revoked successfully' });

  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    db.close();
  }
});

export default router;
