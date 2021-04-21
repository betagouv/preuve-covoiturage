ALTER TABLE policy.policy_metas
    ALTER COLUMN value TYPE JSON
     USING value::text::json;
DROP INDEX IF EXISTS policy.policy_meta_id_key;
CREATE UNIQUE INDEX policy_meta_unique_key ON policy.policy_metas (policy_id, key);

