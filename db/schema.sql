-- CampusCare Neon PostgreSQL schema (Django-managed tables)
-- Students + daily wellness check-ins + contact messages

-- Django creates these via migrations (core app):
--   core_student
--   core_wellnesscheckin
--   core_contactmessage

-- Reference shape (matches Django models):

CREATE TABLE IF NOT EXISTS core_student (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  course VARCHAR(100),
  year VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_wellnesscheckin (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES core_student(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  energy SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 5),
  stress SMALLINT NOT NULL CHECK (stress BETWEEN 1 AND 5),
  note VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_checkins_student_date
  ON core_wellnesscheckin (student_id, checkin_date);

CREATE TABLE IF NOT EXISTS core_contactmessage (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
