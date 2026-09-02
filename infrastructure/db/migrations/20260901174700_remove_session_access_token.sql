-- migrate:up

ALTER TABLE sessions
  DROP COLUMN access_expires_at,
  DROP COLUMN access_token_hash;

-- migrate:down

ALTER TABLE users
  ADD COLUMN access_expires_at TIMESTAMPTZ NOT NULL,
  ADD COLUMN access_token_hash TEXT NOT NULL UNIQUE;