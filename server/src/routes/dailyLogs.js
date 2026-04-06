import express from 'express';
import auth from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

// Get daily logs for a batch
router.get('/batch/:batchId', auth, async (req, res) => {
  try {
    const logs = await query(
      `SELECT dl.*, b.batch_name
       FROM daily_logs dl
       JOIN batches b ON dl.batch_id = b.id
       JOIN farms f ON b.farm_id = f.id
       WHERE dl.batch_id = ? AND f.user_id = ?
       ORDER BY dl.log_date DESC`,
      [req.params.batchId, req.user.userId]
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/update daily log
router.post('/', auth, async (req, res) => {
  try {
    const { batch_id, log_date, mortality, feed_consumed, water_consumed, avg_weight, temperature, notes } = req.body;
    
    if (!batch_id || !log_date) {
      return res.status(400).json({ error: 'Batch ID and date required' });
    }
    
    // Verify batch belongs to user
    const batch = await queryOne(
      `SELECT b.id, b.doc_count, b.doc_date FROM batches b JOIN farms f ON b.farm_id = f.id WHERE b.id = ? AND f.user_id = ?`,
      [batch_id, req.user.userId]
    );
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    // Calculate day number
    const docDate = new Date(batch.doc_date);
    const logDate = new Date(log_date);
    const dayNumber = Math.floor((logDate - docDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check if log exists for this date
    const existing = await queryOne(
      'SELECT id FROM daily_logs WHERE batch_id = ? AND log_date = ?',
      [batch_id, log_date]
    );
    
    let result;
    if (existing) {
      await query(
        `UPDATE daily_logs SET mortality = ?, feed_consumed = ?, water_consumed = ?, avg_weight = ?, temperature = ?, notes = ? WHERE batch_id = ? AND log_date = ?`,
        [mortality, feed_consumed, water_consumed, avg_weight, temperature, notes, batch_id, log_date]
      );
      result = { lastInsertRowid: existing.id };
    } else {
      result = await query(
        `INSERT INTO daily_logs (batch_id, log_date, day_number, mortality, feed_consumed, water_consumed, avg_weight, temperature, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [batch_id, log_date, dayNumber, mortality || 0, feed_consumed, water_consumed, avg_weight, temperature, notes]
      );
    }
    
    const log = await queryOne('SELECT * FROM daily_logs WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's log for all active batches
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const logs = await query(
      `SELECT dl.*, b.batch_name, f.name as farm_name
       FROM daily_logs dl
       JOIN batches b ON dl.batch_id = b.id
       JOIN farms f ON b.farm_id = f.id
       WHERE f.user_id = ? AND dl.log_date = ?`,
      [req.user.userId, today]
    );
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;