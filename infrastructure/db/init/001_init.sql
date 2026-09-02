CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL
);

INSERT INTO roles (code, title)
VALUES
  ('admin', 'Администратор'),
  ('user', 'Пользователь')
ON CONFLICT (code) DO UPDATE
SET title = EXCLUDED.title;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

WITH admin_role AS (
  SELECT id FROM roles WHERE code = 'admin'
)
INSERT INTO users (role_id, email, username, password_hash)
SELECT
  admin_role.id,
  'admin@example.com',
  'admin',
  '$2b$10$example.hash.replace.before.production'
FROM admin_role
ON CONFLICT (email) DO UPDATE
SET
  role_id = EXCLUDED.role_id,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token_hash TEXT NOT NULL UNIQUE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  access_expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ NOT NULL
);

WITH admin_user AS (
  SELECT id FROM users WHERE email = 'admin@example.com'
)
INSERT INTO sessions (user_id, access_token_hash, refresh_token_hash, access_expires_at, refresh_expires_at)
SELECT
  admin_user.id,
  'test-admin-session-token',
  'test-admin-refresh-token',
  NOW() + INTERVAL '60 minutes',
  NOW() + INTERVAL '30 day'
FROM admin_user;

CREATE TABLE IF NOT EXISTS dreams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dream_date DATE NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 10),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

WITH admin_user AS (
  SELECT id FROM users WHERE email = 'admin@example.com'
),
initial_dreams(title, description, dream_date, rating, image_url) AS (
  VALUES
    (
      'Город над облаками',
      'Мне снился тихий город на огромных платформах, плывущих выше грозовых облаков.',
      CURRENT_DATE - INTERVAL '2 days',
      8,
      NULL
    ),
    (
      'Библиотека с живыми страницами',
      'Я искал нужную книгу, а страницы сами складывались в карту незнакомого дома.',
      CURRENT_DATE - INTERVAL '1 day',
      7,
      NULL
    )
)
INSERT INTO dreams (user_id, title, description, dream_date, rating, image_url)
SELECT
  admin_user.id,
  initial_dreams.title,
  initial_dreams.description,
  initial_dreams.dream_date::DATE,
  initial_dreams.rating,
  initial_dreams.image_url
FROM admin_user
CROSS JOIN initial_dreams
WHERE NOT EXISTS (
  SELECT 1
  FROM dreams
  WHERE dreams.user_id = admin_user.id
);
