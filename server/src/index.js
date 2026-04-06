import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import farmRoutes from './routes/farms.js';
import batchRoutes from './routes/batches.js';
import dailyLogRoutes from './routes/dailyLogs.js';
import ledgerRoutes from './routes/ledger.js';
import inventoryRoutes from './routes/inventory.js';
import marketRoutes from './routes/market.js';
import aiRoutes from './routes/ai.js';
import connectionRoutes from './routes/connections.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/daily-logs', dailyLogRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/connections', connectionRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 PoultryMitra API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

start();