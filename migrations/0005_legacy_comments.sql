-- Preserve Discussions snapshots without creating login accounts for historical authors.
CREATE TABLE legacy_discussions (
  source_id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  source_updated_at TEXT NOT NULL,
  imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE legacy_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL UNIQUE,
  listing_id TEXT NOT NULL,
  discussion_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  parent_source_id TEXT,
  author_github_id INTEGER,
  author_login TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  source_updated_at TEXT NOT NULL,
  imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  deleted_by INTEGER REFERENCES users(github_id)
);
CREATE INDEX legacy_comments_listing ON legacy_comments(listing_id, deleted_at, created_at);
CREATE INDEX legacy_comments_author ON legacy_comments(author_github_id);
