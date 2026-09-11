CREATE TABLE IF NOT EXISTS instructor_availability (
  id TEXT PRIMARY KEY,
  instructor_id TEXT NOT NULL REFERENCES instructor(id),
  weekday INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
