-- Add username and GM role to users table
ALTER TABLE users ADD COLUMN username TEXT;
ALTER TABLE users ADD COLUMN is_gm INTEGER DEFAULT 0;

-- Set username from email for existing users
UPDATE users SET username = SUBSTR(email, 1, INSTR(email, '@') - 1) WHERE username IS NULL;

-- Make first user (id=1) a GM for initial setup
UPDATE users SET is_gm = 1 WHERE id = 1;
