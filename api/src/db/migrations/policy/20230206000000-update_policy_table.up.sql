ALTER TABLE policy.policies ADD COLUMN max_amount int NOT NULL DEFAULT 0;

-- ALTER TABLE policy.policies DROP COLUMN IF EXISTS unit;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS parent_id;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS ui_status;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS global_rules;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS rules;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS slug;
