ALTER TABLE territory.territories
  ADD COLUMN IF NOT EXISTS uuid uuid NOT NULL DEFAULT uuid_generate_v4();

CREATE INDEX
  IF NOT EXISTS territories_uuid_idx
  ON territory.territories
  USING btree
  (uuid);
