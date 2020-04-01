-- add indexes to acquisition.acquisition
CREATE INDEX ON acquisition.acquisitions (operator_id);
CREATE INDEX ON acquisition.acquisitions (journey_id);

-- modify acquisition.errors
ALTER TABLE acquisition.errors ADD COLUMN IF NOT EXISTS journey_id varchar;
ALTER TABLE acquisition.errors ADD COLUMN IF NOT EXISTS request_id varchar;

CREATE INDEX IF NOT EXISTS errors_journey_id_idx ON acquisition.errors (journey_id);
CREATE INDEX IF NOT EXISTS errors_request_id_idx ON acquisition.errors (request_id);
