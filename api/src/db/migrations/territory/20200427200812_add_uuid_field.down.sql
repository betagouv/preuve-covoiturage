DROP INDEX IF EXISTS territory.territories_uuid_idx;
ALTER TABLE territory.territories DROP COLUMN IF EXISTS uuid;
