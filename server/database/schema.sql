-- PoultryMitra Database Schema
-- Run this after PostgreSQL is running

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'dealer', 'integrator', 'admin')),
    sub_role VARCHAR(50), -- for farmer: contract, dealer_linked, standalone
    state VARCHAR(50),
    district VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User connections (Farmer-Dealer links)
CREATE TABLE user_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    connection_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);

-- ============================================
-- FARMS & BATCHES
-- ============================================

CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    state VARCHAR(50),
    district VARCHAR(50),
    shed_count INTEGER DEFAULT 1,
    capacity_per_shed INTEGER DEFAULT 5000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    batch_name VARCHAR(50) NOT NULL,
    breed VARCHAR(50), -- Vencobb, Cobb, etc.
    doc_count INTEGER NOT NULL,
    doc_rate DECIMAL(10,2),
    doc_date DATE NOT NULL,
    expected_sale_date DATE,
    company VARCHAR(100), -- Hatchery/company name
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'mortality')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DAILY LOGS
-- ============================================

CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    mortality INTEGER DEFAULT 0,
    feed_consumed DECIMAL(10,2), -- in kg
    water_consumed DECIMAL(10,2), -- in liters
    avg_weight DECIMAL(10,2), -- in kg
    temperature DECIMAL(5,2), -- Celsius
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, log_date)
);

-- ============================================
-- LEDGER & TRANSACTIONS
-- ============================================

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES users(id), -- for dealer-farmer transactions
    batch_id UUID REFERENCES batches(id),
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('credit', 'debit')),
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(50), -- feed, doc, medicine, sale, payment, etc.
    description TEXT,
    payment_mode VARCHAR(20), -- cash, bank, upi
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INVENTORY
-- ============================================

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- feed, medicine, equipment
    quantity DECIMAL(10,2),
    unit VARCHAR(20), -- kg, liters, pieces
    rate DECIMAL(10,2),
    total_value DECIMAL(12,2),
    expiry_date DATE,
    supplier VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MARKET PRICES (from chicksrate data)
-- ============================================

CREATE TABLE market_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    rate_type VARCHAR(20) NOT NULL, -- doc, bird, retail
    rate_date DATE NOT NULL,
    rate_value DECIMAL(10,2) NOT NULL,
    company VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state, district, rate_type, rate_date)
);

-- ============================================
-- AI CHAT HISTORY
-- ============================================

CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS & ALERTS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info', -- info, warning, alert
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_farms_user ON farms(user_id);
CREATE INDEX idx_batches_farm ON batches(farm_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_daily_logs_batch ON daily_logs(batch_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(log_date);
CREATE INDEX idx_ledger_user ON ledger_entries(user_id);
CREATE INDEX idx_market_rates_date ON market_rates(rate_date);
CREATE INDEX idx_market_rates_location ON market_rates(state, district);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger for farms
CREATE TRIGGER update_farms_timestamp
    BEFORE UPDATE ON farms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger for batches
CREATE TRIGGER update_batches_timestamp
    BEFORE UPDATE ON batches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger for inventory
CREATE TRIGGER update_inventory_timestamp
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEEDS (Initial Data)
-- ============================================

-- Insert sample market rates for Tamil Nadu (Namakkal)
INSERT INTO market_rates (state, district, rate_type, rate_date, rate_value, company) VALUES
('Tamil Nadu', 'Namakkal', 'doc', '2026-04-01', 30, 'Vencobb 400'),
('Tamil Nadu', 'Namakkal', 'doc', '2026-04-02', 30, 'Vencobb 400'),
('Tamil Nadu', 'Namakkal', 'doc', '2026-04-03', 30, 'Vencobb 400'),
('Tamil Nadu', 'Namakkal', 'bird', '2026-04-01', 153, NULL),
('Tamil Nadu', 'Namakkal', 'bird', '2026-04-02', 153, NULL),
('Tamil Nadu', 'Namakkal', 'bird', '2026-04-03', 154, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample for Andhra Pradesh
INSERT INTO market_rates (state, district, rate_type, rate_date, rate_value, company) VALUES
('Andhra Pradesh', 'Vijayawada (Krishna)', 'doc', '2026-04-01', 35, 'Vencobb 400'),
('Andhra Pradesh', 'Vijayawada (Krishna)', 'bird', '2026-04-01', 165, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample for West Bengal
INSERT INTO market_rates (state, district, rate_type, rate_date, rate_value, company) VALUES
('West Bengal', 'Kolkata', 'doc', '2026-04-01', 40, 'Vencobb 400'),
('West Bengal', 'Kolkata', 'bird', '2026-04-01', 172, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS
-- ============================================

-- View: Batch with farm info
CREATE OR REPLACE VIEW v_batches_with_farms AS
SELECT 
    b.id,
    b.batch_name,
    b.breed,
    b.doc_count,
    b.doc_rate,
    b.doc_date,
    b.expected_sale_date,
    b.status,
    b.created_at,
    f.name AS farm_name,
    f.district AS farm_district,
    u.name AS owner_name,
    u.phone AS owner_phone
FROM batches b
JOIN farms f ON b.farm_id = f.id
JOIN users u ON f.user_id = u.id;

-- View: Daily summary
CREATE OR REPLACE VIEW v_daily_summary AS
SELECT 
    dl.log_date,
    b.batch_name,
    f.name AS farm_name,
    dl.mortality,
    dl.feed_consumed,
    dl.avg_weight,
    u.name AS owner_name
FROM daily_logs dl
JOIN batches b ON dl.batch_id = b.id
JOIN farms f ON b.farm_id = f.id
JOIN users u ON f.user_id = u.id;

-- View: User balance summary
CREATE OR REPLACE VIEW v_user_balance AS
SELECT 
    user_id,
    SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END) AS total_credit,
    SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END) AS total_debit,
    SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END) AS balance
FROM ledger_entries
GROUP BY user_id;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant access to poultry user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO poultry;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO poultry;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO poultry;

-- Row Level Security (for future multi-tenant)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be added as needed
-- CREATE POLICY users_select ON users FOR SELECT USING (true);

SELECT '✅ Database schema created successfully!' AS status;