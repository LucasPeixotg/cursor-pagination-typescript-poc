CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url  VARCHAR,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- populating the database with mocked users and posts

-- 1. Create 10 dummy users
INSERT INTO users (username, password_hash)
SELECT 
  'user_' || i, 
  -- In a real app, this would be a real bcrypt/argon2 hash
  'fake_hashed_password_string_' || i 
FROM generate_series(1, 10) AS i;

-- 2. Create 250 posts assigned randomly to the existing users
INSERT INTO posts (user_id, image_url, title, body)
SELECT 
  u.id,
  -- Generating placeholder image URLs
  'https://picsum.photos/seed/' || p.i || '/800/600', 
  'Post Title Number ' || p.i,
  'This is the auto-generated body content for post ' || p.i || '. It contains some sample text to populate the database.'
FROM generate_series(1, 250) AS p(i)
-- The LATERAL join ensures we pick a random user for EVERY generated post row
CROSS JOIN LATERAL (
  SELECT id FROM users ORDER BY random() LIMIT 1
) AS u;