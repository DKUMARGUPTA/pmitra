import express from 'express';
import auth from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, phone, name, role, state, district, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await queryOne(
      'SELECT id, phone, name, role, state, district, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, role, state, district, is_active } = req.body;
    
    // Only allow users to update themselves or admins
    if (req.user.role !== 'admin' && req.user.userId != req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await query(
      `UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), state = COALESCE(?, state), district = COALESCE(?, district), is_active = COALESCE(?, is_active) WHERE id = ?`,
      [name, role, state, district, is_active, req.params.id]
    );
    
    const user = await queryOne(
      'SELECT id, phone, name, role, state, district, is_active FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    
    await query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dealers for farmer connection
router.get('/role/dealers', auth, async (req, res) => {
  try {
    const dealers = await query(
      `SELECT id, name, phone, state, district FROM users WHERE role = 'dealer' AND is_active = 1`
    );
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;