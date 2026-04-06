-- ==========================================================
-- PROJECT: PeerConnect - Supabase (PostgreSQL) Schema V2
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'MENTOR', 'ADMIN')),
    credibility_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOUBTS TABLE
CREATE TABLE IF NOT EXISTS doubts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
    is_best_answer BOOLEAN DEFAULT FALSE,
    ai_score INTEGER DEFAULT 0,
    ai_confidence INTEGER DEFAULT 0,
    attachments JSONB DEFAULT '[]',
    version_history JSONB DEFAULT '[]',
    last_reviewed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TAGS TABLE (NEW)
CREATE TABLE IF NOT EXISTS tags (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT UNIQUE NOT NULL
);

-- 5. DOUBT_TAGS TABLE (NEW)
CREATE TABLE IF NOT EXISTS doubt_tags (
    doubt_id BIGINT NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (doubt_id, tag_id)
);

-- 6. VOTES TABLE (NEW)
CREATE TABLE IF NOT EXISTS votes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answer_id BIGINT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('UPVOTE', 'DOWNVOTE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, answer_id)
);

-- 7. REPORTS TABLE (NEW)
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answer_id BIGINT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BOOKMARKS TABLE (NEW)
CREATE TABLE IF NOT EXISTS bookmarks (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doubt_id BIGINT NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, doubt_id)
);

-- 9. DAILY TRACKING TABLE
CREATE TABLE IF NOT EXISTS daily_tracking (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    doubts_posted INTEGER DEFAULT 0,
    bonus_limit INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, tracking_date)
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    doubt_id BIGINT REFERENCES doubts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MESSAGES TABLE (Real-time Chat)
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_doubts_user_id ON doubts(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_doubt_id ON answers(doubt_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_tags_tag_id ON doubt_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_votes_answer_id ON votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_reports_answer_id ON reports(answer_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- ==========================================================
-- STORED PROCEDURES / FUNCTIONS
-- ==========================================================
-- Function to increment user credibility score
CREATE OR REPLACE FUNCTION increment_credibility(user_id_param BIGINT, points INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET credibility_score = credibility_score + points
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================
-- ENABLE REALTIME
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE doubts;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ==========================================================
-- DISABLE RLS (Managed via Backend now)
-- ==========================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doubts DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
