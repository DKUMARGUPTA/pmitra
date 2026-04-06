import express from 'express';
import auth from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

// Get all ledger entries for user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await query(
      `SELECT le.*, u.name as related_user_name
       FROM ledger_entries le
       LEFT JOIN users u ON le.related_user_id = u.id
       WHERE le.user_id = ?
       ORDER BY le.entry_date DESC, le.created_at DESC`,
      [req.user.userId]
    );
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ledger summary
router.get('/summary', auth, async (req, res) => {
  try {
    const entries = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
        COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit
       FROM ledger_entries WHERE user_id = ?`,
      [req.user.userId]
    );
    const row = entries[0] || {};
    res.json({
      total_credit: row.total_credit || 0,
      total_debit: row.total_debit || 0,
      balance: (row.total_credit || 0) - (row.total_debit || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create ledger entry
router.post('/', auth, async (req, res) => {
  try {
    const { related_user_id, batch_id, entry_type, amount, category, description, payment_mode, entry_date } = req.body;
    
    if (!entry_type || !amount || !entry_date) {
      return res.status(400).json({ error: 'Entry type, amount, and date required' });
    }
    
    const result = await query(
      `INSERT INTO ledger_entries (user_id, related_user_id, batch_id, entry_type, amount, category, description, payment_mode, entry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, related_user_id, batch_id, entry_type, amount, category, description, payment_mode, entry_date]
    );
    
    const entry = await queryOne('SELECT * FROM ledger_entries WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ledger entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await query('DELETE FROM ledger_entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    
    if (!result.changes) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;