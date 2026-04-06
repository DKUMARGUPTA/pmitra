import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'poultry-mitra-secret-key-change-in-production';
const DB_PATH = process.env.DB_PATH || './database.sqlite';

// Database instance
let db = null;

// Initialize database
export async function initDB() {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  // Create tables
  await db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'farmer' CHECK(role IN ('farmer', 'dealer', 'integrator', 'admin')),
      sub_role TEXT,
      state TEXT,
      district TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    );

    -- User connections
    CREATE TABLE IF NOT EXISTS user_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      connected_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      connection_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME
    );

    -- Farms
    CREATE TABLE IF NOT EXISTS farms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      address TEXT,
      state TEXT,
      district TEXT,
      shed_count INTEGER DEFAULT 1,
      capacity_per_shed INTEGER DEFAULT 5000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Batches
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
      batch_name TEXT NOT NULL,
      breed TEXT,
      doc_count INTEGER,
      doc_rate REAL,
      doc_date TEXT,
      expected_sale_date TEXT,
      company TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'sold', 'lost')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Daily Logs
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
      log_date TEXT NOT NULL,
      day_number INTEGER,
      mortality INTEGER DEFAULT 0,
      feed_consumed REAL,
      water_consumed REAL,
      avg_weight REAL,
      temperature REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Ledger
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      related_user_id INTEGER REFERENCES users(id),
      batch_id INTEGER REFERENCES batches(id),
      entry_type TEXT NOT NULL CHECK(entry_type IN ('credit', 'debit')),
      amount REAL NOT NULL,
      category TEXT,
      description TEXT,
      payment_mode TEXT,
      entry_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Inventory
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      category TEXT,
      quantity REAL DEFAULT 0,
      unit TEXT,
      rate REAL,
      total_value REAL,
      expiry_date TEXT,
      supplier TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Market Rates
    CREATE TABLE IF NOT EXISTS market_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      rate_type TEXT NOT NULL,
      rate_date TEXT NOT NULL,
      rate_value REAL NOT NULL,
      company TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(state, district, rate_type, rate_date)
    );

    -- Chat History
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('✅ SQLite database initialized');
  return db;
}

// Helper functions
export async function query(sql, params = []) {
  if (!db) await initDB();
  const stmt = await db.prepare(sql);
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    return await stmt.all(params);
  } else {
    const result = await stmt.run(params);
    return { lastInsertRowid: result.lastID, changes: result.changes };
  }
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0];
}

export { db };
export default { initDB, query, queryOne };