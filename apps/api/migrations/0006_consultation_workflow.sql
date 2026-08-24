ALTER TABLE quote_requests RENAME TO quote_requests_previous;

CREATE TABLE quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  items TEXT NOT NULL,
  width_cm INTEGER,
  drop_cm INTEGER,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  postcode TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time_window TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'measured', 'completed', 'cancelled')),
  admin_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO quote_requests (id, items, width_cm, drop_cm, name, phone, email, postcode, preferred_date, preferred_time_window, status, created_at)
SELECT id, items, width_cm, drop_cm, name, phone, email, postcode, preferred_date, preferred_time_window, status, created_at
FROM quote_requests_previous;

DROP TABLE quote_requests_previous;

CREATE INDEX IF NOT EXISTS quote_requests_status_created_at_idx
  ON quote_requests (status, created_at DESC);
