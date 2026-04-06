import express from 'express';
import auth from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

// Get all batches for user's farms
router.get('/', auth, async (req, res) => {
  try {
    const batches = await query(
      `SELECT b.*, f.name as farm_name, f.district as farm_district
       FROM batches b
       JOIN farms f ON b.farm_id = f.id
       WHERE f.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.userId]
    );
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single batch
router.get('/:id', auth, async (req, res) => {
  try {
    const batch = await queryOne(
      `SELECT b.*, f.name as farm_name, f.user_id as owner_id
       FROM batches b
       JOIN farms f ON b.farm_id = f.id
       WHERE b.id = ? AND f.user_id = ?`,
      [req.params.id, req.user.userId]
    );
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create batch
router.post('/', auth, async (req, res) => {
  try {
    const { farm_id, batch_name, breed, doc_count, doc_rate, doc_date, company } = req.body;
    
    if (!farm_id || !batch_name || !doc_count || !doc_date) {
      return res.status(400).json({ error: 'Farm, batch name, DOC count, and date required' });
    }
    
    // Verify farm belongs to user
    const farm = await queryOne('SELECT id FROM farms WHERE id = ? AND user_id = ?', [farm_id, req.user.userId]);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    const result = await query(
      `INSERT INTO batches (farm_id, batch_name, breed, doc_count, doc_rate, doc_date, company) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [farm_id, batch_name, breed, doc_count, doc_rate, doc_date, company]
    );
    
    const batch = await queryOne('SELECT * FROM batches WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update batch
router.put('/:id', auth, async (req, res) => {
  try {
    const { batch_name, breed, doc_count, doc_rate, doc_date, expected_sale_date, company, status } = req.body;
    
    await query(
      `UPDATE batches SET batch_name = COALESCE(?, batch_name), breed = COALESCE(?, breed), doc_count = COALESCE(?, doc_count), doc_rate = COALESCE(?, doc_rate), doc_date = COALESCE(?, doc_date), expected_sale_date = COALESCE(?, expected_sale_date), company = COALESCE(?, company), status = COALESCE(?, status) WHERE id = ? AND farm_id IN (SELECT id FROM farms WHERE user_id = ?)`,
      [batch_name, breed, doc_count, doc_rate, doc_date, expected_sale_date, company, status, req.params.id, req.user.userId]
    );
    
    const batch = await queryOne('SELECT * FROM batches WHERE id = ?', [req.params.id]);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete batch
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM batches WHERE id = ? AND farm_id IN (SELECT id FROM farms WHERE user_id = ?)`,
      [req.params.id, req.user.userId]
    );
    
    if (!result.changes) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    res.json({ message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get batch summary with daily logs
router.get('/:id/summary', auth, async (req, res) => {
  try {
    const batch = await queryOne(
      `SELECT b.*, f.name as farm_name FROM batches b JOIN farms f ON b.farm_id = f.id WHERE b.id = ? AND f.user_id = ?`,
      [req.params.id, req.user.userId]
    );
    
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    
    const logs = await query('SELECT * FROM daily_logs WHERE batch_id = ? ORDER BY log_date DESC', [req.params.id]);
    
    const totalMortality = logs.reduce((sum, log) => sum + (log.mortality || 0), 0);
    const totalFeed = logs.reduce((sum, log) => sum + (log.feed_consumed || 0), 0);
    const lastLog = logs[0];
    
    res.json({
      ...batch,
      totalLogs: logs.length,
      totalMortality,
      totalFeed,
      currentWeight: lastLog?.avg_weight || 0,
      days: logs.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;