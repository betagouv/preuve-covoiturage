ALTER TABLE cee.cee_applications
  ADD COLUMN identity_key VARCHAR(64);

CREATE INDEX IF NOT EXISTS cee_identity_key_idx ON cee.cee_applications(identity_key);
