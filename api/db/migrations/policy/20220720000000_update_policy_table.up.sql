ALTER TABLE policy.policies ALTER COLUMN unit DROP NOT NULL;
ALTER TABLE policy.policies ADD COLUMN handler VARCHAR(256);
