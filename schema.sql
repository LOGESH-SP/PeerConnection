-- ==========================================================
-- PROJECT: PeerConnect - Supabase (PostgreSQL) Schema
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'MENTOR', 'ADMIN')),
    credibility_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOUBTS TABLE
CREATE TABLE IF NOT EXISTS doubts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS answers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    doubt_id BIGINT NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step1 TEXT NOT NULL,
    step2 TEXT,
    step3 TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DAILY TRACKING TABLE
CREATE TABLE IF NOT EXISTS daily_tracking (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    doubts_posted INTEGER DEFAULT 0,
    bonus_limit INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, tracking_date)
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    doubt_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- DISABLE RLS (For Development Simplicity)
-- ==========================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doubts DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ==========================================================
-- SEED DATA (For Initial Setup)
-- ==========================================================
-- INSERT INTO users (username, password_hash, role) VALUES ('student_alice', 'hashed_pw', 'STUDENT');
-- INSERT INTO users (username, password_hash, role) VALUES ('mentor_john', 'hashed_pw', 'MENTOR');
