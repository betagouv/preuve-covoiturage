ALTER TABLE fraudcheck.fraudchecks
  ALTER COLUMN acquisition_id TYPE integer USING acquisition_id::integer;