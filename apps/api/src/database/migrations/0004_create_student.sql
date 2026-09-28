CREATE TABLE IF NOT EXISTS student (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES "user"(id),
  full_name TEXT NOT NULL,
  document TEXT UNIQUE,
  phone TEXT NOT NULL,
  birth_date DATE,
  category_id TEXT NOT NULL REFERENCES license_category(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
