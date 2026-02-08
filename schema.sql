-- ==========================================================
-- PROJECT: Student Doubt Resolution & Peer Help Platform
-- DATABASE SCHEMA (SQLite / MySQL Compatible)
-- ==========================================================

-- 1. USERS TABLE
-- Stores user credentials, roles, and gamification metrics.
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'MENTOR', 'ADMIN')),
    credibility_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DOUBTS TABLE
-- Stores academic inquiries posted by students.
CREATE TABLE IF NOT EXISTS doubts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_anonymous BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Cascading delete: If a user is removed, their doubts are also removed.
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. ANSWERS TABLE
-- Implements the "Micro-Explanation Mode" (Strictly 3 steps).
CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doubt_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    step1 TEXT NOT NULL, -- Step 1 is mandatory
    step2 TEXT,          -- Step 2 is optional but encouraged
    step3 TEXT,          -- Step 3 is optional
    is_verified BOOLEAN DEFAULT 0, -- Marks if a mentor approved the solution
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doubt_id) REFERENCES doubts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. DAILY TRACKING TABLE
-- Manages the 5-doubt daily limit and the +1 bonus system.
CREATE TABLE IF NOT EXISTS daily_tracking (
    user_id INTEGER NOT NULL,
    tracking_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    doubts_posted INTEGER DEFAULT 0 CHECK (doubts_posted >= 0),
    bonus_limit INTEGER DEFAULT 0 CHECK (bonus_limit >= 0),
    PRIMARY KEY (user_id, tracking_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================================
-- PERFORMANCE INDEXES (Optimized for Search & Feed)
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_doubts_title ON doubts(title);
CREATE INDEX IF NOT EXISTS idx_answers_doubt_id ON answers(doubt_id);
CREATE INDEX IF NOT EXISTS idx_tracking_date ON daily_tracking(tracking_date);

-- ==========================================================
-- SEED DATA (For Initial Setup)
-- ==========================================================
-- INSERT INTO users (username, password_hash, role) VALUES ('student_alice', 'hashed_pw', 'STUDENT');
-- INSERT INTO users (username, password_hash, role) VALUES ('mentor_john', 'hashed_pw', 'MENTOR');
