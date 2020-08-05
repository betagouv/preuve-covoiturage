ALTER TABLE fraudcheck.fraudchecks
  ALTER COLUMN karma TYPE integer USING karma*100::integer;