CREATE TABLE notification_outbox (
  event_key TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES catalog_items(id),
  payload TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'sending', 'sent')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  lease_token TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT
);
CREATE INDEX notification_outbox_pending ON notification_outbox(state, next_attempt);
