ALTER TABLE acquisition.acquisitions ADD COLUMN IF NOT EXISTS api_version SMALLINT NOT NULL DEFAULT 2;

ALTER TABLE acquisition.acquisitions
  ADD COLUMN IF NOT EXISTS request_id varchar;

CREATE TYPE acquisition.acquisition_status_enum AS enum('ok', 'error', 'todo');

ALTER TABLE acquisition.acquisitions
  ADD COLUMN status acquisition.acquisition_status_enum IF NOT EXISTS NOT NULL DEFAULT 'todo';

ALTER TABLE acquisition.acquisitions
  ADD COLUMN try_count SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE acquisition.acquisitions
  ADD COLUMN error_stage varchar(255);

ALTER TABLE acquisition.acquisitions
  ADD COLUMN errors JSON;

CREATE INDEX IF NOT EXISTS acquisition_request_id_idx ON acquisition.acquisitions (request_id);
