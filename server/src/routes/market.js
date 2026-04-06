import express from 'express';
import auth from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

// Get market rates
router.get('/', auth, async (req, res) => {
  try {
    const { state, district, rate_type, days = 7 } = req.query;
    
    let sql = 'SELECT * FROM market_rates WHERE rate_date >= date("now", "-" || ? || " days")';
    const params = [parseInt(days)];
    
    if (state) {
      sql += ' AND state = ?';
      params.push(state);
    }
    
    if (district) {
      sql += ' AND district = ?';
      params.push(district);
    }
    
    if (rate_type) {
      sql += ' AND rate_type = ?';
      params.push(rate_type);
    }
    
    sql += ' ORDER BY rate_date DESC, state, district';
    
    const rates = await query(sql, params);
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique states
router.get('/states', auth, async (req, res) => {
  try {
    const states = await query('SELECT DISTINCT state FROM market_rates ORDER BY state');
    res.json(states.map(s => s.state));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get districts by state
router.get('/districts', auth, async (req, res) => {
  try {
    const { state } = req.query;
    if (!state) {
      return res.status(400).json({ error: 'State required' });
    }
    
    const districts = await query(
      'SELECT DISTINCT district FROM market_rates WHERE state = ? ORDER BY district',
      [state]
    );
    res.json(districts.map(d => d.district));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add market rate (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    
    const { state, district, rate_type, rate_date, rate_value, company } = req.body;
    
    if (!state || !district || !rate_type || !rate_date || !rate_value) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    // Try insert, ignore if exists
    try {
      const result = await query(
        `INSERT INTO market_rates (state, district, rate_type, rate_date, rate_value, company) VALUES (?, ?, ?, ?, ?, ?)`,
        [state, district, rate_type, rate_date, rate_value, company]
      );
      const rate = await queryOne('SELECT * FROM market_rates WHERE id = ?', [result.lastInsertRowid]);
      res.status(201).json(rate);
    } catch (e) {
      // Update if exists
      await query(
        `UPDATE market_rates SET rate_value = ? WHERE state = ? AND district = ? AND rate_type = ? AND rate_date = ?`,
        [rate_value, state, district, rate_type, rate_date]
      );
      const rate = await queryOne(
        'SELECT * FROM market_rates WHERE state = ? AND district = ? AND rate_type = ? AND rate_date = ?',
        [state, district, rate_type, rate_date]
      );
      res.json(rate);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Price prediction (simple heuristic)
router.get('/predict', auth, async (req, res) => {
  try {
    const { state, district } = req.query;
    
    if (!state || !district) {
      return res.status(400).json({ error: 'State and district required' });
    }
    
    const history = await query(
      `SELECT rate_date, rate_value, rate_type FROM market_rates WHERE state = ? AND district = ? AND rate_type = 'bird' ORDER BY rate_date DESC LIMIT 30`,
      [state, district]
    );
    
    if (history.length < 7) {
      return res.json({ 
        prediction: null, 
        message: 'Not enough data for prediction',
        confidence: 0 
      });
    }
    
    const recent = history.slice(0, 7);
    const older = history.slice(7, 14);
    
    const recentAvg = recent.reduce((sum, r) => sum + parseFloat(r.rate_value), 0) / recent.length;
    const olderAvg = older.length ? older.reduce((sum, r) => sum + parseFloat(r.rate_value), 0) / older.length : recentAvg;
    
    const trend = recentAvg - olderAvg;
    const prediction = recentAvg + (trend * 3);
    
    res.json({
      current: recentAvg,
      prediction: Math.round(prediction * 100) / 100,
      trend: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
      confidence: Math.min(90, 50 + history.length),
      basedOn: history.length + ' days data'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;