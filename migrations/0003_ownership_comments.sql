ALTER TABLE submissions ADD COLUMN withdrawn_at TEXT;
ALTER TABLE submissions ADD COLUMN revision_of TEXT;
ALTER TABLE submissions ADD COLUMN base_version INTEGER;
DROP INDEX submissions_active_slug_unique;
CREATE UNIQUE INDEX submissions_review_slug_unique
ON submissions (json_extract(payload, '$.id'))
WHERE state IN ('pending', 'needs_changes') AND withdrawn_at IS NULL;

ALTER TABLE catalog_items ADD COLUMN owner_github_id INTEGER REFERENCES users(github_id);
ALTER TABLE catalog_items ADD COLUMN deleted_at TEXT;
ALTER TABLE catalog_items ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
UPDATE catalog_items SET owner_github_id = (
  SELECT github_id FROM submissions WHERE submissions.id = catalog_items.submission_id
);
CREATE INDEX catalog_items_owner ON catalog_items(owner_github_id, state);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id TEXT NOT NULL,
  github_id INTEGER NOT NULL REFERENCES users(github_id),
  body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 2000),
  deleted_at TEXT,
  deleted_by INTEGER REFERENCES users(github_id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX comments_listing ON comments(listing_id, deleted_at, id);
CREATE INDEX comments_author ON comments(github_id, created_at);

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX rate_limits_expiry ON rate_limits(expires_at);
