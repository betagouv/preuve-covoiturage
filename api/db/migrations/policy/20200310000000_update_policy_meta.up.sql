ALTER TABLE policy.policy_metas
  ALTER COLUMN policy_id SET NOT NULL,
  ADD COLUMN updated_at timestamp WITH time zone NOT NULL DEFAULT NOW();

CREATE TRIGGER touch_policy_meta_updated_at BEFORE UPDATE ON policy.policy_metas FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();