ALTER TABLE policy.policy_metas
    ALTER COLUMN value TYPE INT 
     USING CASE 
        WHEN value::text = '{}' THEN 0 
        ELSE value::text::int
     END;
DROP INDEX IF EXISTS policy.policy_meta_unique_key;
CREATE INDEX policy_meta_id_key ON policy.policy_metas (policy_id, key);

