ALTER TABLE submissions ADD COLUMN review_version INTEGER NOT NULL DEFAULT 1;
CREATE TABLE admin_notification_outbox (
  event_key TEXT PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id),
  payload TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','sending','sent','cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  lease_token TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT
);
CREATE INDEX admin_notification_pending ON admin_notification_outbox(state,next_attempt);
