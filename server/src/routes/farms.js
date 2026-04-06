import express from 'express';
import auth from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

// Get all farms for user
router.get('/', auth, async (req, res) => {
  try {
    const farms = await query(
      `SELECT f.*, u.name as owner_name, u.phone as owner_phone
       FROM farms f
       JOIN users u ON f.user_id = u.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.userId]
    );
    res.json(farms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single farm
router.get('/:id', auth, async (req, res) => {
  try {
    const farm = await queryOne(
      `SELECT f.*, u.name as owner_name
       FROM farms f
       JOIN users u ON f.user_id = u.id
       WHERE f.id = ? AND f.user_id = ?`,
      [req.params.id, req.user.userId]
    );
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    res.json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create farm
router.post('/', auth, async (req, res) => {
  try {
    const { name, address, state, district, shed_count, capacity_per_shed } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Farm name is required' });
    }
    
    const result = await query(
      `INSERT INTO farms (user_id, name, address, state, district, shed_count, capacity_per_shed) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, name, address, req.body.state, req.body.district, shed_count || 1, capacity_per_shed || 5000]
    );
    
    const farm = await queryOne('SELECT * FROM farms WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update farm
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, address, state, district, shed_count, capacity_per_shed } = req.body;
    
    await query(
      `UPDATE farms SET name = COALESCE(?, name), address = COALESCE(?, address), state = COALESCE(?, state), district = COALESCE(?, district), shed_count = COALESCE(?, shed_count), capacity_per_shed = COALESCE(?, capacity_per_shed) WHERE id = ? AND user_id = ?`,
      [name, address, state, district, shed_count, capacity_per_shed, req.params.id, req.user.userId]
    );
    
    const farm = await queryOne('SELECT * FROM farms WHERE id = ?', [req.params.id]);
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    
    res.json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete farm
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await query('DELETE FROM farms WHERE id = ? AND user_id = ? RETURNING id', [req.params.id, req.user.userId]);
    
    if (!result.changes) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    res.json({ message: 'Farm deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;