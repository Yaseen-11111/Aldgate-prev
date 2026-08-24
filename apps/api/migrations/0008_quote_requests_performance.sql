CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx
  ON quote_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS quote_requests_schedule_idx
  ON quote_requests (preferred_date, preferred_time_window, status);
