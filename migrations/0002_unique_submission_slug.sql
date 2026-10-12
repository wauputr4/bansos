CREATE UNIQUE INDEX IF NOT EXISTS submissions_active_slug_unique
ON submissions (json_extract(payload, '$.id'))
WHERE state IN ('pending', 'published');
