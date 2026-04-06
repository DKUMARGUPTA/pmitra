import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'poultry-mitra-secret-key-change-in-production';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { phone, name, role, state, district, password } = req.body;
    
    if (!phone || !name || !role) {
      return res.status(400).json({ error: 'Phone, name, and role are required' });
    }
    
    const existing = await queryOne('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing) {
      return res.status(400).json({ error: 'User already exists with this phone' });
    }
    
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }
    
    const result = await query(
      `INSERT INTO users (phone, name, role, state, district, password_hash) VALUES (?, ?, ?, ?, ?, ?)`,
      [phone, name, role, state || null, district || null, passwordHash]
    );
    
    const user = await queryOne(
      'SELECT id, phone, name, role, state, district, created_at FROM users WHERE id = ?',
      [result.lastInsertRowid]
    );
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login with phone + password
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }
    
    const user = await queryOne('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash || '');
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    
    delete user.password_hash;
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// OTP Login
router.post('/otp-login', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp || otp.length !== 6) {
      return res.status(400).json({ error: 'Valid phone and 6-digit OTP required' });
    }
    
    let user = await queryOne('SELECT * FROM users WHERE phone = ?', [phone]);
    
    if (!user) {
      const result = await query(
        `INSERT INTO users (phone, name, role) VALUES (?, ?, ?)`,
        [phone, `User ${phone.slice(-4)}`, 'farmer']
      );
      user = await queryOne('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      token 
    });
  } catch (error) {
    console.error('OTP login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await queryOne(
      'SELECT id, phone, name, role, state, district, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;