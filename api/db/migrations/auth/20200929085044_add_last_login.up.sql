ALTER TABLE auth.users
  ADD COLUMN last_login_at timestamp with time zone NOT NULL DEFAULT NOW();
