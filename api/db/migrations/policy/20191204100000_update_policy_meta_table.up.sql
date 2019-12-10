CREATE UNIQUE INDEX policy_meta_unique_key ON policy.policy_metas (policy_id, key);
ALTER TABLE policy.policy_metas ALTER COLUMN key SET DEFAULT 'default';
ALTER TABLE policy.policy_metas ALTER COLUMN key SET NOT NULL;