-- add indexes to acquisition.acquisition

CREATE INDEX ON acquisition.acquisitions (operator_id);
CREATE INDEX ON acquisition.acquisitions (journey_id);

-- modify acquisition.errors

ALTER TABLE acquisition.errors
  ADD COLUMN journey_id varchar,
  ADD COLUMN request_id varchar;

CREATE INDEX ON acquisition.errors (journey_id);
CREATE INDEX ON acquisition.errors (request_id);
