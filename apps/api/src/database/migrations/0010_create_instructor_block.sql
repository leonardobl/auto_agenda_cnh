CREATE TABLE IF NOT EXISTS instructor_block (
  id TEXT PRIMARY KEY,
  instructor_id TEXT NOT NULL REFERENCES instructor(id),
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES user(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
