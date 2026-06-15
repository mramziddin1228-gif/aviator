-- ============================================================
-- AVIATOR PROJECT - Complete Supabase Setup Script
-- Run this in Supabase SQL Editor on your NEW project
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE (основная таблица пользователей)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(6) UNIQUE NOT NULL,
    phone TEXT,
    email TEXT,
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage profiles" ON profiles
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================================
-- 2. ADMINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(6) NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
    added_by BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admins" ON admins
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage admins" ON admins
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- ============================================================
-- 3. GAME STATE TABLE (singleton - одна строка)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id INTEGER NOT NULL DEFAULT 1,
    phase VARCHAR(20) NOT NULL DEFAULT 'waiting',
    multiplier DECIMAL(10,2) DEFAULT 1.00,
    crash_point DECIMAL(10,2),
    phase_start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Legacy columns (for compatibility with game-loop.js)
    game_state TEXT,
    current_multiplier DECIMAL(10,2),
    target_multiplier DECIMAL(10,2),
    countdown_seconds DECIMAL(10,1) DEFAULT 5.0,
    crashed_at TIMESTAMP WITH TIME ZONE
);

-- Insert initial game state (only one row)
INSERT INTO game_state (round_id, phase, multiplier, crash_point, phase_start_at, updated_at,
    game_state, current_multiplier, target_multiplier, countdown_seconds)
VALUES (1, 'waiting', 1.00, 2.00, NOW(), NOW(), 'waiting', 1.00, 2.00, 5.0);

ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game_state" ON game_state
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage game_state" ON game_state
    FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_game_state_updated_at ON game_state;
CREATE TRIGGER update_game_state_updated_at
    BEFORE UPDATE ON game_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. GAME ROUNDS TABLE (история раундов)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_rounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    multiplier DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game_rounds" ON game_rounds
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage game_rounds" ON game_rounds
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_game_rounds_created ON game_rounds(created_at DESC);

-- ============================================================
-- 5. GAME SETTINGS TABLE (ключ-значение настройки)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game_settings" ON game_settings
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage game_settings" ON game_settings
    FOR ALL USING (true);

-- Insert default settings
INSERT INTO game_settings (key, value) VALUES
    ('game_odds_mode', 'normal'),
    ('min_bet', '100'),
    ('max_bet', '1000000')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 6. BETS TABLE (ставки игроков)
-- ============================================================
CREATE TABLE IF NOT EXISTS bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'placed',
    cashout_multiplier DECIMAL(10,2),
    win_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bets" ON bets
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage bets" ON bets
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);

-- ============================================================
-- 7. PAYMENT REQUESTS TABLE (заявки на пополнение)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    card_number TEXT DEFAULT '',
    card_expiry TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read payment_requests" ON payment_requests
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage payment_requests" ON payment_requests
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_payment_requests_user ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);

-- ============================================================
-- 8. WITHDRAW REQUESTS TABLE (заявки на вывод)
-- ============================================================
CREATE TABLE IF NOT EXISTS withdraw_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    card_number TEXT DEFAULT '',
    card_expiry TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE withdraw_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read withdraw_requests" ON withdraw_requests
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage withdraw_requests" ON withdraw_requests
    FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user ON withdraw_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status ON withdraw_requests(status);

-- ============================================================
-- 9. TELEGRAM SETTINGS TABLE (singleton - одна строка)
-- ============================================================
CREATE TABLE IF NOT EXISTS telegram_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    payments_chat_id TEXT NOT NULL DEFAULT '',
    analysis_chat_id TEXT NOT NULL DEFAULT '',
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ensure singleton row exists
INSERT INTO telegram_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read telegram_settings" ON telegram_settings
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage telegram_settings" ON telegram_settings
    FOR ALL USING (true);

-- ============================================================
-- DONE! All tables created.
-- ============================================================
