ALTER TABLE cee.cee_applications
  ADD COLUMN application_timestamp TIMESTAMP;
UPDATE cee.cee_applications set application_timestamp = datetime;
ALTER TABLE cee.cee_applications ALTER COLUMN application_timestamp SET NOT NULL;
