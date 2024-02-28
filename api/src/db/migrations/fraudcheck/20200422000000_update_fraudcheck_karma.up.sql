ALTER TABLE fraudcheck.fraudchecks
  ALTER COLUMN karma TYPE float USING karma/100::float;