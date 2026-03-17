-- IB Companion — Initial Schema
-- Migration: 0001_initial.sql
-- Cloudflare D1 / SQLite

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,                 -- nanoid
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,                  -- bcrypt-equivalent via Web Crypto
  plan        TEXT NOT NULL DEFAULT 'free',     -- 'free' | 'pro'
  pro_expires_at TEXT,                          -- ISO8601, NULL if free
  queries_today INTEGER NOT NULL DEFAULT 0,
  queries_reset_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────
-- SESSIONS (JWT store for logout / revocation)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT UNIQUE NOT NULL,             -- SHA-256 of JWT
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

-- ─────────────────────────────────────────────
-- ESSAYS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS essays (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Untitled',
  content     TEXT NOT NULL,
  type        TEXT NOT NULL,                    -- 'tok' | 'ee' | 'ia' | 'io' | 'other'
  subject     TEXT,                             -- e.g. 'Biology', 'History'
  feedback    TEXT,                             -- stored JSON (AIEssayFeedback)
  analyzed_at TEXT,
  word_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_essays_user_id ON essays(user_id);
CREATE INDEX IF NOT EXISTS idx_essays_type    ON essays(type);

-- ─────────────────────────────────────────────
-- QUESTION HELP HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_help (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  subject     TEXT,
  level       TEXT,                             -- 'SL' | 'HL'
  response    TEXT NOT NULL,                    -- JSON (AIQuestionResponse)
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_question_help_user_id ON question_help(user_id);

-- ─────────────────────────────────────────────
-- FLASHCARD DECKS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  subject     TEXT,
  description TEXT,
  card_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON flashcard_decks(user_id);

-- ─────────────────────────────────────────────
-- FLASHCARDS (with spaced repetition state)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcards (
  id           TEXT PRIMARY KEY,
  deck_id      TEXT NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front        TEXT NOT NULL,
  back         TEXT NOT NULL,
  -- SM-2 spaced repetition fields
  repetitions  INTEGER NOT NULL DEFAULT 0,
  ease_factor  REAL    NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_review_at TEXT  NOT NULL DEFAULT (datetime('now')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id        ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review_at ON flashcards(next_review_at);

-- ─────────────────────────────────────────────
-- PRACTICE SESSIONS (Oral / Exam)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practice_sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,                    -- 'oral' | 'exam' | 'presentation'
  subject     TEXT,
  title       TEXT,
  messages    TEXT NOT NULL DEFAULT '[]',       -- JSON: [{role, content, timestamp}]
  score       REAL,                             -- 0-100 overall score at session end
  feedback    TEXT,                             -- JSON (AISessionFeedback)
  status      TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'completed'
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);

-- ─────────────────────────────────────────────
-- IA PLANS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ia_plans (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject           TEXT NOT NULL,
  topic             TEXT NOT NULL,
  research_question TEXT,
  plan_data         TEXT NOT NULL DEFAULT '{}', -- JSON (AIIAPlan)
  status            TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'active' | 'submitted'
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ia_plans_user_id ON ia_plans(user_id);

-- ─────────────────────────────────────────────
-- QUIZ ATTEMPTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject     TEXT,
  topic       TEXT,
  questions   TEXT NOT NULL,                    -- JSON array of questions
  answers     TEXT NOT NULL DEFAULT '[]',       -- JSON: user answers
  score       INTEGER,
  total       INTEGER,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
