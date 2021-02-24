ALTER TABLE IF EXISTS certificate.certificates
  ALTER COLUMN operator_id TYPE integer USING operator_id::integer;
