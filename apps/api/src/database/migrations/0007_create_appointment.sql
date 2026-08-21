CREATE TABLE IF NOT EXISTS appointment (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student(id),
  instructor_id TEXT NOT NULL REFERENCES instructor(id),
  vehicle_id TEXT NOT NULL REFERENCES vehicle(id),
  category_id TEXT NOT NULL REFERENCES license_category(id),
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AGENDADA',
  cancellation_reason TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES user(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
