
ALTER TABLE acquisition.errors ADD COLUMN IF NOT EXISTS journey_id VARCHAR;
ALTER TABLE acquisition.errors ADD COLUMN IF NOT EXISTS request_id VARCHAR;