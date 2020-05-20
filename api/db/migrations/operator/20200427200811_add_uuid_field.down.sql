DROP INDEX IF EXISTS operator.operators_uuid_idx;
ALTER TABLE operator.operators DROP COLUMN IF EXISTS uuid;
