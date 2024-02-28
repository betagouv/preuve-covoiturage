-- remove fields from acquisition error
ALTER TABLE acquisition.errors DROP COLUMN journey_id;
ALTER TABLE acquisition.errors DROP COLUMN request_id;
