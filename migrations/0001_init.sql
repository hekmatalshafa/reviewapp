CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  review_url TEXT NOT NULL,
  deep_link TEXT NOT NULL DEFAULT '',
  web_fallback TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  rating INTEGER,
  branch TEXT,
  platform_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_branch ON events(branch);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  branch TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('business_name', ''),
  ('business_logo', ''),
  ('business_description', ''),
  ('business_phone', ''),
  ('business_address', ''),
  ('website_url', ''),
  ('instagram_url', ''),
  ('primary_color', '#04A0B6'),
  ('secondary_color', '#F4C64A');

INSERT OR IGNORE INTO platforms (
  id, name, review_url, deep_link, web_fallback, icon, enabled, is_primary, sort_order
) VALUES (
  'platform-1',
  'نشان',
  'https://B2n.ir/HekmatAlShafa',
  '',
  '',
  '',
  1,
  1,
  1
);
