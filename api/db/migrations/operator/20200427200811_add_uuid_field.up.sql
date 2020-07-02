ALTER TABLE operator.operators
  ADD COLUMN IF NOT EXISTS uuid uuid NOT NULL DEFAULT uuid_generate_v4();

CREATE INDEX
  IF NOT EXISTS operators_uuid_idx
  ON operator.operators
  USING btree
  (uuid);
