ALTER TABLE IF EXISTS certificate.certificates
  ALTER COLUMN operator_id TYPE varchar USING operator_id::varchar;
