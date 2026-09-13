-- migrate:up

CREATE TABLE user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  prefer_dark BOOLEAN
);

-- migrate:down

DROP TABLE user_preferences;
