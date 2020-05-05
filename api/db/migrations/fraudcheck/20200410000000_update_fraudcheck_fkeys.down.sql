ALTER TABLE fraudcheck.fraudchecks
  ALTER COLUMN acquisition_id TYPE varchar USING acquisition_id::varchar;