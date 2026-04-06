import express from 'express';
import auth from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const items = await query('SELECT * FROM inventory WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId]);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock items
router.get('/low-stock', auth, async (req, res) => {
  try {
    const items = await query('SELECT * FROM inventory WHERE user_id = ? AND quantity <= 50 ORDER BY quantity ASC', [req.user.userId]);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create inventory item
router.post('/', auth, async (req, res) => {
  try {
    const { item_name, category, quantity, unit, rate, expiry_date, supplier } = req.body;
    
    if (!item_name) {
      return res.status(400).json({ error: 'Item name required' });
    }
    
    const total_value = quantity && rate ? quantity * rate : null;
    
    const result = await query(
      `INSERT INTO inventory (user_id, item_name, category, quantity, unit, rate, total_value, expiry_date, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, item_name, category, quantity, unit, rate, total_value, expiry_date, supplier]
    );
    
    const item = await queryOne('SELECT * FROM inventory WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory
router.put('/:id', auth, async (req, res) => {
  try {
    const { item_name, category, quantity, unit, rate, expiry_date, supplier } = req.body;
    const total_value = quantity && rate ? quantity * rate : null;
    
    await query(
      `UPDATE inventory SET item_name = COALESCE(?, item_name), category = COALESCE(?, category), quantity = COALESCE(?, quantity), unit = COALESCE(?, unit), rate = COALESCE(?, rate), total_value = COALESCE(?, total_value), expiry_date = COALESCE(?, expiry_date), supplier = COALESCE(?, supplier) WHERE id = ? AND user_id = ?`,
      [item_name, category, quantity, unit, rate, total_value, expiry_date, supplier, req.params.id, req.user.userId]
    );
    
    const item = await queryOne('SELECT * FROM inventory WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await query('DELETE FROM inventory WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    
    if (!result.changes) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;