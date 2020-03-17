DROP TRIGGER IF EXISTS touch_policy_meta_updated_at ON policy.policy_metas;

ALTER TABLE policy.policy_metas
  DROP COLUMN updated_at,
  ALTER COLUMN policy_id DROP NOT NULL;

