ALTER TABLE acquisition.acquisitions ADD COLUMN IF NOT EXISTS api_version SMALLINT NOT NULL DEFAULT 2;

ALTER TABLE acquisition.acquisitions 
  ADD COLUMN updated_at timestamp WITH time zone NOT NULL DEFAULT NOW();

CREATE TRIGGER touch_acquisition_updated_at BEFORE UPDATE ON acquisition.acquisitions FOR EACH ROW EXECUTE PROCEDURE common.touch_updated_at();

ALTER TABLE acquisition.acquisitions
  ADD COLUMN IF NOT EXISTS request_id varchar;

CREATE TYPE acquisition.acquisition_status_enum AS enum('ok', 'error', 'pending', 'canceled');

ALTER TABLE acquisition.acquisitions
  ADD COLUMN IF NOT EXISTS status acquisition.acquisition_status_enum NOT NULL DEFAULT 'pending';

ALTER TABLE acquisition.acquisitions
  ADD COLUMN try_count SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE acquisition.acquisitions
  ADD COLUMN error_stage varchar(255);

ALTER TABLE acquisition.acquisitions
  ADD COLUMN errors JSON;

CREATE INDEX IF NOT EXISTS acquisition_request_id_idx ON acquisition.acquisitions (request_id);
