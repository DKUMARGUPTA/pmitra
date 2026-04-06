import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'poultry-mitra-secret-key';

// In-memory data store for demo
let users = [];
let farms = [];
let batches = [];
let dailyLogs = [];
let ledgerEntries = [];
let inventory = [];
let chatHistory = [];

const generateId = () => Math.floor(Math.random() * 1000000) + 1;

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, name, role, state, district, password } = req.body;
    if (!phone || !name || !role) return res.status(400).json({ error: 'Phone, name, role required' });
    if (users.find(u => u.phone === phone)) return res.status(400).json({ error: 'User exists' });
    
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const user = { id: generateId(), phone, name, role, state, district, password_hash: passwordHash, created_at: new Date().toISOString() };
    users.push(user);
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password_hash, ...userData } = user;
    res.status(201).json({ user: userData, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = users.find(u => u.phone === phone);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password_hash || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password_hash, ...userData } = user;
    res.json({ user: userData, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Farms
app.get('/api/farms', auth, (req, res) => {
  res.json(farms.filter(f => f.user_id === req.user.userId));
});

app.post('/api/farms', auth, (req, res) => {
  const { name, address, state, district, shed_count, capacity_per_shed } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const farm = { id: generateId(), user_id: req.user.userId, name, address, state, district, shed_count: shed_count || 1, capacity_per_shed: capacity_per_shed || 5000, created_at: new Date().toISOString() };
  farms.push(farm);
  res.status(201).json(farm);
});

// Batches
app.get('/api/batches', auth, (req, res) => {
  const userBatchIds = farms.filter(f => f.user_id === req.user.userId).map(f => f.id);
  res.json(batches.filter(b => userBatchIds.includes(b.farm_id)));
});

app.post('/api/batches', auth, (req, res) => {
  const { farm_id, batch_name, breed, doc_count, doc_rate, doc_date, company } = req.body;
  if (!farm_id || !batch_name) return res.status(400).json({ error: 'Required' });
  const batch = { id: generateId(), farm_id, batch_name, breed, doc_count, doc_rate, doc_date, company, status: 'active', created_at: new Date().toISOString() };
  batches.push(batch);
  res.status(201).json(batch);
});

// Daily Logs
app.get('/api/daily-logs/batch/:batchId', auth, (req, res) => {
  res.json(dailyLogs.filter(l => l.batch_id === parseInt(req.params.batchId)));
});

app.post('/api/daily-logs', auth, (req, res) => {
  const { batch_id, log_date, mortality, feed_consumed, avg_weight, temperature, notes } = req.body;
  if (!batch_id || !log_date) return res.status(400).json({ error: 'Required' });
  const log = { id: generateId(), batch_id, log_date, mortality: mortality || 0, feed_consumed, avg_weight, temperature, notes, created_at: new Date().toISOString() };
  dailyLogs.push(log);
  res.status(201).json(log);
});

// Ledger
app.get('/api/ledger', auth, (req, res) => {
  res.json(ledgerEntries.filter(e => e.user_id === req.user.userId));
});

app.post('/api/ledger', auth, (req, res) => {
  const { entry_type, amount, category, description, entry_date } = req.body;
  if (!entry_type || !amount) return res.status(400).json({ error: 'Required' });
  const entry = { id: generateId(), user_id: req.user.userId, entry_type, amount, category, description, entry_date, created_at: new Date().toISOString() };
  ledgerEntries.push(entry);
  res.status(201).json(entry);
});

// Inventory
app.get('/api/inventory', auth, (req, res) => {
  res.json(inventory.filter(i => i.user_id === req.user.userId));
});

app.post('/api/inventory', auth, (req, res) => {
  const { item_name, category, quantity, unit, rate } = req.body;
  if (!item_name) return res.status(400).json({ error: 'Required' });
  const item = { id: generateId(), user_id: req.user.userId, item_name, category, quantity, unit, rate, created_at: new Date().toISOString() };
  inventory.push(item);
  res.status(201).json(item);
});

// AI Placement Guidance
app.get('/api/ai/placement', auth, (req, res) => {
  const month = new Date().getMonth();
  const seasonalData = {
    0: { score: 9, reason: 'Winter - Best FCR', fcr: '1.7-1.8' },
    1: { score: 9, reason: 'Winter - Best FCR', fcr: '1.7-1.8' },
    2: { score: 7, reason: 'Spring - Good', fcr: '1.8-1.85' },
    3: { score: 5, reason: 'Variable', fcr: '1.85-1.9' },
    4: { score: 2, reason: 'Summer - Risk', fcr: '1.9-2.0' },
    5: { score: 2, reason: 'Summer - Risk', fcr: '1.9-2.0' },
    6: { score: 4, reason: 'Monsoon', fcr: '1.9-1.95' },
    7: { score: 5, reason: 'Monsoon start', fcr: '1.85-1.9' },
    8: { score: 7, reason: 'Autumn - Good', fcr: '1.8-1.85' },
    9: { score: 7, reason: 'Autumn - Good', fcr: '1.8-1.85' },
    10: { score: 9, reason: 'Winter - Best FCR', fcr: '1.7-1.8' },
    11: { score: 9, reason: 'Winter - Best FCR', fcr: '1.7-1.8' }
  };
  const data = seasonalData[month];
  res.json({
    currentMonth: month + 1,
    recommendation: data.score >= 7 ? 'GOOD' : data.score >= 4 ? 'MODERATE' : 'AVOID',
    score: data.score,
    reason: data.reason,
    expectedFCR: data.fcr,
    guidance: data.score >= 7 ? '✅ Good time for placement' : data.score >= 4 ? '⚠️ Proceed with caution' : '❌ Not recommended'
  });
});

app.post('/api/ai/chat', auth, (req, res) => {
  const { message } = req.body;
  const lower = message?.toLowerCase() || '';
  let response = '🤖 PoultryMitra AI: Ask about disease, feed, vaccination, mortality.';
  
  if (lower.includes('feed')) response = '🐔 Feed: Starter 22-23% protein, Grower 20-21%, Finisher 18-19%';
  else if (lower.includes('vaccin')) response = '💉 Vaccine: Day 1 Marek\'s, Day 7 IBD, Day 14 Newcastle';
  else if (lower.includes('mortality')) response = '⚠️ Normal mortality: 0.5-1%/week. Warning: >2%/day';
  
  chatHistory.push({ user_id: req.user.userId, message, response, created_at: new Date().toISOString() });
  res.json({ response, type: 'general' });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;