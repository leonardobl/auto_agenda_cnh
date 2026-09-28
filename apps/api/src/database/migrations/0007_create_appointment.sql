-- btree_gist lets an exclusion constraint combine "same resource" (text equality)
-- with "overlapping time range". Created in `public` explicitly so it does not end
-- up inside whichever schema the migration happens to run in (e.g. a test schema).
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA public;

CREATE TABLE IF NOT EXISTS appointment (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student(id),
  instructor_id TEXT NOT NULL REFERENCES instructor(id),
  vehicle_id TEXT NOT NULL REFERENCES vehicle(id),
  category_id TEXT NOT NULL REFERENCES license_category(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'AGENDADA',
  cancellation_reason TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES "user"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT appointment_valid_range CHECK (end_at > start_at),

  -- RN-016: a student, an instructor and a vehicle can each be in only one lesson at
  -- a time. tstzrange is half-open ([start, end)), so back-to-back lessons are allowed.
  -- This is the database-level backstop behind the application's own overlap check:
  -- two concurrent bookings can both pass that check, but never both commit.
  -- Every appointment is currently AGENDADA, so there is no status predicate; the
  -- change that introduces cancellation must add WHERE (status <> 'CANCELADA').
  CONSTRAINT appointment_instructor_no_overlap
    EXCLUDE USING gist (instructor_id WITH =, tstzrange(start_at, end_at) WITH &&),
  CONSTRAINT appointment_vehicle_no_overlap
    EXCLUDE USING gist (vehicle_id WITH =, tstzrange(start_at, end_at) WITH &&),
  CONSTRAINT appointment_student_no_overlap
    EXCLUDE USING gist (student_id WITH =, tstzrange(start_at, end_at) WITH &&)
);
