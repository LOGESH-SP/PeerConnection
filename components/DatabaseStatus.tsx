import React, { useState, useEffect } from 'react';
import { apiService } from '../services/dbService';
import { AlertCircle, CheckCircle2, Copy, Database } from 'lucide-react';

export const DatabaseStatus: React.FC = () => {
  const [tables, setTables] = useState<{ name: string; exists: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSql, setShowSql] = useState(false);

  const requiredTables = ['users', 'doubts', 'answers', 'daily_tracking', 'notifications', 'messages'];

  const checkTables = async () => {
    setLoading(true);
    try {
      const results = await apiService.checkDatabaseStatus();
      setTables(results);
    } catch (err) {
      console.error('Error checking tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTables();
  }, []);

  const allExist = tables.every((t) => t.exists);

  if (loading) return null; // Don't show anything while loading to avoid flicker

  if (allExist && tables.length > 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-full">
            <Database className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-900">Database Setup Required</h3>
            <p className="text-amber-700 text-sm mt-1">
              Some required tables are missing from your Supabase database. Please run the schema SQL in your Supabase SQL Editor to initialize your project.
            </p>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {tables.map((table) => (
                <div key={table.name} className="flex items-center gap-2 text-sm">
                  {table.exists ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span className={table.exists ? 'text-emerald-700' : 'text-rose-700 font-medium'}>
                    {table.name} {table.exists ? '' : '(Missing)'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSql(!showSql)}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                {showSql ? 'Hide SQL' : 'View Setup SQL'}
              </button>
              <button
                onClick={checkTables}
                className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-50 transition-colors"
              >
                Refresh Status
              </button>
            </div>

            {showSql && (
              <div className="mt-4 relative">
                <div className="absolute right-2 top-2">
                  <button
                    onClick={() => {
                      const sql = document.getElementById('setup-sql')?.innerText;
                      if (sql) {
                        navigator.clipboard.writeText(sql);
                        alert('SQL copied to clipboard!');
                      }
                    }}
                    className="p-2 bg-white/80 hover:bg-white rounded-lg border border-amber-200 transition-colors"
                    title="Copy SQL"
                  >
                    <Copy className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
                <pre
                  id="setup-sql"
                  className="p-4 bg-zinc-900 text-zinc-300 text-xs rounded-xl overflow-x-auto max-h-60 font-mono"
                >
{`-- Run this in your Supabase SQL Editor (https://app.supabase.com)
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
    attachments JSONB DEFAULT '[]',
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
    attachments JSONB DEFAULT '[]',
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

-- 6. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doubts DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE doubts;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
