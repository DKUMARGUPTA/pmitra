import express from 'express';
import auth from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

// Get user's connections
router.get('/', auth, async (req, res) => {
  try {
    const connections = await query(
      `SELECT uc.*, u.name as connected_user_name, u.phone as connected_user_phone, u.role as connected_user_role, u.state, u.district
       FROM user_connections uc
       JOIN users u ON uc.connected_user_id = u.id
       WHERE uc.user_id = ?
       ORDER BY uc.created_at DESC`,
      [req.user.userId]
    );
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request connection with a code
router.post('/request', auth, async (req, res) => {
  try {
    const { connection_code } = req.body;
    if (!connection_code) return res.status(400).json({ error: 'Connection code required' });
    
    // For demo, find any user with matching code or create a simple connection
    const targetUser = await queryOne(
      `SELECT id, name, role FROM users WHERE id = (SELECT user_id FROM user_connections WHERE connection_code = ? LIMIT 1)`,
      [connection_code]
    );
    
    if (!targetUser) {
      return res.status(404).json({ error: 'Invalid connection code' });
    }
    
    const existing = await queryOne(
      'SELECT id FROM user_connections WHERE user_id = ? AND connected_user_id = ?',
      [req.user.userId, targetUser.id]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Already connected' });
    }
    
    const result = await query(
      'INSERT INTO user_connections (user_id, connected_user_id, connection_code, status) VALUES (?, ?, ?, ?)',
      [req.user.userId, targetUser.id, connection_code, 'pending']
    );
    
    res.status(201).json({ id: result.lastInsertRowid, status: 'pending' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate connection code (for dealer)
router.post('/generate-code', auth, async (req, res) => {
  try {
    const code = 'PM' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await query(
      'INSERT INTO user_connections (user_id, connected_user_id, connection_code, status) VALUES (?, ?, ?, ?)',
      [req.user.userId, req.user.userId, code, 'approved']
    );
    
    res.json({ code, message: 'Share this code with your farmers' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete connection
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM user_connections WHERE id = ? AND (user_id = ? OR connected_user_id = ?)',
      [req.params.id, req.user.userId, req.user.userId]
    );
    
    if (!result.changes) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json({ message: 'Connection removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;