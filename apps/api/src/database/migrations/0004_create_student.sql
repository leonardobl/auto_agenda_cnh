CREATE TABLE IF NOT EXISTS student (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES user(id),
  full_name TEXT NOT NULL,
  document TEXT UNIQUE,
  phone TEXT NOT NULL,
  birth_date TEXT,
  category_id TEXT NOT NULL REFERENCES license_category(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
